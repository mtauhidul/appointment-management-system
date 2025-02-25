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

  // ✅ Add a new status (ensuring uniqueness)
  addStatus: (status) =>
    set((state) => ({
      statuses: Array.from(new Set([...state.statuses, status])),
    })),

  // ✅ Update a status by ID (immutable updates)
  updateStatus: (id, updates) =>
    set((state) => ({
      statuses: state.statuses.map((status) =>
        status.id === id ? { ...status, ...updates } : status
      ),
    })),

  // ✅ Delete a status by ID
  deleteStatus: (id) =>
    set((state) => ({
      statuses: state.statuses.filter((status) => status.id !== id),
    })),
}));
