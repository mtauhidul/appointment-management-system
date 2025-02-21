import { Doctor } from "@/lib/types";
import { create } from "zustand";
import { useRoomStore } from "./useRoomStore";

interface DoctorStore {
  doctors: Doctor[];
  addDoctor: (doctor: Doctor) => void;
  updateDoctor: (id: string, updates: Partial<Doctor>) => void;
  deleteDoctor: (id: string) => void;
  assignRoom: (doctorId: string, roomId: string) => void;
  removeRoomAssignment: (doctorId: string, roomId: string) => void;
  assignPatient: (doctorId: string, patientId: string) => void;
  removePatient: (doctorId: string, patientId: string) => void;
  assignAssistant: (doctorId: string, assistantId: string) => void;
  removeAssistant: (doctorId: string, assistantId: string) => void;
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

  deleteDoctor: (id) => {
    const { updateRoom } = useRoomStore.getState();

    useRoomStore.getState().rooms.forEach((room) => {
      if (room.doctorsAssigned.includes(id)) {
        updateRoom(room.id, {
          doctorsAssigned: room.doctorsAssigned.filter((docId) => docId !== id),
        });
      }
    });

    set((state) => ({
      doctors: state.doctors.filter((doc) => doc.id !== id),
    }));
  },

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

  assignAssistant: (doctorId, assistantId) =>
    set((state) => ({
      doctors: state.doctors.map((doc) =>
        doc.id === doctorId
          ? {
              ...doc,
              assistantsAssigned: Array.from(
                new Set([...doc.assistantsAssigned, assistantId])
              ), // Ensure unique assistants
            }
          : doc
      ),
    })),

  removeAssistant: (doctorId, assistantId) =>
    set((state) => ({
      doctors: state.doctors.map((doc) =>
        doc.id === doctorId
          ? {
              ...doc,
              assistantsAssigned: doc.assistantsAssigned.filter(
                (aId) => aId !== assistantId
              ),
            }
          : doc
      ),
    })),
}));
