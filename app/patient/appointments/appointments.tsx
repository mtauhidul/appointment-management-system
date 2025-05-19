import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, ClockIcon, UserIcon, VideoIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  rating: number;
}

interface Appointment {
  id: string;
  doctorId: number;
  date: Date;
  time: string;
  status: "confirmed" | "cancelled" | "rescheduled";
  originalDate?: Date;
  originalTime?: string;
}

const doctors: Doctor[] = [
  { id: 1, name: "Dr. Sarah Johnson", specialty: "Cardiology", rating: 4.9 },
  { id: 2, name: "Dr. Michael Chen", specialty: "Dermatology", rating: 4.8 },
  { id: 3, name: "Dr. Emily Rodriguez", specialty: "Neurology", rating: 4.7 },
  { id: 4, name: "Dr. David Kim", specialty: "Orthopedics", rating: 4.8 },
];

const timeSlots = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
];

const Appointments = () => {
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [open, setOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [appointmentToReschedule, setAppointmentToReschedule] =
    useState<Appointment | null>(null);
  const [rescheduleStep, setRescheduleStep] = useState(1);
  const [appointmentDetailsOpen, setAppointmentDetailsOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  // Load appointments from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("appointments");
      if (saved) {
        setAppointments(
          JSON.parse(saved, (key, value) => {
            if (key === "date" || key === "originalDate")
              return new Date(value);
            return value;
          })
        );
      }
    } catch (error) {
      console.error("Failed to load appointments from sessionStorage", error);
    }
  }, []);

  // Save appointments to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("appointments", JSON.stringify(appointments));
  }, [appointments]);

  const handleConfirmation = () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) return;

    const newAppointment: Appointment = {
      id: Date.now().toString(),
      doctorId: selectedDoctor,
      date: selectedDate,
      time: selectedTime,
      status: "confirmed",
    };

    setAppointments((prev) => [...prev, newAppointment]);
    setOpen(false);
    resetForm();
  };

  const handleCancel = (appointmentId: string) => {
    setAppointments((prev) => prev.filter((appt) => appt.id !== appointmentId));
  };

  const handleReschedule = (appointment: Appointment) => {
    setAppointmentToReschedule(appointment);
    setSelectedDoctor(appointment.doctorId);
    setRescheduleStep(1);
    setRescheduleOpen(true);
  };

  const confirmReschedule = () => {
    if (!appointmentToReschedule || !selectedDate || !selectedTime) return;

    const updatedAppointment: Appointment = {
      ...appointmentToReschedule,
      originalDate:
        appointmentToReschedule.originalDate || appointmentToReschedule.date,
      originalTime:
        appointmentToReschedule.originalTime || appointmentToReschedule.time,
      date: selectedDate,
      time: selectedTime,
      status: "rescheduled",
    };

    setAppointments((prev) =>
      prev.map((appt) =>
        appt.id === appointmentToReschedule.id ? updatedAppointment : appt
      )
    );
    setRescheduleOpen(false);
    resetRescheduleForm();
  };

  const resetForm = () => {
    setCurrentStep(1);
    setSelectedDoctor(null);
    setSelectedDate(undefined);
    setSelectedTime(null);
  };

  const resetRescheduleForm = () => {
    setRescheduleStep(1);
    setAppointmentToReschedule(null);
    setSelectedDate(undefined);
    setSelectedTime(null);
  };

  const getDoctorById = (doctorId: number) => {
    return doctors.find((doctor) => doctor.id === doctorId);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const showAppointmentDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setAppointmentDetailsOpen(true);
  };

  // Calculate if the appointment is upcoming (in the future)
  const isUpcoming = (appointment: Appointment) => {
    const today = new Date();
    const apptDate = new Date(appointment.date);
    return apptDate > today;
  };

  // Get unavailable time slots for a specific date (simulated)
  const getUnavailableTimeSlots = (date: Date, doctorId: number) => {
    // In a real app, this would come from the server
    // This is just a simple simulation
    const dateSeed = date.getDate() + doctorId;
    const unavailable = [];

    // Randomly mark some slots as unavailable based on date and doctor
    if (dateSeed % 5 === 0) unavailable.push("09:00 AM");
    if (dateSeed % 4 === 0) unavailable.push("11:00 AM");
    if (dateSeed % 3 === 0) unavailable.push("02:00 PM");
    if (dateSeed % 2 === 0) unavailable.push("04:00 PM");

    return unavailable;
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Appointments</h2>
        <Dialog
          open={open}
          onOpenChange={(isOpen) => {
            if (!isOpen) resetForm();
            setOpen(isOpen);
          }}
        >
          <DialogTrigger asChild>
            <Button>Book New Appointment</Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl">
            <DialogTitle>Book Appointment</DialogTitle>
            <div className="space-y-6 pt-4">
              <div className="flex justify-center gap-4">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center gap-2">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center 
                      ${
                        currentStep >= step
                          ? "bg-primary text-white"
                          : "bg-muted"
                      }`}
                    >
                      {step}
                    </div>
                    {step < 3 && <Separator className="w-8" />}
                  </div>
                ))}
              </div>

              {currentStep === 1 && (
                <div className="grid gap-4">
                  <h3 className="text-xl font-semibold">Select Doctor</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {doctors.map((doctor) => (
                      <Card
                        key={doctor.id}
                        className={`cursor-pointer transition-colors ${
                          selectedDoctor === doctor.id ? "border-primary" : ""
                        }`}
                        onClick={() => setSelectedDoctor(doctor.id)}
                      >
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                            <UserIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{doctor.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {doctor.specialty} • ⭐ {doctor.rating}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <Button
                    disabled={!selectedDoctor}
                    onClick={() => setCurrentStep(2)}
                  >
                    Next: Select Date
                  </Button>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Select Date</h3>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date < today;
                    }}
                  />
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(1)}>
                      Back
                    </Button>
                    <Button
                      disabled={!selectedDate}
                      onClick={() => setCurrentStep(3)}
                    >
                      Next: Select Time
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 3 && selectedDate && selectedDoctor && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Select Time Slot</h3>
                  <p className="text-sm text-muted-foreground">
                    Available times for {formatDate(selectedDate)}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(() => {
                      const unavailableTimes = getUnavailableTimeSlots(
                        selectedDate,
                        selectedDoctor
                      );
                      return timeSlots.map((time) => {
                        const isUnavailable = unavailableTimes.includes(time);
                        return (
                          <Button
                            key={time}
                            variant={
                              selectedTime === time ? "default" : "outline"
                            }
                            onClick={() =>
                              !isUnavailable && setSelectedTime(time)
                            }
                            disabled={isUnavailable}
                            className={isUnavailable ? "opacity-50" : ""}
                          >
                            {time}
                          </Button>
                        );
                      });
                    })()}
                  </div>
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(2)}>
                      Back
                    </Button>
                    <Button
                      disabled={!selectedTime}
                      onClick={handleConfirmation}
                    >
                      Confirm Appointment
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Reschedule Dialog */}
      <Dialog
        open={rescheduleOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) resetRescheduleForm();
          setRescheduleOpen(isOpen);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogTitle>Reschedule Appointment</DialogTitle>
          <div className="space-y-6 pt-4">
            <div className="flex justify-center gap-4">
              {[1, 2].map((step) => (
                <div key={step} className="flex items-center gap-2">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center 
                    ${
                      rescheduleStep >= step
                        ? "bg-primary text-white"
                        : "bg-muted"
                    }`}
                  >
                    {step}
                  </div>
                  {step < 2 && <Separator className="w-8" />}
                </div>
              ))}
            </div>

            {appointmentToReschedule && (
              <div className="bg-muted/30 p-3 rounded-md">
                <p className="text-sm font-medium">Currently scheduled for:</p>
                <div className="flex items-center mt-1 text-sm">
                  <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>
                    {formatDate(appointmentToReschedule.date)} at{" "}
                    {appointmentToReschedule.time}
                  </span>
                </div>
                <div className="flex items-center mt-1 text-sm">
                  <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>
                    {getDoctorById(appointmentToReschedule.doctorId)?.name}
                  </span>
                </div>
              </div>
            )}

            {rescheduleStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Select New Date</h3>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date < today;
                  }}
                />
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setRescheduleOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={!selectedDate}
                    onClick={() => setRescheduleStep(2)}
                  >
                    Next: Select Time
                  </Button>
                </div>
              </div>
            )}

            {rescheduleStep === 2 &&
              selectedDate &&
              appointmentToReschedule && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">
                    Select New Time Slot
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Available times for {formatDate(selectedDate)}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(() => {
                      const unavailableTimes = getUnavailableTimeSlots(
                        selectedDate,
                        appointmentToReschedule.doctorId
                      );
                      return timeSlots.map((time) => {
                        const isUnavailable = unavailableTimes.includes(time);
                        return (
                          <Button
                            key={time}
                            variant={
                              selectedTime === time ? "default" : "outline"
                            }
                            onClick={() =>
                              !isUnavailable && setSelectedTime(time)
                            }
                            disabled={isUnavailable}
                            className={isUnavailable ? "opacity-50" : ""}
                          >
                            {time}
                          </Button>
                        );
                      });
                    })()}
                  </div>
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setRescheduleStep(1)}
                    >
                      Back
                    </Button>
                    <Button
                      disabled={!selectedTime}
                      onClick={confirmReschedule}
                    >
                      Confirm Reschedule
                    </Button>
                  </div>
                </div>
              )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Appointment Details Dialog */}
      <Dialog
        open={appointmentDetailsOpen}
        onOpenChange={setAppointmentDetailsOpen}
      >
        <DialogContent>
          <DialogTitle>Appointment Details</DialogTitle>
          {selectedAppointment && (
            <div className="space-y-4 pt-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <UserIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">
                      {getDoctorById(selectedAppointment.doctorId)?.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {getDoctorById(selectedAppointment.doctorId)?.specialty}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex">
                    <div className="w-24 flex-shrink-0 text-muted-foreground text-sm">
                      Status
                    </div>
                    <div>
                      <Badge
                        className={
                          selectedAppointment.status === "confirmed"
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : selectedAppointment.status === "rescheduled"
                            ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                            : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                        }
                      >
                        {selectedAppointment.status === "confirmed"
                          ? "Confirmed"
                          : selectedAppointment.status === "rescheduled"
                          ? "Rescheduled"
                          : "Cancelled"}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex">
                    <div className="w-24 flex-shrink-0 text-muted-foreground text-sm">
                      Date
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{formatDate(selectedAppointment.date)}</span>
                    </div>
                  </div>

                  <div className="flex">
                    <div className="w-24 flex-shrink-0 text-muted-foreground text-sm">
                      Time
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{selectedAppointment.time}</span>
                    </div>
                  </div>

                  {selectedAppointment.status === "rescheduled" &&
                    selectedAppointment.originalDate && (
                      <div className="flex">
                        <div className="w-24 flex-shrink-0 text-muted-foreground text-sm">
                          Original
                        </div>
                        <div className="text-muted-foreground text-sm">
                          {formatDate(selectedAppointment.originalDate)} at{" "}
                          {selectedAppointment.originalTime}
                        </div>
                      </div>
                    )}
                </div>

                {selectedAppointment.status === "confirmed" &&
                  isUpcoming(selectedAppointment) && (
                    <div className="flex space-x-2 mt-6">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setAppointmentDetailsOpen(false);
                          handleReschedule(selectedAppointment);
                        }}
                      >
                        Reschedule
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 text-destructive"
                        onClick={() => {
                          handleCancel(selectedAppointment.id);
                          setAppointmentDetailsOpen(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Upcoming Appointments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {appointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No upcoming appointments. Book your first appointment to get
              started.
            </div>
          ) : (
            appointments
              .filter((appt) => isUpcoming(appt))
              .sort(
                (a, b) =>
                  new Date(a.date).getTime() - new Date(b.date).getTime()
              )
              .map((appointment) => {
                const doctor = getDoctorById(appointment.doctorId);
                return (
                  <div
                    key={appointment.id}
                    className="border rounded-lg p-4 hover:bg-muted/10 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className="cursor-pointer"
                        onClick={() => showAppointmentDetails(appointment)}
                      >
                        <div className="flex items-center">
                          <p className="font-medium">{doctor?.name}</p>
                          {appointment.status === "rescheduled" && (
                            <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-100">
                              Rescheduled
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(appointment.date)} • {appointment.time}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {doctor?.specialty}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReschedule(appointment)}
                        >
                          Reschedule
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancel(appointment.id)}
                          className="text-destructive"
                        >
                          Cancel
                        </Button>
                        <Button variant="default" size="sm">
                          <VideoIcon className="h-4 w-4 mr-2" />
                          Join
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </CardContent>
      </Card>

      {/* Past Appointments Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClockIcon className="h-5 w-5" />
            Past Appointments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {appointments.filter((appt) => !isUpcoming(appt)).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No past appointments
            </div>
          ) : (
            appointments
              .filter((appt) => !isUpcoming(appt))
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              )
              .map((appointment) => {
                const doctor = getDoctorById(appointment.doctorId);
                return (
                  <div
                    key={appointment.id}
                    className="border rounded-lg p-4 hover:bg-muted/10 transition-colors cursor-pointer"
                    onClick={() => showAppointmentDetails(appointment)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center">
                          <p className="font-medium">{doctor?.name}</p>
                          {appointment.status === "cancelled" ? (
                            <Badge className="ml-2 bg-amber-100 text-amber-800 hover:bg-amber-100">
                              Cancelled
                            </Badge>
                          ) : appointment.status === "rescheduled" ? (
                            <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-100">
                              Rescheduled
                            </Badge>
                          ) : null}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(appointment.date)} • {appointment.time}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {doctor?.specialty}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                );
              })
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Appointments;
