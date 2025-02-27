import { Doctor, TimeSlot, createEmptyAvailability } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import { Appointment } from "./store/useAppointmentStore";
import { Patient } from "./store/usePatientStore";

// Helper to create a time slot
const createTimeSlot = (startTime: string, endTime: string): TimeSlot => ({
  id: uuidv4(),
  startTime,
  endTime,
});

// Generate availability with some common patterns
export const generateDoctorAvailability = (
  morningShift: boolean = true,
  afternoonShift: boolean = true,
  eveningShift: boolean = false,
  weekendAvailable: boolean = false
) => {
  const availability = createEmptyAvailability();

  // Standard weekday schedule
  const weekdaySchedule: TimeSlot[] = [];

  if (morningShift) {
    weekdaySchedule.push(
      createTimeSlot("09:00", "09:30"),
      createTimeSlot("09:30", "10:00"),
      createTimeSlot("10:00", "10:30"),
      createTimeSlot("10:30", "11:00"),
      createTimeSlot("11:00", "11:30"),
      createTimeSlot("11:30", "12:00")
    );
  }

  if (afternoonShift) {
    weekdaySchedule.push(
      createTimeSlot("13:00", "13:30"),
      createTimeSlot("13:30", "14:00"),
      createTimeSlot("14:00", "14:30"),
      createTimeSlot("14:30", "15:00"),
      createTimeSlot("15:00", "15:30"),
      createTimeSlot("15:30", "16:00")
    );
  }

  if (eveningShift) {
    weekdaySchedule.push(
      createTimeSlot("17:00", "17:30"),
      createTimeSlot("17:30", "18:00"),
      createTimeSlot("18:00", "18:30"),
      createTimeSlot("18:30", "19:00")
    );
  }

  // Apply to weekdays
  availability.monday = [...weekdaySchedule];
  availability.tuesday = [...weekdaySchedule];
  availability.wednesday = [...weekdaySchedule];
  availability.thursday = [...weekdaySchedule];
  availability.friday = [...weekdaySchedule];

  // Apply weekend schedule if available
  if (weekendAvailable) {
    const weekendSchedule = [
      createTimeSlot("10:00", "10:30"),
      createTimeSlot("10:30", "11:00"),
      createTimeSlot("11:00", "11:30"),
      createTimeSlot("11:30", "12:00"),
    ];

    availability.saturday = [...weekendSchedule];
    // Sunday is usually off for most doctors
  }

  return availability;
};

// Mock doctors data
export const mockDoctors: Doctor[] = [
  {
    id: "doc_1",
    name: "Dr. Sarah Johnson",
    specialty: "Cardiology",
    email: "sarah.johnson@example.com",
    phone: "(555) 123-4567",
    roomsAssigned: ["room_1", "room_4"],
    assistantsAssigned: ["assist_2"],
    patients: ["patient_1", "patient_3", "patient_5"],
    availability: generateDoctorAvailability(true, true, false, false),
  },
  {
    id: "doc_2",
    name: "Dr. Michael Chen",
    specialty: "Dermatology",
    email: "michael.chen@example.com",
    phone: "(555) 234-5678",
    roomsAssigned: ["room_2"],
    assistantsAssigned: ["assist_1"],
    patients: ["patient_2", "patient_4"],
    availability: generateDoctorAvailability(true, true, true, true),
  },
  {
    id: "doc_3",
    name: "Dr. Emily Rodriguez",
    specialty: "Pediatrics",
    email: "emily.rodriguez@example.com",
    phone: "(555) 345-6789",
    roomsAssigned: ["room_3"],
    assistantsAssigned: ["assist_3"],
    patients: ["patient_6", "patient_7"],
    availability: generateDoctorAvailability(true, false, true, true),
  },
  {
    id: "doc_4",
    name: "Dr. James Wilson",
    specialty: "Orthopedics",
    email: "james.wilson@example.com",
    phone: "(555) 456-7890",
    roomsAssigned: ["room_5"],
    assistantsAssigned: [],
    patients: ["patient_8"],
    availability: generateDoctorAvailability(false, true, true, false),
  },
  {
    id: "doc_5",
    name: "Dr. Olivia Kim",
    specialty: "Neurology",
    email: "olivia.kim@example.com",
    phone: "(555) 567-8901",
    roomsAssigned: [],
    assistantsAssigned: ["assist_4"],
    patients: ["patient_9", "patient_10"],
    availability: generateDoctorAvailability(true, true, false, false),
  },
];

