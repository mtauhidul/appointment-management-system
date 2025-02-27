import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAppointmentStore } from "@/lib/store/useAppointmentStore";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import BookAppointment from "./book-appointment";
import PastAppointments from "./past-appointments";
import UpcomingAppointments from "./upcoming-appointments";

// Mock user ID for demonstration purposes
// In a real application, this would come from an authentication system
const MOCK_PATIENT_ID = "patient123";

export default function PatientAppointments() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const { cancelAppointment } = useAppointmentStore();

  // Simulate data loading from an API
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleCancelAppointment = (appointmentId: string) => {
    cancelAppointment(appointmentId);
    toast({
      title: "Appointment cancelled",
      description: "Your appointment has been cancelled successfully.",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-16 md:pt-0 space-y-4 md:p-8 md:pt-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
        <p className="text-muted-foreground">
          View and manage your appointments
        </p>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-2">
          <TabsTrigger value="upcoming" className="text-xs sm:text-sm">
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="past" className="text-xs sm:text-sm">
            Past
          </TabsTrigger>
          <TabsTrigger value="book" className="text-xs sm:text-sm">
            Book
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          <UpcomingAppointments
            patientId={MOCK_PATIENT_ID}
            onCancelAppointment={handleCancelAppointment}
          />
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          <PastAppointments patientId={MOCK_PATIENT_ID} />
        </TabsContent>

        <TabsContent value="book" className="mt-6">
          <BookAppointment patientId={MOCK_PATIENT_ID} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
