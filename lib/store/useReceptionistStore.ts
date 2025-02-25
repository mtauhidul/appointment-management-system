import { Receptionist } from "@/lib/types";
import { create } from "zustand";

interface ReceptionistStore {
  receptionists: Receptionist[];
  addReceptionist: (receptionist: Receptionist) => void;
  updateReceptionist: (id: string, updates: Partial<Receptionist>) => void;
  deleteReceptionist: (id: string) => void;
}

export const useReceptionistStore = create<ReceptionistStore>((set) => ({
  receptionists: [],

  // ✅ Add a new receptionist (Prevents duplicates)
  addReceptionist: (receptionist) =>
    set((state) => {
      if (state.receptionists.some((r) => r.id === receptionist.id))
        return state; // Prevents duplicate IDs
      return { receptionists: [...state.receptionists, receptionist] };
    }),

  // ✅ Update an existing receptionist
  updateReceptionist: (id, updates) =>
    set((state) => ({
      receptionists: state.receptionists.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    })),

  // ✅ Delete a receptionist by ID
  deleteReceptionist: (id) =>
    set((state) => ({
      receptionists: state.receptionists.filter((r) => r.id !== id),
    })),
}));
