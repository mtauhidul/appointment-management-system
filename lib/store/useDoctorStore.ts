import {
  Doctor,
  DoctorAvailability,
  TimeSlot,
  createEmptyAvailability,
} from "@/lib/types";
import { create } from "zustand";
import { useRoomStore } from "./useRoomStore";

interface DoctorStore {
  doctors: Doctor[];
  isLoading: boolean;
  // Local state management (for real-time updates)
  addDoctor: (doctor: Doctor) => void;
  updateDoctor: (id: string, updates: Partial<Doctor>) => void;
  deleteDoctor: (id: string) => void;
  setDoctors: (doctors: Doctor[]) => void;
  setLoading: (loading: boolean) => void;
  // Room and patient assignments (local only)
  assignRoom: (doctorId: string, roomId: string) => void;
  removeRoomAssignment: (doctorId: string, roomId: string) => void;
  assignPatient: (doctorId: string, patientId: string) => void;
  removePatient: (doctorId: string, patientId: string) => void;
  assignAssistant: (doctorId: string, assistantId: string) => void;
  removeAssistant: (doctorId: string, assistantId: string) => void;
  // Availability methods (local only)
  addTimeSlot: (
    doctorId: string,
    day: keyof DoctorAvailability,
    timeSlot: TimeSlot
  ) => void;
  updateTimeSlot: (
    doctorId: string,
    day: keyof DoctorAvailability,
    timeSlotId: string,
    updates: Partial<TimeSlot>
  ) => void;
  removeTimeSlot: (
    doctorId: string,
    day: keyof DoctorAvailability,
    timeSlotId: string
  ) => void;
  setAvailability: (doctorId: string, availability: DoctorAvailability) => void;
  // Firestore operations
  addDoctorToFirestore: (doctorData: Omit<Doctor, 'id'>) => Promise<boolean>;
  updateDoctorInFirestore: (id: string, updates: Partial<Doctor>) => Promise<boolean>;
  deleteDoctorFromFirestore: (id: string) => Promise<boolean>;
}

export const useDoctorStore = create<DoctorStore>((set) => ({
  doctors: [],
  isLoading: false,

  // ✅ Set doctors (used by real-time listeners)
  setDoctors: (doctors) => set({ doctors }),
  
  // ✅ Set loading state
  setLoading: (isLoading) => set({ isLoading }),

  // ✅ Add a new doctor with empty availability (local state only)
  addDoctor: (doctor) =>
    set((state) => ({
      doctors: [
        ...state.doctors,
        {
          ...doctor,
          availability: doctor.availability || createEmptyAvailability(),
        },
      ],
    })),

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

  // ✅ Add a time slot to a specific day
  addTimeSlot: (doctorId, day, timeSlot) =>
    set((state) => ({
      doctors: state.doctors.map((doc) =>
        doc.id === doctorId
          ? {
              ...doc,
              availability: {
                ...doc.availability,
                [day]: [...(doc.availability?.[day] || []), timeSlot],
              },
            }
          : doc
      ),
    })),

  // ✅ Update a specific time slot
  updateTimeSlot: (doctorId, day, timeSlotId, updates) =>
    set((state) => ({
      doctors: state.doctors.map((doc) =>
        doc.id === doctorId
          ? {
              ...doc,
              availability: {
                ...doc.availability,
                [day]: (doc.availability?.[day] || []).map((slot) =>
                  slot.id === timeSlotId ? { ...slot, ...updates } : slot
                ),
              },
            }
          : doc
      ),
    })),

  // ✅ Remove a time slot
  removeTimeSlot: (doctorId, day, timeSlotId) =>
    set((state) => ({
      doctors: state.doctors.map((doc) =>
        doc.id === doctorId
          ? {
              ...doc,
              availability: {
                ...doc.availability,
                [day]: (doc.availability?.[day] || []).filter(
                  (slot) => slot.id !== timeSlotId
                ),
              },
            }
          : doc
      ),
    })),

  // ✅ Set the entire availability schedule for a doctor
  setAvailability: (doctorId, availability) =>
    set((state) => ({
      doctors: state.doctors.map((doc) =>
        doc.id === doctorId
          ? {
              ...doc,
              availability,
            }
          : doc
      ),
    })),

  // 🔥 REAL FIRESTORE OPERATIONS
  
  // ✅ Add doctor to Firestore (this will trigger real-time update)
  addDoctorToFirestore: async (doctorData) => {
    set({ isLoading: true });
    try {
      const doctorService = (await import('@/lib/services/doctor-service')).default;
      const result = await doctorService.createDoctor(doctorData);
      
      if (result.success) {
        console.log('Doctor added to Firestore:', result.id);
        return true;
      } else {
        console.error('Failed to add doctor:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Error adding doctor to Firestore:', error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // ✅ Update doctor in Firestore (this will trigger real-time update)
  updateDoctorInFirestore: async (id, updates) => {
    try {
      const doctorService = (await import('@/lib/services/doctor-service')).default;
      const result = await doctorService.updateDoctor(id, updates);
      
      if (result.success) {
        console.log('Doctor updated in Firestore:', id);
        return true;
      } else {
        console.error('Failed to update doctor:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Error updating doctor in Firestore:', error);
      return false;
    }
  },

  // ✅ Delete doctor from Firestore (this will trigger real-time update)
  deleteDoctorFromFirestore: async (id) => {
    set({ isLoading: true });
    try {
      const doctorService = (await import('@/lib/services/doctor-service')).default;
      const result = await doctorService.deleteDoctor(id);
      
      if (result.success) {
        console.log('Doctor deleted from Firestore:', id);
        return true;
      } else {
        console.error('Failed to delete doctor:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Error deleting doctor from Firestore:', error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
}));
