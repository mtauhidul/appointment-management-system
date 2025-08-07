"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Clock,
  UserPlus,
  CheckCircle,
  AlertCircle,
  Calendar,
  Search,
  Phone,
  Timer,
  UserCheck,
  Activity,
  ArrowRight
} from "lucide-react";

// Mock data for front desk operations
const mockAppointments: Appointment[] = [
  {
    id: "apt-001",
    time: "9:00 AM",
    patient: "Alice Brown",
    doctor: "Dr. Sarah Wilson",
    room: "Room 1",
    status: "checked-in" as AppointmentStatus,
    phone: "(555) 0101",
    reason: "Regular checkup"
  },
  {
    id: "apt-002", 
    time: "9:30 AM",
    patient: "John Smith",
    doctor: "Dr. Sarah Wilson",
    room: "Room 1",
    status: "waiting" as AppointmentStatus,
    phone: "(555) 0102",
    reason: "Follow-up"
  },
  {
    id: "apt-003",
    time: "10:00 AM",
    patient: "Mary Johnson",
    doctor: "Dr. Michael Chen",
    room: "Room 3",
    status: "scheduled" as AppointmentStatus,
    phone: "(555) 0103",
    reason: "Consultation"
  },
  {
    id: "apt-004",
    time: "10:30 AM",
    patient: "David Lee",
    doctor: "Dr. Sarah Wilson",
    room: "Room 1",
    status: "no-show" as AppointmentStatus,
    phone: "(555) 0104",
    reason: "Therapy session"
  },
  {
    id: "apt-005",
    time: "11:00 AM",
    patient: "Emma Wilson",
    doctor: "Dr. Michael Chen",
    room: "Room 5",
    status: "scheduled" as AppointmentStatus,
    phone: "(555) 0105",
    reason: "Annual physical"
  }
];

const mockWaitingRoom = [
  {
    id: "wait-001",
    patient: "Alice Brown",
    checkedInAt: "8:55 AM",
    appointmentTime: "9:00 AM",
    doctor: "Dr. Sarah Wilson",
    waitTime: "25 min",
    status: "waiting"
  },
  {
    id: "wait-002",
    patient: "John Smith", 
    checkedInAt: "9:25 AM",
    appointmentTime: "9:30 AM",
    doctor: "Dr. Sarah Wilson",
    waitTime: "15 min",
    status: "ready"
  }
];

const mockWalkIns = [
  {
    id: "walk-001",
    patient: "Robert Davis",
    arrivalTime: "10:15 AM",
    reason: "Urgent consultation",
    phone: "(555) 0201",
    status: "pending"
  }
];

type AppointmentStatus = "scheduled" | "checked-in" | "waiting" | "in-progress" | "completed" | "no-show" | "cancelled";

interface Appointment {
  id: string;
  time: string;
  patient: string;
  doctor: string;
  room: string;
  status: AppointmentStatus;
  phone: string;
  reason: string;
}

