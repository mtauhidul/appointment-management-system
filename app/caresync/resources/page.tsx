"use client";

// Import Zustand store
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
import { useRoomStore } from "@/lib/store/useRoomStore";
import { useMemo, useState } from "react";

const ResourcesSection = () => {
  const { toast } = useToast();
  const { rooms, addRoom, updateRoom, deleteRoom } = useRoomStore(); // Zustand store

  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRoom, setNewRoom] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);

  const filteredRooms = useMemo(
    () => rooms.filter((room) => room.number.toString().includes(searchQuery)),
    [rooms, searchQuery]
  );

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

    addRoom({
      id: `${Date.now()}`,
      number: roomNumber,
      doctorsAssigned: [], // Now supports multiple doctors
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

  const toggleRoomSelection = (roomId: string) => {
    setSelectedRooms((prev) =>
      prev.includes(roomId)
        ? prev.filter((r) => r !== roomId)
        : [...prev, roomId]
    );
  };

  const assignRooms = () => {
    if (!selectedDoctor) {
      toast({
        title: "Error",
        description: "Please select a doctor before assigning rooms.",
        variant: "destructive",
      });
      return;
    }

    selectedRooms.forEach((roomId) => {
      const currentRoom = rooms.find((room) => room.id === roomId)!;

      if (!currentRoom.doctorsAssigned.includes(selectedDoctor)) {
        updateRoom(roomId, {
          ...currentRoom,
          doctorsAssigned: [...currentRoom.doctorsAssigned, selectedDoctor],
        });
      }
    });

    setSelectedRooms([]);
    toast({
      title: "Success",
      description: `Rooms assigned to Dr. ${selectedDoctor}!`,
    });
  };

  const unassignDoctorFromRoom = (roomId: string, doctor: string) => {
    const currentRoom = rooms.find((room) => room.id === roomId)!;

    updateRoom(roomId, {
      ...currentRoom,
      doctorsAssigned: currentRoom.doctorsAssigned.filter((d) => d !== doctor),
    });

    toast({
      title: "Success",
      description: `Dr. ${doctor} unassigned from Room #${currentRoom.number}.`,
    });
  };

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
          <Select onValueChange={setSelectedDoctor}>
            <SelectTrigger className="w-full md:w-1/3">
              <SelectValue placeholder="Select Doctor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Smith">Dr. Smith</SelectItem>
              <SelectItem value="Adams">Dr. Adams</SelectItem>
              <SelectItem value="Johnson">Dr. Johnson</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Search rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button onClick={() => setIsDialogOpen(true)}>Create Room</Button>
        </div>

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

              {room.doctorsAssigned.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {room.doctorsAssigned.map((doctor) => (
                    <span
                      key={doctor}
                      className="flex items-center bg-red-500 text-white text-xs px-2 py-1 rounded"
                    >
                      {doctor}
                      <button
                        onClick={() => unassignDoctorFromRoom(room.id, doctor)}
                        className="ml-2 text-xs hover:text-gray-300"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}

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

        <div className="flex justify-end">
          <Button
            onClick={assignRooms}
            disabled={!selectedDoctor || selectedRooms.length === 0}
            className="bg-primary text-white"
          >
            Assign Rooms to Selected Doctor
          </Button>
        </div>

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
