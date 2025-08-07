"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  MapPin,
  Users,
  Calendar,
  Stethoscope,
  Timer,
  CheckCircle,
  XCircle,
  Activity
} from "lucide-react";

// Mock data for assistant's assigned rooms
const mockAssignedRooms: AssignedRoom[] = [
  {
    id: "room-001",
    name: "Consultation Room 1",
    status: "occupied" as RoomStatus,
    currentPatient: "John Smith",
    assignedDoctor: "Dr. Sarah Wilson",
    startTime: "10:00 AM",
    estimatedDuration: "30 min",
    urgency: "normal"
  },
  {
    id: "room-003", 
    name: "Consultation Room 3",
    status: "preparing" as RoomStatus,
    nextPatient: "Mary Johnson",
    assignedDoctor: "Dr. Sarah Wilson",
    scheduledTime: "11:00 AM",
    preparationNeeded: ["Equipment check", "Chart review"]
  },
  {
    id: "room-005",
    name: "Consultation Room 5", 
    status: "available" as RoomStatus,
    assignedDoctor: "Dr. Michael Chen",
    nextScheduled: "2:00 PM"
  }
];

// Mock data for assigned doctors' schedules
const mockDoctorSchedules: DoctorSchedule[] = [
  {
    doctorId: "doc-001",
    doctorName: "Dr. Sarah Wilson",
    department: "General Medicine",
    avatar: "/avatars/dr-wilson.jpg",
    currentStatus: "In Session",
    todaySchedule: [
      { time: "9:00 AM", patient: "Alice Brown", room: "Room 1", status: "completed" as AppointmentStatus },
      { time: "10:00 AM", patient: "John Smith", room: "Room 1", status: "active" as AppointmentStatus },
      { time: "11:00 AM", patient: "Mary Johnson", room: "Room 3", status: "scheduled" as AppointmentStatus },
      { time: "2:00 PM", patient: "David Lee", room: "Room 1", status: "scheduled" as AppointmentStatus },
    ],
    nextBreak: "12:00 PM - 1:00 PM"
  },
  {
    doctorId: "doc-002",
    doctorName: "Dr. Michael Chen",
    department: "Cardiology",
    avatar: "/avatars/dr-chen.jpg", 
    currentStatus: "Available",
    todaySchedule: [
      { time: "2:00 PM", patient: "Emma Wilson", room: "Room 5", status: "scheduled" as AppointmentStatus },
      { time: "3:00 PM", patient: "Robert Davis", room: "Room 5", status: "scheduled" as AppointmentStatus },
      { time: "4:00 PM", patient: "Lisa Garcia", room: "Room 5", status: "scheduled" as AppointmentStatus },
    ],
    nextBreak: "1:00 PM - 2:00 PM"
  }
];

type RoomStatus = "available" | "occupied" | "preparing" | "maintenance";
type AppointmentStatus = "scheduled" | "active" | "completed" | "cancelled";

interface AssignedRoom {
  id: string;
  name: string;
  status: RoomStatus;
  currentPatient?: string;
  nextPatient?: string;
  assignedDoctor: string;
  startTime?: string;
  scheduledTime?: string;
  estimatedDuration?: string;
  nextScheduled?: string;
  urgency?: string;
  preparationNeeded?: string[];
}

interface DoctorSchedule {
  doctorId: string;
  doctorName: string;
  department: string;
  avatar: string;
  currentStatus: string;
  todaySchedule: {
    time: string;
    patient: string;
    room: string;
    status: AppointmentStatus;
  }[];
  nextBreak: string;
}

