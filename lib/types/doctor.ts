export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  roomsAssigned: string[];
  assistantsAssigned: string[];
  patients: string[];
  availability: DoctorAvailability;
}

export interface DoctorAvailability {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
}

export interface TimeSlot {
  id: string;
  startTime: string; // Format: "HH:MM" in 24-hour format
  endTime: string; // Format: "HH:MM" in 24-hour format
}

// Helper to create an empty availability schedule
export const createEmptyAvailability = (): DoctorAvailability => ({
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
  sunday: [],
});
