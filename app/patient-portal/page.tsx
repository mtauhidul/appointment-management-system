import MobileQuickActions from "@/components/mobile-quick-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  ArrowRight,
  Bell,
  CalendarIcon,
  ClipboardList,
  Clock,
  FileText,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";

export default function PatientPortalDashboard() {
  return (
    <div className="px-4 pt-16 md:pt-0 space-y-4">
      <div className="flex items-center justify-between mt-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, Test User</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="outline">
            <Bell className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline">
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Alerts */}
      <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-900">
        <CardContent className="flex items-center gap-2 p-3">
          <div className="rounded-full bg-yellow-200 dark:bg-yellow-900/50 p-2 flex-shrink-0">
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm">Action Required</h3>
            <p className="text-xs text-muted-foreground truncate">
              Please complete your health questionnaire before your next
              appointment.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="flex-shrink-0 text-xs px-2"
          >
            Complete Now
          </Button>
        </CardContent>
      </Card>

      {/* Mobile Quick Actions */}
      <MobileQuickActions />

      {/* Desktop Quick Actions */}
      <div className="hidden md:grid gap-3 md:grid-cols-4">
        <Link href="/patient-portal/appointments?tab=book">
          <Card className="bg-primary/5 border-primary/10 hover:bg-primary/10 transition-colors cursor-pointer h-full">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="rounded-full bg-primary/10 p-3 mb-3">
                <CalendarIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">Book Appointment</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Schedule your next visit
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/patient-portal/messages">
          <Card className="hover:bg-secondary/10 transition-colors cursor-pointer h-full">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="rounded-full bg-secondary/10 p-3 mb-3">
                <MessageSquare className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-medium">Message Doctor</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Send a secure message
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/patient-portal/prescriptions">
          <Card className="hover:bg-destructive/10 transition-colors cursor-pointer h-full">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="rounded-full bg-destructive/10 p-3 mb-3">
                <ClipboardList className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="font-medium">Prescription Refill</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Request medication refills
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/patient-portal/records">
          <Card className="hover:bg-accent/30 transition-colors cursor-pointer h-full">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="rounded-full bg-accent/20 p-3 mb-3">
                <FileText className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="font-medium">View Test Results</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Access your medical records
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>Upcoming Appointments</CardTitle>
            <Link href="/patient-portal/appointments">
              <Button variant="ghost" size="sm" className="gap-1">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <CardDescription>
            Your scheduled appointments for the next 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Dr. Sarah Johnson</p>
                  <p className="text-sm text-muted-foreground">Cardiology</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">Tomorrow, 9:30 AM</p>
                <p className="text-sm text-muted-foreground">In-person</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Dr. Michael Chen</p>
                  <p className="text-sm text-muted-foreground">Dermatology</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">Feb 29, 2:00 PM</p>
                <p className="text-sm text-muted-foreground">Virtual</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Dr. Emily Rodriguez</p>
                  <p className="text-sm text-muted-foreground">Pediatrics</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">Mar 5, 11:00 AM</p>
                <p className="text-sm text-muted-foreground">In-person</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Summary */}
      <div className="grid gap-3 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Vitals</CardTitle>
            <CardDescription>
              Your most recent health measurements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-muted-foreground">Blood Pressure</span>
                <span className="font-medium">120/80 mmHg</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-muted-foreground">Heart Rate</span>
                <span className="font-medium">72 bpm</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-muted-foreground">Weight</span>
                <span className="font-medium">165 lbs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Temperature</span>
                <span className="font-medium">98.6 °F</span>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4">
              View Health Trends
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Medications</CardTitle>
            <CardDescription>
              Your current prescription medications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex flex-col border-b pb-2">
                <div className="flex justify-between">
                  <span className="font-medium">Lisinopril</span>
                  <span className="text-sm text-muted-foreground">10mg</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Take once daily
                </span>
              </div>
              <div className="flex flex-col border-b pb-2">
                <div className="flex justify-between">
                  <span className="font-medium">Metformin</span>
                  <span className="text-sm text-muted-foreground">500mg</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Take twice daily with meals
                </span>
              </div>
              <div className="flex flex-col">
                <div className="flex justify-between">
                  <span className="font-medium">Atorvastatin</span>
                  <span className="text-sm text-muted-foreground">20mg</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Take once daily at bedtime
                </span>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4">
              Manage Medications
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
