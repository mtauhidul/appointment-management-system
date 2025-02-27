import { DoctorAvailability, TimeSlot } from "@/lib/types";

// Day names mapping
export const DAYS_OF_WEEK = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

// Format a time string (HH:MM) to a user-friendly format (e.g., "9:00 AM")
export const formatTimeDisplay = (time: string): string => {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;
  return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
};

// Parse a user-friendly time string back to HH:MM format
export const parseTimeInput = (timeStr: string): string => {
  const [time, period] = timeStr.split(" ");
  // eslint-disable-next-line prefer-const
  let [hours, minutes] = time.split(":").map(Number);

  if (period === "PM" && hours < 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0;
  }

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
};

// Convert a Date object to ISO string date (YYYY-MM-DD)
export const toISODateString = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

// Format a date to display format (e.g., "Monday, January 1, 2023")
export const formatDateDisplay = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Get the day of the week from a date as a key of DoctorAvailability
export const getDayFromDate = (date: Date): keyof DoctorAvailability => {
  const dayIndex = date.getDay();
  return DAYS_OF_WEEK[dayIndex] as keyof DoctorAvailability;
};

// Check if a date is in the past
export const isDateInPast = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);

  return compareDate < today;
};

// Check if a time is in the past for today
export const isTimeInPastForToday = (timeStr: string): boolean => {
  const now = new Date();
  const today = new Date();

  const [hours, minutes] = timeStr.split(":").map(Number);
  today.setHours(hours, minutes, 0, 0);

  return today < now;
};

// Get available time slots for a doctor on a specific date
export const getAvailableTimeSlots = (
  doctorAvailability: DoctorAvailability,
  date: Date,
  bookedSlots: { startTime: string; endTime: string }[] = []
): TimeSlot[] => {
  const day = getDayFromDate(date);
  const isToday = new Date().toDateString() === date.toDateString();

  // Get the doctor's available slots for the day
  const availableSlots = doctorAvailability[day] || [];

  // Filter out slots that are already booked
  return availableSlots.filter((slot) => {
    // Skip slots in the past if it's today
    if (isToday && isTimeInPastForToday(slot.startTime)) {
      return false;
    }

    // Check if the slot overlaps with any booked slot
    const isBooked = bookedSlots.some((bookedSlot) => {
      // Check if the slots overlap
      return (
        (slot.startTime < bookedSlot.endTime &&
          slot.endTime > bookedSlot.startTime) ||
        (slot.startTime === bookedSlot.startTime &&
          slot.endTime === bookedSlot.endTime)
      );
    });

    return !isBooked;
  });
};

// Group time slots for display (e.g., morning, afternoon, evening)
export const groupTimeSlotsByPeriod = (slots: TimeSlot[]) => {
  const morning: TimeSlot[] = [];
  const afternoon: TimeSlot[] = [];
  const evening: TimeSlot[] = [];

  slots.forEach((slot) => {
    const hour = parseInt(slot.startTime.split(":")[0], 10);

    if (hour < 12) {
      morning.push(slot);
    } else if (hour < 17) {
      afternoon.push(slot);
    } else {
      evening.push(slot);
    }
  });

  return {
    morning: morning.sort((a, b) => a.startTime.localeCompare(b.startTime)),
    afternoon: afternoon.sort((a, b) => a.startTime.localeCompare(b.startTime)),
    evening: evening.sort((a, b) => a.startTime.localeCompare(b.startTime)),
  };
};
