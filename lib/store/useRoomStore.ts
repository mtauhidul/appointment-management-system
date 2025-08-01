import { Room } from "@/lib/types";
import { create } from "zustand";

interface RoomStore {
  rooms: Room[];
  isLoading: boolean;
  addRoom: (room: Room) => void;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  assignDoctorToRoom: (roomId: string, doctorId: string) => void;
  removeDoctorFromRoom: (roomId: string, doctorId: string) => void;
  // New methods for Firestore integration
  setRooms: (rooms: Room[]) => void;
  setLoading: (loading: boolean) => void;
  // Real Firestore operations
  addRoomToFirestore: (roomData: Omit<Room, 'id'>) => Promise<boolean>;
  updateRoomInFirestore: (id: string, updates: Partial<Room>) => Promise<boolean>;
  deleteRoomFromFirestore: (id: string) => Promise<boolean>;
}

export const useRoomStore = create<RoomStore>((set) => ({
  rooms: [],
  isLoading: false,

  // ✅ Set rooms (used by real-time listeners)
  setRooms: (rooms) => set({ rooms }),
  
  // ✅ Set loading state
  setLoading: (isLoading) => set({ isLoading }),

  // ✅ Add a new room (local state only - for real-time updates)
  addRoom: (room) =>
    set((state) => ({
      rooms: [...state.rooms, room],
    })),

  // ✅ Update a room's properties (local state only - for real-time updates)
  updateRoom: (id, updates) =>
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === id ? { ...room, ...updates } : room
      ),
    })),

  // ✅ Delete a room by ID (local state only - for real-time updates)
  deleteRoom: (id) =>
    set((state) => ({
      rooms: state.rooms.filter((room) => room.id !== id),
    })),

  // ✅ Assign a doctor to a room using doctor ID (local state only)
  assignDoctorToRoom: (roomId, doctorId) =>
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === roomId
          ? {
              ...room,
              doctorsAssigned: Array.from(
                new Set([...room.doctorsAssigned, doctorId])
              ),
            }
          : room
      ),
    })),

  // ✅ Remove a doctor from a room using doctor ID (local state only)
  removeDoctorFromRoom: (roomId, doctorId) =>
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === roomId
          ? {
              ...room,
              doctorsAssigned: room.doctorsAssigned.filter(
                (id) => id !== doctorId
              ),
            }
          : room
      ),
    })),

  // 🔥 REAL FIRESTORE OPERATIONS
  
  // ✅ Add room to Firestore (this will trigger real-time update)
  addRoomToFirestore: async (roomData) => {
    set({ isLoading: true });
    try {
      const roomService = (await import('@/lib/services/room-service')).default;
      const result = await roomService.createRoom(roomData);
      
      if (result.success) {
        console.log('Room added to Firestore:', result.id);
        return true;
      } else {
        console.error('Failed to add room:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Error adding room to Firestore:', error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // ✅ Update room in Firestore (this will trigger real-time update)
  updateRoomInFirestore: async (id, updates) => {
    try {
      const roomService = (await import('@/lib/services/room-service')).default;
      const result = await roomService.updateRoom(id, updates);
      
      if (result.success) {
        console.log('Room updated in Firestore:', id);
        return true;
      } else {
        console.error('Failed to update room:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Error updating room in Firestore:', error);
      return false;
    }
  },

  // ✅ Delete room from Firestore (this will trigger real-time update)
  deleteRoomFromFirestore: async (id) => {
    set({ isLoading: true });
    try {
      const roomService = (await import('@/lib/services/room-service')).default;
      const result = await roomService.deleteRoom(id);
      
      if (result.success) {
        console.log('Room deleted from Firestore:', id);
        return true;
      } else {
        console.error('Failed to delete room:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Error deleting room from Firestore:', error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
}));
