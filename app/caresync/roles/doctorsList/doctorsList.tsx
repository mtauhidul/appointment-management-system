"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
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
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAssistantStore } from "@/lib/store/useAssistantStore";
import { useDoctorStore } from "@/lib/store/useDoctorStore";
import { useRoomStore } from "@/lib/store/useRoomStore";
import {
  DoctorAvailability,
  TimeSlot,
  createEmptyAvailability,
} from "@/lib/types";
import {
  Briefcase,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  DoorOpen,
  Edit,
  Eye,
  Mail,
  Phone,
  Plus,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];
const TIME_OPTIONS = Array.from({ length: 24 * 4 }, (_, i) => {
  const hour = Math.floor(i / 4);
  const minute = (i % 4) * 15;
  return `${hour.toString().padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")}`;
});

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const DoctorsList = () => {
  const {
    doctors,
    addDoctor,
    updateDoctor,
    deleteDoctor,
    addTimeSlot,
    removeTimeSlot,
  } = useDoctorStore();
  const { assistants } = useAssistantStore();
  const { rooms } = useRoomStore();
  const { toast } = useToast();

  const [isUpdating, setIsUpdating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAvailabilityDialogOpen, setIsAvailabilityDialogOpen] =
    useState(false);
  const [isViewScheduleOpen, setIsViewScheduleOpen] = useState(false);
  const [dialogTab, setDialogTab] = useState<"details" | "availability">(
    "details"
  );
  const [selectedDoctor, setSelectedDoctor] = useState<{ id: string } | null>(
    null
  );

  const [newDoctor, setNewDoctor] = useState({
    name: "",
    email: "",
    phone: "",
    specialty: "",
  });

  // Availability state
  const [activeDay, setActiveDay] =
    useState<keyof DoctorAvailability>("monday");
  const [newTimeSlot, setNewTimeSlot] = useState({
    startTime: "09:00",
    endTime: "17:00",
  });
  const [availability, setAvailability] = useState(createEmptyAvailability());

  // State for the doctor whose availability is being edited
  const [doctorForAvailability, setDoctorForAvailability] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // ✅ Ensure doctors have correct room assignments by using **room IDs**
  useEffect(() => {
    if (isUpdating) return;
    setIsUpdating(true);

    doctors.forEach((doctor) => {
      const assignedRoomIds = rooms
        .filter((room) => room.doctorsAssigned.includes(doctor.id))
        .map((room) => room.id);

      if (
        JSON.stringify(doctor.roomsAssigned.sort()) !==
        JSON.stringify(assignedRoomIds.sort())
      ) {
        updateDoctor(doctor.id, { roomsAssigned: assignedRoomIds });
      }
    });

    setIsUpdating(false);
  }, [rooms, doctors, updateDoctor, isUpdating]);

  // Reset form state when dialog opens
  useEffect(() => {
    if (isDialogOpen) {
      if (!selectedDoctor) {
        setAvailability(createEmptyAvailability());
      } else {
        const doctor = doctors.find((d) => d.id === selectedDoctor.id);
        if (doctor && doctor.availability) {
          setAvailability(doctor.availability);
        }
      }
    }
  }, [isDialogOpen, selectedDoctor, doctors]);

  // Reset availability dialog state
  useEffect(() => {
    if (isAvailabilityDialogOpen && doctorForAvailability) {
      const doctor = doctors.find((d) => d.id === doctorForAvailability.id);
      if (doctor && doctor.availability) {
        setAvailability(doctor.availability);
      }
    }
  }, [isAvailabilityDialogOpen, doctorForAvailability, doctors]);

  const handleSaveDoctor = () => {
    if (
      !newDoctor.name ||
      !newDoctor.email ||
      !newDoctor.phone ||
      !newDoctor.specialty
    ) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "All fields are required!",
      });
      return;
    }

    if (selectedDoctor) {
      updateDoctor(selectedDoctor.id, {
        ...newDoctor,
        availability,
      });
      toast({
        title: "Doctor Updated",
        description: `${newDoctor.name} has been updated.`,
      });
    } else {
      addDoctor({
        id: Math.random().toString(36).substr(2, 9),
        ...newDoctor,
        roomsAssigned: [],
        assistantsAssigned: [],
        patients: [],
        availability,
      });
      toast({
        title: "Doctor Added",
        description: `${newDoctor.name} has been added.`,
      });
    }

    setIsDialogOpen(false);
    setSelectedDoctor(null);
    setNewDoctor({ name: "", email: "", phone: "", specialty: "" });
    setDialogTab("details");
    setAvailability(createEmptyAvailability());
  };

  const handleAddTimeSlot = (day: keyof DoctorAvailability) => {
    // Validate time slot
    if (newTimeSlot.startTime >= newTimeSlot.endTime) {
      toast({
        variant: "destructive",
        title: "Invalid Time Slot",
        description: "End time must be after start time",
      });
      return;
    }

    // Check for overlapping time slots
    const daySlots = availability[day] || [];

    const isOverlapping = daySlots.some((slot) => {
      // Check if new slot overlaps with existing slot
      return (
        newTimeSlot.startTime < slot.endTime &&
        newTimeSlot.endTime > slot.startTime
      );
    });

    if (isOverlapping) {
      toast({
        variant: "destructive",
        title: "Time Slot Conflict",
        description: "This time slot overlaps with an existing one",
      });
      return;
    }

    // Add the time slot
    const timeSlot: TimeSlot = {
      id: Math.random().toString(36).substr(2, 9),
      startTime: newTimeSlot.startTime,
      endTime: newTimeSlot.endTime,
    };

    // Update local availability state
    setAvailability((prev) => ({
      ...prev,
      [day]: [...prev[day], timeSlot],
    }));

    // If editing existing doctor in the availability dialog
    if (isAvailabilityDialogOpen && doctorForAvailability) {
      addTimeSlot(doctorForAvailability.id, day, timeSlot);
    }

    toast({
      title: "Availability Updated",
      description: `Added ${newTimeSlot.startTime} - ${
        newTimeSlot.endTime
      } on ${capitalize(day)}`,
    });
  };

  const handleRemoveTimeSlot = (
    day: keyof DoctorAvailability,
    slotId: string
  ) => {
    // Update local availability state
    setAvailability((prev) => ({
      ...prev,
      [day]: prev[day].filter((slot) => slot.id !== slotId),
    }));

    // If editing existing doctor in the availability dialog
    if (isAvailabilityDialogOpen && doctorForAvailability) {
      removeTimeSlot(doctorForAvailability.id, day, slotId);
    }

    toast({
      title: "Time Slot Removed",
      description: `Time slot removed from ${capitalize(day)}`,
    });
  };

  // Format time slot for display
  const formatTimeSlot = (slot: TimeSlot) => {
    return `${slot.startTime} - ${slot.endTime}`;
  };

  // Get availability summary for doctor card
  const getAvailabilitySummary = (doctorId: string) => {
    const doctor = doctors.find((d) => d.id === doctorId);
    if (!doctor || !doctor.availability) return "No availability set";

    // Count days with at least one time slot
    const availableDays = DAYS_OF_WEEK.filter(
      (day) => doctor.availability[day as keyof DoctorAvailability]?.length > 0
    );

    if (availableDays.length === 0) return "No availability set";
    if (availableDays.length === 7) return "Available all days";

    if (availableDays.length <= 3) {
      return `Available on ${availableDays.map(capitalize).join(", ")}`;
    } else {
      return `Available ${availableDays.length} days a week`;
    }
  };

  // Count total availability slots for a doctor
  const getTotalSlots = (doctorId: string) => {
    const doctor = doctors.find((d) => d.id === doctorId);
    if (!doctor || !doctor.availability) return 0;

    return DAYS_OF_WEEK.reduce((total, day) => {
      return (
        total +
        (doctor.availability[day as keyof DoctorAvailability]?.length || 0)
      );
    }, 0);
  };

  // Get all time slots for a specific day - either from local state or doctor object
  const getDaySlots = (day: keyof DoctorAvailability) => {
    if (isAvailabilityDialogOpen && doctorForAvailability) {
      const doctor = doctors.find((d) => d.id === doctorForAvailability.id);
      return doctor?.availability?.[day] || [];
    }

    return availability[day] || [];
  };

  // Reset the doctor creation/edit form
  const resetForm = () => {
    setNewDoctor({ name: "", email: "", phone: "", specialty: "" });
    setAvailability(createEmptyAvailability());
    setDialogTab("details");
    setSelectedDoctor(null);
  };

  // Availability Management Component (used in both main dialog and availability dialog)
  const AvailabilityManager = () => (
    <Tabs
      defaultValue="monday"
      value={activeDay}
      onValueChange={(value) => setActiveDay(value as keyof DoctorAvailability)}
    >
      <TabsList className="grid grid-cols-7 w-full mb-4">
        {DAYS_OF_WEEK.map((day) => (
          <TabsTrigger key={day} value={day} className="text-xs">
            {capitalize(day.substring(0, 3))}
          </TabsTrigger>
        ))}
      </TabsList>

      {DAYS_OF_WEEK.map((day) => {
        const daySlots = getDaySlots(day as keyof DoctorAvailability);

        return (
          <TabsContent key={day} value={day} className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">{capitalize(day)}</h3>
              <Badge
                variant={daySlots.length > 0 ? "default" : "outline"}
                className="ml-2"
              >
                {daySlots.length} slot{daySlots.length !== 1 ? "s" : ""}
              </Badge>
            </div>

            {/* Display existing time slots */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {daySlots.length > 0 ? (
                daySlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between p-2 border rounded-md group hover:bg-gray-50"
                  >
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-500 mr-2" />
                      <span>{formatTimeSlot(slot)}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleRemoveTimeSlot(
                          day as keyof DoctorAvailability,
                          slot.id
                        )
                      }
                      className="h-8 w-8 p-0 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-center py-6 border border-dashed rounded-md">
                  No time slots added for {capitalize(day)}
                </div>
              )}
            </div>

            {/* Add new time slot */}
            <div className="bg-gray-50 p-4 rounded-md mt-4">
              <div className="flex gap-3 flex-wrap items-end">
                <div>
                  <span className="text-xs text-gray-500 block mb-1">
                    Start
                  </span>
                  <Select
                    value={newTimeSlot.startTime}
                    onValueChange={(value) =>
                      setNewTimeSlot({ ...newTimeSlot, startTime: value })
                    }
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder="Start" />
                    </SelectTrigger>
                    <SelectContent>
                      <ScrollArea className="h-60">
                        <SelectGroup>
                          {TIME_OPTIONS.map((time) => (
                            <SelectItem key={`start-${time}`} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </ScrollArea>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <span className="text-xs text-gray-500 block mb-1">End</span>
                  <Select
                    value={newTimeSlot.endTime}
                    onValueChange={(value) =>
                      setNewTimeSlot({ ...newTimeSlot, endTime: value })
                    }
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder="End" />
                    </SelectTrigger>
                    <SelectContent>
                      <ScrollArea className="h-60">
                        <SelectGroup>
                          {TIME_OPTIONS.map((time) => (
                            <SelectItem key={`end-${time}`} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </ScrollArea>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={() =>
                    handleAddTimeSlot(day as keyof DoctorAvailability)
                  }
                  className="ml-auto"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Doctors</h2>
        <Button
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Doctor
        </Button>
      </div>

      {doctors.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-lg bg-gray-50">
          <Briefcase className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <h3 className="text-lg font-medium text-gray-700">No Doctors Yet</h3>
          <p className="text-gray-500 mb-4">
            Add your first doctor to get started
          </p>
          <Button
            onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Doctor
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((doctor) => {
            // Get dynamically assigned assistants
            const assignedAssistants = assistants.filter((a) =>
              a.doctorsAssigned.includes(doctor.id)
            );

            // Get assigned rooms
            const assignedRooms = doctor.roomsAssigned
              .map((roomId) => rooms.find((r) => r.id === roomId)?.number)
              .filter(Boolean);

            // Total time slots
            const totalSlots = getTotalSlots(doctor.id);

            return (
              <Card
                key={doctor.id}
                className="overflow-hidden transition-all hover:shadow-md"
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold">{doctor.name}</h3>
                      <p className="text-sm text-primary flex items-center">
                        <Briefcase className="w-4 h-4 mr-1.5" />
                        {doctor.specialty}
                      </p>
                    </div>
                    <Badge
                      variant={totalSlots > 0 ? "default" : "outline"}
                      className="ml-2"
                    >
                      {totalSlots} time slot{totalSlots !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pb-3">
                  <div className="space-y-2.5">
                    <p className="text-sm text-gray-600 flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      {doctor.email}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      {doctor.phone}
                    </p>

                    <Separator className="my-3" />

                    {/* Availability Summary */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-start">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Availability
                          </p>
                          <p className="text-xs text-gray-500">
                            {getAvailabilitySummary(doctor.id)}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-blue-500 p-0 hover:bg-transparent"
                          onClick={() => {
                            setDoctorForAvailability({
                              id: doctor.id,
                              name: doctor.name,
                            });
                            setIsViewScheduleOpen(true);
                          }}
                          title="View Schedule"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-primary p-0 hover:bg-transparent"
                          onClick={() => {
                            setDoctorForAvailability({
                              id: doctor.id,
                              name: doctor.name,
                            });
                            setIsAvailabilityDialogOpen(true);
                          }}
                          title="Edit Schedule"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Assigned Assistants */}
                    <div className="flex items-start">
                      <Users className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Assistants
                        </p>
                        <p className="text-xs text-gray-500">
                          {assignedAssistants.length > 0
                            ? assignedAssistants.map((a) => a.name).join(", ")
                            : "None assigned"}
                        </p>
                      </div>
                    </div>

                    {/* Assigned Rooms */}
                    <div className="flex items-start">
                      <DoorOpen className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Rooms
                        </p>
                        <p className="text-xs text-gray-500">
                          {assignedRooms.length > 0
                            ? assignedRooms.join(", ")
                            : "None assigned"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex justify-between pt-2 border-t bg-gray-50">
                  <Button
                    onClick={() => {
                      setSelectedDoctor(doctor);
                      setNewDoctor(doctor);
                      setDialogTab("details");
                      setIsDialogOpen(true);
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-gray-600"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => {
                      if (
                        confirm(
                          `Are you sure you want to delete ${doctor.name}?`
                        )
                      ) {
                        deleteDoctor(doctor.id);
                        toast({
                          title: "Doctor Deleted",
                          description: `${doctor.name} has been removed.`,
                        });
                      }
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-red-500"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog for Adding or Editing Doctor with Tabs */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedDoctor ? "Edit Doctor" : "Add New Doctor"}
            </DialogTitle>
          </DialogHeader>

          <div className="mb-6">
            <div className="flex space-x-1 mb-6">
              <Button
                type="button"
                variant={dialogTab === "details" ? "default" : "outline"}
                onClick={() => setDialogTab("details")}
                className="flex-1"
              >
                1. Personal Details
              </Button>
              <Button
                type="button"
                variant={dialogTab === "availability" ? "default" : "outline"}
                onClick={() => setDialogTab("availability")}
                className="flex-1"
              >
                2. Availability
              </Button>
            </div>

            {dialogTab === "details" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <Input
                      placeholder="Dr. John Smith"
                      value={newDoctor.name}
                      onChange={(e) =>
                        setNewDoctor({ ...newDoctor, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Specialty</label>
                    <Input
                      placeholder="Cardiology"
                      value={newDoctor.specialty}
                      onChange={(e) =>
                        setNewDoctor({
                          ...newDoctor,
                          specialty: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <Input
                    placeholder="doctor@example.com"
                    type="email"
                    value={newDoctor.email}
                    onChange={(e) =>
                      setNewDoctor({ ...newDoctor, email: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input
                    placeholder="+1 (555) 123-4567"
                    type="tel"
                    value={newDoctor.phone}
                    onChange={(e) =>
                      setNewDoctor({ ...newDoctor, phone: e.target.value })
                    }
                  />
                </div>

                <div className="pt-4 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => setDialogTab("availability")}
                    className="gap-1"
                  >
                    Continue to Availability{" "}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {dialogTab === "availability" && (
              <div className="space-y-4">
                <AvailabilityManager />

                <div className="pt-4 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setDialogTab("details")}
                  >
                    Back to Details
                  </Button>
                  <Button onClick={handleSaveDoctor} className="gap-1">
                    <Check className="w-4 h-4" />
                    {selectedDoctor ? "Save Changes" : "Add Doctor"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog for Managing Availability */}
      <Dialog
        open={isAvailabilityDialogOpen}
        onOpenChange={(open) => {
          setIsAvailabilityDialogOpen(open);
          if (!open) {
            setDoctorForAvailability(null);
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {doctorForAvailability
                ? `Manage ${doctorForAvailability.name}'s Availability`
                : "Manage Availability"}
            </DialogTitle>
          </DialogHeader>

          {doctorForAvailability && (
            <>
              <AvailabilityManager />

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAvailabilityDialogOpen(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog for Viewing Schedule (Read-only) */}
      <Dialog
        open={isViewScheduleOpen}
        onOpenChange={(open) => {
          setIsViewScheduleOpen(open);
          if (!open) {
            setDoctorForAvailability(null);
          }
        }}
      >
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {doctorForAvailability
                ? `${doctorForAvailability.name}'s Schedule`
                : "Doctor Schedule"}
            </DialogTitle>
          </DialogHeader>

          {doctorForAvailability && (
            <>
              <ScrollArea className="max-h-[60vh]">
                <div className="pr-4 space-y-3">
                  {DAYS_OF_WEEK.map((day) => {
                    const doctor = doctors.find(
                      (d) => d.id === doctorForAvailability.id
                    );
                    const daySlots =
                      doctor?.availability?.[day as keyof DoctorAvailability] ||
                      [];
                    const sortedSlots = [...daySlots].sort((a, b) =>
                      a.startTime.localeCompare(b.startTime)
                    );

                    return (
                      <div
                        key={day}
                        className="border rounded-md overflow-hidden"
                      >
                        <div className="bg-gray-50 px-3 py-2 border-b flex justify-between items-center">
                          <h3 className="font-medium text-sm">
                            {capitalize(day)}
                          </h3>
                          <Badge
                            variant={
                              daySlots.length > 0 ? "default" : "outline"
                            }
                            className="text-xs"
                          >
                            {daySlots.length} slot
                            {daySlots.length !== 1 ? "s" : ""}
                          </Badge>
                        </div>

                        {sortedSlots.length > 0 ? (
                          <div className="divide-y">
                            {sortedSlots.map((slot) => (
                              <div
                                key={slot.id}
                                className="flex items-center px-3 py-1.5 text-sm"
                              >
                                <Clock className="h-3.5 w-3.5 text-gray-400 mr-2" />
                                <span>{formatTimeSlot(slot)}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="px-3 py-3 text-center text-gray-500 text-xs">
                            Not available on {capitalize(day)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              <DialogFooter className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsViewScheduleOpen(false)}
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setIsViewScheduleOpen(false);
                    setIsAvailabilityDialogOpen(true);
                  }}
                >
                  <Edit className="w-3.5 h-3.5 mr-1" />
                  Edit
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorsList;
