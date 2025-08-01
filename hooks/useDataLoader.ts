import { collection, getDocs, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useDoctorStore } from '@/lib/store/useDoctorStore';
import { useReceptionistStore } from '@/lib/store/useReceptionistStore';
import { useRoomStore } from '@/lib/store/useRoomStore';
import { useStatusStore } from '@/lib/store/useStatusStore';
import { useAssistantStore } from '@/lib/store/useAssistantStore';
import { usePatientStore } from '@/lib/store/usePatientStore';
import { Doctor } from '@/lib/types/doctor';
import { Receptionist } from '@/lib/types/receptionist';
import { Status } from '@/lib/types/status';
import { Patient } from '@/lib/types/patient';

/**
 * Real-time data loading service that replaces the dummy data
 * This service loads all initial data from Firestore and sets up real-time subscriptions
 */
class DataLoaderService {
  private unsubscribeFunctions: (() => void)[] = [];

  /**
   * Load all real data and set up real-time subscriptions
   */
  async loadData(): Promise<boolean> {
    try {
      // Load doctors
      await this.loadDoctors();
      
      // Load receptionists
      await this.loadReceptionists();
      
      // Load rooms
      await this.loadRooms();
      
      // Load statuses
      await this.loadStatuses();
      
      // Load assistants
      await this.loadAssistants();

      // Load patients
      await this.loadPatients();

      console.log('All real-time data loaded and subscriptions established');
      return true;
    } catch (error) {
      console.error('Error loading real data:', error);
      return false;
    }
  }

