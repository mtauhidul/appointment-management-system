import { Card, CardContent } from "@/components/ui/card";
import {
  CalendarIcon,
  ClipboardList,
  FileText,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";

/**
 * Mobile-optimized quick action cards that display in a grid
 * with appropriate spacing for small screens
 */
export default function MobileQuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3 md:hidden">
      <Link href="/patient-portal/appointments?tab=book">
        <Card className="bg-primary/5 border-primary/10 hover:bg-primary/10 transition-colors cursor-pointer h-full">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="rounded-full bg-primary/10 p-3 mb-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-medium text-sm">Book Appointment</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Schedule your next visit
            </p>
          </CardContent>
        </Card>
      </Link>

      <Link href="/patient-portal/messages">
        <Card className="hover:bg-secondary/10 transition-colors cursor-pointer h-full">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="rounded-full bg-secondary/10 p-3 mb-2">
              <MessageSquare className="h-5 w-5 text-secondary" />
            </div>
            <h3 className="font-medium text-sm">Message Doctor</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Send a secure message
            </p>
          </CardContent>
        </Card>
      </Link>

      <Link href="/patient-portal/prescriptions">
        <Card className="hover:bg-destructive/10 transition-colors cursor-pointer h-full">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="rounded-full bg-destructive/10 p-3 mb-2">
              <ClipboardList className="h-5 w-5 text-destructive" />
            </div>
            <h3 className="font-medium text-sm">Prescription Refill</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Request medication refills
            </p>
          </CardContent>
        </Card>
      </Link>

      <Link href="/patient-portal/records">
        <Card className="hover:bg-accent/30 transition-colors cursor-pointer h-full">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="rounded-full bg-accent/20 p-3 mb-2">
              <FileText className="h-5 w-5 text-accent-foreground" />
            </div>
            <h3 className="font-medium text-sm">View Test Results</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Access your medical records
            </p>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
