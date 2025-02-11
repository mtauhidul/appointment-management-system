import { create } from "zustand";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  roomsAssigned: string[];
  assistantAssigned?: string;
  patients: string[];
}

interface DoctorStore {
  doctors: Doctor[];
  addDoctor: (doctor: Doctor) => void;
  updateDoctor: (id: string, updates: Partial<Doctor>) => void;
  deleteDoctor: (id: string) => void;
  assignRoom: (doctorId: string, roomId: string) => void;
  removeRoomAssignment: (doctorId: string, roomId: string) => void;
  assignPatient: (doctorId: string, patientId: string) => void;
  removePatient: (doctorId: string, patientId: string) => void;
}

export const useDoctorStore = create<DoctorStore>((set) => ({
  doctors: [],

  addDoctor: (doctor) =>
    set((state) => ({ doctors: [...state.doctors, doctor] })),

  updateDoctor: (id, updates) =>
    set((state) => ({
      doctors: state.doctors.map((doc) =>
        doc.id === id ? { ...doc, ...updates } : doc
      ),
    })),

  deleteDoctor: (id) =>
    set((state) => ({
      doctors: state.doctors.filter((doc) => doc.id !== id),
    })),

  assignRoom: (doctorId, roomId) =>
    set((state) => ({
      doctors: state.doctors.map((doc) =>
        doc.id === doctorId && !doc.roomsAssigned.includes(roomId)
          ? { ...doc, roomsAssigned: [...doc.roomsAssigned, roomId] }
          : doc
      ),
    })),

  removeRoomAssignment: (doctorId, roomId) =>
    set((state) => ({
      doctors: state.doctors.map((doc) =>
        doc.id === doctorId
          ? {
              ...doc,
              roomsAssigned: doc.roomsAssigned.filter((r) => r !== roomId),
            }
          : doc
      ),
    })),

  assignPatient: (doctorId, patientId) =>
    set((state) => ({
      doctors: state.doctors.map((doc) =>
        doc.id === doctorId && !doc.patients.includes(patientId)
          ? { ...doc, patients: [...doc.patients, patientId] }
          : doc
      ),
    })),

  removePatient: (doctorId, patientId) =>
    set((state) => ({
      doctors: state.doctors.map((doc) =>
        doc.id === doctorId
          ? {
              ...doc,
              patients: doc.patients.filter((p) => p !== patientId),
            }
          : doc
      ),
    })),
}));
