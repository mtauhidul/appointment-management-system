import { Status } from "@/lib/types";
import { create } from "zustand";

interface StatusStore {
  statuses: Status[];
  isLoading: boolean;
  // Local state management (for real-time updates)
  addStatus: (status: Status) => void;
  updateStatus: (id: string, updates: Partial<Status>) => void;
  deleteStatus: (id: string) => void;
  setStatuses: (statuses: Status[]) => void;
  setLoading: (loading: boolean) => void;
  // Firestore operations
  addStatusToFirestore: (statusData: Omit<Status, 'id'>) => Promise<boolean>;
  updateStatusInFirestore: (id: string, updates: Partial<Status>) => Promise<boolean>;
  deleteStatusFromFirestore: (id: string) => Promise<boolean>;
}

export const useStatusStore = create<StatusStore>((set) => ({
  statuses: [],
  isLoading: false,

  // ✅ Set statuses (used by real-time listeners)
  setStatuses: (statuses) => set({ statuses }),
  
  // ✅ Set loading state
  setLoading: (isLoading) => set({ isLoading }),

  // ✅ Add a new status (local state only - ensuring uniqueness)
  addStatus: (status) =>
    set((state) => ({
      statuses: Array.from(new Set([...state.statuses, status])),
    })),

  // ✅ Update a status by ID (local state only - immutable updates)
  updateStatus: (id, updates) =>
    set((state) => ({
      statuses: state.statuses.map((status) =>
        status.id === id ? { ...status, ...updates } : status
      ),
    })),

  // ✅ Delete a status by ID (local state only)
  deleteStatus: (id) =>
    set((state) => ({
      statuses: state.statuses.filter((status) => status.id !== id),
    })),

  // 🔥 REAL FIRESTORE OPERATIONS
  
  // ✅ Add status to Firestore (this will trigger real-time update)
  addStatusToFirestore: async (statusData) => {
    set({ isLoading: true });
    try {
      const statusService = (await import('@/lib/services/status-service')).default;
      const result = await statusService.createStatus(statusData);
      
      if (result.success) {
        console.log('Status added to Firestore:', result.id);
        return true;
      } else {
        console.error('Failed to add status:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Error adding status to Firestore:', error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // ✅ Update status in Firestore (this will trigger real-time update)
  updateStatusInFirestore: async (id, updates) => {
    try {
      const statusService = (await import('@/lib/services/status-service')).default;
      const result = await statusService.updateStatus(id, updates);
      
      if (result.success) {
        console.log('Status updated in Firestore:', id);
        return true;
      } else {
        console.error('Failed to update status:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Error updating status in Firestore:', error);
      return false;
    }
  },

  // ✅ Delete status from Firestore (this will trigger real-time update)
  deleteStatusFromFirestore: async (id) => {
    set({ isLoading: true });
    try {
      const statusService = (await import('@/lib/services/status-service')).default;
      const result = await statusService.deleteStatus(id);
      
      if (result.success) {
        console.log('Status deleted from Firestore:', id);
        return true;
      } else {
        console.error('Failed to delete status:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Error deleting status from Firestore:', error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
}));
