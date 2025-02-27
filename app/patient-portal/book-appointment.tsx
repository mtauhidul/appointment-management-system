import { Doctor } from "@/lib/types";
import {
  formatDateDisplay,
  formatTimeDisplay,
  getAvailableTimeSlots,
  getDayFromDate,
  groupTimeSlotsByPeriod,
  toISODateString,
} from "@/lib/utils/date-utils";
import { useEffect, useMemo, useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAppointmentStore } from "@/lib/store/useAppointmentStore";
import { useDoctorStore } from "@/lib/store/useDoctorStore";
import {
  CalendarIcon,
  CheckCircle2,
  ChevronRight,
  Clock,
  MapPin,
  Search,
  Star,
  User2,
  Video,
} from "lucide-react";

interface BookAppointmentProps {
  patientId: string;
}

export default function BookAppointment({ patientId }: BookAppointmentProps) {
  const { toast } = useToast();
  const { doctors } = useDoctorStore();
  const { appointments, addAppointment } = useAppointmentStore();

  // Booking state
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{
    id: string;
    startTime: string;
    endTime: string;
  } | null>(null);
  const [appointmentType, setAppointmentType] = useState<
    "in-person" | "virtual"
  >("in-person");
  const [appointmentNotes, setAppointmentNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentStep, setCurrentStep] = useState(1);

  // Confirmation dialog
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter doctors based on search term
  const filteredDoctors = useMemo(() => {
    if (!searchTerm.trim()) return doctors;

    const term = searchTerm.toLowerCase();
    return doctors.filter(
      (doctor) =>
        doctor.name.toLowerCase().includes(term) ||
        doctor.specialty.toLowerCase().includes(term)
    );
  }, [doctors, searchTerm]);

  // Get doctor's existing appointments for selected date
  const doctorBookedSlots = useMemo(() => {
    if (!selectedDoctor || !selectedDate) return [];

    const dateStr = toISODateString(selectedDate);

    return appointments
      .filter(
        (appointment) =>
          appointment.doctorId === selectedDoctor.id &&
          appointment.date === dateStr &&
          appointment.status !== "cancelled"
      )
      .map((appointment) => ({
        startTime: appointment.startTime,
        endTime: appointment.endTime,
      }));
  }, [appointments, selectedDoctor, selectedDate]);

  // Get available time slots for selected date
  const availableTimeSlots = useMemo(() => {
    if (!selectedDoctor || !selectedDate) return [];

    return getAvailableTimeSlots(
      selectedDoctor.availability,
      selectedDate,
      doctorBookedSlots
    );
  }, [selectedDoctor, selectedDate, doctorBookedSlots]);

  // Group time slots by period (morning, afternoon, evening)
  const groupedTimeSlots = useMemo(() => {
    return groupTimeSlotsByPeriod(availableTimeSlots);
  }, [availableTimeSlots]);

  // Get disabled dates for calendar
  const getDisabledDates = (doctor: Doctor) => {
    // Function to check if a date has any available slots for a doctor
    return (date: Date) => {
      const day = getDayFromDate(date);
      const isInPast = date < new Date();
      const hasNoAvailability =
        !doctor.availability[day] || doctor.availability[day].length === 0;

      return isInPast || hasNoAvailability;
    };
  };

  // Determine the next day with availability for initial calendar selection
  useEffect(() => {
    if (selectedDoctor) {
      const today = new Date();

      // Check the next 30 days for any availability
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date();
        checkDate.setDate(today.getDate() + i);

        if (!getDisabledDates(selectedDoctor)(checkDate)) {
          setSelectedDate(checkDate);
          break;
        }
      }
    }
  }, [selectedDoctor]);

  // Reset later steps when earlier selections change
  useEffect(() => {
    setSelectedTimeSlot(null);
  }, [selectedDate]);

  useEffect(() => {
    setSelectedDate(undefined);
    setSelectedTimeSlot(null);
  }, [selectedDoctor]);

  // Handle appointment booking
  const handleBookAppointment = () => {
    if (!selectedDoctor || !selectedDate || !selectedTimeSlot) return;

    setIsSubmitting(true);

    // Simulate API call delay
    setTimeout(() => {
      try {
        addAppointment({
          patientId,
          doctorId: selectedDoctor.id,
          date: toISODateString(selectedDate),
          startTime: selectedTimeSlot.startTime,
          endTime: selectedTimeSlot.endTime,
          appointmentType,
          status: "scheduled",
          notes: appointmentNotes,
        });

        toast({
          title: "Appointment Booked",
          description: "Your appointment has been scheduled successfully.",
        });

        // Reset form
        resetForm();
        setShowConfirmation(false);
      } catch {
        toast({
          variant: "destructive",
          title: "Booking Failed",
          description:
            "There was an error booking your appointment. Please try again.",
        });
      } finally {
        setIsSubmitting(false);
      }
    }, 1000);
  };

  const resetForm = () => {
    setCurrentStep(1);
    setSelectedDoctor(null);
    setSelectedDate(undefined);
    setSelectedTimeSlot(null);
    setAppointmentType("in-person");
    setAppointmentNotes("");
    setSearchTerm("");
  };

  return (
    <>
      <div className="space-y-4">
        {/* Progress Steps */}
        <div className="flex justify-center">
          <ol className="flex items-center w-full max-w-3xl">
            {[
              { step: 1, label: "Select Doctor" },
              { step: 2, label: "Choose Date" },
              { step: 3, label: "Select Time" },
              { step: 4, label: "Appointment Details" },
            ].map((item, index) => (
              <li
                key={item.step}
                className={`flex items-center ${index < 3 ? "w-full" : ""}`}
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      currentStep >= item.step
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {currentStep > item.step ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <span>{item.step}</span>
                    )}
                  </div>
                  <span
                    className={`text-xs mt-1 ${
                      currentStep >= item.step
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
                {index < 3 && (
                  <div className="w-full flex items-center">
                    <div
                      className={`w-full h-1 mx-2 ${
                        currentStep > item.step ? "bg-primary" : "bg-muted"
                      }`}
                    ></div>
                  </div>
                )}
              </li>
            ))}
          </ol>
        </div>

        {/* Step 1: Select Doctor */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Select a Doctor</CardTitle>
              <CardDescription>
                Choose a healthcare provider for your appointment
              </CardDescription>
              <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by name or specialty..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredDoctors.length === 0 ? (
                  <div className="md:col-span-2 lg:col-span-3 py-8 text-center text-muted-foreground">
                    No doctors found matching your search criteria
                  </div>
                ) : (
                  filteredDoctors.map((doctor) => (
                    <Card
                      key={doctor.id}
                      className={`cursor-pointer transition-all hover:border-primary hover:shadow-sm ${
                        selectedDoctor?.id === doctor.id
                          ? "border-primary ring-1 ring-primary"
                          : ""
                      }`}
                      onClick={() => setSelectedDoctor(doctor)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12 border">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {doctor.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <h3 className="font-medium">{doctor.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {doctor.specialty}
                            </p>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Star className="h-3 w-3 fill-primary text-primary mr-1" />
                              <span className="text-xs">4.8 (42 reviews)</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
            <CardFooter className="justify-between border-t p-4">
              <p className="text-sm text-muted-foreground">
                {selectedDoctor
                  ? `Selected: ${selectedDoctor.name}`
                  : "Select a doctor to continue"}
              </p>
              <Button
                disabled={!selectedDoctor}
                onClick={() => setCurrentStep(2)}
              >
                Continue <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Step 2: Select Date */}
        {currentStep === 2 && selectedDoctor && (
          <Card>
            <CardHeader>
              <CardTitle>Select a Date</CardTitle>
              <CardDescription>
                Choose an available date for your appointment with{" "}
                {selectedDoctor.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <Card className="flex-1 border-dashed">
                  <CardContent className="p-4">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={getDisabledDates(selectedDoctor)}
                      className="mx-auto"
                    />
                  </CardContent>
                </Card>

                <div className="flex-1">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold flex items-center">
                        <User2 className="mr-2 h-4 w-4 text-primary" />
                        Doctor Information
                      </h3>
                      <div className="space-y-1.5 text-sm">
                        <p className="font-medium">{selectedDoctor.name}</p>
                        <p>{selectedDoctor.specialty}</p>
                        <p>{selectedDoctor.email}</p>
                        <p>{selectedDoctor.phone}</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <h3 className="font-semibold flex items-center">
                        <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                        Available Days
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(selectedDoctor.availability).map(
                          ([day, slots]) => {
                            if (slots.length === 0) return null;
                            return (
                              <Badge key={day} variant="outline">
                                {day.charAt(0).toUpperCase() + day.slice(1)}
                              </Badge>
                            );
                          }
                        )}
                      </div>
                    </div>

                    {selectedDate && (
                      <div className="mt-4 space-y-2">
                        <h3 className="font-semibold text-primary">
                          {formatDateDisplay(selectedDate)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {availableTimeSlots.length} time slots available
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-between border-t p-4">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                Back
              </Button>
              <Button
                disabled={!selectedDate}
                onClick={() => setCurrentStep(3)}
              >
                Continue <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Step 3: Select Time */}
        {currentStep === 3 && selectedDoctor && selectedDate && (
          <Card>
            <CardHeader>
              <CardTitle>Select a Time</CardTitle>
              <CardDescription>
                Choose an available time slot on{" "}
                {formatDateDisplay(selectedDate)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {availableTimeSlots.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    No available time slots for this day.
                  </p>
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    Choose Another Date
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedTimeSlots).map(([period, slots]) => {
                    if (slots.length === 0) return null;

                    return (
                      <div key={period} className="space-y-2">
                        <h3 className="font-medium capitalize">
                          {period} ({slots.length}{" "}
                          {slots.length === 1 ? "slot" : "slots"})
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {slots.map((slot) => (
                            <Button
                              key={slot.id}
                              variant={
                                selectedTimeSlot?.id === slot.id
                                  ? "default"
                                  : "outline"
                              }
                              className="justify-start"
                              onClick={() => setSelectedTimeSlot(slot)}
                            >
                              <Clock className="mr-2 h-4 w-4" />
                              {formatTimeDisplay(slot.startTime)}
                            </Button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
            <CardFooter className="justify-between border-t p-4">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                Back
              </Button>
              <Button
                disabled={!selectedTimeSlot}
                onClick={() => setCurrentStep(4)}
              >
                Continue <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Step 4: Appointment Details */}
        {currentStep === 4 &&
          selectedDoctor &&
          selectedDate &&
          selectedTimeSlot && (
            <Card>
              <CardHeader>
                <CardTitle>Appointment Details</CardTitle>
                <CardDescription>
                  Finalize your appointment details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium">Appointment Type</h3>
                      <RadioGroup
                        className="mt-2"
                        value={appointmentType}
                        onValueChange={(value) =>
                          setAppointmentType(value as "in-person" | "virtual")
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="in-person" id="in-person" />
                          <Label
                            htmlFor="in-person"
                            className="flex items-center"
                          >
                            <MapPin className="mr-2 h-4 w-4" />
                            In-person Visit
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="virtual" id="virtual" />
                          <Label
                            htmlFor="virtual"
                            className="flex items-center"
                          >
                            <Video className="mr-2 h-4 w-4" />
                            Virtual Appointment
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium">Appointment Notes</h3>
                      <Textarea
                        className="mt-2"
                        placeholder="Please provide any additional information or reason for visit..."
                        value={appointmentNotes}
                        onChange={(e) => setAppointmentNotes(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">
                          Appointment Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Doctor:</span>
                          <span className="font-medium">
                            {selectedDoctor.name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Specialty:
                          </span>
                          <span>{selectedDoctor.specialty}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Date:</span>
                          <span>{formatDateDisplay(selectedDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Time:</span>
                          <span>
                            {formatTimeDisplay(selectedTimeSlot.startTime)} -{" "}
                            {formatTimeDisplay(selectedTimeSlot.endTime)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Type:</span>
                          <span className="capitalize">{appointmentType}</span>
                        </div>
                        <Separator />
                        <div className="pt-2">
                          <p className="text-sm text-muted-foreground mb-1">
                            {appointmentType === "in-person" ? (
                              <>
                                <MapPin className="inline h-3 w-3 mr-1" />
                                Please arrive 15 minutes before your scheduled
                                time.
                              </>
                            ) : (
                              <>
                                <Video className="inline h-3 w-3 mr-1" />
                                You&apos;ll receive a link to join the virtual
                                appointment.
                              </>
                            )}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-between border-t p-4">
                <Button variant="outline" onClick={() => setCurrentStep(3)}>
                  Back
                </Button>
                <Button onClick={() => setShowConfirmation(true)}>
                  Book Appointment
                </Button>
              </CardFooter>
            </Card>
          )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Appointment</DialogTitle>
            <DialogDescription>
              Please review your appointment details before confirming.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedDoctor && selectedDate && selectedTimeSlot && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {selectedDoctor.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedDoctor.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedDoctor.specialty}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 rounded-lg border p-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {formatDateDisplay(selectedDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-medium">
                      {formatTimeDisplay(selectedTimeSlot.startTime)} -{" "}
                      {formatTimeDisplay(selectedTimeSlot.endTime)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium capitalize">{appointmentType}</p>
                  </div>
                </div>

                {appointmentNotes && (
                  <div>
                    <p className="text-sm font-medium">Notes</p>
                    <p className="text-sm text-muted-foreground">
                      {appointmentNotes}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmation(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleBookAppointment} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">◌</span>
                  Processing...
                </>
              ) : (
                "Confirm Booking"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
