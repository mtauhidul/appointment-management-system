import { Receptionist } from "@/lib/types";
import { create } from "zustand";

interface ReceptionistStore {
  receptionists: Receptionist[];
  isLoading: boolean;
  // Local state management (for real-time updates)
  addReceptionist: (receptionist: Receptionist) => void;
  updateReceptionist: (id: string, updates: Partial<Receptionist>) => void;
  deleteReceptionist: (id: string) => void;
  setReceptionists: (receptionists: Receptionist[]) => void;
  setLoading: (loading: boolean) => void;
  // Firestore operations
  addReceptionistToFirestore: (receptionistData: Omit<Receptionist, 'id'>) => Promise<boolean>;
  updateReceptionistInFirestore: (id: string, updates: Partial<Receptionist>) => Promise<boolean>;
  deleteReceptionistFromFirestore: (id: string) => Promise<boolean>;
}

export const useReceptionistStore = create<ReceptionistStore>((set) => ({
  receptionists: [],
  isLoading: false,

  // ✅ Set receptionists (used by real-time listeners)
  setReceptionists: (receptionists) => set({ receptionists }),
  
  // ✅ Set loading state
  setLoading: (isLoading) => set({ isLoading }),

  // ✅ Add a new receptionist (local state only - prevents duplicates)
  addReceptionist: (receptionist) =>
    set((state) => {
      if (state.receptionists.some((r) => r.id === receptionist.id))
        return state; // Prevents duplicate IDs
      return { receptionists: [...state.receptionists, receptionist] };
    }),

  // ✅ Update an existing receptionist (local state only)
  updateReceptionist: (id, updates) =>
    set((state) => ({
      receptionists: state.receptionists.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    })),

  // ✅ Delete a receptionist by ID (local state only)
  deleteReceptionist: (id) =>
    set((state) => ({
      receptionists: state.receptionists.filter((r) => r.id !== id),
    })),

  // 🔥 REAL FIRESTORE OPERATIONS
  
  // ✅ Add receptionist to Firestore (this will trigger real-time update)
  addReceptionistToFirestore: async (receptionistData) => {
    set({ isLoading: true });
    try {
      const receptionistService = (await import('@/lib/services/receptionist-service')).default;
      const result = await receptionistService.createReceptionist(receptionistData);
      
      if (result.success) {
        console.log('Receptionist added to Firestore:', result.id);
        return true;
      } else {
        console.error('Failed to add receptionist:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Error adding receptionist to Firestore:', error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // ✅ Update receptionist in Firestore (this will trigger real-time update)
  updateReceptionistInFirestore: async (id, updates) => {
    try {
      const receptionistService = (await import('@/lib/services/receptionist-service')).default;
      const result = await receptionistService.updateReceptionist(id, updates);
      
      if (result.success) {
        console.log('Receptionist updated in Firestore:', id);
        return true;
      } else {
        console.error('Failed to update receptionist:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Error updating receptionist in Firestore:', error);
      return false;
    }
  },

  // ✅ Delete receptionist from Firestore (this will trigger real-time update)
  deleteReceptionistFromFirestore: async (id) => {
    set({ isLoading: true });
    try {
      const receptionistService = (await import('@/lib/services/receptionist-service')).default;
      const result = await receptionistService.deleteReceptionist(id);
      
      if (result.success) {
        console.log('Receptionist deleted from Firestore:', id);
        return true;
      } else {
        console.error('Failed to delete receptionist:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Error deleting receptionist from Firestore:', error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
}));