export default function AssistantDashboard() {
  const [assignedRooms] = useState<AssignedRoom[]>(mockAssignedRooms);
  const [doctorSchedules] = useState<DoctorSchedule[]>(mockDoctorSchedules);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const getRoomStatusColor = (status: RoomStatus) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-800 border-green-200";
      case "occupied": return "bg-red-100 text-red-800 border-red-200";
      case "preparing": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "maintenance": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getAppointmentStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "active": return "bg-blue-100 text-blue-800 border-blue-200";
      case "scheduled": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: RoomStatus) => {
    switch (status) {
      case "available": return <CheckCircle className="h-4 w-4" />;
      case "occupied": return <Activity className="h-4 w-4" />;
      case "preparing": return <Timer className="h-4 w-4" />;
      case "maintenance": return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Assistant Dashboard</h2>
          <p className="text-muted-foreground">
            Manage your assigned rooms and track doctor schedules
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Rooms</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignedRooms.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rooms</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assignedRooms.filter(room => room.status === "occupied").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Doctors</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{doctorSchedules.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Preparing Rooms</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assignedRooms.filter(room => room.status === "preparing").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="rooms" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rooms">Assigned Rooms</TabsTrigger>
          <TabsTrigger value="schedules">Doctor Schedules</TabsTrigger>
        </TabsList>

        {/* Assigned Rooms Tab */}
        <TabsContent value="rooms" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {assignedRooms.map((room) => (
              <Card key={room.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{room.name}</CardTitle>
                    <Badge className={getRoomStatusColor(room.status)}>
                      {getStatusIcon(room.status)}
                      <span className="ml-1 capitalize">{room.status}</span>
                    </Badge>
                  </div>
                  <CardDescription>
                    Assigned to: {room.assignedDoctor}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Current/Next Patient Info */}
                  {room.currentPatient && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-900">Current Patient</span>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">{room.currentPatient}</div>
                        <div className="text-muted-foreground">
                          Started: {room.startTime} • Duration: {room.estimatedDuration}
                        </div>
                      </div>
                    </div>
                  )}

                  {room.nextPatient && (
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        <span className="font-medium text-yellow-900">Next Patient</span>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">{room.nextPatient}</div>
                        <div className="text-muted-foreground">Scheduled: {room.scheduledTime}</div>
                        {room.preparationNeeded && (
                          <div className="mt-2">
                            <div className="text-xs font-medium text-yellow-800">Preparation needed:</div>
                            <ul className="text-xs text-yellow-700 mt-1 space-y-1">
                              {room.preparationNeeded.map((item, index) => (
                                <li key={index}>• {item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {room.status === "available" && room.nextScheduled && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-900">Ready for next appointment</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Next scheduled: {room.nextScheduled}
                      </div>
                    </div>
                  )}

                  {/* Room Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      View Details
                    </Button>
                    {room.status === "preparing" && (
                      <Button size="sm" className="flex-1">
                        Mark Ready
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Doctor Schedules Tab */}
        <TabsContent value="schedules" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {doctorSchedules.map((doctor) => (
              <Card key={doctor.doctorId} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={doctor.avatar} alt={doctor.doctorName} />
                      <AvatarFallback>
                        {doctor.doctorName.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{doctor.doctorName}</CardTitle>
                      <CardDescription>{doctor.department}</CardDescription>
                    </div>
                    <Badge 
                      className={
                        doctor.currentStatus === "Available" 
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-blue-100 text-blue-800 border-blue-200"
                      }
                    >
                      {doctor.currentStatus}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Today's Schedule */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Today&apos;s Schedule
                    </h4>
                    <div className="space-y-2">
                      {doctor.todaySchedule.map((appointment, index) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-sm font-medium w-16">
                              {appointment.time}
                            </div>
                            <div className="text-sm">
                              <div className="font-medium">{appointment.patient}</div>
                              <div className="text-xs text-muted-foreground">
                                {appointment.room}
                              </div>
                            </div>
                          </div>
                          <Badge className={getAppointmentStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Next Break */}
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-purple-600" />
                      <span className="font-medium text-purple-900">Next Break</span>
                    </div>
                    <div className="text-sm text-purple-700">{doctor.nextBreak}</div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      View Full Schedule
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Contact Doctor
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
