"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
} from "lucide-react";
import { usePatientStore } from "@/lib/store/usePatientStore";
import { Patient } from "@/lib/types/patient";
import { format } from "date-fns";

const PatientsList: React.FC = () => {
  const {
    patients,
    isLoading,
    addPatientToFirestore,
    updatePatientInFirestore,
    deletePatientFromFirestore,
  } = usePatientStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    medicalHistory: "",
    allergies: "",
    medications: "",
    checkInStatus: "not-checked-in" as Patient['checkInStatus'],
  });

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "",
      phone: "",
      email: "",
      address: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      medicalHistory: "",
      allergies: "",
      medications: "",
      checkInStatus: "not-checked-in",
    });
  };

  const handleAddPatient = async () => {
    try {
      const patientData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: formData.gender as Patient['gender'] || undefined,
        address: formData.address ? {
          street: formData.address,
        } : undefined,
        emergencyContact: (formData.emergencyContactName || formData.emergencyContactPhone) ? {
          name: formData.emergencyContactName || undefined,
          phone: formData.emergencyContactPhone || undefined,
        } : undefined,
        medicalHistory: (formData.allergies || formData.medications || formData.medicalHistory) ? {
          allergies: formData.allergies ? [formData.allergies] : undefined,
          medications: formData.medications ? [formData.medications] : undefined,
          conditions: formData.medicalHistory ? [formData.medicalHistory] : undefined,
        } : undefined,
      };
      
      await addPatientToFirestore(patientData);
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to add patient:", error);
    }
  };

  const handleUpdatePatient = async () => {
    if (!editingPatient) return;
    
    try {
      const updates = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: formData.gender as Patient['gender'] || undefined,
        address: formData.address ? {
          street: formData.address,
        } : undefined,
        emergencyContact: (formData.emergencyContactName || formData.emergencyContactPhone) ? {
          name: formData.emergencyContactName || undefined,
          phone: formData.emergencyContactPhone || undefined,
        } : undefined,
        medicalHistory: (formData.allergies || formData.medications || formData.medicalHistory) ? {
          allergies: formData.allergies ? [formData.allergies] : undefined,
          medications: formData.medications ? [formData.medications] : undefined,
          conditions: formData.medicalHistory ? [formData.medicalHistory] : undefined,
        } : undefined,
        checkInStatus: formData.checkInStatus,
      };
      
      await updatePatientInFirestore(editingPatient.id, updates);
      setEditingPatient(null);
      resetForm();
    } catch (error) {
      console.error("Failed to update patient:", error);
    }
  };

  const handleEditPatient = (patient: Patient) => {
    setFormData({
      firstName: patient.firstName,
      lastName: patient.lastName,
      dateOfBirth: patient.dateOfBirth || "",
      gender: patient.gender || "",
      phone: patient.phone || "",
      email: patient.email || "",
      address: typeof patient.address === 'object' ? patient.address?.street || "" : "",
      emergencyContactName: typeof patient.emergencyContact === 'object' ? patient.emergencyContact?.name || "" : "",
      emergencyContactPhone: typeof patient.emergencyContact === 'object' ? patient.emergencyContact?.phone || "" : "",
      medicalHistory: typeof patient.medicalHistory === 'object' ? patient.medicalHistory?.conditions?.[0] || "" : "",
      allergies: typeof patient.medicalHistory === 'object' ? patient.medicalHistory?.allergies?.[0] || "" : "",
      medications: typeof patient.medicalHistory === 'object' ? patient.medicalHistory?.medications?.[0] || "" : "",
      checkInStatus: patient.checkInStatus || "not-checked-in",
    });
    setEditingPatient(patient);
  };

  const handleDeletePatient = async (patientId: string) => {
    if (window.confirm("Are you sure you want to delete this patient?")) {
      try {
        await deletePatientFromFirestore(patientId);
      } catch (error) {
        console.error("Failed to delete patient:", error);
      }
    }
  };

  const filteredPatients = patients.filter((patient) => {
    const fullName = `${patient.firstName} ${patient.lastName}`;
    const matchesSearch = fullName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || patient.checkInStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
  };

  const getStatusColor = (status: Patient['checkInStatus']) => {
    switch (status) {
      case "checked-in":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "not-checked-in":
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Patients</SelectItem>
              <SelectItem value="not-checked-in">Not Checked In</SelectItem>
              <SelectItem value="checked-in">Checked In</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
            </DialogHeader>
            <PatientForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleAddPatient}
              onCancel={() => {
                setIsAddDialogOpen(false);
                resetForm();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {patients.filter((p) => p.checkInStatus === "checked-in").length}
            </div>
            <p className="text-sm text-gray-600">Checked In</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {patients.filter((p) => p.checkInStatus === "in-progress").length}
            </div>
            <p className="text-sm text-gray-600">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {patients.filter((p) => p.checkInStatus === "completed").length}
            </div>
            <p className="text-sm text-gray-600">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{patients.length}</div>
            <p className="text-sm text-gray-600">Total Patients</p>
          </CardContent>
        </Card>
      </div>

      {/* Patients List */}
      <div className="grid gap-4">
        {filteredPatients.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No patients found
              </h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Get started by adding your first patient."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredPatients.map((patient) => (
            <Card key={patient.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(patient.firstName, patient.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {patient.firstName} {patient.lastName}
                        </h3>
                        <Badge className={getStatusColor(patient.checkInStatus)}>
                          {patient.checkInStatus?.replace('-', ' ') || 'Not Set'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        {patient.dateOfBirth && (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            Born: {format(new Date(patient.dateOfBirth), "MMM dd, yyyy")}
                          </div>
                        )}
                        {patient.gender && (
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            {patient.gender}
                          </div>
                        )}
                        {patient.phone && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2" />
                            {patient.phone}
                          </div>
                        )}
                        {patient.email && (
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2" />
                            {patient.email}
                          </div>
                        )}
                        {patient.address && typeof patient.address === 'object' && patient.address.street && (
                          <div className="flex items-center md:col-span-2">
                            <MapPin className="h-4 w-4 mr-2" />
                            {patient.address.street}
                          </div>
                        )}
                      </div>
                      {patient.medicalHistory && typeof patient.medicalHistory === 'object' && patient.medicalHistory.allergies && (
                        <div className="mt-2">
                          <span className="text-sm font-medium text-red-600">
                            Allergies: {patient.medicalHistory.allergies.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditPatient(patient)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Edit Patient</DialogTitle>
                        </DialogHeader>
                        <PatientForm
                          formData={formData}
                          setFormData={setFormData}
                          onSubmit={handleUpdatePatient}
                          onCancel={() => {
                            setEditingPatient(null);
                            resetForm();
                          }}
                          isEditing
                        />
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePatient(patient.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      {editingPatient && (
        <Dialog
          open={!!editingPatient}
          onOpenChange={(open) => {
            if (!open) {
              setEditingPatient(null);
              resetForm();
            }
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Patient</DialogTitle>
            </DialogHeader>
            <PatientForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleUpdatePatient}
              onCancel={() => {
                setEditingPatient(null);
                resetForm();
              }}
              isEditing
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// Patient Form Component
interface FormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  medicalHistory: string;
  allergies: string;
  medications: string;
  checkInStatus: Patient['checkInStatus'];
}

const PatientForm: React.FC<{
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isEditing?: boolean;
}> = ({ formData, setFormData, onSubmit, onCancel, isEditing = false }) => {
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev: FormData) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
            placeholder="Enter first name"
            required
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
            placeholder="Enter last name"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="gender">Gender</Label>
          <Select
            value={formData.gender}
            onValueChange={(value) => handleInputChange("gender", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
              <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            placeholder="Enter phone number"
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="Enter email address"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => handleInputChange("address", e.target.value)}
          placeholder="Enter address"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
          <Input
            id="emergencyContactName"
            value={formData.emergencyContactName}
            onChange={(e) => handleInputChange("emergencyContactName", e.target.value)}
            placeholder="Contact name"
          />
        </div>
        <div>
          <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
          <Input
            id="emergencyContactPhone"
            value={formData.emergencyContactPhone}
            onChange={(e) => handleInputChange("emergencyContactPhone", e.target.value)}
            placeholder="Contact phone"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="checkInStatus">Check-in Status</Label>
        <Select
          value={formData.checkInStatus}
          onValueChange={(value) => handleInputChange("checkInStatus", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="not-checked-in">Not Checked In</SelectItem>
            <SelectItem value="checked-in">Checked In</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="medicalHistory">Medical History</Label>
        <Textarea
          id="medicalHistory"
          value={formData.medicalHistory}
          onChange={(e) => handleInputChange("medicalHistory", e.target.value)}
          placeholder="Enter medical conditions"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="allergies">Allergies</Label>
        <Textarea
          id="allergies"
          value={formData.allergies}
          onChange={(e) => handleInputChange("allergies", e.target.value)}
          placeholder="Enter allergies"
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="medications">Current Medications</Label>
        <Textarea
          id="medications"
          value={formData.medications}
          onChange={(e) => handleInputChange("medications", e.target.value)}
          placeholder="Enter current medications"
          rows={2}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSubmit}>
          {isEditing ? "Update Patient" : "Add Patient"}
        </Button>
      </div>
    </div>
  );
};

export default PatientsList;
