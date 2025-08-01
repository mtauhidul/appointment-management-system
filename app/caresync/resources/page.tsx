"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { useDoctorStore } from "@/lib/store/useDoctorStore";
import { useRoomStore } from "@/lib/store/useRoomStore";
import {
  Building2,
  Check,
  DoorOpen,
  Plus,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const ResourcesSection = () => {
  const { toast } = useToast();
  const { 
    rooms, 
    isLoading: roomsLoading,
    addRoomToFirestore,
    updateRoomInFirestore,
    deleteRoomFromFirestore
  } = useRoomStore();
  const { doctors, assignRoom, removeRoomAssignment } = useDoctorStore();

  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRoom, setNewRoom] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  // ✅ Filter rooms dynamically based on search query
  const filteredRooms = useMemo(
    () => rooms.filter((room) => room.number.toString().includes(searchQuery)),
    [rooms, searchQuery]
  );

  // ✅ Handle Room Creation
  const handleCreateRoom = async () => {
    const roomNumber = parseInt(newRoom);
    if (isNaN(roomNumber) || rooms.some((room) => room.number === roomNumber)) {
      toast({
        title: "Error",
        description: "Invalid or duplicate room number.",
        variant: "destructive",
      });
      return;
    }

    // Create room data
    const roomData = {
      number: roomNumber,
      doctorsAssigned: [], // No doctors assigned by default
      doctorStatuses: {},
      isEmergency: false,
      // Note: patientAssigned is omitted (undefined fields not allowed in Firestore)
    };

    // Add to Firestore (this will trigger real-time update)
    const success = await addRoomToFirestore(roomData);
    
    if (success) {
      setNewRoom("");
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: `Room ${roomNumber} created successfully!`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to create room. Please try again.",
        variant: "destructive",
      });
    }
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
  const assignRooms = async () => {
    if (!selectedDoctor) {
      toast({
        title: "Error",
        description: "Please select a doctor before assigning rooms.",
        variant: "destructive",
      });
      return;
    }

    setIsAssigning(true);
    let assignedCount = 0;
    let hasErrors = false;

    for (const roomId of selectedRooms) {
      const currentRoom = rooms.find((room) => room.id === roomId);
      if (!currentRoom) continue;

      // ✅ Prevent duplicate assignments
      if (!currentRoom.doctorsAssigned.includes(selectedDoctor)) {
        // Update Firestore
        const success = await updateRoomInFirestore(roomId, {
          doctorsAssigned: [...currentRoom.doctorsAssigned, selectedDoctor],
        });
        
        if (success) {
          assignRoom(selectedDoctor, roomId);
          assignedCount++;
        } else {
          hasErrors = true;
          console.error(`Failed to assign room ${roomId} to doctor ${selectedDoctor}`);
        }
      }
    }

    if (hasErrors) {
      toast({
        title: "Partial Success",
        description: "Some room assignments failed. Please check and try again.",
        variant: "destructive",
      });
    } else if (assignedCount === 0) {
      toast({
        title: "Info",
        description: "Selected rooms are already assigned to this doctor.",
        variant: "default",
      });
    } else {
      toast({
        title: "Success",
        description: `${assignedCount} room${
          assignedCount !== 1 ? "s" : ""
        } assigned to Dr. ${
          doctors.find((d) => d.id === selectedDoctor)?.name || "Unknown"
        }!`,
      });
    }

    // ✅ Reset state after assignment
    setSelectedRooms([]);
    setSelectedDoctor(null);
    setIsAssigning(false);
  };

  // ✅ Unassign a Doctor from a Room
  const unassignDoctorFromRoom = async (roomId: string, doctorId: string) => {
    const currentRoom = rooms.find((room) => room.id === roomId);
    if (!currentRoom) return;

    // Update Firestore
    const success = await updateRoomInFirestore(roomId, {
      doctorsAssigned: currentRoom.doctorsAssigned.filter(
        (d) => d !== doctorId
      ),
    });

    if (success) {
      removeRoomAssignment(doctorId, roomId);

      toast({
        title: "Success",
        description: `Dr. ${
          doctors.find((d) => d.id === doctorId)?.name || "Unknown"
        } unassigned from Room ${currentRoom.number}.`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to unassign doctor. Please try again.",
        variant: "destructive",
      });
    }
  };

  // ✅ Handle Room Deletion
  const handleRemoveRoom = async (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;

    if (confirm(`Are you sure you want to remove Room ${room.number}?`)) {
      // Delete from Firestore (this will trigger real-time update)
      const success = await deleteRoomFromFirestore(roomId);
      
      if (success) {
        // Remove this room from selected rooms if it's there
        if (selectedRooms.includes(roomId)) {
          setSelectedRooms((prev) => prev.filter((id) => id !== roomId));
        }

        toast({
          title: "Success",
          description: `Room ${room.number} removed successfully!`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to remove room. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  // Reset the room creation form
  const resetRoomForm = () => {
    setNewRoom("");
  };

  return (
    <>
      <div className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold flex items-center">
              <Building2 className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-primary" />
              <span>Rooms Management</span>
            </h1>
            <p className="text-sm text-gray-500 mt-0.5 hidden sm:block">
              Manage and assign rooms to doctors
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="py-1 px-2 text-xs">
              <DoorOpen className="h-3.5 w-3.5 mr-1" />
              {rooms.length} {rooms.length === 1 ? "Room" : "Rooms"}
            </Badge>

            <Badge variant="outline" className="py-1 px-2 text-xs">
              <UserRound className="h-3.5 w-3.5 mr-1" />
              {doctors.length} {doctors.length === 1 ? "Doctor" : "Doctors"}
            </Badge>
          </div>
        </div>

        <Separator className="my-2" />

        {/* Control Panel */}
        <Card className="mb-4">
          <CardContent className="p-3 sm:p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {/* Select Doctor Dropdown */}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Select Doctor
                </label>
                <Select
                  value={selectedDoctor || ""}
                  onValueChange={setSelectedDoctor}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Choose a doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.length === 0 ? (
                      <div className="py-2 px-1 text-center text-sm text-gray-500">
                        No doctors available
                      </div>
                    ) : (
                      doctors.map((doctor) => (
                        <SelectItem
                          key={doctor.id}
                          value={doctor.id}
                          className="text-sm"
                        >
                          {doctor.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Search Rooms */}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Search Rooms
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Enter room number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 text-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 items-end">
                <Button
                  disabled={
                    selectedRooms.length === 0 || !selectedDoctor || isAssigning
                  }
                  onClick={assignRooms}
                  size="sm"
                  className="flex-1"
                >
                  {isAssigning ? (
                    "Assigning..."
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Assign{" "}
                      {selectedRooms.length > 0
                        ? `(${selectedRooms.length})`
                        : ""}
                    </>
                  )}
                </Button>

                <Button
                  disabled={selectedRooms.length > 0 || isAssigning}
                  onClick={() => {
                    resetRoomForm();
                    setIsDialogOpen(true);
                  }}
                  size="sm"
                  className="flex-1"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Room
                </Button>
              </div>
            </div>

            {/* Selection summary */}
            {selectedRooms.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    {selectedRooms.length} room
                    {selectedRooms.length > 1 ? "s" : ""} selected
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedRooms([])}
                    className="h-7 text-xs"
                  >
                    Clear selection
                  </Button>
                </div>

                <ScrollArea className="max-h-20">
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedRooms.map((roomId) => {
                      const room = rooms.find((r) => r.id === roomId);
                      return room ? (
                        <Badge
                          key={roomId}
                          variant="secondary"
                          className="flex items-center gap-1 py-1"
                        >
                          Room {room.number}
                          <button
                            onClick={() => toggleRoomSelection(roomId)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </ScrollArea>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rooms List */}
        {filteredRooms.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredRooms.map((room) => {
              const assignedDoctors = room.doctorsAssigned
                .filter((doctorId) =>
                  doctors.some((doc) => doc.id === doctorId)
                )
                .map((doctorId) => doctors.find((d) => d.id === doctorId)!);

              return (
                <Card
                  key={room.id}
                  className={`overflow-hidden transition-all ${
                    selectedRooms.includes(room.id) ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-base font-bold flex items-center">
                        <DoorOpen className="w-4 h-4 mr-1 text-primary" />
                        Room {room.number}
                      </h3>
                      <Badge
                        variant={
                          selectedRooms.includes(room.id)
                            ? "default"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {assignedDoctors.length}{" "}
                        {assignedDoctors.length === 1 ? "doctor" : "doctors"}
                      </Badge>
                    </div>

                    {/* Assigned Doctors */}
                    <div className="min-h-[60px] max-h-[100px] overflow-y-auto">
                      {assignedDoctors.length > 0 ? (
                        <div className="space-y-1">
                          {assignedDoctors.map((doctor) => (
                            <div
                              key={doctor.id}
                              className="flex items-center justify-between bg-gray-100 rounded-md py-1 px-2 group"
                            >
                              <span className="text-xs font-medium truncate max-w-[140px]">
                                {doctor.name}
                              </span>
                              <button
                                onClick={() =>
                                  unassignDoctorFromRoom(room.id, doctor.id)
                                }
                                className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 italic h-full flex items-center justify-center">
                          No doctors assigned
                        </div>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="flex items-center justify-between p-2 bg-gray-50 border-t">
                    <Button
                      variant={
                        selectedRooms.includes(room.id) ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => toggleRoomSelection(room.id)}
                      className="text-xs h-7"
                    >
                      {selectedRooms.includes(room.id) ? (
                        <>
                          <Check className="h-3 w-3 mr-1" />
                          Selected
                        </>
                      ) : (
                        "Select"
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveRoom(room.id)}
                      className="text-red-500 text-xs h-7"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Remove
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 border border-dashed rounded-lg bg-gray-50">
            <DoorOpen className="w-10 h-10 mx-auto text-gray-300 mb-3" />
            {searchQuery ? (
              <>
                <h3 className="text-lg font-medium text-gray-700">
                  No matching rooms found
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Try a different search term or clear your search
                </p>
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery("")}
                  size="sm"
                >
                  Clear Search
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium text-gray-700">
                  No Rooms Yet
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Add your first room to get started
                </p>
                <Button
                  onClick={() => {
                    resetRoomForm();
                    setIsDialogOpen(true);
                  }}
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Room
                </Button>
              </>
            )}
          </div>
        )}

        {/* Dialog for Creating Rooms */}
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetRoomForm();
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create a New Room</DialogTitle>
            </DialogHeader>

            <div className="space-y-2 py-4">
              <label className="text-sm font-medium">Room Number</label>
              <Input
                placeholder="Enter room number (e.g. 101)"
                type="number"
                value={newRoom}
                onChange={(e) => setNewRoom(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Room numbers must be unique and numeric
              </p>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="sm:mr-2 w-full sm:w-auto order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateRoom}
                className="w-full sm:w-auto order-1 sm:order-2"
                disabled={!newRoom || isNaN(parseInt(newRoom)) || roomsLoading}
              >
                {roomsLoading ? "Creating..." : "Create Room"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Toaster component for toast notifications */}
      <Toaster />
    </>
  );
};

export default ResourcesSection;
