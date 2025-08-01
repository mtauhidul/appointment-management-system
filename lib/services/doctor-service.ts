import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Doctor } from '@/lib/types/doctor';

/**
 * Real-time Doctor Service
 * Handles CRUD operations for doctors with Firestore integration
 */
class RealDoctorService {
  private unsubscribeDoctor: (() => void) | null = null;

  /**
   * Clean data for Firestore (remove undefined values)
   * Firestore doesn't accept undefined values, only null or omitted fields
   */
  private cleanDataForFirestore<T extends Record<string, unknown>>(data: T): Partial<T> {
    const cleaned: Partial<T> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        (cleaned as Record<string, unknown>)[key] = value;
      }
    }
    return cleaned;
  }

  /**
   * Create a new doctor in Firestore
   */
  async createDoctor(doctorData: Omit<Doctor, 'id'>): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      // Clean data to remove undefined values
      const cleanedData = this.cleanDataForFirestore(doctorData);
      
      const docRef = await addDoc(collection(db, 'doctors'), cleanedData);
      console.log('Doctor created with ID:', docRef.id);
      
      return {
        success: true,
        id: docRef.id
      };
    } catch (error) {
      console.error('Error creating doctor:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create doctor'
      };
    }
  }

  /**
   * Update an existing doctor in Firestore
   */
  async updateDoctor(doctorId: string, updates: Partial<Doctor>): Promise<{ success: boolean; error?: string }> {
    try {
      const doctorRef = doc(db, 'doctors', doctorId);
      
      // Clean data to remove undefined values and add timestamp
      const cleanedUpdates = this.cleanDataForFirestore({
        ...updates,
        updatedAt: new Date().toISOString()
      });
      
      await updateDoc(doctorRef, cleanedUpdates);
      
      console.log('Doctor updated:', doctorId);
      return { success: true };
    } catch (error) {
      console.error('Error updating doctor:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update doctor'
      };
    }
  }

  /**
   * Delete a doctor from Firestore
   */
  async deleteDoctor(doctorId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const doctorRef = doc(db, 'doctors', doctorId);
      await deleteDoc(doctorRef);
      
      console.log('Doctor deleted:', doctorId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting doctor:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete doctor'
      };
    }
  }

  /**
   * Set up real-time listener for doctors
   */
  setupRealTimeListener(
    onDoctorsUpdate: (doctors: Doctor[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    try {
      const doctorsQuery = query(
        collection(db, 'doctors'),
        orderBy('name', 'asc')
      );

      this.unsubscribeDoctor = onSnapshot(
        doctorsQuery,
        (snapshot) => {
          const doctors: Doctor[] = [];
          
          snapshot.forEach((doc) => {
            const data = doc.data();
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

          console.log(`Real-time update: ${doctors.length} doctors loaded`);
          onDoctorsUpdate(doctors);
        },
        (error) => {
          console.error('Real-time doctors listener error:', error);
          if (onError) onError(error);
        }
      );

      return this.unsubscribeDoctor;
    } catch (error) {
      console.error('Error setting up real-time listener:', error);
      if (onError && error instanceof Error) onError(error);
      return () => {};
    }
  }

  /**
   * Cleanup real-time listener
   */
  cleanup(): void {
    if (this.unsubscribeDoctor) {
      this.unsubscribeDoctor();
      this.unsubscribeDoctor = null;
    }
  }
}

// Export singleton instance
const realDoctorService = new RealDoctorService();
export default realDoctorService;
