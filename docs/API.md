# API Documentation

## Firebase Integration

### Authentication
The system uses Firebase Authentication for user management.

#### Authentication Methods
- Email/Password authentication
- Session management
- Role-based access control

#### Configuration
```typescript
// lib/firebase/config.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  // Configuration from environment variables
};

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

### Firestore Collections

#### Doctors Collection
```typescript
interface Doctor {
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
```

#### Rooms Collection
```typescript
interface Room {
  id: string;
  number: number;
  doctorStatuses: { [doctorId: string]: DoctorStatus };
  isEmergency: boolean;
  doctorsAssigned: string[];
}
```

#### Appointments Collection
```typescript
interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: Date;
  time: string;
  type: 'In-person' | 'Virtual';
  status: 'confirmed' | 'cancelled' | 'completed' | 'rescheduled';
  notes?: string;
}
```

### State Management APIs

#### Doctor Store
```typescript
// lib/store/useDoctorStore.ts
interface DoctorStore {
  doctors: Doctor[];
  addDoctor: (doctor: Omit<Doctor, 'id'>) => void;
  updateDoctor: (id: string, updates: Partial<Doctor>) => void;
  deleteDoctor: (id: string) => void;
  addTimeSlot: (doctorId: string, day: string, slot: TimeSlot) => void;
  removeTimeSlot: (doctorId: string, day: string, slotId: string) => void;
}
```

#### Room Store
```typescript
// lib/store/useRoomStore.ts
interface RoomStore {
  rooms: Room[];
  updateRoom: (id: string, updates: Partial<Room>) => void;
  addRoom: (room: Omit<Room, 'id'>) => void;
  deleteRoom: (id: string) => void;
}
```

#### Status Store
```typescript
// lib/store/useStatusStore.ts
interface StatusStore {
  statuses: Status[];
  addStatus: (status: Omit<Status, 'id'>) => void;
  updateStatus: (id: string, updates: Partial<Status>) => void;
  deleteStatus: (id: string) => void;
}
```

## Component APIs

### Dashboard Component
```typescript
// app/caresync/dashboard/dashboard.tsx
interface DashboardProps {
  // No props - uses global state
}

// Key functions:
- handleUpdateStatus(roomId: string, doctorId: string, newStatus: string)
- handleToggleEmergency(roomId: string)
- handlePatientCountChange(doctorId: string, count: number)
- handleRoomReset(roomId: string, doctorId: string)
```

### Appointment Booking Component
```typescript
// app/patient/dashboard/dashboard.tsx
interface BookingState {
  selectedProvider: number | null;
  selectedDate: Date | null;
  selectedTime: string | null;
  appointmentType: 'In-person' | 'Virtual';
  bookingNotes: string;
}

// Key functions:
- handleSubmitBooking()
- handleStartReschedule(appointment: Appointment)
- handleCancelAppointment(appointmentId: string)
```

### Kiosk Component
```typescript
// app/patient/kiosk/kiosk.tsx
interface KioskProps {
  // No props - self-contained component
}

// Features:
- Full-screen modal interface
- Embedded iframe for kiosk application
- Loading states and error handling
```

## Utility Functions

### Date and Time Utilities
```typescript
// Common date formatting functions
formatDate(date: Date, format: 'short' | 'long' | 'medium'): string
formatTime(seconds: number): string // MM:SS format
getTimeSlots(providerId: number, date: Date, appointments: Appointment[]): string[]
```

### Audio Management
```typescript
// Audio notification functions
playNotificationSound(): void
playEmergencySound(): void
```

### Status Management
```typescript
// Status color and styling utilities
getStatusColor(statusName: string): string
getCardStyles(room: Room, isEmergency: boolean): React.CSSProperties
```

## Real-time Updates

### Timer System
The dashboard implements a real-time timer system that tracks:
- Time since status change for each room
- Automatic updates every second
- Visual indicators for long wait times
- Emergency state handling

```typescript
useEffect(() => {
  const interval = setInterval(() => {
    setTimers((prev) => {
      // Update timer logic
    });
  }, 1000);
  
  return () => clearInterval(interval);
}, [rooms]);
```

### WebSocket Integration
While not currently implemented, the architecture supports WebSocket integration for:
- Real-time status synchronization
- Multi-user collaborative updates
- Live notifications across devices

## Error Handling

### Global Error Boundaries
```typescript
// Error handling patterns used throughout the application
try {
  // Firebase operations
} catch (error) {
  console.error('Operation failed:', error);
  // User notification
}
```

### Form Validation
```typescript
// Using Zod for form validation
const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Phone number required')
});
```

## Performance Optimization

### Memoization
```typescript
// Using useMemo for expensive calculations
const sidebarItems = useMemo(() => [
  // Sidebar configuration
], []);

const componentMap = useMemo(() => ({
  // Component mapping
}), []);
```

### State Optimization
```typescript
// Zustand store optimization
const useStore = create((set) => ({
  // Minimal state updates
  updateField: (id, field, value) => set((state) => ({
    items: state.items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    )
  }))
}));
```
