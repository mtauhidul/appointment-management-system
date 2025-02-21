import { Status } from "@/lib/types";
import { create } from "zustand";

interface StatusStore {
  statuses: Status[];
  addStatus: (status: Status) => void;
  updateStatus: (id: string, updates: Partial<Status>) => void;
  deleteStatus: (id: string) => void;
}

export const useStatusStore = create<StatusStore>((set) => ({
  statuses: [],

  addStatus: (status: Status) =>
    set((state) => ({ statuses: [...state.statuses, status] })),

  updateStatus: (id: string, updates: Partial<Status>) =>
    set((state) => ({
      statuses: state.statuses.map((status) =>
        status.id === id ? { ...status, ...updates } : status
      ),
    })),

  deleteStatus: (id: string) =>
    set((state) => ({
      statuses: state.statuses.filter((status) => status.id !== id),
    })),
}));
