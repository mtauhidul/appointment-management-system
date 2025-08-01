import { create } from 'zustand';
import { Patient, PatientFormData } from '../types/patient';

interface PatientStore {
  patients: Patient[];
  isLoading: boolean;
  // Local state management (for real-time updates)
  addPatient: (patient: Patient) => void;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  deletePatient: (id: string) => void;
  setPatients: (patients: Patient[]) => void;
  setLoading: (loading: boolean) => void;
  // Utility methods
  getPatientById: (id: string) => Patient | undefined;
  getPatientsByDoctor: (doctorId: string) => Patient[];
  getPatientsByStatus: (status: Patient['checkInStatus']) => Patient[];
  searchPatients: (searchTerm: string) => Patient[];
  // Firestore operations
  addPatientToFirestore: (patientData: PatientFormData) => Promise<boolean>;
  updatePatientInFirestore: (id: string, updates: Partial<Patient>) => Promise<boolean>;
  deletePatientFromFirestore: (id: string) => Promise<boolean>;
}

export const usePatientStore = create<PatientStore>((set, get) => ({
  patients: [],
  isLoading: false,

  // Local state management
  addPatient: (patient) =>
    set((state) => ({
      patients: [patient, ...state.patients],
    })),

  updatePatient: (id, updates) =>
    set((state) => ({
      patients: state.patients.map((patient) =>
        patient.id === id ? { ...patient, ...updates } : patient
      ),
    })),

  deletePatient: (id) =>
    set((state) => ({
      patients: state.patients.filter((patient) => patient.id !== id),
    })),

  setPatients: (patients) => set({ patients }),

  setLoading: (loading) => set({ isLoading: loading }),

  // Utility methods
  getPatientById: (id) => {
    const { patients } = get();
    return patients.find((patient) => patient.id === id);
  },

  getPatientsByDoctor: (doctorId) => {
    const { patients } = get();
    return patients.filter((patient) => patient.doctorId === doctorId);
  },

  getPatientsByStatus: (status) => {
    const { patients } = get();
    return patients.filter((patient) => patient.checkInStatus === status);
  },

  searchPatients: (searchTerm) => {
    const { patients } = get();
    const searchLower = searchTerm.toLowerCase();
    return patients.filter(
      (patient) =>
        patient.firstName?.toLowerCase().includes(searchLower) ||
        patient.lastName?.toLowerCase().includes(searchLower) ||
        patient.email?.toLowerCase().includes(searchLower) ||
        `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchLower)
    );
  },

  // Firestore operations
  addPatientToFirestore: async (patientData) => {
    set({ isLoading: true });
    try {
      const patientService = (await import('@/lib/services/patient-service')).default;
      const id = await patientService.createPatient(patientData);
      
      // Add to local state
      const newPatient: Patient = {
        id,
        ...patientData,
        gender: patientData.gender as Patient['gender'],
        checkInStatus: 'not-checked-in',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      get().addPatient(newPatient);
      return true;
    } catch (error) {
      console.error('Error adding patient to Firestore:', error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  updatePatientInFirestore: async (id, updates) => {
    set({ isLoading: true });
    try {
      const patientService = (await import('@/lib/services/patient-service')).default;
      await patientService.updatePatient(id, updates);
      
      // Update local state
      get().updatePatient(id, { ...updates, updatedAt: new Date().toISOString() });
      return true;
    } catch (error) {
      console.error('Error updating patient in Firestore:', error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  deletePatientFromFirestore: async (id) => {
    set({ isLoading: true });
    try {
      const patientService = (await import('@/lib/services/patient-service')).default;
      await patientService.deletePatient(id);
      
      // Remove from local state
      get().deletePatient(id);
      return true;
    } catch (error) {
      console.error('Error deleting patient from Firestore:', error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
}));
