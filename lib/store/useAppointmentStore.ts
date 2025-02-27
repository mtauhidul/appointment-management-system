import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no-show";

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string; // ISO date string
  startTime: string; // Format: "HH:MM" in 24-hour format
  endTime: string; // Format: "HH:MM" in 24-hour format
  appointmentType: "in-person" | "virtual";
  status: AppointmentStatus;
  notes: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

interface AppointmentStore {
  appointments: Appointment[];
  addAppointment: (
    appointment: Omit<Appointment, "id" | "createdAt" | "updatedAt">
  ) => Appointment;
  updateAppointment: (
    id: string,
    updates: Partial<Omit<Appointment, "id" | "createdAt" | "updatedAt">>
  ) => void;
  cancelAppointment: (id: string) => void;
  deleteAppointment: (id: string) => void;
  getAppointmentsByPatient: (patientId: string) => Appointment[];
  getAppointmentsByDoctor: (doctorId: string) => Appointment[];
  getAppointmentsByDate: (date: string) => Appointment[];
  getUpcomingAppointments: () => Appointment[];
}

export const useAppointmentStore = create<AppointmentStore>()(
  persist(
    (set, get) => ({
      appointments: [],

      addAppointment: (appointmentData) => {
        const now = new Date().toISOString();
        const newAppointment: Appointment = {
          id: Math.random().toString(36).substr(2, 9),
          ...appointmentData,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          appointments: [...state.appointments, newAppointment],
        }));

        return newAppointment;
      },

      updateAppointment: (id, updates) => {
        const now = new Date().toISOString();

        set((state) => ({
          appointments: state.appointments.map((appointment) =>
            appointment.id === id
              ? { ...appointment, ...updates, updatedAt: now }
              : appointment
          ),
        }));
      },

      cancelAppointment: (id) => {
        const now = new Date().toISOString();

        set((state) => ({
          appointments: state.appointments.map((appointment) =>
            appointment.id === id
              ? { ...appointment, status: "cancelled", updatedAt: now }
              : appointment
          ),
        }));
      },

      deleteAppointment: (id) =>
        set((state) => ({
          appointments: state.appointments.filter(
            (appointment) => appointment.id !== id
          ),
        })),

      getAppointmentsByPatient: (patientId) => {
        return get().appointments.filter(
          (appointment) => appointment.patientId === patientId
        );
      },

      getAppointmentsByDoctor: (doctorId) => {
        return get().appointments.filter(
          (appointment) => appointment.doctorId === doctorId
        );
      },

      getAppointmentsByDate: (date) => {
        return get().appointments.filter(
          (appointment) => appointment.date === date
        );
      },

      getUpcomingAppointments: () => {
        const now = new Date();

        return get()
          .appointments.filter((appointment) => {
            const appointmentDate = new Date(appointment.date);
            return (
              appointmentDate >= now &&
              appointment.status !== "cancelled" &&
              appointment.status !== "completed"
            );
          })
          .sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.startTime}`);
            const dateB = new Date(`${b.date}T${b.startTime}`);
            return dateA.getTime() - dateB.getTime();
          });
      },
    }),
    {
      name: "appointments-storage",
    }
  )
);
