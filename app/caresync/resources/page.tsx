"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { useDoctorStore } from "@/lib/store/useDoctorStore";
import { useRoomStore } from "@/lib/store/useRoomStore";
import { useMemo, useState } from "react";

const ResourcesSection = () => {
  const { toast } = useToast();
  const { rooms, addRoom, updateRoom, deleteRoom } = useRoomStore();
  const { doctors, assignRoom, removeRoomAssignment } = useDoctorStore();

  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRoom, setNewRoom] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);

  // ✅ Filter rooms dynamically based on search query
  const filteredRooms = useMemo(
    () => rooms.filter((room) => room.number.toString().includes(searchQuery)),
    [rooms, searchQuery]
  );

  // ✅ Handle Room Creation
  const handleCreateRoom = () => {
    const roomNumber = parseInt(newRoom);
    if (isNaN(roomNumber) || rooms.some((room) => room.number === roomNumber)) {
      toast({
        title: "Error",
        description: "Invalid or duplicate room number.",
        variant: "destructive",
      });
      return;
    }

    const newRoomId = `${Date.now()}`; // Generate unique ID

    addRoom({
      id: newRoomId,
      number: roomNumber,
      doctorsAssigned: [],
      patientAssigned: undefined,
      status: "Available",
      isEmergency: false,
      color: "gray",
      statusTime: new Date(),
      statusOrder: 0,
    });

    setNewRoom("");
    setIsDialogOpen(false);
    toast({
      title: "Success",
      description: `Room #${roomNumber} created successfully!`,
    });
  };

  // ✅ Toggle Room Selection
  const toggleRoomSelection = (roomId: string) => {
    setSelectedRooms((prev) =>
      prev.includes(roomId)
        ? prev.filter((r) => r !== roomId)
        : [...prev, roomId]
    );
  };

  // ✅ Assign Selected Rooms to a Doctor
  const assignRooms = () => {
    if (!selectedDoctor) {
      toast({
        title: "Error",
        description: "Please select a doctor before assigning rooms.",
        variant: "destructive",
      });
      return;
    }

    let assignedCount = 0;

    selectedRooms.forEach((roomId) => {
      const currentRoom = rooms.find((room) => room.id === roomId)!;

      // ✅ Prevent duplicate assignments
      if (!currentRoom.doctorsAssigned.includes(selectedDoctor)) {
        updateRoom(roomId, {
          ...currentRoom,
          doctorsAssigned: [...currentRoom.doctorsAssigned, selectedDoctor],
        });

        assignRoom(selectedDoctor, roomId);
        assignedCount++;
      }
    });

    if (assignedCount === 0) {
      toast({
        title: "Info",
        description: "Selected rooms are already assigned to this doctor.",
        variant: "default",
      });
    } else {
      toast({
        title: "Success",
        description: `Rooms assigned to Dr. ${
          doctors.find((d) => d.id === selectedDoctor)?.name || "Unknown"
        }!`,
      });
    }

    setSelectedRooms([]);
  };

  // ✅ Unassign a Doctor from a Room
  const unassignDoctorFromRoom = (roomId: string, doctorId: string) => {
    const currentRoom = rooms.find((room) => room.id === roomId)!;

    updateRoom(roomId, {
      ...currentRoom,
      doctorsAssigned: currentRoom.doctorsAssigned.filter(
        (d) => d !== doctorId
      ),
    });

    removeRoomAssignment(doctorId, roomId);

    toast({
      title: "Success",
      description: `Dr. ${
        doctors.find((d) => d.id === doctorId)?.name || "Unknown"
      } unassigned from Room #${currentRoom.number}.`,
    });
  };

  // ✅ Handle Room Deletion
  const handleRemoveRoom = (roomId: string) => {
    deleteRoom(roomId);
    toast({
      title: "Success",
      description: `Room removed successfully!`,
    });
  };

  return (
    <>
      <div className="p-6 space-y-6 bg-gray-50 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* ✅ Select Doctor Dropdown */}
          <Select onValueChange={setSelectedDoctor}>
            <SelectTrigger className="w-full md:w-1/3">
              <SelectValue placeholder="Select Doctor" />
            </SelectTrigger>
            <SelectContent>
              {doctors.map((doctor) => (
                <SelectItem key={doctor.id} value={doctor.id}>
                  {doctor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* ✅ Search Rooms */}
          <Input
            placeholder="Search rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />

          {/* ✅ Create New Room */}
          <Button onClick={() => setIsDialogOpen(true)}>Create Room</Button>
        </div>

        {/* ✅ Rooms List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              className={`relative p-4 rounded-lg border shadow-md flex flex-col items-start gap-2 transition ${
                selectedRooms.includes(room.id)
                  ? "bg-blue-50 border-blue-500"
                  : "bg-white border-gray-300"
              }`}
            >
              <div className="flex justify-between w-full items-center">
                <h3 className="text-lg font-semibold">Room #{room.number}</h3>
              </div>

              {/* ✅ Assigned Doctors */}
              {room.doctorsAssigned
                .filter((doctorId) =>
                  doctors.some((doc) => doc.id === doctorId)
                ) // ✅ Only show existing doctors
                .map((doctorId) => (
                  <span
                    key={doctorId}
                    className="flex items-center bg-red-500 text-white text-xs px-2 py-1 rounded"
                  >
                    {doctors.find((d) => d.id === doctorId)?.name}
                    <button
                      onClick={() => unassignDoctorFromRoom(room.id, doctorId)}
                      className="ml-2 text-xs hover:text-gray-300"
                    >
                      ✕
                    </button>
                  </span>
                ))}

              {/* ✅ Room Actions */}
              <div className="flex items-center gap-2 w-full mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleRoomSelection(room.id)}
                >
                  {selectedRooms.includes(room.id) ? "Unselect" : "Select"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveRoom(room.id)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* ✅ Assign Rooms Button */}
        <div className="flex justify-end">
          <Button
            onClick={assignRooms}
            disabled={!selectedDoctor || selectedRooms.length === 0}
            className="bg-primary text-white"
          >
            Assign Rooms to Selected Doctor
          </Button>
        </div>

        {/* ✅ Create Room Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Room</DialogTitle>
            </DialogHeader>
            <Input
              placeholder="Enter room number"
              type="number"
              value={newRoom}
              onChange={(e) => setNewRoom(e.target.value)}
            />
            <Button onClick={handleCreateRoom} className="mt-4">
              Add Room
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <Toaster />
    </>
  );
};

export default ResourcesSection;
