import {
  CalendarIcon,
  CheckCircle2,
  Clock,
  FileEdit,
  PlusCircle,
  RefreshCw,
  UserIcon,
  VideoIcon,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Mock patient data
const patientData = {
  name: "Roger Curtis",
  id: "208898786",
};

// Mock provider data
const providers = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialty: "Podiatry",
    image: "/assets/images/providers/dr-johnson.jpg",
    available: true,
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    specialty: "Foot & Ankle Surgery",
    image: "/assets/images/providers/dr-chen.jpg",
    available: true,
  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    specialty: "Diabetic Foot Care",
    image: "/assets/images/providers/dr-rodriguez.jpg",
    available: true,
  },
  {
    id: 4,
    name: "Dr. David Patel",
    specialty: "Sports Medicine",
    image: "/assets/images/providers/dr-patel.jpg",
    available: false,
  },
];

// Mock appointment data
type Appointment = {
  id: string;
  provider: string;
  providerId: number;
  specialty: string;
  date: Date;
  time: string;
  type: string;
  location: string;
  status: string;
  notes: string;
  originalDate: Date | null;
  originalTime: string | null;
};

const initialAppointments: Appointment[] = [
  {
    id: "APT-23089",
    provider: "Dr. Sarah Johnson",
    providerId: 1,
    specialty: "Podiatry",
    date: new Date(2025, 4, 22),
    time: "10:30 AM",
    type: "In-person",
    location: "Main Office",
    status: "confirmed",
    notes: "Follow-up for previous treatment",
    originalDate: null,
    originalTime: null,
  },
  {
    id: "APT-23412",
    provider: "Dr. Michael Chen",
    providerId: 2,
    specialty: "Foot & Ankle Surgery",
    date: new Date(2025, 5, 5),
    time: "2:15 PM",
    type: "Virtual",
    location: "Video Call",
    status: "confirmed",
    notes: "Pre-surgical consultation",
    originalDate: null,
    originalTime: null,
  },
];

// Available time slots for selected date
const getTimeSlots = (
  providerId: number,
  date: Date
): string[] => {
  // In a real app, this would come from an API based on provider availability
  // Adding some variety to simulate real provider schedules
  let slots = [
    "9:00 AM",
    "9:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "1:00 PM",
    "1:30 PM",
    "2:00 PM",
    "2:30 PM",
    "3:00 PM",
  ];
  // This is just a simple simulation
  const dateNum = date.getDate();
  const providerNum = providerId;

  // Remove some slots based on the date and provider combo
  if ((dateNum + providerNum) % 3 === 0)
    slots = slots.filter((_, i) => i % 3 !== 0);
  if ((dateNum + providerNum) % 2 === 0)
    slots = slots.filter((_, i) => i % 4 !== 1);

  return slots;
};

