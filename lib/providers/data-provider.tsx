"use client";

import { initializeMockData } from "@/lib/mock-data";
import { Loader2 } from "lucide-react";
import { ReactNode, useEffect, useRef, useState } from "react";
import { useAppointmentStore } from "../store/useAppointmentStore";
import { useDoctorStore } from "../store/useDoctorStore";
import { usePatientStore } from "../store/usePatientStore";

interface DataProviderProps {
  children: ReactNode;
}

export default function DataProvider({ children }: DataProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const initializationComplete = useRef(false);

  // Get the current state of the stores
  const { doctors } = useDoctorStore();
  const { patients } = usePatientStore();
  const { appointments } = useAppointmentStore();

  useEffect(() => {
    // Skip initialization if already done
    if (initializationComplete.current) {
      setIsLoading(false);
      return;
    }

    const initializeStores = async () => {
      // Check if any store needs initialization
      // If doctors store already has data, we'll preserve it
      const hasDoctors = doctors.length > 0;
      const hasPatients = patients.length > 0;
      const hasAppointments = appointments.length > 0;

      console.log("Current store state:", {
        doctors: hasDoctors ? `${doctors.length} doctors found` : "empty",
        patients: hasPatients ? `${patients.length} patients found` : "empty",
        appointments: hasAppointments
          ? `${appointments.length} appointments found`
          : "empty",
      });

      // Only initialize empty stores
      if (!hasDoctors || !hasPatients || !hasAppointments) {
        console.log("Initializing empty stores with mock data");
        const mockData = initializeMockData();

        // Get the current state handlers
        const doctorStore = useDoctorStore.getState();
        const patientStore = usePatientStore.getState();
        const appointmentStore = useAppointmentStore.getState();

        // Only initialize doctors if the store is empty
        if (!hasDoctors && mockData.doctors.length > 0) {
          console.log(`Adding ${mockData.doctors.length} mock doctors`);
          mockData.doctors.forEach((doctor) => {
            doctorStore.addDoctor(doctor);
          });
        }

        // Only initialize patients if the store is empty
        if (!hasPatients && mockData.patients.length > 0) {
          console.log(`Adding ${mockData.patients.length} mock patients`);
          mockData.patients.forEach((patient) => {
            patientStore.addPatient(patient);
          });
        }

        // Only initialize appointments if the store is empty
        if (!hasAppointments && mockData.appointments.length > 0) {
          console.log(
            `Adding ${mockData.appointments.length} mock appointments`
          );
          mockData.appointments.forEach((appointment) => {
            appointmentStore.addAppointment(appointment);
          });
        }
      } else {
        console.log("All stores already have data, skipping initialization");
      }

      // Mark initialization as complete regardless
      initializationComplete.current = true;
    };

    // Initialize and then set loading to false
    initializeStores().then(() => {
      // Simulate loading delay for smoother UX
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);

      return () => clearTimeout(timer);
    });
  }, [doctors.length, patients.length, appointments.length]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading application data...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
