import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Doctor, DoctorAvailability, TimeSlot } from '@/lib/types/doctor';

export interface PatientAppointment {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  date: Date;
  timeSlot: string;
  duration: number; // minutes
  type: 'in-person' | 'virtual';
  location: string;
  roomId?: string;
  status: 'scheduled' | 'confirmed' | 'checked-in' | 'in-progress' | 'completed' | 'cancelled' | 'no-show' | 'rescheduled';
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  originalAppointmentId?: string; // For rescheduled appointments
  reminderSent?: boolean;
  virtualMeetingLink?: string;
  symptoms?: string;
  reasonForVisit: string;
  insurance?: {
    provider: string;
    policyNumber: string;
  };
}

export interface AvailableSlot {
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  date: Date;
  timeSlot: string;
  duration: number;
  available: boolean;
  roomId?: string;
  conflictReason?: string;
}

export interface AppointmentFilters {
  doctorId?: string;
  patientId?: string;
  date?: Date;
  dateRange?: { start: Date; end: Date };
  status?: PatientAppointment['status'][];
  type?: PatientAppointment['type'];
}

class AppointmentService {
  private appointmentsCollection = collection(db, 'appointments');
  private unsubscribeFunctions: (() => void)[] = [];

  /**
   * Get real-time available doctors from CareSync
   */
  async getAvailableDoctors(): Promise<Doctor[]> {
    try {
      const doctorsQuery = query(
        collection(db, 'doctors'),
        where('availability', '!=', null)
      );
      
      const doctorsSnapshot = await getDocs(doctorsQuery);
      return doctorsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Doctor));
    } catch (error) {
      console.error('Error fetching doctors:', error);
      throw new Error('Failed to fetch available doctors');
    }
  }

  /**
   * Get available time slots for a specific doctor on a specific date
   */
  async getAvailableSlots(
    doctorId: string, 
    date: Date,
    duration: number = 30
  ): Promise<AvailableSlot[]> {
    try {
      // Get doctor data
      const doctorDoc = await getDoc(doc(db, 'doctors', doctorId));
      if (!doctorDoc.exists()) {
        throw new Error('Doctor not found');
      }

      const doctor = { id: doctorDoc.id, ...doctorDoc.data() } as Doctor;
      const dayName = this.getDayName(date);
      const daySlots = doctor.availability[dayName as keyof DoctorAvailability] || [];

      if (daySlots.length === 0) {
        return [];
      }

      // Get existing appointments for this doctor on this date
      const existingAppointments = await this.getAppointmentsByDoctorAndDate(doctorId, date);
      
      // Generate available slots
      const availableSlots: AvailableSlot[] = [];
      
      for (const timeSlot of daySlots) {
        const slots = this.generateTimeSlots(timeSlot, duration);
        
        for (const slot of slots) {
          const isBooked = existingAppointments.some(apt => 
            apt.timeSlot === slot && 
            ['scheduled', 'confirmed', 'checked-in', 'in-progress'].includes(apt.status)
          );

          availableSlots.push({
            doctorId: doctor.id,
            doctorName: doctor.name,
            doctorSpecialty: doctor.specialty,
            date,
            timeSlot: slot,
            duration,
            available: !isBooked,
            conflictReason: isBooked ? 'Already booked' : undefined
          });
        }
      }

      return availableSlots.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
    } catch (error) {
      console.error('Error getting available slots:', error);
      throw new Error('Failed to get available slots');
    }
  }

  /**
   * Create a new appointment
   */
  async createAppointment(appointmentData: Omit<PatientAppointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<PatientAppointment> {
    try {
      // Validate availability
      const availableSlots = await this.getAvailableSlots(
        appointmentData.doctorId, 
        appointmentData.date,
        appointmentData.duration
      );

      const requestedSlot = availableSlots.find(slot => 
        slot.timeSlot === appointmentData.timeSlot
      );

      if (!requestedSlot || !requestedSlot.available) {
        throw new Error('Selected time slot is no longer available');
      }

      // Create appointment
      const now = new Date();
      const appointmentToCreate = {
        ...appointmentData,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
        date: Timestamp.fromDate(appointmentData.date),
        status: 'scheduled' as const
      };

      // Remove undefined fields as Firestore doesn't accept them
      const cleanedAppointmentData = Object.fromEntries(
        Object.entries(appointmentToCreate).filter(([, value]) => value !== undefined)
      );

      const docRef = await addDoc(this.appointmentsCollection, cleanedAppointmentData);
      
      // Return the created appointment
      const createdAppointment: PatientAppointment = {
        id: docRef.id,
        ...appointmentData,
        createdAt: now,
        updatedAt: now,
        status: 'scheduled'
      };

      return createdAppointment;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }

  /**
   * Update appointment status
   */
  async updateAppointmentStatus(
    appointmentId: string, 
    status: PatientAppointment['status'],
    notes?: string
  ): Promise<void> {
    try {
      const updateData = {
        status,
        updatedAt: Timestamp.fromDate(new Date()),
        ...(notes && { notes })
      };

      await updateDoc(doc(db, 'appointments', appointmentId), updateData);
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw new Error('Failed to update appointment status');
    }
  }

  /**
   * Reschedule appointment
   */
  async rescheduleAppointment(
    appointmentId: string,
    newDoctorId: string,
    newDate: Date,
    newTimeSlot: string,
    reason?: string
  ): Promise<PatientAppointment> {
    try {
      // Get current appointment
      const currentAppointment = await this.getAppointmentById(appointmentId);
      if (!currentAppointment) {
        throw new Error('Appointment not found');
      }

      // Validate new slot availability
      const availableSlots = await this.getAvailableSlots(newDoctorId, newDate);
      const requestedSlot = availableSlots.find(slot => slot.timeSlot === newTimeSlot);
      
      if (!requestedSlot || !requestedSlot.available) {
        throw new Error('New time slot is not available');
      }

      // Update appointment
      const updateData = {
        doctorId: newDoctorId,
        doctorName: requestedSlot.doctorName,
        doctorSpecialty: requestedSlot.doctorSpecialty,
        date: Timestamp.fromDate(newDate),
        timeSlot: newTimeSlot,
        status: 'rescheduled' as const,
        updatedAt: Timestamp.fromDate(new Date()),
        originalAppointmentId: currentAppointment.originalAppointmentId || appointmentId,
        notes: reason ? `${currentAppointment.notes}\n\nRescheduled: ${reason}` : currentAppointment.notes
      };

      await updateDoc(doc(db, 'appointments', appointmentId), updateData);

      return {
        ...currentAppointment,
        ...updateData,
        date: newDate,
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      throw error;
    }
  }

  /**
   * Cancel appointment
   */
  async cancelAppointment(appointmentId: string, reason?: string): Promise<void> {
    try {
      const updateData = {
        status: 'cancelled' as const,
        updatedAt: Timestamp.fromDate(new Date()),
        notes: reason ? `Cancelled: ${reason}` : 'Cancelled by patient'
      };

      await updateDoc(doc(db, 'appointments', appointmentId), updateData);
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      throw new Error('Failed to cancel appointment');
    }
  }

  /**
   * Get appointments with real-time updates
   */
  subscribeToAppointments(
    filters: AppointmentFilters,
    callback: (appointments: PatientAppointment[]) => void
  ): () => void {
    try {
      let appointmentsQuery = query(this.appointmentsCollection);

      // Apply filters
      if (filters.doctorId) {
        appointmentsQuery = query(appointmentsQuery, where('doctorId', '==', filters.doctorId));
      }

      if (filters.patientId) {
        appointmentsQuery = query(appointmentsQuery, where('patientId', '==', filters.patientId));
      }

      if (filters.status && filters.status.length > 0) {
        appointmentsQuery = query(appointmentsQuery, where('status', 'in', filters.status));
      }

      if (filters.type) {
        appointmentsQuery = query(appointmentsQuery, where('type', '==', filters.type));
      }

      // Add ordering
      appointmentsQuery = query(appointmentsQuery, orderBy('date', 'asc'));

      const unsubscribe = onSnapshot(appointmentsQuery, (snapshot) => {
        const appointments: PatientAppointment[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: data.date.toDate(),
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
          } as PatientAppointment;
        });

        callback(appointments);
      });

      this.unsubscribeFunctions.push(unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error('Error subscribing to appointments:', error);
      throw new Error('Failed to subscribe to appointments');
    }
  }

  /**
   * Get single appointment by ID
   */
  async getAppointmentById(appointmentId: string): Promise<PatientAppointment | null> {
    try {
      const appointmentDoc = await getDoc(doc(db, 'appointments', appointmentId));
      
      if (!appointmentDoc.exists()) {
        return null;
      }

      const data = appointmentDoc.data();
      return {
        id: appointmentDoc.id,
        ...data,
        date: data.date.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as PatientAppointment;
    } catch (error) {
      console.error('Error getting appointment:', error);
      throw new Error('Failed to get appointment');
    }
  }

  /**
   * Get appointments by doctor and date
   */
  private async getAppointmentsByDoctorAndDate(
    doctorId: string, 
    date: Date
  ): Promise<PatientAppointment[]> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const appointmentsQuery = query(
        this.appointmentsCollection,
        where('doctorId', '==', doctorId),
        where('date', '>=', Timestamp.fromDate(startOfDay)),
        where('date', '<=', Timestamp.fromDate(endOfDay))
      );

      const snapshot = await getDocs(appointmentsQuery);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as PatientAppointment;
      });
    } catch (error) {
      console.error('Error getting appointments by doctor and date:', error);
      return [];
    }
  }

  /**
   * Generate time slots from doctor availability
   */
  private generateTimeSlots(timeSlot: TimeSlot, duration: number): string[] {
    const slots: string[] = [];
    const [startHour, startMinute] = timeSlot.startTime.split(':').map(Number);
    const [endHour, endMinute] = timeSlot.endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    for (let minutes = startMinutes; minutes < endMinutes; minutes += duration) {
      const hour = Math.floor(minutes / 60);
      const minute = minutes % 60;
      
      // Convert to 12-hour format
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const displayMinute = minute.toString().padStart(2, '0');
      
      slots.push(`${displayHour}:${displayMinute} ${period}`);
    }
    
    return slots;
  }

  /**
   * Get day name from date
   */
  private getDayName(date: Date): string {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  }

  /**
   * Check if a doctor is available on a specific date
   */
  async isDoctorAvailableOnDate(doctorId: string, date: Date): Promise<boolean> {
    try {
      // Get doctor data
      const doctorDoc = await getDoc(doc(db, 'doctors', doctorId));
      if (!doctorDoc.exists()) {
        return false;
      }

      const doctor = { id: doctorDoc.id, ...doctorDoc.data() } as Doctor;
      const dayName = this.getDayName(date);
      const daySlots = doctor.availability[dayName as keyof DoctorAvailability] || [];

      // Doctor is available if they have at least one time slot on this day
      return daySlots.length > 0;
    } catch (error) {
      console.error('Error checking doctor availability for date:', error);
      return false;
    }
  }

  /**
   * Cleanup subscriptions
   */
  cleanup(): void {
    this.unsubscribeFunctions.forEach(unsubscribe => {
      try {
        unsubscribe();
      } catch (error) {
        console.error('Error unsubscribing:', error);
      }
    });
    this.unsubscribeFunctions = [];
  }

  /**
   * Get appointment statistics for analytics
   */
  async getAppointmentStats(doctorId?: string, dateRange?: { start: Date; end: Date }) {
    try {
      let appointmentsQuery = query(this.appointmentsCollection);

      if (doctorId) {
        appointmentsQuery = query(appointmentsQuery, where('doctorId', '==', doctorId));
      }

      if (dateRange) {
        appointmentsQuery = query(
          appointmentsQuery,
          where('date', '>=', Timestamp.fromDate(dateRange.start)),
          where('date', '<=', Timestamp.fromDate(dateRange.end))
        );
      }

      const snapshot = await getDocs(appointmentsQuery);
      const appointments = snapshot.docs.map(doc => doc.data());

      const stats = {
        total: appointments.length,
        scheduled: appointments.filter(apt => apt.status === 'scheduled').length,
        confirmed: appointments.filter(apt => apt.status === 'confirmed').length,
        completed: appointments.filter(apt => apt.status === 'completed').length,
        cancelled: appointments.filter(apt => apt.status === 'cancelled').length,
        noShows: appointments.filter(apt => apt.status === 'no-show').length,
        inPerson: appointments.filter(apt => apt.type === 'in-person').length,
        virtual: appointments.filter(apt => apt.type === 'virtual').length,
      };

      return stats;
    } catch (error) {
      console.error('Error getting appointment stats:', error);
      throw new Error('Failed to get appointment statistics');
    }
  }
}

// Export singleton instance
export const appointmentService = new AppointmentService();
export default appointmentService;
