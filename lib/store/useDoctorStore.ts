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

  // ✅ Add a new doctor
  addDoctor: (doctor) =>
    set((state) => ({ doctors: [...state.doctors, doctor] })),

  // ✅ Update doctor details
  updateDoctor: (id, updates) =>
    set((state) => ({
      doctors: state.doctors.map((doc) =>
        doc.id === id ? { ...doc, ...updates } : doc
      ),
    })),

  // ✅ Delete a doctor (Removes assigned rooms)
  deleteDoctor: (id) => {
    const { updateRoom } = useRoomStore.getState();

    // Remove doctor from all rooms before deleting
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

  // ✅ Assign a room to a doctor (Only using IDs)
  assignRoom: (doctorId, roomId) =>
    set((state) => ({
      doctors: state.doctors.map((doc) =>
        doc.id === doctorId && !doc.roomsAssigned.includes(roomId)
          ? { ...doc, roomsAssigned: [...doc.roomsAssigned, roomId] }
          : doc
      ),
    })),

  // ✅ Remove a room assignment from a doctor
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

  // ✅ Assign a patient to a doctor
  assignPatient: (doctorId, patientId) =>
    set((state) => ({
      doctors: state.doctors.map((doc) =>
        doc.id === doctorId && !doc.patients.includes(patientId)
          ? { ...doc, patients: [...doc.patients, patientId] }
          : doc
      ),
    })),

  // ✅ Remove a patient from a doctor
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

  // ✅ Assign an assistant to a doctor (Only using IDs, prevents duplicates)
  assignAssistant: (doctorId, assistantId) =>
    set((state) => ({
      doctors: state.doctors.map((doc) =>
        doc.id === doctorId
          ? {
              ...doc,
              assistantsAssigned: Array.from(
                new Set([...doc.assistantsAssigned, assistantId])
              ), // Prevent duplicates
            }
          : doc
      ),
    })),

  // ✅ Remove an assistant from a doctor
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
