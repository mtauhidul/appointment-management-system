"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Briefcase,
  Award,
  Save,
  X,
  User,
  Shield
} from "lucide-react";

// Mock receptionist profile data
const mockReceptionistProfile = {
  id: "rec-001",
  name: "Jennifer Martinez",
  email: "jennifer.martinez@clinic.com",
  phone: "(555) 0301",
  address: "456 Healthcare Blvd, Medical City, MC 67890",
  role: "Senior Receptionist",
  department: "Front Desk Operations",
  employeeId: "EMP-REC-001",
  hireDate: "2020-06-01",
  experienceYears: 4,
  workType: "full-time",
  currentShift: "Day Shift (7 AM - 3 PM)",
  avatar: "/avatars/jennifer.jpg",
  skills: ["Customer Service", "Appointment Scheduling", "Insurance Verification", "Phone Systems"],
  certifications: ["Medical Office Administration", "HIPAA Compliance", "Customer Service Excellence"],
  permissions: ["Patient Registration", "Appointment Management", "Insurance Processing", "Basic Reports"],
  workSchedule: {
    monday: "7:00 AM - 3:00 PM",
    tuesday: "7:00 AM - 3:00 PM", 
    wednesday: "7:00 AM - 3:00 PM",
    thursday: "7:00 AM - 3:00 PM",
    friday: "7:00 AM - 3:00 PM",
    saturday: "Off",
    sunday: "Off"
  }
};

type ReceptionistProfile = typeof mockReceptionistProfile;

export default function ReceptionistProfile() {
  const [profile, setProfile] = useState<ReceptionistProfile>(mockReceptionistProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<ReceptionistProfile>(mockReceptionistProfile);

  const handleEdit = () => {
    setEditedProfile({ ...profile });
    setIsEditing(true);
  };

  const handleSave = () => {
    setProfile({ ...editedProfile });
    setIsEditing(false);
    // Here you would typically call an API to save the changes
    console.log("Profile updated:", editedProfile);
  };

  const handleCancel = () => {
    setEditedProfile({ ...profile });
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof ReceptionistProfile, value: string) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getWorkTypeColor = (workType: string) => {
    switch (workType) {
      case "full-time": return "bg-blue-100 text-blue-800 border-blue-200";
      case "part-time": return "bg-purple-100 text-purple-800 border-purple-200";
      case "contract": return "bg-orange-100 text-orange-800 border-orange-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const currentProfile = isEditing ? editedProfile : profile;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Profile</h2>
          <p className="text-muted-foreground">
            Manage your personal information and work details
          </p>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Overview Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={currentProfile.avatar} alt={currentProfile.name} />
                  <AvatarFallback className="text-lg">
                    {currentProfile.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-xl">{currentProfile.name}</CardTitle>
              <CardDescription className="space-y-1">
                <div>{currentProfile.role}</div>
                <div>{currentProfile.department}</div>
                <Badge className={getWorkTypeColor(currentProfile.workType)} variant="outline">
                  {currentProfile.workType}
                </Badge>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{currentProfile.experienceYears}</div>
                  <div className="text-xs text-muted-foreground">Years Experience</div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{currentProfile.permissions.length}</div>
                  <div className="text-xs text-muted-foreground">Access Permissions</div>
                </div>
              </div>

              {/* Skills */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Skills</Label>
                <div className="flex flex-wrap gap-1">
                  {currentProfile.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Certifications</Label>
                <div className="space-y-1">
                  {currentProfile.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Award className="h-3 w-3 text-green-600" />
                      <span>{cert}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Permissions */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Access Permissions</Label>
                <div className="space-y-1">
                  {currentProfile.permissions.map((permission, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Shield className="h-3 w-3 text-blue-600" />
                      <span>{permission}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={currentProfile.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                    />
                  ) : (
                    <div className="p-2 text-sm">{currentProfile.name}</div>
                  )}
                </div>

                <div>
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <div className="p-2 text-sm text-muted-foreground">{currentProfile.employeeId}</div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={currentProfile.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                  ) : (
                    <div className="p-2 text-sm flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {currentProfile.email}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={currentProfile.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                    />
                  ) : (
                    <div className="p-2 text-sm flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {currentProfile.phone}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                {isEditing ? (
                  <Textarea
                    id="address"
                    value={currentProfile.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    rows={2}
                  />
                ) : (
                  <div className="p-2 text-sm flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    {currentProfile.address}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Work Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Work Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Role</Label>
                  <div className="p-2 text-sm">{currentProfile.role}</div>
                </div>

                <div>
                  <Label>Department</Label>
                  <div className="p-2 text-sm">{currentProfile.department}</div>
                </div>

                <div>
                  <Label>Hire Date</Label>
                  <div className="p-2 text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {new Date(currentProfile.hireDate).toLocaleDateString()}
                  </div>
                </div>

                <div>
                  <Label>Current Shift</Label>
                  <div className="p-2 text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {currentProfile.currentShift}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Work Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Work Schedule
              </CardTitle>
              <CardDescription>
                Your weekly work schedule
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(currentProfile.workSchedule).map(([day, hours]) => (
                  <div key={day} className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                    <span className="font-medium capitalize">{day}</span>
                    <span className="text-sm text-muted-foreground">{hours}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
