"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useKioskStore } from "@/lib/store/kiosk/useKioskStore";
import { ArrowRight, CheckSquare, Clock, FileText, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Kiosk() {
  const router = useRouter();
  const { progress, resetKiosk } = useKioskStore();

  const hasExistingData =
    progress.data && Object.keys(progress.data).length > 0;
  const isInProgress =
    progress.currentStep !== "welcome" && progress.currentStep !== "complete";

  const handleStartCheckIn = () => {
    // Reset any existing data for a fresh start
    resetKiosk();
    // Navigate to kiosk flow using React router
    router.push("/patient/kiosk");
  };

  const handleContinueCheckIn = () => {
    // Continue from where user left off
    router.push("/patient/kiosk");
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-bold text-gray-900">Check-in Center</h1>
        <p className="text-gray-600">
          Complete your appointment check-in quickly and securely
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* New Check-in Card */}
        <Card className="border-2 border-blue-200 hover:border-blue-300 transition-colors">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-3 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-xl text-gray-900">
              New Check-in
            </CardTitle>
            <p className="text-sm text-gray-600">
              Start a fresh check-in process for your upcoming appointment
            </p>
          </CardHeader>
          <CardContent className="text-center">
            <Button
              onClick={handleStartCheckIn}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              Start Check-in
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <div className="mt-4 text-xs text-gray-500">
              <Clock className="inline w-3 h-3 mr-1" />
              Takes 5-10 minutes
            </div>
          </CardContent>
        </Card>

        {/* Continue/Status Card */}
        <Card
          className={`border-2 transition-colors ${
            hasExistingData
              ? "border-orange-200 hover:border-orange-300"
              : "border-gray-200"
          }`}
        >
          <CardHeader className="text-center pb-4">
            <div
              className={`mx-auto mb-3 w-16 h-16 rounded-full flex items-center justify-center ${
                hasExistingData ? "bg-orange-100" : "bg-gray-100"
              }`}
            >
              {hasExistingData ? (
                <CheckSquare
                  className={`w-8 h-8 ${
                    isInProgress ? "text-orange-600" : "text-green-600"
                  }`}
                />
              ) : (
                <User className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <CardTitle className="text-xl text-gray-900">
              {hasExistingData ? "Previous Check-in" : "No Previous Check-in"}
            </CardTitle>
            <p className="text-sm text-gray-600">
              {hasExistingData
                ? isInProgress
                  ? "You have an incomplete check-in in progress"
                  : "You have completed a previous check-in"
                : "No previous check-in data found"}
            </p>
          </CardHeader>
          <CardContent className="text-center">
            {hasExistingData ? (
              <Button
                onClick={handleContinueCheckIn}
                variant={isInProgress ? "default" : "outline"}
                className={`w-full ${
                  isInProgress
                    ? "bg-orange-600 hover:bg-orange-700"
                    : "border-green-600 text-green-600 hover:bg-green-50"
                }`}
                size="lg"
              >
                {isInProgress ? "Continue Check-in" : "View Check-in"}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            ) : (
              <Button variant="outline" className="w-full" size="lg" disabled>
                No Data Available
              </Button>
            )}
            {hasExistingData && (
              <div className="mt-4 text-xs text-gray-500">
                Current step: {progress.currentStep.replace("-", " ")}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Info */}
      <Card className="bg-gray-50">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-3 text-center">
            What You&apos;ll Need
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-gray-700">Personal Info</span>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-green-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                <FileText className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-gray-700">Medical History</span>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-purple-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                <CheckSquare className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-gray-700">Medications</span>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-red-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                <FileText className="w-4 h-4 text-red-600" />
              </div>
              <span className="text-gray-700">Signatures</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
