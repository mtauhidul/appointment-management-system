import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useAppointmentStore } from "@/lib/store/useAppointmentStore";
import { useDoctorStore } from "@/lib/store/useDoctorStore";
import { formatDateDisplay, formatTimeDisplay } from "@/lib/utils/date-utils";
import {
  AlertCircle,
  CalendarIcon,
  Clock,
  MapPin,
  MoreVertical,
  Trash2,
  Video,
} from "lucide-react";
import { useMemo } from "react";

interface UpcomingAppointmentsProps {
  patientId: string;
  onCancelAppointment: (appointmentId: string) => void;
}

export default function UpcomingAppointments({
  patientId,
  onCancelAppointment,
}: UpcomingAppointmentsProps) {
  const { appointments } = useAppointmentStore();
  const { doctors } = useDoctorStore();

  const upcomingAppointments = useMemo(() => {
    const now = new Date();

    return appointments
      .filter(
        (appointment) =>
          appointment.patientId === patientId &&
          appointment.status !== "cancelled" &&
          appointment.status !== "completed" &&
          new Date(`${appointment.date}T${appointment.startTime}`) >= now
      )
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.startTime}`);
        const dateB = new Date(`${b.date}T${b.startTime}`);
        return dateA.getTime() - dateB.getTime();
      });
  }, [appointments, patientId]);

  const getDoctor = (doctorId: string) => {
    return doctors.find((doctor) => doctor.id === doctorId);
  };

  const getAppointmentStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="outline">Scheduled</Badge>;
      case "confirmed":
        return <Badge variant="secondary">Confirmed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDaysUntilAppointment = (date: string) => {
    const appointmentDate = new Date(date);
    const today = new Date();

    // Reset time to compare only dates
    appointmentDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = appointmentDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    return `In ${diffDays} days`;
  };

  if (upcomingAppointments.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="rounded-full bg-primary/10 p-4">
            <CalendarIcon className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">No upcoming appointments</h3>
          <p className="text-muted-foreground text-center max-w-md">
            You don&apos;t have any upcoming appointments scheduled. Use the
            &quot;Book Appointment&quot; tab to schedule a visit with a doctor.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {upcomingAppointments.map((appointment) => {
          const doctor = getDoctor(appointment.doctorId);
          const appointmentDate = new Date(appointment.date);
          const timeUntil = getDaysUntilAppointment(appointment.date);
          const isToday = timeUntil === "Today";

          return (
            <Card key={appointment.id} className="h-full flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2 text-base">
                      {doctor?.name || "Doctor"}
                      {isToday && (
                        <Badge className="ml-2" variant="destructive">
                          Today
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {doctor?.specialty || "General Practice"}
                    </CardDescription>
                  </div>
                  <div className="flex items-center">
                    {getAppointmentStatusBadge(appointment.status)}
                    <Dialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DialogTrigger asChild>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Cancel Appointment
                            </DropdownMenuItem>
                          </DialogTrigger>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Cancel Appointment</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to cancel your appointment
                            with {doctor?.name} on{" "}
                            {formatDateDisplay(appointmentDate)} at{" "}
                            {formatTimeDisplay(appointment.startTime)}?
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2 sm:gap-0">
                          <DialogClose asChild>
                            <Button variant="outline">Keep Appointment</Button>
                          </DialogClose>
                          <DialogClose asChild>
                            <Button
                              variant="destructive"
                              onClick={() =>
                                onCancelAppointment(appointment.id)
                              }
                            >
                              Cancel Appointment
                            </Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{formatDateDisplay(appointmentDate)}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>
                      {formatTimeDisplay(appointment.startTime)} -{" "}
                      {formatTimeDisplay(appointment.endTime)}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    {appointment.appointmentType === "virtual" ? (
                      <>
                        <Video className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Virtual Appointment</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>In-person Appointment</span>
                      </>
                    )}
                  </div>
                  {appointment.notes && (
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <div className="flex items-center text-sm cursor-help">
                          <AlertCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span className="underline dotted">
                            Appointment notes
                          </span>
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold">
                            Appointment Notes
                          </h4>
                          <p className="text-sm">{appointment.notes}</p>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                {appointment.appointmentType === "virtual" ? (
                  <Button className="w-full" disabled={!isToday}>
                    <Video className="mr-2 h-4 w-4" />
                    {isToday
                      ? "Join Virtual Appointment"
                      : "Join (Available on appointment day)"}
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full">
                    <MapPin className="mr-2 h-4 w-4" />
                    View Location
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
