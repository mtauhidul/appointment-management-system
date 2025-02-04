import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, UserIcon, VideoIcon } from "lucide-react";
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
  status: "confirmed" | "cancelled";
}

const doctors: Doctor[] = [
  { id: 1, name: "Dr. Sarah Johnson", specialty: "Cardiology", rating: 4.9 },
  { id: 2, name: "Dr. Michael Chen", specialty: "Dermatology", rating: 4.8 },
];

const timeSlots = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
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

  // Load appointments from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("appointments");
      if (saved) {
        setAppointments(
          JSON.parse(saved, (key, value) => {
            if (key === "date") return new Date(value);
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
    resetForm();
  };

  const handleCancel = (appointmentId: string) => {
    setAppointments((prev) => prev.filter((appt) => appt.id !== appointmentId));
  };

  const resetForm = () => {
    setCurrentStep(1);
    setSelectedDoctor(null);
    setSelectedDate(undefined);
    setSelectedTime(null);
  };

  const getDoctorById = (doctorId: number) => {
    return doctors.find((doctor) => doctor.id === doctorId);
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
            <div className="space-y-6">
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
                    disabled={(date) => date < new Date()}
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

              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Select Time Slot</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </Button>
                    ))}
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
              No upcoming appointments
            </div>
          ) : (
            appointments.map((appointment) => {
              const doctor = getDoctorById(appointment.doctorId);
              return (
                <div key={appointment.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{doctor?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.date.toLocaleDateString()} •{" "}
                        {appointment.time}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {doctor?.specialty}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancel(appointment.id)}
                      >
                        Cancel
                      </Button>
                      <Button variant="outline" size="sm">
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
    </div>
  );
};

export default Appointments;
