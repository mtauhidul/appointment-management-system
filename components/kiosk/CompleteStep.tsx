"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StepComponentProps } from "@/lib/types/kiosk";
import { CheckCircle, Clock, FileText, Home, Users } from "lucide-react";
import { useEffect } from "react";

export default function CompleteStep({ data }: StepComponentProps) {
  // Clear any stored data when reaching completion
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("kiosk-progress");
    }
  }, []);

  const handleReturnToPortal = () => {
    // Navigate back to the patient portal
    window.location.href = "/patient?section=Appointments";
  };

  const handleStartNewCheckIn = () => {
    // Reset and start a new check-in
    window.location.reload();
  };

  const currentTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">
            Check-in Complete!
          </CardTitle>
          <p className="text-gray-600">
            Thank you for completing your patient check-in. Your information has
            been submitted successfully.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Confirmation Details */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-green-600" />
                  <span className="font-medium">Patient:</span>
                </div>
                <span>{data.userInfo?.fullName || "Patient"}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span className="font-medium">Submitted at:</span>
                </div>
                <span>{currentTime}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-green-600" />
                  <span className="font-medium">Status:</span>
                </div>
                <span className="text-green-600 font-medium">Complete</span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">
              What happens next:
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <span>
                  Your healthcare provider will review your information
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <span>Please take a seat in the waiting area</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <span>
                  You will be called when it&apos;s time for your appointment
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <span>
                  If you have any urgent questions, please inform the front desk
                </span>
              </li>
            </ul>
          </div>

          {/* Important Notes */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Important Notes:</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Please keep your insurance card and ID ready</li>
              <li>• Notify staff if your condition changes while waiting</li>
              <li>
                • Emergency services: Dial 911 for life-threatening emergencies
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleReturnToPortal}
              className="flex-1 flex items-center justify-center space-x-2"
            >
              <Home className="w-4 h-4" />
              <span>Return to Patient Portal</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleStartNewCheckIn}
              className="flex-1 flex items-center justify-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>Start New Check-in</span>
            </Button>
          </div>

          {/* Contact Information */}
          <div className="text-center text-sm text-gray-500 border-t pt-4">
            <p>
              Need assistance? Please approach the front desk or call our
              office.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
