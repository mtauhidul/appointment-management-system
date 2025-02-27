import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppointmentStore } from "@/lib/store/useAppointmentStore";
import { useDoctorStore } from "@/lib/store/useDoctorStore";
import { formatDateDisplay, formatTimeDisplay } from "@/lib/utils/date-utils";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  FileDown,
  FileText,
  History,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";

interface PastAppointmentsProps {
  patientId: string;
}

export default function PastAppointments({ patientId }: PastAppointmentsProps) {
  const { appointments } = useAppointmentStore();
  const { doctors } = useDoctorStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const appointmentsPerPage = 5;

  const pastAppointments = useMemo(() => {
    const now = new Date();

    return appointments
      .filter(
        (appointment) =>
          appointment.patientId === patientId &&
          (appointment.status === "completed" ||
            appointment.status === "cancelled" ||
            appointment.status === "no-show" ||
            new Date(`${appointment.date}T${appointment.endTime}`) < now)
      )
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.startTime}`);
        const dateB = new Date(`${b.date}T${b.startTime}`);
        return dateB.getTime() - dateA.getTime(); // Most recent first
      });
  }, [appointments, patientId]);

  const getDoctor = (doctorId: string) => {
    return doctors.find((doctor) => doctor.id === doctorId);
  };

  const getAppointmentStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "no-show":
        return (
          <Badge
            variant="outline"
            className="text-destructive border-destructive"
          >
            No Show
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredAppointments = useMemo(() => {
    if (!searchTerm.trim()) return pastAppointments;

    const term = searchTerm.toLowerCase();
    return pastAppointments.filter((appointment) => {
      const doctor = getDoctor(appointment.doctorId);
      return (
        doctor?.name.toLowerCase().includes(term) ||
        doctor?.specialty.toLowerCase().includes(term) ||
        appointment.date.includes(term) ||
        appointment.status.toLowerCase().includes(term)
      );
    });
  }, [pastAppointments, searchTerm]);

  // Calculate pagination
  const totalPages = Math.ceil(
    filteredAppointments.length / appointmentsPerPage
  );
  const startIndex = (currentPage - 1) * appointmentsPerPage;
  const paginatedAppointments = filteredAppointments.slice(
    startIndex,
    startIndex + appointmentsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  if (pastAppointments.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="rounded-full bg-primary/10 p-4">
            <History className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">No past appointments</h3>
          <p className="text-muted-foreground text-center max-w-md">
            You don&#39;t have any past appointment history yet. Your completed
            and cancelled appointments will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Appointment History</h2>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by doctor, specialty, date..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAppointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <CalendarIcon className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        No appointments found
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedAppointments.map((appointment) => {
                  const doctor = getDoctor(appointment.doctorId);
                  const appointmentDate = new Date(appointment.date);

                  return (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {doctor?.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("") || "DR"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {doctor?.name || "Doctor"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {doctor?.specialty || "General Practice"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {formatDateDisplay(appointmentDate)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatTimeDisplay(appointment.startTime)} -{" "}
                            {formatTimeDisplay(appointment.endTime)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getAppointmentStatusBadge(appointment.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {appointment.status === "completed" && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <FileText className="h-4 w-4 mr-2" />
                                  View Summary
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Appointment Summary</DialogTitle>
                                  <DialogDescription>
                                    Details from your visit with {doctor?.name}{" "}
                                    on {formatDateDisplay(appointmentDate)}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div>
                                    <h4 className="text-sm font-medium">
                                      Diagnosis
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                      This would contain the diagnosis from your
                                      visit.
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium">
                                      Treatment Plan
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                      This would contain the treatment
                                      recommendations.
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium">
                                      Follow-up
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                      A follow-up appointment is recommended in
                                      3 weeks.
                                    </p>
                                  </div>
                                </div>
                                <div className="flex justify-between">
                                  <Button variant="outline" size="sm">
                                    <FileDown className="h-4 w-4 mr-2" />
                                    Download Summary
                                  </Button>
                                  <Button size="sm">Book Follow-up</Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-
                {Math.min(
                  startIndex + appointmentsPerPage,
                  filteredAppointments.length
                )}{" "}
                of {filteredAppointments.length} appointments
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Previous Page</span>
                </Button>
                <div className="text-sm">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Next Page</span>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
