import { Room } from "@/lib/types";
import { create } from "zustand";

interface RoomStore {
  rooms: Room[];
  addRoom: (room: Room) => void;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  assignDoctorToRoom: (roomId: string, doctorId: string) => void;
  removeDoctorFromRoom: (roomId: string, doctorId: string) => void;
}

export const useRoomStore = create<RoomStore>((set) => ({
  rooms: [],

  // ✅ Add a new room
  addRoom: (room) =>
    set((state) => ({
      rooms: [...state.rooms, room],
    })),

  // ✅ Update a room's properties
  updateRoom: (id, updates) =>
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === id ? { ...room, ...updates } : room
      ),
    })),

  // ✅ Delete a room by ID
  deleteRoom: (id) =>
    set((state) => ({
      rooms: state.rooms.filter((room) => room.id !== id),
    })),

  // ✅ Assign a doctor to a room using doctor ID (prevents duplicates)
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

  // ✅ Remove a doctor from a room using doctor ID
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
}));
