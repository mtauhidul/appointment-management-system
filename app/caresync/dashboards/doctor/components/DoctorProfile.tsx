"use client";

import {
  Briefcase,
  Calendar,
  Clock,
  Edit,
  Mail,
  Phone,
  Plus,
  Save,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Badge as UIBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

import { useDoctorStore } from "@/lib/store/useDoctorStore";
import { useRoomStore } from "@/lib/store/useRoomStore";
import { DoctorAvailability, TimeSlot } from "@/lib/types";

const DoctorProfile = () => {
  const { doctors, updateDoctorInFirestore } = useDoctorStore();
  const { rooms } = useRoomStore();
  const { toast } = useToast();

  // State for demo - in real app, this would come from auth/user context
  const [currentDoctorId, setCurrentDoctorId] = useState<string>("");
  
  // Get current doctor (for demo, use first doctor; in real app, get from auth)
  const currentDoctor = doctors.find(d => d.id === currentDoctorId) || doctors[0];

  // Set current doctor ID when doctors load
  useEffect(() => {
    if (doctors.length > 0 && !currentDoctorId) {
      setCurrentDoctorId(doctors[0].id);
    }
  }, [doctors, currentDoctorId]);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    specialty: "",
  });

  // Time slot management
  const [newTimeSlot, setNewTimeSlot] = useState({
    day: "monday" as keyof DoctorAvailability,
    startTime: "",
    endTime: "",
  });
  const [availability, setAvailability] = useState<DoctorAvailability>({
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  });

  // Initialize forms when doctor data loads
  useEffect(() => {
    if (currentDoctor) {
      setProfileForm({
        name: currentDoctor.name,
        email: currentDoctor.email,
        phone: currentDoctor.phone,
        specialty: currentDoctor.specialty,
      });
      setAvailability(currentDoctor.availability || {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: [],
      });
    }
  }, [currentDoctor]);

  // Helper functions
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  const generateTimeSlotId = () => `slot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const isValidTimeSlot = (start: string, end: string) => {
    if (!start || !end) return false;
    const startTime = new Date(`2000-01-01T${start}:00`);
    const endTime = new Date(`2000-01-01T${end}:00`);
    return startTime < endTime;
  };

  const handleSaveProfile = async () => {
    if (!currentDoctor) return;

    if (!profileForm.name || !profileForm.email || !profileForm.phone || !profileForm.specialty) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "All fields are required!",
      });
      return;
    }

    const success = await updateDoctorInFirestore(currentDoctor.id, profileForm);

    if (success) {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      setIsEditingProfile(false);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile. Please try again.",
      });
    }
  };

  const handleSaveSchedule = async () => {
    if (!currentDoctor) return;

    const success = await updateDoctorInFirestore(currentDoctor.id, { availability });

    if (success) {
      toast({
        title: "Schedule Updated",
        description: "Your schedule has been updated successfully.",
      });
      setIsEditingSchedule(false);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update schedule. Please try again.",
      });
    }
  };

  const handleAddTimeSlot = () => {
    if (!currentDoctor) return;

    if (!isValidTimeSlot(newTimeSlot.startTime, newTimeSlot.endTime)) {
      toast({
        variant: "destructive",
        title: "Invalid Time Slot",
        description: "Please enter valid start and end times.",
      });
      return;
    }

    const timeSlot: TimeSlot = {
      id: generateTimeSlotId(),
      startTime: newTimeSlot.startTime,
      endTime: newTimeSlot.endTime,
    };

    // Update local state
    setAvailability(prev => ({
      ...prev,
      [newTimeSlot.day]: [...prev[newTimeSlot.day], timeSlot],
    }));

    // Reset form
    setNewTimeSlot({
      day: "monday",
      startTime: "",
      endTime: "",
    });

    toast({
      title: "Time Slot Added",
      description: "Time slot has been added to your schedule.",
    });
  };

  const handleRemoveTimeSlot = (day: keyof DoctorAvailability, timeSlotId: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: prev[day].filter(slot => slot.id !== timeSlotId),
    }));

    toast({
      title: "Time Slot Removed",
      description: "Time slot has been removed from your schedule.",
    });
  };

  // Get assigned rooms
  const assignedRooms = currentDoctor?.roomsAssigned
    .map((roomId) => rooms.find((r) => r.id === roomId))
    .filter(Boolean) || [];

  // Calculate total time slots
  const getTotalSlots = () => {
    if (!currentDoctor?.availability) return 0;
    return Object.values(currentDoctor.availability).reduce(
      (total, daySlots) => total + daySlots.length,
      0
    );
  };

  if (!currentDoctor) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-16 space-y-6">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
            <User className="h-12 w-12 text-gray-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">
              Profile Not Found
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Unable to load doctor profile. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="schedule">Schedule Management</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Manage your personal and professional information
                </CardDescription>
              </div>
              <Button
                variant={isEditingProfile ? "outline" : "default"}
                size="sm"
                onClick={() => {
                  if (isEditingProfile) {
                    // Reset form
                    setProfileForm({
                      name: currentDoctor.name,
                      email: currentDoctor.email,
                      phone: currentDoctor.phone,
                      specialty: currentDoctor.specialty,
                    });
                  }
                  setIsEditingProfile(!isEditingProfile);
                }}
              >
                {isEditingProfile ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditingProfile ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileForm.name}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialty">Specialty</Label>
                    <Input
                      id="specialty"
                      value={profileForm.specialty}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, specialty: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <Button onClick={handleSaveProfile}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">{currentDoctor.name}</p>
                        <p className="text-sm text-gray-500">Full Name</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">{currentDoctor.email}</p>
                        <p className="text-sm text-gray-500">Email Address</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">{currentDoctor.specialty}</p>
                        <p className="text-sm text-gray-500">Specialty</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">{currentDoctor.phone}</p>
                        <p className="text-sm text-gray-500">Phone Number</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              {/* Assignment Information */}
              <div className="space-y-4">
                <h3 className="font-medium">Assignment Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Assigned Rooms</span>
                      <UIBadge variant="secondary">{assignedRooms.length}</UIBadge>
                    </div>
                    <div className="mt-2">
                      {assignedRooms.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {assignedRooms.map((room) => (
                            <UIBadge key={room?.id} variant="outline" className="text-xs">
                              Room {room?.number}
                            </UIBadge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">No rooms assigned</p>
                      )}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Current Patients</span>
                      <UIBadge variant="secondary">{currentDoctor.patients.length}</UIBadge>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Active patient count</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Time Slots</span>
                      <UIBadge variant="secondary">{getTotalSlots()}</UIBadge>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Weekly availability</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Schedule Management
                </CardTitle>
                <CardDescription>
                  Manage your weekly availability and time slots
                </CardDescription>
              </div>
              <Button
                variant={isEditingSchedule ? "outline" : "default"}
                size="sm"
                onClick={() => {
                  if (isEditingSchedule) {
                    // Reset availability
                    setAvailability(currentDoctor.availability || {
                      monday: [],
                      tuesday: [],
                      wednesday: [],
                      thursday: [],
                      friday: [],
                      saturday: [],
                      sunday: [],
                    });
                  }
                  setIsEditingSchedule(!isEditingSchedule);
                }}
              >
                {isEditingSchedule ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Schedule
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditingSchedule && (
                <Card className="border-dashed">
                  <CardHeader>
                    <CardTitle className="text-base">Add Time Slot</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <div className="space-y-2">
                        <Label>Day of Week</Label>
                        <Select
                          value={newTimeSlot.day}
                          onValueChange={(value) =>
                            setNewTimeSlot({
                              ...newTimeSlot,
                              day: value as keyof DoctorAvailability,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(availability).map((day) => (
                              <SelectItem key={day} value={day}>
                                {capitalize(day)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Start Time</Label>
                        <Input
                          type="time"
                          value={newTimeSlot.startTime}
                          onChange={(e) =>
                            setNewTimeSlot({
                              ...newTimeSlot,
                              startTime: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Time</Label>
                        <Input
                          type="time"
                          value={newTimeSlot.endTime}
                          onChange={(e) =>
                            setNewTimeSlot({
                              ...newTimeSlot,
                              endTime: e.target.value,
                            })
                          }
                        />
                      </div>
                      <Button onClick={handleAddTimeSlot}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Slot
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Weekly Schedule Display */}
              <div className="space-y-4">
                {Object.entries(availability).map(([day, slots]) => (
                  <div key={day} className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                      <h3 className="font-medium">{capitalize(day)}</h3>
                      <UIBadge variant={slots.length > 0 ? "default" : "outline"}>
                        {slots.length} slot{slots.length !== 1 ? "s" : ""}
                      </UIBadge>
                    </div>
                    <div className="p-4">
                      {slots.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {slots
                            .sort((a: TimeSlot, b: TimeSlot) => a.startTime.localeCompare(b.startTime))
                            .map((slot: TimeSlot) => (
                              <div
                                key={slot.id}
                                className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                              >
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-blue-600" />
                                  <span className="text-sm font-medium">
                                    {slot.startTime} - {slot.endTime}
                                  </span>
                                </div>
                                {isEditingSchedule && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleRemoveTimeSlot(
                                        day as keyof DoctorAvailability,
                                        slot.id
                                      )
                                    }
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm italic">
                          No time slots scheduled for this day
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {isEditingSchedule && (
                <div className="flex justify-end">
                  <Button onClick={handleSaveSchedule}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Schedule
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoctorProfile;
