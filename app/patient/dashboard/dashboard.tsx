import {
  CalendarIcon,
  CheckCircle2,
  Clock,
  PlusCircle,
  UserIcon,
  VideoIcon,
  X,
} from "lucide-react";
import { useState } from "react";

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
const initialAppointments = [
  {
    id: "APT-23089",
    provider: "Dr. Sarah Johnson",
    specialty: "Podiatry",
    date: new Date(2025, 4, 22),
    time: "10:30 AM",
    type: "In-person",
    location: "Main Office",
    status: "confirmed",
  },
  {
    id: "APT-23412",
    provider: "Dr. Michael Chen",
    specialty: "Foot & Ankle Surgery",
    date: new Date(2025, 5, 5),
    time: "2:15 PM",
    type: "Virtual",
    location: "Video Call",
    status: "confirmed",
  },
];

// Available time slots for selected date

const getTimeSlots = (): string[] => {
  // In a real app, this would come from an API based on provider availability
  return [
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
};

const Dashboard = () => {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);

  // Booking state
  const [selectedProvider, setSelectedProvider] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [appointmentType, setAppointmentType] = useState("In-person");
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingReference, setBookingReference] = useState("");

  // Time slots for selected date
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

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
  };

  // Handle date selection
  interface HandleDateSelect {
    (date: Date | undefined): void;
  }

  const handleDateSelect: HandleDateSelect = (date) => {
    setSelectedDate(date ?? null);
    // Get available time slots for the selected date
    setAvailableTimeSlots(date ? getTimeSlots() : []);
  };

  // Handle appointment submission
  const handleSubmitBooking = () => {
    // Generate a booking reference
    const reference = `APT-${Math.floor(10000 + Math.random() * 90000)}`;
    setBookingReference(reference);

    // Add the new appointment to the list
    const providerObj = providers.find((p) => p.id === selectedProvider);
    const newAppointment = {
      id: reference,
      provider: providerObj ? providerObj.name : "",
      specialty: providerObj ? providerObj.specialty : "",
      date: selectedDate as Date,
      time: (selectedTime ?? "") as string,
      type: appointmentType as "In-person" | "Virtual",
      location: appointmentType === "In-person" ? "Main Office" : "Video Call",
      status: "confirmed",
    };

    setAppointments([...appointments, newAppointment]);
    setBookingStep(5); // Move to confirmation step
  };

  // Cancel an appointment
  const handleCancelAppointment = (appointmentId: string) => {
    if (confirm("Are you sure you want to cancel this appointment?")) {
      setAppointments(appointments.filter((apt) => apt.id !== appointmentId));
    }
  };

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
          {appointments.length === 0 ? (
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
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border rounded-xl p-4 hover:shadow-md transition-shadow bg-card"
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
                        <div className="flex gap-2 items-center">
                          <h3 className="font-semibold">
                            {appointment.provider}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {appointment.specialty}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-3.5 w-3.5" />
                            <span>
                              {appointment.date.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
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
                    <div className="flex gap-2 ml-auto">
                      {appointment.type === "Virtual" && (
                        <Button size="sm" className="gap-1">
                          <VideoIcon className="h-3.5 w-3.5" />
                          Join
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive gap-1"
                        onClick={() => handleCancelAppointment(appointment.id)}
                      >
                        <X className="h-3.5 w-3.5" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Appointment Dialog */}
      <Dialog open={bookingOpen} onOpenChange={handleCloseBooking}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {bookingStep === 5
                ? "Appointment Confirmed!"
                : `Book an Appointment - Step ${bookingStep} of 4`}
            </DialogTitle>
            <DialogDescription>
              {bookingStep === 1 && "Select a provider for your appointment"}
              {bookingStep === 2 && "Choose a date for your appointment"}
              {bookingStep === 3 && "Select an available time slot"}
              {bookingStep === 4 &&
                "Review and confirm your appointment details"}
              {bookingStep === 5 &&
                "Your appointment has been successfully scheduled"}
            </DialogDescription>
          </DialogHeader>

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
                <p className="text-sm text-muted-foreground mb-2">
                  Selected Provider:{" "}
                  <span className="font-medium text-foreground">
                    {providers.find((p) => p.id === selectedProvider)?.name}
                  </span>
                </p>
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
                <Button variant="outline" onClick={() => setBookingStep(1)}>
                  Back
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

                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2">Appointment Type</h3>
                  <div className="flex gap-2">
                    <Button
                      variant={
                        appointmentType === "In-person" ? "default" : "outline"
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

                <h3 className="text-sm font-medium mb-2">
                  Available Time Slots
                </h3>
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
                        {providers.find((p) => p.id === selectedProvider)?.name}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Specialty:
                      </span>
                      <span className="text-sm">
                        {
                          providers.find((p) => p.id === selectedProvider)
                            ?.specialty
                        }
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
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (optional)</Label>
                  <Input
                    id="notes"
                    placeholder="Add any specific concerns or questions for your provider"
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                  />
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
                  Confirm Appointment
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
                  Appointment Confirmed!
                </h3>
                <p className="text-muted-foreground text-center mb-4">
                  Your appointment has been successfully scheduled
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
                      {providers.find((p) => p.id === selectedProvider)?.name}
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
