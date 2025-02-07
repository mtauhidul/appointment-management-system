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
import { useMemo, useState } from "react";

const ResourcesSection = () => {
  const { toast } = useToast();
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
      toast({
        title: "Error",
        description: "Invalid or duplicate room number.",
        variant: "destructive",
      });
      return;
    }
    setRooms((prev) => [...prev, roomNumber].sort((a, b) => a - b));
    setNewRoom("");
    setIsDialogOpen(false);
    toast({
      title: "Success",
      description: `Room #${roomNumber} created successfully!`,
    });
  };

  const toggleRoomSelection = (room: number) => {
    if (assignedRooms[room]) {
      toast({
        title: "Error",
        description: "Room already assigned. Unassign it first.",
        variant: "destructive",
      });
      return;
    }
    setSelectedRooms((prev) =>
      prev.includes(room) ? prev.filter((r) => r !== room) : [...prev, room]
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
    setAssignedRooms((prev) => ({
      ...prev,
      ...Object.fromEntries(
        selectedRooms.map((room) => [room, selectedDoctor])
      ),
    }));
    setSelectedRooms([]);
    toast({
      title: "Success",
      description: `Rooms assigned to Dr. ${selectedDoctor}!`,
    });
  };

  const unassignRoom = (room: number) => {
    setAssignedRooms((prev) => {
      const updated = { ...prev };
      delete updated[room];
      return updated;
    });
    toast({
      title: "Success",
      description: `Room #${room} unassigned successfully!`,
    });
  };

  const removeRoom = (room: number) => {
    if (assignedRooms[room]) {
      toast({
        title: "Error",
        description: "Room is assigned. Unassign it first before removing.",
        variant: "destructive",
      });
      return;
    }
    setRooms((prev) => prev.filter((r) => r !== room));
    toast({
      title: "Success",
      description: `Room #${room} removed successfully!`,
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
              key={room}
              className={`relative p-4 rounded-lg border shadow-md flex flex-col items-start gap-2 transition ${
                assignedRooms[room]
                  ? "bg-red-50 border-red-500"
                  : selectedRooms.includes(room)
                  ? "bg-blue-50 border-blue-500"
                  : "bg-white border-gray-300"
              }`}
            >
              <div className="flex justify-between w-full items-center">
                <h3 className="text-lg font-semibold">Room #{room}</h3>
                {assignedRooms[room] && (
                  <span className="text-sm bg-red-500 text-white rounded px-2">
                    Assigned to {assignedRooms[room]}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 w-full">
                {!assignedRooms[room] && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleRoomSelection(room)}
                    >
                      {selectedRooms.includes(room) ? "Unselect" : "Select"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeRoom(room)}
                    >
                      Remove
                    </Button>
                  </>
                )}
                {assignedRooms[room] && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => unassignRoom(room)}
                  >
                    Unassign
                  </Button>
                )}
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
            <Button onClick={createRoom} className="mt-4">
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
