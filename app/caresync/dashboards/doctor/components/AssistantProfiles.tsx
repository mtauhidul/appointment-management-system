"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  UserCheck, 
  Calendar,
  MoreVertical,
  Edit,
  Briefcase
} from "lucide-react";

// Mock data for assistants
const mockAssistants = [
  {
    id: "ast-001",
    name: "Sarah Johnson",
    email: "sarah.johnson@clinic.com",
    phone: "(555) 0123",
    role: "Senior Medical Assistant",
    department: "General Medicine",
    assignedDoctor: "doc-001",
    currentStatus: "active",
    workType: "full-time",
    experienceYears: 5,
    currentShift: "Morning (8 AM - 4 PM)",
    avatar: "/avatars/sarah.jpg"
  },
  {
    id: "ast-002", 
    name: "Michael Chen",
    email: "michael.chen@clinic.com",
    phone: "(555) 0124",
    role: "Medical Assistant",
    department: "General Medicine",
    assignedDoctor: "doc-001",
    currentStatus: "on-break",
    workType: "full-time",
    experienceYears: 3,
    currentShift: "Afternoon (12 PM - 8 PM)",
    avatar: "/avatars/michael.jpg"
  },
  {
    id: "ast-003",
    name: "Emily Rodriguez",
    email: "emily.rodriguez@clinic.com", 
    phone: "(555) 0125",
    role: "Clinical Assistant",
    department: "General Medicine",
    assignedDoctor: "doc-001",
    currentStatus: "active",
    workType: "part-time",
    experienceYears: 2,
    currentShift: "Morning (9 AM - 1 PM)",
    avatar: "/avatars/emily.jpg"
  }
];

type Assistant = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  assignedDoctor: string;
  currentStatus: string;
  workType: string;
  experienceYears: number;
  currentShift: string;
  avatar: string;
};

export default function AssistantProfiles() {
  const [assistants] = useState<Assistant[]>(mockAssistants);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Get current doctor ID (in real app, this would come from auth context)
  const currentDoctorId = "doc-001";

  // Filter assistants assigned to current doctor
  const assignedAssistants = assistants.filter((assistant: Assistant) => 
    assistant.assignedDoctor === currentDoctorId &&
    (assistant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     assistant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
     assistant.phone.includes(searchTerm))
  );

  const handleViewDetails = (assistant: Assistant) => {
    setSelectedAssistant(assistant);
    setShowDetails(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 border-green-200";
      case "on-break": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "busy": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getWorkStatusColor = (status: string) => {
    switch (status) {
      case "full-time": return "bg-blue-100 text-blue-800 border-blue-200";
      case "part-time": return "bg-purple-100 text-purple-800 border-purple-200";
      case "contract": return "bg-orange-100 text-orange-800 border-orange-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Assistant Profiles</h2>
          <p className="text-muted-foreground">
            Manage assistants assigned to your supervision
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          {assignedAssistants.length} Assistants
        </Badge>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search assistants by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assistants</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignedAssistants.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Currently Active</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assignedAssistants.filter((a: Assistant) => a.currentStatus === "active").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Break</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assignedAssistants.filter((a: Assistant) => a.currentStatus === "on-break").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Full-time</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assignedAssistants.filter((a: Assistant) => a.workType === "full-time").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assistant List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {assignedAssistants.map((assistant: Assistant) => (
          <Card key={assistant.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={assistant.avatar} alt={assistant.name} />
                    <AvatarFallback>
                      {assistant.name.split(" ").map((n: string) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{assistant.name}</CardTitle>
                    <CardDescription>{assistant.role}</CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Status Badges */}
              <div className="flex gap-2">
                <Badge className={getStatusColor(assistant.currentStatus)}>
                  {assistant.currentStatus}
                </Badge>
                <Badge className={getWorkStatusColor(assistant.workType)}>
                  {assistant.workType}
                </Badge>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  <span>{assistant.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{assistant.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{assistant.department}</span>
                </div>
              </div>

              {/* Experience & Shift */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <div className="text-xs text-muted-foreground">Experience</div>
                  <div className="text-sm font-medium">{assistant.experienceYears} years</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Current Shift</div>
                  <div className="text-sm font-medium">{assistant.currentShift}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleViewDetails(assistant)}
                >
                  View Details
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {assignedAssistants.length === 0 && (
        <Card className="py-12">
          <CardContent className="text-center">
            <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Assistants Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? "No assistants match your search criteria."
                : "No assistants are currently assigned to you."
              }
            </p>
            {searchTerm && (
              <Button variant="outline" onClick={() => setSearchTerm("")}>
                Clear Search
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Assistant Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedAssistant?.avatar} alt={selectedAssistant?.name} />
                <AvatarFallback>
                  {selectedAssistant?.name?.split(" ").map((n: string) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              {selectedAssistant?.name}
            </DialogTitle>
            <DialogDescription>
              Assistant Profile Details
            </DialogDescription>
          </DialogHeader>

          {selectedAssistant && (
            <div className="grid gap-6 py-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Role</Label>
                  <p className="text-sm text-muted-foreground">{selectedAssistant.role}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Department</Label>
                  <p className="text-sm text-muted-foreground">{selectedAssistant.department}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Experience</Label>
                  <p className="text-sm text-muted-foreground">{selectedAssistant.experienceYears} years</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Work Type</Label>
                  <Badge className={getWorkStatusColor(selectedAssistant.workType)}>
                    {selectedAssistant.workType}
                  </Badge>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Contact Information</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedAssistant.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedAssistant.email}</span>
                  </div>
                </div>
              </div>

              {/* Current Status */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Current Status</Label>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(selectedAssistant.currentStatus)}>
                    {selectedAssistant.currentStatus}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Current Shift: {selectedAssistant.currentShift}
                  </span>
                </div>
              </div>

              {/* Schedule */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Weekly Schedule</Label>
                <div className="grid grid-cols-7 gap-1 text-xs">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <div key={day} className="text-center p-2 bg-muted rounded">
                      <div className="font-medium">{day}</div>
                      <div className="text-muted-foreground">9-5</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetails(false)}>
              Close
            </Button>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}