  /**
   * Load doctors from Firestore with real-time updates
   */
  private async loadDoctors(): Promise<void> {
    try {
      console.log('🔄 Starting to load doctors from Firestore...');
      const doctorStore = useDoctorStore.getState();
      
      // Set up real-time subscription for doctors
      const doctorsQuery = query(
        collection(db, 'doctors'),
        orderBy('name', 'asc')
      );

      const unsubscribe = onSnapshot(doctorsQuery, (snapshot) => {
        console.log(`📊 Firestore doctors snapshot received: ${snapshot.size} documents`);
        const doctors: Doctor[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          console.log('👨‍⚕️ Doctor data:', { id: doc.id, ...data });
          doctors.push({
            id: doc.id,
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            specialty: data.specialty || '',
            patients: data.patients || [],
            roomsAssigned: data.roomsAssigned || [],
            assistantsAssigned: data.assistantsAssigned || [],
            availability: data.availability || {
              monday: [],
              tuesday: [],
              wednesday: [],
              thursday: [],
              friday: [],
              saturday: [],
              sunday: [],
            },
          });
        });

        // Update the store with real-time data
        doctorStore.setDoctors(doctors);
        console.log(`✅ Real-time doctors update: ${doctors.length} doctors loaded`);
      }, (error) => {
        console.error('❌ Error in doctors snapshot listener:', error);
      });

      this.unsubscribeFunctions.push(unsubscribe);
    } catch (error) {
      console.error('❌ Error loading doctors:', error);
      throw error;
    }
  }

  /**
   * Load receptionists from Firestore with real-time updates
   */
  private async loadReceptionists(): Promise<void> {
    try {
      const receptionistStore = useReceptionistStore.getState();
      
      // Set up real-time subscription for receptionists
      const receptionistsQuery = query(
        collection(db, 'receptionists'),
        orderBy('name', 'asc')
      );

      const unsubscribe = onSnapshot(receptionistsQuery, (snapshot) => {
        const receptionists: Receptionist[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          receptionists.push({
            id: doc.id,
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            specialty: data.specialty || '',
          });
        });

        // Update the store with real-time data
        receptionistStore.setReceptionists(receptionists);
        console.log(`Real-time receptionists update: ${receptionists.length} receptionists loaded`);
      });

      this.unsubscribeFunctions.push(unsubscribe);
    } catch (error) {
      console.error('Error loading receptionists:', error);
      throw error;
    }
  }

  /**
   * Load rooms from Firestore with real-time updates
   */
  private async loadRooms(): Promise<void> {
    try {
      console.log('🔄 Starting to load rooms from Firestore...');
      const roomStore = useRoomStore.getState();
      
      // Import the room service
      const roomService = (await import('@/lib/services/room-service')).default;
      
      // Set up real-time subscription for rooms
      const unsubscribe = roomService.setupRealTimeListener(
        (rooms) => {
          console.log(`🏠 Rooms data received: ${rooms.length} rooms`);
          rooms.forEach(room => {
            console.log('🏠 Room data:', room);
          });
          // Update the store with real-time data
          roomStore.setRooms(rooms);
          console.log(`✅ Real-time rooms update: ${rooms.length} rooms loaded`);
        },
        (error) => {
          console.error('❌ Real-time rooms listener error:', error);
        }
      );

      this.unsubscribeFunctions.push(unsubscribe);
    } catch (error) {
      console.error('❌ Error loading rooms:', error);
      throw error;
    }
  }

  /**
   * Load statuses from Firestore with real-time updates
   */
  private async loadStatuses(): Promise<void> {
    try {
      const statusStore = useStatusStore.getState();
      
      // Set up real-time subscription for statuses
      const statusesQuery = query(
        collection(db, 'statuses'),
        orderBy('name', 'asc')
      );

      const unsubscribe = onSnapshot(statusesQuery, (snapshot) => {
        const statuses: Status[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          statuses.push({
            id: doc.id,
            name: data.name || '',
            color: data.color || '#000000',
            activityType: data.activityType || 'general',
            hasSound: data.hasSound || false,
          });
        });

        // Update the store with real-time data
        statusStore.setStatuses(statuses);
        console.log(`Real-time statuses update: ${statuses.length} statuses loaded`);
      });

      this.unsubscribeFunctions.push(unsubscribe);
    } catch (error) {
      console.error('Error loading statuses:', error);
      throw error;
    }
  }

  /**
   * Load assistants from Firestore with real-time updates
   */
  private async loadAssistants(): Promise<void> {
    try {
      console.log('🔄 Starting to load assistants from Firestore...');
      const assistantStore = useAssistantStore.getState();
      
      // Import the assistant service
      const assistantService = (await import('@/lib/services/assistant-service')).default;
      
      // Set up real-time subscription for assistants
      const unsubscribe = assistantService.setupRealTimeListener(
        (assistants) => {
          console.log(`🩺 Assistants data received: ${assistants.length} assistants`);
          assistants.forEach(assistant => {
            console.log('🩺 Assistant data:', assistant);
          });
          // Update the store with real-time data
          assistantStore.setAssistants(assistants);
          console.log(`✅ Real-time assistants update: ${assistants.length} assistants loaded`);
        },
        (error) => {
          console.error('❌ Real-time assistants listener error:', error);
        }
      );

      this.unsubscribeFunctions.push(unsubscribe);
    } catch (error) {
      console.error('❌ Error loading assistants:', error);
      throw error;
    }
  }

  /**
   * Load patients from Firestore with real-time updates
   */
  private async loadPatients(): Promise<void> {
    try {
      console.log('🔄 Starting to load patients from Firestore...');
      const patientStore = usePatientStore.getState();
      
      // Set up real-time subscription for patients
      const patientsQuery = query(
        collection(db, 'patients'),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(patientsQuery, (snapshot) => {
        console.log(`📊 Firestore patients snapshot received: ${snapshot.size} documents`);
        const patients: Patient[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          console.log('🏥 Patient data:', { id: doc.id, ...data });
          patients.push({
            id: doc.id,
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            phone: data.phone || '',
            dateOfBirth: data.dateOfBirth || '',
            gender: data.gender || undefined,
            address: data.address || {},
            emergencyContact: data.emergencyContact || {},
            medicalHistory: data.medicalHistory || {},
            insurance: data.insurance || {},
            checkInStatus: data.checkInStatus || 'not-checked-in',
            appointmentId: data.appointmentId || '',
            doctorId: data.doctorId || '',
            roomId: data.roomId || '',
            createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          });
        });

        // Update the store with real-time data
        patientStore.setPatients(patients);
        console.log(`✅ Real-time patients update: ${patients.length} patients loaded`);
      }, (error) => {
        console.error('❌ Error in patients snapshot listener:', error);
      });

      this.unsubscribeFunctions.push(unsubscribe);
    } catch (error) {
      console.error('❌ Error loading patients:', error);
      throw error;
    }
  }

  /**
   * Cleanup all subscriptions
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
   * Initialize seed data if collections are empty
   */
  async initializeSeedData(): Promise<void> {
    try {
      // Check if doctors collection is empty and seed if needed
      const doctorsSnapshot = await getDocs(collection(db, 'doctors'));
      if (doctorsSnapshot.empty) {
        console.log('Doctors collection is empty, seeding with initial data...');
        // You can add seed data here if needed
      }

      // Check other collections similarly
      const roomsSnapshot = await getDocs(collection(db, 'rooms'));
      if (roomsSnapshot.empty) {
        console.log('Rooms collection is empty, seeding with initial data...');
      }

      const statusesSnapshot = await getDocs(collection(db, 'statuses'));
      if (statusesSnapshot.empty) {
        console.log('Statuses collection is empty, seeding with initial data...');
      }

      const assistantsSnapshot = await getDocs(collection(db, 'assistants'));
      if (assistantsSnapshot.empty) {
        console.log('Assistants collection is empty, seeding with initial data...');
      }
    } catch (error) {
      console.error('Error checking/initializing seed data:', error);
    }
  }
}

// Create singleton instance
const dataLoaderService = new DataLoaderService();

/**
 * Custom hook for loading real-time data from Firestore
 * Sets up subscriptions and manages cleanup
 */
export default function useDataLoader() {
  return {
    loadData: () => dataLoaderService.loadData(),
    cleanup: () => dataLoaderService.cleanup(),
  };
}