const Dashboard = () => {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [appointmentDetailsOpen, setAppointmentDetailsOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Booking state
  const [selectedProvider, setSelectedProvider] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [appointmentType, setAppointmentType] = useState("In-person");
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingReference, setBookingReference] = useState("");

  // Time slots for selected date
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

  // Load appointments from localStorage if available
  useEffect(() => {
    const savedAppointments = localStorage.getItem("ytfcsAppointments");
    if (savedAppointments) {
      try {
        const parsed = JSON.parse(savedAppointments, (key, value) => {
          if (key === "date" || key === "originalDate") {
            return value ? new Date(value) : null;
          }
          return value;
        });
        setAppointments(parsed);
      } catch (error) {
        console.error("Error parsing saved appointments:", error);
      }
    }
  }, []);

  // Save appointments to localStorage when they change
  useEffect(() => {
    localStorage.setItem("ytfcsAppointments", JSON.stringify(appointments));
  }, [appointments]);

  // Reset booking flow
  const resetBooking = () => {
    setBookingStep(1);
    setSelectedProvider(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setAppointmentType("In-person");
    setBookingNotes("");
    setBookingReference("");
  };

  // Close booking dialog
  const handleCloseBooking = () => {
    setBookingOpen(false);
    resetBooking();
    setIsRescheduling(false);
  };

  // Start rescheduling process
  const handleStartReschedule = (appointment: Appointment) => {
    setIsRescheduling(true);
    setSelectedAppointment(appointment);
    setSelectedProvider(appointment.providerId);
    setAppointmentType(appointment.type);
    setBookingNotes(appointment.notes || "");
    setAppointmentDetailsOpen(false);
    setBookingStep(2); // Start at date selection
    setBookingOpen(true);
  };

  // Handle date selection
  interface HandleDateSelect {
    (date: Date | undefined): void;
  }

  const handleDateSelect: HandleDateSelect = (date) => {
    setSelectedDate(date ?? null);

    // Get available time slots for the selected date and provider
    if (date && selectedProvider) {
      setAvailableTimeSlots(getTimeSlots(selectedProvider, date));
    } else {
      setAvailableTimeSlots([]);
    }
  };

  // Handle appointment submission
  const handleSubmitBooking = () => {
    if (isRescheduling && selectedAppointment) {
      // For rescheduling, update the existing appointment
      const updatedAppointments = appointments.map((apt) => {
        if (apt.id === selectedAppointment.id) {
          return {
            ...apt,
            date: selectedDate as Date,
            time: selectedTime as string,
            type: appointmentType,
            location:
              appointmentType === "In-person" ? "Main Office" : "Video Call",
            status: "rescheduled",
            notes: bookingNotes,
            originalDate: apt.originalDate || apt.date,
            originalTime: apt.originalTime || apt.time,
          };
        }
        return apt;
      });

      setAppointments(updatedAppointments);
      setBookingReference(selectedAppointment.id);
    } else {
      // Generate a booking reference for new appointments
      const reference = `APT-${Math.floor(10000 + Math.random() * 90000)}`;
      setBookingReference(reference);

      // Add the new appointment to the list
      const providerObj = providers.find((p) => p.id === selectedProvider);
      if (selectedProvider !== null && selectedDate && selectedTime) {
        const newAppointment: Appointment = {
          id: reference,
          provider: providerObj ? providerObj.name : "",
          providerId: selectedProvider,
          specialty: providerObj ? providerObj.specialty : "",
          date: selectedDate,
          time: selectedTime,
          type: appointmentType as "In-person" | "Virtual",
          location:
            appointmentType === "In-person" ? "Main Office" : "Video Call",
          status: "confirmed",
          notes: bookingNotes,
          originalDate: null,
          originalTime: null,
        };
        setAppointments([...appointments, newAppointment]);
      }
    }

    setBookingStep(5); // Move to confirmation step
  };

  // Cancel an appointment
  const handleCancelAppointment = (appointmentId: string) => {
    if (confirm("Are you sure you want to cancel this appointment?")) {
      setAppointments(appointments.filter((apt) => apt.id !== appointmentId));
      setAppointmentDetailsOpen(false);
    }
  };

  // Show appointment details
  const handleShowAppointmentDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setAppointmentDetailsOpen(true);
  };

  // Format date for display
  const formatDate = (
    date: Date,
    format: "short" | "long" | "medium" = "medium"
  ) => {
    if (format === "short") {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } else if (format === "long") {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  };

  // Sort appointments by date
  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA.getTime() - dateB.getTime();
  });

  // Check if an appointment is in the past
  const isAppointmentPast = (appointment: Appointment) => {
    const today = new Date();
    const appointmentDate = new Date(appointment.date);
    appointmentDate.setHours(23, 59, 59);
    return appointmentDate < today;
  };

  // Filter upcoming appointments (not in the past)
  const upcomingAppointments = sortedAppointments.filter(
    (apt) => !isAppointmentPast(apt)
  );

  // Filter past appointments
  const pastAppointments = sortedAppointments.filter(isAppointmentPast);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Welcome Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {patientData.name}
          </h1>
          <p className="text-muted-foreground text-sm">
            Patient ID: {patientData.id} | Today:{" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <Button
          onClick={() => {
            resetBooking();
            setBookingOpen(true);
            setIsRescheduling(false);
          }}
          className="gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Book Appointment
        </Button>
      </div>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Your Upcoming Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-8 bg-muted/30 rounded-md border border-dashed">
              <CalendarIcon className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <h3 className="font-medium text-base">
                No upcoming appointments
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Schedule your first appointment to get started
              </p>
              <Button
                onClick={() => {
                  resetBooking();
                  setBookingOpen(true);
                  setIsRescheduling(false);
                }}
                variant="outline"
                className="gap-2 mx-auto"
              >
                <PlusCircle className="h-4 w-4" />
                Book Appointment
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border rounded-xl p-4 hover:shadow-md transition-shadow bg-card cursor-pointer"
                  onClick={() => handleShowAppointmentDetails(appointment)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex gap-3 items-start">
                      <div
                        className={`p-2 rounded-full ${
                          appointment.type === "Virtual"
                            ? "bg-blue-100"
                            : "bg-green-100"
                        }`}
                      >
                        {appointment.type === "Virtual" ? (
                          <VideoIcon
                            className={`h-5 w-5 ${
                              appointment.type === "Virtual"
                                ? "text-blue-600"
                                : "text-green-600"
                            }`}
                          />
                        ) : (
                          <UserIcon
                            className={`h-5 w-5 ${
                              appointment.type === "Virtual"
                                ? "text-blue-600"
                                : "text-green-600"
                            }`}
                          />
                        )}
                      </div>
                      <div>
                        <div className="flex gap-2 items-center flex-wrap">
                          <h3 className="font-semibold">
                            {appointment.provider}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {appointment.specialty}
                          </Badge>
                          {appointment.status === "rescheduled" && (
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
                            >
                              Rescheduled
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-3.5 w-3.5" />
                            <span>
                              {formatDate(appointment.date, "medium")}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{appointment.time}</span>
                          </div>
                        </div>
                        <div className="text-xs mt-1 flex items-center gap-1">
                          <span
                            className={`${
                              appointment.type === "Virtual"
                                ? "text-blue-600"
                                : "text-green-600"
                            } font-medium`}
                          >
                            {appointment.type}
                          </span>
                          <span className="text-muted-foreground">
                            • {appointment.location}
                          </span>
                          <span className="text-muted-foreground">
                            • Ref: {appointment.id}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div
                      className="flex gap-2 ml-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartReschedule(appointment);
                              }}
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                              Reschedule
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Reschedule this appointment
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {appointment.type === "Virtual" && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="sm" className="gap-1">
                                <VideoIcon className="h-3.5 w-3.5" />
                                Join
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              Join virtual appointment
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive gap-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelAppointment(appointment.id);
                              }}
                            >
                              <X className="h-3.5 w-3.5" />
                              Cancel
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Cancel this appointment
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Past Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pastAppointments.slice(0, 3).map((appointment) => (
                <div
                  key={appointment.id}
                  className="border rounded-xl p-4 hover:bg-muted/10 transition-colors cursor-pointer"
                  onClick={() => handleShowAppointmentDetails(appointment)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex gap-3 items-start">
                      <div className="p-2 rounded-full bg-muted">
                        {appointment.type === "Virtual" ? (
                          <VideoIcon className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <UserIcon className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <div className="flex gap-2 items-center">
                          <h3 className="font-medium">
                            {appointment.provider}
                          </h3>
                          <Badge
                            variant="outline"
                            className="text-xs text-muted-foreground"
                          >
                            {appointment.specialty}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-3.5 w-3.5" />
                            <span>
                              {formatDate(appointment.date, "medium")}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{appointment.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShowAppointmentDetails(appointment);
                      }}
                    >
                      <FileEdit className="h-3.5 w-3.5" />
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
              {pastAppointments.length > 3 && (
                <Button variant="ghost" className="w-full text-sm" size="sm">
                  View All {pastAppointments.length} Past Appointments
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Appointment Details Dialog */}
      <Dialog
        open={appointmentDetailsOpen}
        onOpenChange={setAppointmentDetailsOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          {selectedAppointment && (
            <>
              <DialogHeader>
                <DialogTitle>Appointment Details</DialogTitle>
                <DialogDescription>
                  Reference ID: {selectedAppointment.id}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-3 rounded-full ${
                      selectedAppointment.type === "Virtual"
                        ? "bg-blue-100"
                        : "bg-green-100"
                    }`}
                  >
                    {selectedAppointment.type === "Virtual" ? (
                      <VideoIcon
                        className={`h-6 w-6 ${
                          selectedAppointment.type === "Virtual"
                            ? "text-blue-600"
                            : "text-green-600"
                        }`}
                      />
                    ) : (
                      <UserIcon
                        className={`h-6 w-6 ${
                          selectedAppointment.type === "Virtual"
                            ? "text-blue-600"
                            : "text-green-600"
                        }`}
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {selectedAppointment.provider}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedAppointment.specialty}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Status
                      </Label>
                      <div className="mt-1">
                        <Badge
                          className={`text-xs ${
                            selectedAppointment.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : selectedAppointment.status === "rescheduled"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {selectedAppointment.status === "confirmed"
                            ? "Confirmed"
                            : selectedAppointment.status === "rescheduled"
                            ? "Rescheduled"
                            : "Cancelled"}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Type
                      </Label>
                      <p className="mt-1 text-sm font-medium">
                        {selectedAppointment.type}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Date & Time
                    </Label>
                    <div className="mt-1 flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {formatDate(selectedAppointment.date, "long")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedAppointment.time}</span>
                      </div>
                    </div>
                  </div>

                  {selectedAppointment.status === "rescheduled" &&
                    selectedAppointment.originalDate && (
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Original Appointment
                        </Label>
                        <div className="mt-1 flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CalendarIcon className="h-4 w-4" />
                            <span>
                              {formatDate(
                                selectedAppointment.originalDate,
                                "medium"
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{selectedAppointment.originalTime}</span>
                          </div>
                        </div>
                      </div>
                    )}

                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Location
                    </Label>
                    <p className="mt-1 text-sm">
                      {selectedAppointment.location}
                    </p>
                  </div>

                  {selectedAppointment.notes && (
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Notes
                      </Label>
                      <p className="mt-1 text-sm bg-muted/30 p-2 rounded-md">
                        {selectedAppointment.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {!isAppointmentPast(selectedAppointment) && (
                <DialogFooter className="flex gap-2">
                  {selectedAppointment.type === "Virtual" && (
                    <Button className="gap-2 flex-1">
                      <VideoIcon className="h-4 w-4" />
                      Join Video Call
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="gap-2 flex-1"
                    onClick={() => {
                      setAppointmentDetailsOpen(false);
                      handleStartReschedule(selectedAppointment);
                    }}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reschedule
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2 flex-1 text-destructive hover:text-destructive"
                    onClick={() =>
                      handleCancelAppointment(selectedAppointment.id)
                    }
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Booking Appointment Dialog */}
      <Dialog open={bookingOpen} onOpenChange={handleCloseBooking}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {bookingStep === 5
                ? "Appointment Confirmed!"
                : isRescheduling
                ? `Reschedule Appointment - Step ${bookingStep - 1} of 3`
                : `Book an Appointment - Step ${bookingStep} of 4`}
            </DialogTitle>
            <DialogDescription>
              {bookingStep === 1 && "Select a provider for your appointment"}
              {bookingStep === 2 && "Choose a date for your appointment"}
              {bookingStep === 3 && "Select an available time slot"}
              {bookingStep === 4 &&
                "Review and confirm your appointment details"}
              {bookingStep === 5 &&
                (isRescheduling
                  ? "Your appointment has been successfully rescheduled"
                  : "Your appointment has been successfully scheduled")}
            </DialogDescription>
          </DialogHeader>

          {isRescheduling && selectedAppointment && bookingStep < 5 && (
            <div className="bg-muted/30 p-3 rounded-md mb-4 border">
              <p className="text-sm font-medium">Currently scheduled:</p>
              <div className="flex items-center gap-2 mt-1 text-sm">
                <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {formatDate(selectedAppointment.date, "medium")} at{" "}
                  {selectedAppointment.time}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm">
                <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{selectedAppointment.provider}</span>
              </div>
            </div>
          )}

          {/* Step 1: Provider Selection */}
          {bookingStep === 1 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4">
                {providers.map((provider) => (
                  <div
                    key={provider.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-all ${
                      selectedProvider === provider.id
                        ? "border-primary bg-primary/5"
                        : provider.available
                        ? "hover:border-primary"
                        : "opacity-50 cursor-not-allowed"
                    }`}
                    onClick={() => {
                      if (provider.available) {
                        setSelectedProvider(provider.id);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                        <UserIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-medium">{provider.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {provider.specialty}
                        </p>
                        {!provider.available && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            Unavailable
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCloseBooking}>
                  Cancel
                </Button>
                <Button
                  onClick={() => setBookingStep(2)}
                  disabled={!selectedProvider}
                >
                  Next
                </Button>
              </DialogFooter>
            </>
          )}

          {/* Step 2: Date Selection */}
          {bookingStep === 2 && (
            <>
              <div className="py-4 flex flex-col items-center">
                {!isRescheduling && (
                  <p className="text-sm text-muted-foreground mb-2">
                    Selected Provider:{" "}
                    <span className="font-medium text-foreground">
                      {providers.find((p) => p.id === selectedProvider)?.name}
                    </span>
                  </p>
                )}
                <Calendar
                  mode="single"
                  selected={selectedDate ?? undefined}
                  onSelect={handleDateSelect}
                  disabled={(date) => {
                    // Disable dates in the past and weekends
                    return (
                      date < new Date() ||
                      date.getDay() === 0 ||
                      date.getDay() === 6
                    );
                  }}
                  className="rounded-md border"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Note: Weekends are unavailable for appointments
                </p>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (isRescheduling) {
                      handleCloseBooking();
                    } else {
                      setBookingStep(1);
                    }
                  }}
                >
                  {isRescheduling ? "Cancel" : "Back"}
                </Button>
                <Button
                  onClick={() => setBookingStep(3)}
                  disabled={!selectedDate}
                >
                  Next
                </Button>
              </DialogFooter>
            </>
          )}

          {/* Step 3: Time Selection */}
          {bookingStep === 3 && (
            <>
              <div className="py-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Selected Date:{" "}
                  <span className="font-medium text-foreground">
                    {selectedDate?.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </p>

                {!isRescheduling && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">
                      Appointment Type
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        variant={
                          appointmentType === "In-person"
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => setAppointmentType("In-person")}
                        className="gap-2 flex-1"
                      >
                        <UserIcon className="h-4 w-4" />
                        In-person
                      </Button>
                      <Button
                        variant={
                          appointmentType === "Virtual" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setAppointmentType("Virtual")}
                        className="gap-2 flex-1"
                      >
                        <VideoIcon className="h-4 w-4" />
                        Virtual
                      </Button>
                    </div>
                  </div>
                )}

                <h3 className="text-sm font-medium mb-2">
                  Available Time Slots
                </h3>
                {availableTimeSlots.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4 bg-muted/20 rounded-md border border-dashed">
                    No available time slots for selected date
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {availableTimeSlots.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setBookingStep(2)}>
                  Back
                </Button>
                <Button
                  onClick={() => setBookingStep(4)}
                  disabled={!selectedTime}
                >
                  Next
                </Button>
              </DialogFooter>
            </>
          )}

          {/* Step 4: Review and Confirm */}
          {bookingStep === 4 && (
            <>
              <div className="py-4 space-y-4">
                <div className="rounded-lg border p-4 bg-muted/20">
                  <h3 className="font-medium mb-3">Appointment Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Provider:
                      </span>
                      <span className="text-sm font-medium">
                        {isRescheduling && selectedAppointment
                          ? selectedAppointment.provider
                          : providers.find((p) => p.id === selectedProvider)
                              ?.name}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Specialty:
                      </span>
                      <span className="text-sm">
                        {isRescheduling && selectedAppointment
                          ? selectedAppointment.specialty
                          : providers.find((p) => p.id === selectedProvider)
                              ?.specialty}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Date:
                      </span>
                      <span className="text-sm">
                        {selectedDate?.toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Time:
                      </span>
                      <span className="text-sm">{selectedTime}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Type:
                      </span>
                      <Badge variant="outline">{appointmentType}</Badge>
                    </div>

                    {isRescheduling && selectedAppointment && (
                      <>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Original:
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(selectedAppointment.date, "short")} at{" "}
                            {selectedAppointment.time}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {!isRescheduling && (
                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes (optional)</Label>
                    <Input
                      id="notes"
                      placeholder="Add any specific concerns or questions for your provider"
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                    />
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  By confirming this appointment, you agree to our
                  <a href="#" className="text-primary underline mx-1">
                    cancellation policy
                  </a>
                  which requires 24 hours notice for any changes.
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setBookingStep(3)}>
                  Back
                </Button>
                <Button onClick={handleSubmitBooking}>
                  {isRescheduling
                    ? "Confirm Reschedule"
                    : "Confirm Appointment"}
                </Button>
              </DialogFooter>
            </>
          )}

          {/* Step 5: Confirmation */}
          {bookingStep === 5 && (
            <>
              <div className="py-6 flex flex-col items-center">
                <div className="mb-4 bg-green-100 text-green-700 p-4 rounded-full">
                  <CheckCircle2 className="h-12 w-12" />
                </div>
                <h3 className="text-xl font-semibold text-center mb-2">
                  {isRescheduling
                    ? "Appointment Rescheduled!"
                    : "Appointment Confirmed!"}
                </h3>
                <p className="text-muted-foreground text-center mb-4">
                  {isRescheduling
                    ? "Your appointment has been successfully rescheduled"
                    : "Your appointment has been successfully scheduled"}
                </p>

                <div className="bg-muted/20 p-4 rounded-lg border w-full mb-4">
                  <p className="text-sm text-center mb-2">
                    Your booking reference
                  </p>
                  <p className="text-lg font-bold text-center">
                    {bookingReference}
                  </p>
                </div>

                <div className="space-y-2 text-sm w-full max-w-xs mx-auto">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Provider:</span>
                    <span className="font-medium">
                      {isRescheduling && selectedAppointment
                        ? selectedAppointment.provider
                        : providers.find((p) => p.id === selectedProvider)
                            ?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date & Time:</span>
                    <span>
                      {selectedDate?.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                      , {selectedTime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span>{appointmentType}</span>
                  </div>
                </div>

                <div className="mt-6 w-full">
                  <p className="text-xs text-muted-foreground text-center mb-2">
                    A confirmation email has been sent to your registered email
                    address
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCloseBooking} className="w-full">
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
