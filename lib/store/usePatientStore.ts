import { create } from "zustand";

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  medicalHistory: string[];
  assignedDoctor: string | null;
}

interface PatientStore {
  patients: Patient[];
  addPatient: (patient: Omit<Patient, "id">) => Patient;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  deletePatient: (id: string) => void;
  getPatientById: (id: string) => Patient | undefined;
}

export const usePatientStore = create<PatientStore>((set, get) => ({
  patients: [],

  addPatient: (patientData) => {
    const newPatient: Patient = {
      id: Math.random().toString(36).substr(2, 9),
      ...patientData,
    };

    set((state) => ({
      patients: [...state.patients, newPatient],
    }));

    return newPatient;
  },

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

  getPatientById: (id) => {
    return get().patients.find((patient) => patient.id === id);
  },
}));
