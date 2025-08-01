import { db } from '../firebase/config';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query,
  orderBy,
  where,
  Timestamp
} from 'firebase/firestore';
import { Patient, PatientFormData } from '../types/patient';

class PatientService {
  private collectionName = 'patients';

  /**
   * Get all patients from Firestore
   */
  async getAllPatients(): Promise<Patient[]> {
    try {
      const patientsRef = collection(db, this.collectionName);
      const q = query(patientsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      })) as Patient[];
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  }

  /**
   * Get a single patient by ID
   */
  async getPatientById(id: string): Promise<Patient | null> {
    try {
      const patientRef = doc(db, this.collectionName, id);
      const patientSnap = await getDoc(patientRef);
      
      if (patientSnap.exists()) {
        const data = patientSnap.data();
        return {
          id: patientSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        } as Patient;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching patient:', error);
      throw error;
    }
  }

  /**
   * Create a new patient
   */
  async createPatient(patientData: PatientFormData): Promise<string> {
    try {
      const now = Timestamp.now();
      const patientDoc = {
        ...patientData,
        checkInStatus: 'not-checked-in' as const,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(db, this.collectionName), patientDoc);
      console.log('Patient created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  }

  /**
   * Update an existing patient
   */
  async updatePatient(id: string, updates: Partial<PatientFormData & { checkInStatus?: Patient['checkInStatus'], appointmentId?: string, doctorId?: string, roomId?: string }>): Promise<void> {
    try {
      const patientRef = doc(db, this.collectionName, id);
      await updateDoc(patientRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
      console.log('Patient updated:', id);
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  }

  /**
   * Delete a patient
   */
  async deletePatient(id: string): Promise<void> {
    try {
      const patientRef = doc(db, this.collectionName, id);
      await deleteDoc(patientRef);
      console.log('Patient deleted:', id);
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }
  }

  /**
   * Get patients by doctor ID
   */
  async getPatientsByDoctor(doctorId: string): Promise<Patient[]> {
    try {
      const patientsRef = collection(db, this.collectionName);
      const q = query(
        patientsRef, 
        where('doctorId', '==', doctorId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      })) as Patient[];
    } catch (error) {
      console.error('Error fetching patients by doctor:', error);
      throw error;
    }
  }

  /**
   * Get patients by check-in status
   */
  async getPatientsByStatus(status: Patient['checkInStatus']): Promise<Patient[]> {
    try {
      const patientsRef = collection(db, this.collectionName);
      const q = query(
        patientsRef, 
        where('checkInStatus', '==', status),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      })) as Patient[];
    } catch (error) {
      console.error('Error fetching patients by status:', error);
      throw error;
    }
  }

  /**
   * Search patients by name or email
   */
  async searchPatients(searchTerm: string): Promise<Patient[]> {
    try {
      const patientsRef = collection(db, this.collectionName);
      const querySnapshot = await getDocs(patientsRef);
      
      const allPatients = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      })) as Patient[];

      // Client-side filtering (Firestore doesn't support complex text search)
      const searchLower = searchTerm.toLowerCase();
      return allPatients.filter(patient => 
        patient.firstName?.toLowerCase().includes(searchLower) ||
        patient.lastName?.toLowerCase().includes(searchLower) ||
        patient.email?.toLowerCase().includes(searchLower) ||
        `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchLower)
      );
    } catch (error) {
      console.error('Error searching patients:', error);
      throw error;
    }
  }
}

const patientService = new PatientService();
export default patientService;
