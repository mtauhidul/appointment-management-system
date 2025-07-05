# YTFCS Healthcare Management System

## 📋 Project Overview

**YTFCS (Your Total Foot Care Specialist)** is a comprehensive healthcare management system designed specifically for podiatry and foot care clinics. The system provides dual interfaces for healthcare staff administration and patient self-service, featuring real-time room status monitoring, appointment scheduling, and integrated kiosk functionality.

### 🏥 System Purpose
- **Staff Portal (CareSync)**: Complete healthcare facility management with real-time dashboards
- **Patient Portal**: Self-service appointment booking and management
- **Kiosk System**: Integrated self-service check-in system for clinic waiting areas

---

## 🏗️ Architecture & Technology Stack

### Core Technologies
- **Framework**: Next.js 14.2.26 (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with Tailwind CSS Animate
- **State Management**: Zustand 5.0.3
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **UI Components**: Radix UI primitives with custom components
- **Charts & Analytics**: Recharts 2.15.1
- **Date Handling**: date-fns 4.1.0
- **Form Management**: React Hook Form with Zod validation

### Development Tools
- **Package Manager**: pnpm
- **Build System**: Next.js built-in build system
- **Linting**: ESLint (Next.js configuration)
- **Type Checking**: TypeScript compiler

---

## 📁 Project Structure

```
ytfcs-shg/
├── app/                          # Next.js App Router directory
│   ├── globals.css              # Global styles and Tailwind imports
│   ├── layout.tsx              # Root layout component
│   ├── page.tsx                # Home page with navigation
│   ├── caresync/               # Staff portal (Healthcare management)
│   │   ├── page.tsx           # Main CareSync dashboard router
│   │   ├── dashboard/         # Real-time room status monitoring
│   │   ├── patients/          # Patient management
│   │   ├── reports/           # Analytics and reporting
│   │   ├── roles/             # Staff role management
│   │   │   ├── assistantsList/
│   │   │   ├── doctorsList/
│   │   │   └── receptionistsList/
│   │   ├── status/            # Status configuration
│   │   └── resources/         # Resource management
│   └── patient/               # Patient portal
│       ├── page.tsx          # Patient dashboard router
│       ├── auth/             # Authentication pages
│       ├── dashboard/        # Appointment management
│       ├── kiosk/            # Integrated kiosk system
│       └── profile/          # Patient profile management
├── components/                # Reusable UI components
│   ├── ui/                   # Base UI components (Radix UI based)
│   ├── app-sidebar.tsx       # Sidebar navigation component
│   ├── login-form.tsx        # Authentication forms
│   └── notifications/        # Notification system
├── lib/                      # Utilities and configurations
│   ├── firebase/            # Firebase configuration
│   ├── store/               # Zustand state management
│   ├── types/               # TypeScript type definitions
│   ├── utils.ts             # Utility functions
│   └── dummyData.json       # Development/demo data
├── hooks/                    # Custom React hooks
├── fonts/                    # Custom font files (Geist)
└── public/                   # Static assets
    ├── assets/images/       # Logo and images
    └── sounds/              # Audio files for notifications
```

---

## 🚀 Features & Functionality

### 🏥 CareSync (Staff Portal)

#### Real-Time Dashboard
- **Live Room Status Monitoring**: Real-time tracking of room occupancy and patient status
- **Doctor Management**: Assign doctors to rooms, track patient counts
- **Status Updates**: Visual status indicators with color-coding and audio alerts
- **Emergency Alerts**: Priority emergency status with visual and audio notifications
- **Timer Tracking**: Automatic time tracking for each room status

#### Patient Management
- **Patient Information**: Comprehensive patient data management
- **Appointment Tracking**: Integration with appointment scheduling
- **Status History**: Track patient status changes over time

#### Reports & Analytics
- **Healthcare Metrics**: Patient wait times, staff efficiency, doctor availability
- **Time-based Analytics**: Custom date range reporting
- **Visual Charts**: Interactive charts for data visualization
- **Performance Insights**: Key performance indicators for clinic operations

#### Role Management
- **Doctor Management**: 
  - Profile management with specialties
  - Room assignments and availability scheduling
  - Weekly schedule management with time slots
  - Patient assignment tracking
- **Assistant Management**: Staff coordination and assignments
- **Receptionist Management**: Front desk staff management

#### Status Configuration
- **Custom Status Types**: Configurable status categories
- **Color Coding**: Visual status identification
- **Audio Notifications**: Sound alerts for specific statuses
- **Activity Types**: Categorize statuses by Patient, Doctor, or Staff activities

#### Resource Management
- **Room Management**: Room assignments and configurations
- **Equipment Tracking**: Medical equipment and resources
- **Facility Management**: Overall clinic resource coordination

### 👤 Patient Portal

#### Appointment Management
- **Multi-step Booking Process**:
  1. Provider selection with availability
  2. Date selection (calendar interface)
  3. Time slot selection
  4. Appointment type (In-person/Virtual)
  5. Confirmation and reference number
- **Rescheduling**: Easy appointment rescheduling with original appointment tracking
- **Appointment History**: View past and upcoming appointments
- **Virtual Appointments**: Video call integration support
- **Cancellation**: Appointment cancellation with confirmation

#### Profile Management
- **Personal Information**: Patient profile and contact details
- **Medical History**: Basic medical information management
- **Preferences**: Appointment and communication preferences

#### Self-Service Kiosk
- **Integrated Kiosk Mode**: Full-screen self-service interface
- **Check-in Process**: Digital check-in for appointments
- **Paperwork Completion**: Digital forms and documentation
- **QR Code Access**: Mobile device compatibility

### 🔧 Technical Features

#### Real-Time Capabilities
- **Live Updates**: Real-time status synchronization across all connected devices
- **Audio Notifications**: Contextual sound alerts for status changes
- **Timer System**: Automatic time tracking with visual indicators

#### State Management
- **Zustand Stores**: Centralized state management for:
  - Doctor management (`useDoctorStore`)
  - Room management (`useRoomStore`)
  - Status management (`useStatusStore`)
  - Assistant management (`useAssistantStore`)
  - Receptionist management (`useReceptionistStore`)

#### Data Persistence
- **Firebase Integration**: Cloud-based data storage and authentication
- **Local Storage**: Client-side data persistence for offline capability
- **Session Management**: Secure user session handling

#### Responsive Design
- **Mobile-First**: Optimized for mobile devices and tablets
- **Desktop Support**: Full desktop functionality
- **Touch-Friendly**: Kiosk-optimized touch interface

---

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js**: Version 18.0 or higher
- **pnpm**: Package manager (recommended) or npm/yarn
- **Firebase Account**: For backend services

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ytfcs-shg
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Configuration**
   Create `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Firebase Setup**
   - Create a Firebase project
   - Enable Authentication (Email/Password)
   - Create Firestore database
   - Configure Storage bucket
   - Update Firebase configuration in `lib/firebase/config.ts`

### Development

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint
```

The application will be available at `http://localhost:3000`

---

## 📱 User Interfaces

### Home Page (`/`)
- **Navigation Hub**: Central navigation to different system areas
- **Role Selection**: Direct access to CareSync (staff) or Patient portals
- **Kiosk Access**: Quick access to kiosk functionality

### CareSync Portal (`/caresync`)
- **Dashboard**: Real-time room and doctor status monitoring
- **Patients**: Patient management and tracking
- **Reports**: Analytics and performance metrics
- **Roles**: Staff management (doctors, assistants, receptionists)
- **Status**: Status configuration and management
- **Resources**: Clinic resource management

### Patient Portal (`/patient`)
- **Appointments**: Booking, rescheduling, and appointment management
- **Profile**: Personal information and preferences
- **Kiosk**: Self-service check-in system

---

## 🔐 Authentication & Security

### Authentication Flow
- **Firebase Authentication**: Secure user authentication
- **Role-Based Access**: Different access levels for staff and patients
- **Session Management**: Secure session handling
- **Protected Routes**: Route protection based on authentication status

### Security Features
- **Data Validation**: Zod schema validation for forms
- **Secure API Calls**: Firebase security rules
- **Client-Side Protection**: Protected routes and components

---

## 📊 Data Models

### Core Entities

#### Doctor
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

#### Room
```typescript
interface Room {
  id: string;
  number: number;
  doctorStatuses: { [doctorId: string]: DoctorStatus };
  isEmergency: boolean;
  doctorsAssigned: string[];
}
```

#### Status
```typescript
interface Status {
  id: string;
  name: string;
  color: string;
  hasSound: boolean;
  activityType: 'Patient' | 'Doctor' | 'Staff';
}
```

#### Appointment
```typescript
interface Appointment {
  id: string;
  provider: string;
  providerId: number;
  specialty: string;
  date: Date;
  time: string;
  type: 'In-person' | 'Virtual';
  location: string;
  status: string;
  notes: string;
  originalDate?: Date;
  originalTime?: string;
}
```

---

## 🎨 UI/UX Design

### Design System
- **Color Scheme**: Healthcare-focused professional color palette
- **Typography**: Geist font family for modern, readable interface
- **Component Library**: Custom components built on Radix UI primitives
- **Responsive Layout**: Mobile-first responsive design

### Visual Elements
- **Status Indicators**: Color-coded status system with icons
- **Real-time Updates**: Live data visualization
- **Interactive Charts**: Data visualization for analytics
- **Audio Feedback**: Sound notifications for important events

### Accessibility
- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **High Contrast**: Accessible color combinations
- **Touch Targets**: Appropriately sized touch targets for mobile/kiosk use

---

## 🔊 Audio System

### Notification Sounds
- **`/sounds/beep.mp3`**: General status change notifications
- **`/sounds/emergency.mp3`**: Emergency alert notifications

### Audio Features
- **Contextual Alerts**: Different sounds for different types of notifications
- **Volume Control**: Configurable audio settings
- **Status-Based**: Sounds triggered by specific status changes

---

## 📈 Performance & Optimization

### Performance Features
- **Next.js Optimization**: Built-in performance optimizations
- **Image Optimization**: Next.js Image component for optimized loading
- **Code Splitting**: Automatic code splitting for faster loading
- **Caching**: Efficient caching strategies

### Real-time Performance
- **Efficient State Updates**: Optimized state management with Zustand
- **Minimal Re-renders**: Optimized React component updates
- **WebSocket Connections**: Efficient real-time data synchronization

---

## 🚀 Deployment

### Production Build
```bash
# Create production build
pnpm build

# Test production build locally
pnpm start
```

### Deployment Platforms
- **Vercel**: Recommended for Next.js applications
- **Netlify**: Alternative deployment platform
- **Firebase Hosting**: Integration with Firebase services

### Environment Variables
Ensure all environment variables are properly configured in your deployment platform.

---

## 🧪 Testing & Development

### Development Features
- **Hot Reload**: Instant development feedback
- **TypeScript**: Type safety and development experience
- **ESLint**: Code quality and consistency
- **Dummy Data**: Sample data for development and testing

### Demo Data
The system includes comprehensive dummy data in `lib/dummyData.json` for:
- Sample doctors and specialties
- Room configurations
- Assistant and receptionist data
- Status configurations

---

## 🔧 Customization

### Theming
- **Tailwind Configuration**: Customizable design tokens
- **Color Schemes**: Configurable color palettes
- **Component Styling**: Extensible component system

### Configuration
- **Status Types**: Customizable status configurations
- **Room Setup**: Flexible room and doctor assignments
- **Appointment Types**: Configurable appointment categories

---

## 📞 Support & Maintenance

### System Monitoring
- **Error Handling**: Comprehensive error management
- **Logging**: Console logging for debugging
- **Performance Monitoring**: Built-in performance tracking

### Updates & Maintenance
- **Version Control**: Git-based version management
- **Database Migrations**: Firebase-based data migrations
- **Backup Systems**: Firebase automatic backups

---

## 📝 License & Credits

This healthcare management system is designed specifically for YTFCS (Your Total Foot Care Specialist) clinic operations.

### Technologies Used
- Next.js & React
- TypeScript
- Tailwind CSS
- Firebase
- Radix UI
- Zustand
- And many other open-source libraries

---

## 🤝 Contributing

### Development Guidelines
1. Follow TypeScript best practices
2. Maintain consistent code formatting
3. Write meaningful component and function names
4. Test changes thoroughly before committing
5. Update documentation for new features

### Code Style
- Use TypeScript for all new code
- Follow ESLint configuration
- Use Tailwind CSS for styling
- Implement responsive design principles

---

*This documentation provides a comprehensive overview of the YTFCS Healthcare Management System. For specific implementation details, refer to the source code and component documentation.*