// Mock patients data
export const mockPatients: Patient[] = [
  {
    id: "patient_1",
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "(555) 111-2222",
    dateOfBirth: "1985-03-15",
    gender: "male",
    address: "123 Main St, Anytown, CA 12345",
    medicalHistory: ["Hypertension", "Type 2 Diabetes"],
    assignedDoctor: "doc_1",
  },
  {
    id: "patient_2",
    name: "Maria Garcia",
    email: "maria.garcia@example.com",
    phone: "(555) 222-3333",
    dateOfBirth: "1990-07-22",
    gender: "female",
    address: "456 Oak Ave, Somecity, CA 67890",
    medicalHistory: ["Asthma"],
    assignedDoctor: "doc_2",
  },
  {
    id: "patient_3",
    name: "Robert Johnson",
    email: "robert.johnson@example.com",
    phone: "(555) 333-4444",
    dateOfBirth: "1975-11-08",
    gender: "male",
    address: "789 Pine Rd, Othercity, CA 54321",
    medicalHistory: ["Coronary Artery Disease", "High Cholesterol"],
    assignedDoctor: "doc_1",
  },
  {
    id: "patient_4",
    name: "Emma Williams",
    email: "emma.williams@example.com",
    phone: "(555) 444-5555",
    dateOfBirth: "1995-01-30",
    gender: "female",
    address: "321 Elm Blvd, Newtown, CA 13579",
    medicalHistory: ["Eczema", "Allergies"],
    assignedDoctor: "doc_2",
  },
  {
    id: "patient_5",
    name: "David Brown",
    email: "david.brown@example.com",
    phone: "(555) 555-6666",
    dateOfBirth: "1968-05-12",
    gender: "male",
    address: "654 Maple Dr, Oldcity, CA 97531",
    medicalHistory: ["Heart Failure", "Atrial Fibrillation"],
    assignedDoctor: "doc_1",
  },
  {
    id: "patient_123",
    name: "Test User",
    email: "test.user@example.com",
    phone: "(555) 123-9999",
    dateOfBirth: "1990-01-01",
    gender: "female",
    address: "123 Test Street, Testville, CA 90000",
    medicalHistory: ["Seasonal Allergies"],
    assignedDoctor: "doc_2",
  },
];

// Generate a date X days from now
const dateFromNow = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
};

// Generate a date X days ago
const dateFromPast = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split("T")[0];
};

// Mock appointments data
export const mockAppointments: Appointment[] = [
  // Upcoming appointments
  {
    id: "appt_1",
    patientId: "patient_123",
    doctorId: "doc_1",
    date: dateFromNow(1),
    startTime: "09:30",
    endTime: "10:00",
    appointmentType: "in-person",
    status: "confirmed",
    notes: "Follow-up on blood pressure medication",
    createdAt: dateFromPast(7),
    updatedAt: dateFromPast(7),
  },
  {
    id: "appt_2",
    patientId: "patient_123",
    doctorId: "doc_2",
    date: dateFromNow(3),
    startTime: "14:00",
    endTime: "14:30",
    appointmentType: "virtual",
    status: "scheduled",
    notes: "Skin rash consultation",
    createdAt: dateFromPast(5),
    updatedAt: dateFromPast(5),
  },
  {
    id: "appt_3",
    patientId: "patient_123",
    doctorId: "doc_3",
    date: dateFromNow(7),
    startTime: "11:00",
    endTime: "11:30",
    appointmentType: "in-person",
    status: "scheduled",
    notes: "Annual check-up",
    createdAt: dateFromPast(10),
    updatedAt: dateFromPast(10),
  },

  // Past appointments
  {
    id: "appt_4",
    patientId: "patient_123",
    doctorId: "doc_1",
    date: dateFromPast(10),
    startTime: "10:00",
    endTime: "10:30",
    appointmentType: "in-person",
    status: "completed",
    notes: "Initial consultation for heart palpitations",
    createdAt: dateFromPast(20),
    updatedAt: dateFromPast(9),
  },
  {
    id: "appt_5",
    patientId: "patient_123",
    doctorId: "doc_4",
    date: dateFromPast(5),
    startTime: "15:30",
    endTime: "16:00",
    appointmentType: "in-person",
    status: "completed",
    notes: "Evaluation for knee pain",
    createdAt: dateFromPast(15),
    updatedAt: dateFromPast(4),
  },
  {
    id: "appt_6",
    patientId: "patient_123",
    doctorId: "doc_2",
    date: dateFromPast(15),
    startTime: "13:30",
    endTime: "14:00",
    appointmentType: "virtual",
    status: "cancelled",
    notes: "Acne treatment follow-up",
    createdAt: dateFromPast(25),
    updatedAt: dateFromPast(16),
  },
  {
    id: "appt_7",
    patientId: "patient_123",
    doctorId: "doc_5",
    date: dateFromPast(20),
    startTime: "14:30",
    endTime: "15:00",
    appointmentType: "in-person",
    status: "no-show",
    notes: "Headache evaluation",
    createdAt: dateFromPast(30),
    updatedAt: dateFromPast(20),
  },
];

// Function to initialize stores with mock data
export const initializeMockData = () => {
  return {
    doctors: mockDoctors,
    patients: mockPatients,
    appointments: mockAppointments,
  };
};