export default function ReceptionistDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [waitingRoom] = useState(mockWaitingRoom);
  const [walkIns] = useState(mockWalkIns);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800 border-blue-200";
      case "checked-in": return "bg-green-100 text-green-800 border-green-200";
      case "waiting": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in-progress": return "bg-purple-100 text-purple-800 border-purple-200";
      case "completed": return "bg-gray-100 text-gray-800 border-gray-200";
      case "no-show": return "bg-red-100 text-red-800 border-red-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: AppointmentStatus) => {
    switch (status) {
      case "checked-in": return <CheckCircle className="h-4 w-4" />;
      case "waiting": return <Clock className="h-4 w-4" />;
      case "in-progress": return <Activity className="h-4 w-4" />;
      case "completed": return <CheckCircle className="h-4 w-4" />;
      case "no-show": return <AlertCircle className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const handleCheckIn = (appointmentId: string) => {
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, status: "checked-in" as AppointmentStatus }
          : apt
      )
    );
  };

  const handleStatusChange = (appointmentId: string, newStatus: AppointmentStatus) => {
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, status: newStatus }
          : apt
      )
    );
  };

  const filteredAppointments = appointments.filter(apt =>
    apt.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.phone.includes(searchTerm)
  );

  const todayStats = {
    total: appointments.length,
    checkedIn: appointments.filter(apt => apt.status === "checked-in").length,
    waiting: waitingRoom.length,
    completed: appointments.filter(apt => apt.status === "completed").length,
    noShow: appointments.filter(apt => apt.status === "no-show").length,
    walkIns: walkIns.length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Front Desk Dashboard</h2>
          <p className="text-muted-foreground">
            Manage appointments, check-ins, and patient flow
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Current Time</div>
          <div className="text-lg font-semibold">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checked In</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{todayStats.checkedIn}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Waiting Room</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{todayStats.waiting}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{todayStats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No Shows</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{todayStats.noShow}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Walk-ins</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{todayStats.walkIns}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="appointments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="appointments">Today&apos;s Appointments</TabsTrigger>
          <TabsTrigger value="waiting">Waiting Room</TabsTrigger>
          <TabsTrigger value="walkins">Walk-ins</TabsTrigger>
        </TabsList>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by patient name, doctor, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Appointments List */}
          <div className="space-y-3">
            {filteredAppointments.map((appointment) => (
              <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold">{appointment.time}</div>
                        <div className="text-xs text-muted-foreground">{appointment.room}</div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{appointment.patient}</h3>
                          <Badge className={getStatusColor(appointment.status)}>
                            {getStatusIcon(appointment.status)}
                            <span className="ml-1 capitalize">{appointment.status.replace('-', ' ')}</span>
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <div>{appointment.doctor}</div>
                          <div>{appointment.reason}</div>
                          <div className="flex items-center gap-1 mt-1">
                            <Phone className="h-3 w-3" />
                            {appointment.phone}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {appointment.status === "scheduled" && (
                        <Button 
                          size="sm" 
                          onClick={() => handleCheckIn(appointment.id)}
                        >
                          Check In
                        </Button>
                      )}
                      {appointment.status === "checked-in" && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleStatusChange(appointment.id, "waiting")}
                        >
                          Move to Waiting
                        </Button>
                      )}
                      {appointment.status === "waiting" && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleStatusChange(appointment.id, "in-progress")}
                        >
                          Call Patient
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Waiting Room Tab */}
        <TabsContent value="waiting" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {waitingRoom.map((patient) => (
              <Card key={patient.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{patient.patient}</CardTitle>
                    <Badge className={
                      patient.status === "ready" 
                        ? "bg-green-100 text-green-800 border-green-200"
                        : "bg-yellow-100 text-yellow-800 border-yellow-200"
                    }>
                      {patient.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    Waiting for: {patient.doctor}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Appointment:</span>
                      <span>{patient.appointmentTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Checked in:</span>
                      <span>{patient.checkedInAt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Wait time:</span>
                      <span className="font-medium text-orange-600">{patient.waitTime}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1">
                      <ArrowRight className="h-3 w-3 mr-1" />
                      Call Patient
                    </Button>
                    <Button variant="outline" size="sm">
                      Update
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {waitingRoom.length === 0 && (
            <Card className="py-12">
              <CardContent className="text-center">
                <Timer className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Patients Waiting</h3>
                <p className="text-muted-foreground">
                  The waiting room is currently empty.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Walk-ins Tab */}
        <TabsContent value="walkins" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Walk-in Patients</h3>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Register Walk-in
            </Button>
          </div>

          <div className="space-y-3">
            {walkIns.map((walkIn) => (
              <Card key={walkIn.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold">{walkIn.arrivalTime}</div>
                        <div className="text-xs text-muted-foreground">Arrived</div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{walkIn.patient}</h3>
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                            Walk-in
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <div>{walkIn.reason}</div>
                          <div className="flex items-center gap-1 mt-1">
                            <Phone className="h-3 w-3" />
                            {walkIn.phone}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm">
                        Schedule
                      </Button>
                      <Button size="sm" variant="outline">
                        Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {walkIns.length === 0 && (
            <Card className="py-12">
              <CardContent className="text-center">
                <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Walk-in Patients</h3>
                <p className="text-muted-foreground">
                  No walk-in patients are currently registered.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
