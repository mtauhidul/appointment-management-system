import { create } from "zustand";

interface Room {
  id: string;
  number: number;
  doctorsAssigned: string[];
  patientAssigned?: string;
  status: string;
  isEmergency: boolean;
  color: string;
  statusTime: Date;
}

interface RoomStore {
  rooms: Room[];
  addRoom: (room: Room) => void;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  assignDoctorToRoom: (roomId: string, doctorName: string) => void;
  removeDoctorFromRoom: (roomId: string, doctorName: string) => void;
}

export const useRoomStore = create<RoomStore>((set) => ({
  rooms: [],

  addRoom: (room) => set((state) => ({ rooms: [...state.rooms, room] })),

  updateRoom: (id, updates) =>
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === id ? { ...room, ...updates } : room
      ),
    })),

  deleteRoom: (id) =>
    set((state) => ({
      rooms: state.rooms.filter((room) => room.id !== id),
    })),

  assignDoctorToRoom: (roomId, doctorName) =>
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === roomId && !room.doctorsAssigned.includes(doctorName)
          ? { ...room, doctorsAssigned: [...room.doctorsAssigned, doctorName] }
          : room
      ),
    })),

  removeDoctorFromRoom: (roomId, doctorName) =>
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === roomId
          ? {
              ...room,
              doctorsAssigned: room.doctorsAssigned.filter(
                (doc) => doc !== doctorName
              ),
            }
          : room
      ),
    })),
}));
