import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Clock, User, UserCheck } from "lucide-react";
import React from "react";

export const FHIRAppointmentManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Appointment Management
          </CardTitle>
          <CardDescription>
            View and manage appointments from FHIR system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Appointment Management
              </h3>
              <p className="text-gray-500 mb-4">
                This feature will allow you to view, search, and sync
                appointments from the FHIR server.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-md mx-auto">
                <div className="p-3 border rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-xs font-medium">Scheduled</p>
                  <p className="text-xs text-gray-500">
                    View upcoming appointments
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <User className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-xs font-medium">Patients</p>
                  <p className="text-xs text-gray-500">
                    Link to patient records
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <UserCheck className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-xs font-medium">Providers</p>
                  <p className="text-xs text-gray-500">
                    Practitioner schedules
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
