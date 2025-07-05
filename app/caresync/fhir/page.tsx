"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  Calendar,
  Database,
  FileText,
  Search,
  Settings,
  UserCheck,
  Users,
} from "lucide-react";
import { useState } from "react";

// Import FHIR components
import { FHIRAppointmentManagement } from "@/components/fhir/fhir-appointment-management";
import { FHIRClinicalData } from "@/components/fhir/fhir-clinical-data";
import { FHIRConfiguration } from "@/components/fhir/fhir-configuration";
import { FHIRDataExplorer } from "@/components/fhir/fhir-data-explorer";
import { FHIRPatientManagement } from "@/components/fhir/fhir-patient-management";
import { FHIRPractitionerManagement } from "@/components/fhir/fhir-practitioner-management";
import { FHIRSyncStatus } from "@/components/fhir/fhir-sync-status";
import { FHIRSystemStatus } from "@/components/fhir/fhir-system-status";

const FHIRManagement = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            FHIR Integration Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your eClinicalWorks FHIR R4 integration, sync clinical data,
            and monitor system health
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            <Database className="h-3 w-3 mr-1" />
            FHIR R4
          </Badge>
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            <Activity className="h-3 w-3 mr-1" />
            eClinicalWorks
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 h-auto p-1">
          <TabsTrigger
            value="overview"
            className="flex items-center gap-2 px-3 py-2"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger
            value="patients"
            className="flex items-center gap-2 px-3 py-2"
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Patients</span>
          </TabsTrigger>
          <TabsTrigger
            value="practitioners"
            className="flex items-center gap-2 px-3 py-2"
          >
            <UserCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Practitioners</span>
          </TabsTrigger>
          <TabsTrigger
            value="appointments"
            className="flex items-center gap-2 px-3 py-2"
          >
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Appointments</span>
          </TabsTrigger>
          <TabsTrigger
            value="clinical"
            className="flex items-center gap-2 px-3 py-2"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Clinical</span>
          </TabsTrigger>
          <TabsTrigger
            value="sync"
            className="flex items-center gap-2 px-3 py-2"
          >
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Sync Status</span>
          </TabsTrigger>
          <TabsTrigger
            value="explorer"
            className="flex items-center gap-2 px-3 py-2"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Data Explorer</span>
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="flex items-center gap-2 px-3 py-2"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FHIRSystemStatus />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Common FHIR operations and management tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setActiveTab("patients")}
                  >
                    <Users className="h-6 w-6 text-blue-600 mb-2" />
                    <p className="font-medium text-sm">Manage Patients</p>
                    <p className="text-xs text-gray-500">
                      Search and sync patient data
                    </p>
                  </div>
                  <div
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setActiveTab("practitioners")}
                  >
                    <UserCheck className="h-6 w-6 text-green-600 mb-2" />
                    <p className="font-medium text-sm">Manage Practitioners</p>
                    <p className="text-xs text-gray-500">
                      Sync healthcare providers
                    </p>
                  </div>
                  <div
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setActiveTab("appointments")}
                  >
                    <Calendar className="h-6 w-6 text-purple-600 mb-2" />
                    <p className="font-medium text-sm">Appointments</p>
                    <p className="text-xs text-gray-500">
                      View and manage appointments
                    </p>
                  </div>
                  <div
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setActiveTab("clinical")}
                  >
                    <FileText className="h-6 w-6 text-orange-600 mb-2" />
                    <p className="font-medium text-sm">Clinical Data</p>
                    <p className="text-xs text-gray-500">
                      Access clinical records
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Patients Tab */}
        <TabsContent value="patients" className="space-y-6">
          <FHIRPatientManagement />
        </TabsContent>

        {/* Practitioners Tab */}
        <TabsContent value="practitioners" className="space-y-6">
          <FHIRPractitionerManagement />
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-6">
          <FHIRAppointmentManagement />
        </TabsContent>

        {/* Clinical Data Tab */}
        <TabsContent value="clinical" className="space-y-6">
          <FHIRClinicalData />
        </TabsContent>

        {/* Sync Status Tab */}
        <TabsContent value="sync" className="space-y-6">
          <FHIRSyncStatus />
        </TabsContent>

        {/* Data Explorer Tab */}
        <TabsContent value="explorer" className="space-y-6">
          <FHIRDataExplorer />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>FHIR Configuration</CardTitle>
              <CardDescription>
                Configure your FHIR endpoint settings and authentication
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FHIRConfiguration />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FHIRManagement;
