import { create } from "zustand";

interface Receptionist {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty?: string;
}

interface ReceptionistStore {
  receptionists: Receptionist[];
  addReceptionist: (receptionist: Receptionist) => void;
  updateReceptionist: (id: string, updates: Partial<Receptionist>) => void;
  deleteReceptionist: (id: string) => void;
}

export const useReceptionistStore = create<ReceptionistStore>((set) => ({
  receptionists: [],

  addReceptionist: (receptionist: Receptionist) =>
    set((state: ReceptionistStore) => ({
      receptionists: [...state.receptionists, receptionist],
    })),

  updateReceptionist: (id: string, updates: Partial<Receptionist>) =>
    set((state: ReceptionistStore) => ({
      receptionists: state.receptionists.map((receptionist: Receptionist) =>
        receptionist.id === id ? { ...receptionist, ...updates } : receptionist
      ),
    })),

  deleteReceptionist: (id: string) =>
    set((state: ReceptionistStore) => ({
      receptionists: state.receptionists.filter(
        (receptionist: Receptionist) => receptionist.id !== id
      ),
    })),
}));
