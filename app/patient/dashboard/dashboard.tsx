"use client";

import {
  AlertCircle,
  CalendarIcon,
  Clock,
  FileEdit,
  Loader2,
  PlusCircle,
  RefreshCw,
  UserIcon,
  VideoIcon,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Real-time imports
import { useToast } from "@/hooks/use-toast";
import {
  appointmentService,
  AvailableSlot,
  PatientAppointment,
} from "@/lib/services/appointment-service";
import { Doctor, DoctorAvailability } from "@/lib/types/doctor";

// Real patient data (in production, this would come from authentication)
const patientData = {
  name: "Roger Curtis",
  id: "208898786",
  email: "roger.curtis@email.com",
  phone: "+1-555-0123",
};

const Dashboard = () => {
  // Real-time state management
  const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Booking dialog state
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [appointmentDetailsOpen, setAppointmentDetailsOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<PatientAppointment | null>(null);
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Booking form state
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [appointmentType, setAppointmentType] = useState<
    "in-person" | "virtual"
  >("in-person");
  const [reasonForVisit, setReasonForVisit] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");

  // Available slots state
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Load initial data and set up real-time subscriptions
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);

        // Load available doctors
        const availableDoctors = await appointmentService.getAvailableDoctors();
        setDoctors(availableDoctors);

        // Set up real-time appointment subscription for this patient
        const unsubscribe = appointmentService.subscribeToAppointments(
          { patientId: patientData.id },
          (updatedAppointments) => {
            setAppointments(updatedAppointments);
            setLoading(false);
          }
        );

        // Cleanup subscription on unmount
        return () => {
          unsubscribe();
          appointmentService.cleanup();
        };
      } catch (err) {
        console.error("Error initializing data:", err);
        setError("Failed to load appointments. Please refresh the page.");
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // Load available time slots when doctor and date are selected
  useEffect(() => {
    const loadTimeSlots = async () => {
      if (!selectedDoctor || !selectedDate) {
        setAvailableSlots([]);
        return;
      }

      try {
        setLoadingSlots(true);
        const slots = await appointmentService.getAvailableSlots(
          selectedDoctor.id,
          selectedDate,
          30 // 30-minute appointments
        );
        setAvailableSlots(slots);
      } catch (err) {
        console.error("Error loading time slots:", err);
        toast({
          title: "Error",
          description: "Failed to load available time slots. Please try again.",
          variant: "destructive",
        });
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    loadTimeSlots();
  }, [selectedDoctor, selectedDate, toast]);

  // Helper function to get day name from date
  const getDayName = (date: Date): string => {
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    return days[date.getDay()];
  };

  // Reset booking form
  const resetBooking = useCallback(() => {
    setBookingStep(1);
    setSelectedDoctor(null);
    setSelectedDate(null);
    setSelectedTimeSlot(null);
    setAppointmentType("in-person");
    setReasonForVisit("");
    setSymptoms("");
    setBookingNotes("");
    setAvailableSlots([]);
  }, []);

  // Close booking dialog
  const handleCloseBooking = useCallback(() => {
    setBookingOpen(false);
    resetBooking();
    setIsRescheduling(false);
  }, [resetBooking]);

  // Start rescheduling process
  const handleStartReschedule = useCallback(
    (appointment: PatientAppointment) => {
      setIsRescheduling(true);
      setSelectedAppointment(appointment);

      // Find the doctor
      const doctor = doctors.find((d) => d.id === appointment.doctorId);
      if (doctor) {
        setSelectedDoctor(doctor);
      }

      setAppointmentType(appointment.type);
      setReasonForVisit(appointment.reasonForVisit || "");
      setSymptoms(appointment.symptoms || "");
      setBookingNotes(appointment.notes || "");
      setAppointmentDetailsOpen(false);
      setBookingStep(2); // Start at date selection
      setBookingOpen(true);
    },
    [doctors]
  );

  // Synchronous date disabled check for Calendar component
  const isDateDisabledSync = useCallback(
    (date: Date): boolean => {
      // Always disable past dates
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) {
        return true;
      }

      // If no doctor is selected, only disable weekends
      if (!selectedDoctor) {
        return date.getDay() === 0 || date.getDay() === 6; // Disable weekends
      }

      // Check availability directly from doctor's schedule
      const dayName = getDayName(date);
      const doctorAvailability: DoctorAvailability =
        selectedDoctor.availability;

      // Ensure we have availability data
      if (!doctorAvailability) {
        console.log(`No availability data for doctor: ${selectedDoctor.name}`);
        return true; // Disable if no availability data
      }

      const daySlots =
        doctorAvailability[dayName as keyof DoctorAvailability] || [];

      // Debug logging
      console.log(
        `Date: ${date.toDateString()}, Day: ${dayName}, Doctor: ${
          selectedDoctor.name
        }, Slots:`,
        daySlots,
        "Available:",
        daySlots.length > 0
      );

      // Disable if doctor has no time slots on this day
      return daySlots.length === 0;
    },
    [selectedDoctor]
  );

  // Handle date selection with validation
  const handleDateSelectWithValidation = useCallback(
    (date: Date | undefined) => {
      if (!date) {
        setSelectedDate(null);
        setSelectedTimeSlot(null);
        return;
      }

      // Check if the selected date is disabled
      const isDisabled = isDateDisabledSync(date);
      if (isDisabled) {
        // Don't allow selection of disabled dates
        console.log(
          `Date ${date.toDateString()} is disabled and cannot be selected`
        );
        return;
      }

      setSelectedDate(date);
      setSelectedTimeSlot(null); // Reset time selection when date changes
    },
    [isDateDisabledSync]
  );

  // Handle appointment submission
  const handleSubmitBooking = async () => {
    if (
      !selectedDoctor ||
      !selectedDate ||
      !selectedTimeSlot ||
      !reasonForVisit.trim()
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      if (isRescheduling && selectedAppointment) {
        // Reschedule existing appointment
        await appointmentService.rescheduleAppointment(
          selectedAppointment.id,
          selectedDoctor.id,
          selectedDate,
          selectedTimeSlot,
          `Rescheduled by patient. ${bookingNotes}`.trim()
        );

        toast({
          title: "Appointment Rescheduled",
          description: `Your appointment with ${
            selectedDoctor.name
          } has been rescheduled to ${selectedDate.toLocaleDateString()} at ${selectedTimeSlot}.`,
        });
      } else {
        // Create new appointment - only include fields that have values
        const appointmentData = {
          patientId: patientData.id,
          patientName: patientData.name,
          patientEmail: patientData.email,
          patientPhone: patientData.phone,
          doctorId: selectedDoctor.id,
          doctorName: selectedDoctor.name,
          doctorSpecialty: selectedDoctor.specialty,
          date: selectedDate,
          timeSlot: selectedTimeSlot,
          duration: 30,
          type: appointmentType,
          location:
            appointmentType === "in-person"
              ? `Room ${selectedDoctor.roomsAssigned[0] || "TBD"}`
              : "Video Call",
          status: "scheduled" as const,
          reasonForVisit: reasonForVisit,
          ...(appointmentType === "in-person" &&
            selectedDoctor.roomsAssigned[0] && {
              roomId: selectedDoctor.roomsAssigned[0],
            }),
          ...(bookingNotes && { notes: bookingNotes }),
          ...(symptoms && { symptoms: symptoms }),
        };

        await appointmentService.createAppointment(appointmentData);

        toast({
          title: "Appointment Booked",
          description: `Your appointment with ${
            selectedDoctor.name
          } has been scheduled for ${selectedDate.toLocaleDateString()} at ${selectedTimeSlot}.`,
        });
      }

      handleCloseBooking();
    } catch (err) {
      console.error("Error submitting appointment:", err);
      toast({
        title: "Booking Failed",
        description:
          err instanceof Error
            ? err.message
            : "Failed to book appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle appointment cancellation
  const handleCancelAppointment = async (
    appointmentId: string,
    reason?: string
  ) => {
    try {
      await appointmentService.cancelAppointment(appointmentId, reason);
      setAppointmentDetailsOpen(false);

      toast({
        title: "Appointment Cancelled",
        description: "Your appointment has been cancelled successfully.",
      });
    } catch (err) {
      console.error("Error cancelling appointment:", err);
      toast({
        title: "Cancellation Failed",
        description: "Failed to cancel appointment. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Format appointment status for display
  const getStatusBadge = (status: PatientAppointment["status"]) => {
    const statusConfig = {
      scheduled: { label: "Scheduled", variant: "default" as const },
      confirmed: { label: "Confirmed", variant: "secondary" as const },
      "checked-in": { label: "Checked In", variant: "outline" as const },
      "in-progress": { label: "In Progress", variant: "default" as const },
      completed: { label: "Completed", variant: "secondary" as const },
      cancelled: { label: "Cancelled", variant: "destructive" as const },
      "no-show": { label: "No Show", variant: "destructive" as const },
      rescheduled: { label: "Rescheduled", variant: "outline" as const },
    };

    const config = statusConfig[status] || statusConfig.scheduled;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Show loading state
  if (loading && appointments.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Loading appointments...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <Alert className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

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

  // Show appointment details
  const handleShowAppointmentDetails = (appointment: PatientAppointment) => {
    setSelectedAppointment(appointment);
    setAppointmentDetailsOpen(true);
  };

  // Sort appointments by date
  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA.getTime() - dateB.getTime();
  });

  // Check if an appointment is in the past
  const isAppointmentPast = (appointment: PatientAppointment) => {
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
                          appointment.type === "virtual"
                            ? "bg-blue-100"
                            : "bg-green-100"
                        }`}
                      >
                        {appointment.type === "virtual" ? (
                          <VideoIcon
                            className={`h-5 w-5 ${
                              appointment.type === "virtual"
                                ? "text-blue-600"
                                : "text-green-600"
                            }`}
                          />
                        ) : (
                          <UserIcon
                            className={`h-5 w-5 ${
                              appointment.type === "in-person"
                                ? "text-green-600"
                                : "text-blue-600"
                            }`}
                          />
                        )}
                      </div>
                      <div>
                        <div className="flex gap-2 items-center flex-wrap">
                          <h3 className="font-semibold">
                            {appointment.doctorName}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {appointment.doctorSpecialty}
                          </Badge>
                          {getStatusBadge(appointment.status)}
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
                            <span>{appointment.timeSlot}</span>
                          </div>
                        </div>
                        <div className="text-xs mt-1 flex items-center gap-1">
                          <span
                            className={`${
                              appointment.type === "virtual"
                                ? "text-blue-600"
                                : "text-green-600"
                            } font-medium`}
                          >
                            {appointment.type === "virtual"
                              ? "Virtual"
                              : "In-person"}
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

                      {appointment.type === "virtual" && (
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
                        {appointment.type === "virtual" ? (
                          <VideoIcon className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <UserIcon className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <div className="flex gap-2 items-center">
                          <h3 className="font-medium">
                            {appointment.doctorName}
                          </h3>
                          <Badge
                            variant="outline"
                            className="text-xs text-muted-foreground"
                          >
                            {appointment.doctorSpecialty}
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
                            <span>{appointment.timeSlot}</span>
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
                      selectedAppointment.type === "virtual"
                        ? "bg-blue-100"
                        : "bg-green-100"
                    }`}
                  >
                    {selectedAppointment.type === "virtual" ? (
                      <VideoIcon
                        className={`h-6 w-6 ${
                          selectedAppointment.type === "virtual"
                            ? "text-blue-600"
                            : "text-green-600"
                        }`}
                      />
                    ) : (
                      <UserIcon
                        className={`h-6 w-6 ${
                          selectedAppointment.type === "in-person"
                            ? "text-green-600"
                            : "text-blue-600"
                        }`}
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {selectedAppointment.doctorName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedAppointment.doctorSpecialty}
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
                        <span>{selectedAppointment.timeSlot}</span>
                      </div>
                    </div>
                  </div>

                  {selectedAppointment.originalAppointmentId && (
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Rescheduled Appointment
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        This appointment has been rescheduled from a previous
                        booking.
                      </p>
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
                  {selectedAppointment.type === "virtual" && (
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
                  {selectedAppointment.timeSlot}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm">
                <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{selectedAppointment.doctorName}</span>
              </div>
            </div>
          )}

          {/* Step 1: Doctor Selection */}
          {bookingStep === 1 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4">
                {doctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-all ${
                      selectedDoctor?.id === doctor.id
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary"
                    }`}
                    onClick={() => {
                      setSelectedDoctor(doctor);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                        <UserIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-medium">{doctor.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {doctor.specialty}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {doctor.specialty}
                          </Badge>
                          <Badge
                            variant="default"
                            className="text-xs bg-green-100 text-green-800"
                          >
                            Available
                          </Badge>
                        </div>
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
                  disabled={!selectedDoctor}
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
                    Selected Doctor:{" "}
                    <span className="font-medium text-foreground">
                      {selectedDoctor?.name}
                    </span>
                  </p>
                )}
                <Calendar
                  mode="single"
                  selected={selectedDate ?? undefined}
                  onSelect={handleDateSelectWithValidation}
                  disabled={isDateDisabledSync}
                  className="rounded-md border"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {selectedDoctor
                    ? `Only showing days when ${
                        selectedDoctor.name
                      } is available. ${
                        selectedDoctor.availability
                          ? "Doctor availability loaded."
                          : "Loading doctor availability..."
                      }`
                    : "Note: Weekends are unavailable for appointments"}
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
                  disabled={
                    !selectedDate ||
                    (selectedDate && isDateDisabledSync(selectedDate))
                  }
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
                          appointmentType === "in-person"
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => setAppointmentType("in-person")}
                        className="gap-2 flex-1"
                      >
                        <UserIcon className="h-4 w-4" />
                        In-person
                      </Button>
                      <Button
                        variant={
                          appointmentType === "virtual" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setAppointmentType("virtual")}
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
                {loadingSlots ? (
                  <div className="text-center py-4">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">
                      Loading available slots...
                    </p>
                  </div>
                ) : availableSlots.filter((slot) => slot.available).length ===
                  0 ? (
                  <div className="text-center text-muted-foreground py-4 bg-muted/20 rounded-md border border-dashed">
                    No available time slots for selected date
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots
                      .filter((slot) => slot.available)
                      .map((slot) => (
                        <Button
                          key={slot.timeSlot}
                          variant={
                            selectedTimeSlot === slot.timeSlot
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => setSelectedTimeSlot(slot.timeSlot)}
                        >
                          {slot.timeSlot}
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
                  disabled={!selectedTimeSlot}
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
                        Doctor:
                      </span>
                      <span className="text-sm font-medium">
                        {selectedDoctor?.name}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Specialty:
                      </span>
                      <span className="text-sm">
                        {selectedDoctor?.specialty}
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
                      <span className="text-sm">{selectedTimeSlot}</span>
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
                            {selectedAppointment.timeSlot}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Form fields for appointment details */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason for Visit *</Label>
                    <Input
                      id="reason"
                      placeholder="e.g., Annual checkup, consultation, follow-up"
                      value={reasonForVisit}
                      onChange={(e) => setReasonForVisit(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="symptoms">Symptoms (optional)</Label>
                    <Textarea
                      id="symptoms"
                      placeholder="Describe any symptoms you're experiencing"
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any specific concerns or questions for your provider"
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>

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
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
