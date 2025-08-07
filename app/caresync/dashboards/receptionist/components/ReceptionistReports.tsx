"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Calendar,
  Users,
  Download,
  UserCheck,
  AlertCircle,
  Timer
} from "lucide-react";

// Mock data for reports
const dailyPatientFlow = [
  { time: "8 AM", checkedIn: 5, scheduled: 8, waitTime: 15 },
  { time: "9 AM", checkedIn: 12, scheduled: 15, waitTime: 22 },
  { time: "10 AM", checkedIn: 18, scheduled: 20, waitTime: 18 },
  { time: "11 AM", checkedIn: 15, scheduled: 18, waitTime: 25 },
  { time: "12 PM", checkedIn: 8, scheduled: 10, waitTime: 12 },
  { time: "1 PM", checkedIn: 6, scheduled: 8, waitTime: 8 },
  { time: "2 PM", checkedIn: 14, scheduled: 16, waitTime: 20 },
  { time: "3 PM", checkedIn: 16, scheduled: 18, waitTime: 15 },
  { time: "4 PM", checkedIn: 12, scheduled: 14, waitTime: 18 },
  { time: "5 PM", checkedIn: 8, scheduled: 10, waitTime: 10 }
];

const weeklyStats = [
  { day: "Mon", appointments: 65, completed: 60, noShows: 3, walkIns: 8 },
  { day: "Tue", appointments: 72, completed: 68, noShows: 2, walkIns: 5 },
  { day: "Wed", appointments: 58, completed: 55, noShows: 1, walkIns: 7 },
  { day: "Thu", appointments: 69, completed: 64, noShows: 4, walkIns: 6 },
  { day: "Fri", appointments: 75, completed: 71, noShows: 2, walkIns: 9 },
  { day: "Sat", appointments: 45, completed: 42, noShows: 1, walkIns: 4 },
  { day: "Sun", appointments: 32, completed: 30, noShows: 1, walkIns: 2 }
];

const appointmentStatus = [
  { name: 'Completed', value: 85, color: '#10b981' },
  { name: 'No Show', value: 8, color: '#ef4444' },
  { name: 'Cancelled', value: 5, color: '#f59e0b' },
  { name: 'Rescheduled', value: 2, color: '#8b5cf6' }
];

const doctorStats = [
  { doctor: "Dr. Sarah Wilson", appointments: 45, avgWaitTime: 18, satisfaction: 4.8 },
  { doctor: "Dr. Michael Chen", appointments: 38, avgWaitTime: 15, satisfaction: 4.7 },
  { doctor: "Dr. Emily Davis", appointments: 42, avgWaitTime: 22, satisfaction: 4.6 },
  { doctor: "Dr. James Miller", appointments: 36, avgWaitTime: 16, satisfaction: 4.9 }
];

export default function ReceptionistReports() {
  const [selectedPeriod, setSelectedPeriod] = useState("week");

  const generateSummaryStats = () => {
    const totalAppointments = weeklyStats.reduce((sum, day) => sum + day.appointments, 0);
    const totalCompleted = weeklyStats.reduce((sum, day) => sum + day.completed, 0);
    const totalNoShows = weeklyStats.reduce((sum, day) => sum + day.noShows, 0);
    const totalWalkIns = weeklyStats.reduce((sum, day) => sum + day.walkIns, 0);
    
    return {
      totalAppointments,
      totalCompleted,
      totalNoShows,
      totalWalkIns,
      completionRate: ((totalCompleted / totalAppointments) * 100).toFixed(1),
      noShowRate: ((totalNoShows / totalAppointments) * 100).toFixed(1),
      avgWaitTime: dailyPatientFlow.reduce((sum, hour) => sum + hour.waitTime, 0) / dailyPatientFlow.length
    };
  };

  const stats = generateSummaryStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Front Desk Reports</h2>
          <p className="text-muted-foreground">
            Patient flow analytics and operational insights
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completionRate}%</div>
            <p className="text-xs text-muted-foreground">+2.1% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Wait Time</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.avgWaitTime)} min</div>
            <p className="text-xs text-muted-foreground">-3 min from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No Show Rate</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.noShowRate}%</div>
            <p className="text-xs text-muted-foreground">-0.5% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Walk-ins</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalWalkIns}</div>
            <p className="text-xs text-muted-foreground">+5 from last week</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Tables */}
      <Tabs defaultValue="flow" className="space-y-4">
        <TabsList>
          <TabsTrigger value="flow">Patient Flow</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="doctors">Doctor Performance</TabsTrigger>
          <TabsTrigger value="status">Status Analysis</TabsTrigger>
        </TabsList>

        {/* Patient Flow Tab */}
        <TabsContent value="flow" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Daily Patient Flow</CardTitle>
                <CardDescription>
                  Hourly breakdown of patient check-ins and wait times
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyPatientFlow}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="scheduled" fill="#e2e8f0" name="Scheduled" />
                    <Bar dataKey="checkedIn" fill="#3b82f6" name="Checked In" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Wait Times</CardTitle>
                <CardDescription>
                  Wait time trends throughout the day
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={dailyPatientFlow}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="waitTime" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      name="Wait Time (min)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Appointment Trends</CardTitle>
                <CardDescription>
                  Appointment volume by day of week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="appointments" fill="#3b82f6" name="Total" />
                    <Bar dataKey="completed" fill="#10b981" name="Completed" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Appointment Outcomes</CardTitle>
                <CardDescription>
                  Distribution of appointment statuses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={appointmentStatus}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {appointmentStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Doctor Performance Tab */}
        <TabsContent value="doctors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Doctor Performance Metrics</CardTitle>
              <CardDescription>
                Key performance indicators by doctor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {doctorStats.map((doctor, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold">{doctor.doctor}</h3>
                      <div className="grid grid-cols-3 gap-4 mt-2 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Appointments:</span> {doctor.appointments}
                        </div>
                        <div>
                          <span className="font-medium">Avg Wait:</span> {doctor.avgWaitTime} min
                        </div>
                        <div>
                          <span className="font-medium">Satisfaction:</span> {doctor.satisfaction}/5.0
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        className={
                          doctor.satisfaction >= 4.8 
                            ? "bg-green-100 text-green-800 border-green-200"
                            : doctor.satisfaction >= 4.5
                            ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                            : "bg-red-100 text-red-800 border-red-200"
                        }
                      >
                        {doctor.satisfaction >= 4.8 ? "Excellent" : 
                         doctor.satisfaction >= 4.5 ? "Good" : "Needs Improvement"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Status Analysis Tab */}
        <TabsContent value="status" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Peak Hours Analysis</CardTitle>
                <CardDescription>
                  Busiest times of day
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                    <span className="font-medium">9:00 AM - 11:00 AM</span>
                    <Badge className="bg-red-100 text-red-800 border-red-200">Peak</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                    <span className="font-medium">2:00 PM - 4:00 PM</span>
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Busy</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                    <span className="font-medium">12:00 PM - 1:00 PM</span>
                    <Badge className="bg-green-100 text-green-800 border-green-200">Quiet</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Efficiency Metrics</CardTitle>
                <CardDescription>
                  Operational efficiency indicators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Check-in Time</span>
                    <span className="font-semibold">3.2 min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Patient Throughput</span>
                    <span className="font-semibold">18 patients/hour</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Schedule Adherence</span>
                    <span className="font-semibold">87%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Room Utilization</span>
                    <span className="font-semibold">94%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
