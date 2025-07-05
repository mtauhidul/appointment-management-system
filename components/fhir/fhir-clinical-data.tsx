import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Heart, Pill, Stethoscope, TestTube } from "lucide-react";
import React from "react";

export const FHIRClinicalData: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Clinical Data Management
          </CardTitle>
          <CardDescription>
            Access and manage clinical records from FHIR system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Clinical Data Access
              </h3>
              <p className="text-gray-500 mb-6">
                Access comprehensive clinical data from your FHIR-enabled EHR
                system.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                <div className="p-4 border rounded-lg">
                  <Heart className="h-8 w-8 text-red-500 mx-auto mb-3" />
                  <p className="text-sm font-medium mb-1">Vital Signs</p>
                  <p className="text-xs text-gray-500">
                    Blood pressure, heart rate, temperature
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <Pill className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                  <p className="text-sm font-medium mb-1">Medications</p>
                  <p className="text-xs text-gray-500">
                    Current prescriptions and history
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <TestTube className="h-8 w-8 text-green-500 mx-auto mb-3" />
                  <p className="text-sm font-medium mb-1">Lab Results</p>
                  <p className="text-xs text-gray-500">
                    Test results and diagnostics
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <Stethoscope className="h-8 w-8 text-purple-500 mx-auto mb-3" />
                  <p className="text-sm font-medium mb-1">Conditions</p>
                  <p className="text-xs text-gray-500">
                    Diagnoses and medical conditions
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
