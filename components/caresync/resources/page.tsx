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
import { useMemo, useState } from "react";

const ResourcesSection = () => {
  const [rooms, setRooms] = useState<number[]>([1, 2, 3, 10, 12, 14, 16, 18]);
  const [selectedRooms, setSelectedRooms] = useState<number[]>([]);
  const [assignedRooms, setAssignedRooms] = useState<{ [key: number]: string }>(
    {}
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRoom, setNewRoom] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);

  const filteredRooms = useMemo(
    () => rooms.filter((room) => room.toString().includes(searchQuery)),
    [rooms, searchQuery]
  );

  const createRoom = () => {
    const roomNumber = parseInt(newRoom);
    if (isNaN(roomNumber) || rooms.includes(roomNumber)) {
      alert("Invalid or duplicate room number.");
      return;
    }
    setRooms((prev) => [...prev, roomNumber].sort((a, b) => a - b));
    setNewRoom("");
    setIsDialogOpen(false);
  };

  const toggleRoomSelection = (room: number) => {
    if (assignedRooms[room]) {
      alert("Room already assigned. Remove it first.");
      return;
    }
    setSelectedRooms((prev) =>
      prev.includes(room) ? prev.filter((r) => r !== room) : [...prev, room]
    );
  };

  const assignRooms = () => {
    if (!selectedDoctor) {
      alert("Please select a doctor before assigning rooms.");
      return;
    }
    setAssignedRooms((prev) => ({
      ...prev,
      ...Object.fromEntries(
        selectedRooms.map((room) => [room, selectedDoctor])
      ),
    }));
    setSelectedRooms([]);
  };

  const unassignRoom = (room: number) => {
    setAssignedRooms((prev) => {
      const updated = { ...prev };
      delete updated[room];
      return updated;
    });
  };

  const removeRoom = (room: number) => {
    if (assignedRooms[room]) {
      alert("Room is assigned. Unassign it first before removing.");
      return;
    }
    setRooms((prev) => prev.filter((r) => r !== room));
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 rounded-lg">
      {/* Doctor Selection and Actions */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <Select onValueChange={setSelectedDoctor}>
          <SelectTrigger className="w-full md:w-1/3">
            <SelectValue placeholder="Select Doctor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Dr. Smith">Dr. Smith</SelectItem>
            <SelectItem value="Dr. Adams">Dr. Adams</SelectItem>
            <SelectItem value="Dr. Johnson">Dr. Johnson</SelectItem>
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

      {/* Rooms Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredRooms.map((room) => (
          <div
            key={room}
            className={`relative p-4 rounded-lg shadow-lg border flex flex-col items-center justify-between ${
              assignedRooms[room]
                ? "bg-red-100 text-red-600"
                : selectedRooms.includes(room)
                ? "bg-blue-100 text-blue-600"
                : "bg-gray-100"
            }`}
          >
            {/* Room Number */}
            <div className="flex items-center justify-between w-full">
              <h3 className="text-lg font-bold"># {room}</h3>
              {assignedRooms[room] && (
                <span className="text-xs bg-red-500 text-white rounded px-2 py-1">
                  Assigned to {assignedRooms[room]}
                </span>
              )}
            </div>

            {/* Room Controls */}
            <div className="flex space-x-2 mt-4">
              {!assignedRooms[room] && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleRoomSelection(room)}
                  className="text-sm"
                >
                  {selectedRooms.includes(room) ? "Unselect" : "Select"}
                </Button>
              )}
              {!assignedRooms[room] && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeRoom(room)}
                  className="text-sm"
                >
                  Remove
                </Button>
              )}
              {assignedRooms[room] && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => unassignRoom(room)}
                  className="text-sm"
                >
                  Unassign
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Assign Rooms */}
      <div className="flex justify-end">
        <Button
          onClick={assignRooms}
          disabled={!selectedDoctor || selectedRooms.length === 0}
          className="bg-primary text-white"
        >
          Assign Rooms to Selected Doctor
        </Button>
      </div>

      {/* Create Room Dialog */}
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
          <Button onClick={createRoom} className="mt-4">
            Add Room
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResourcesSection;
