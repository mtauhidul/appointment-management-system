# Doctor Dashboard

This is the role-specific dashboard for doctors in the CareSync system.

## Features

### Dashboard Tab
- View assigned rooms with real-time status updates
- Update room statuses (Empty, Ready, Waiting, In Progress)
- Emergency alert system
- Patient assignment tracking
- Room timer functionality

### Profile Tab
- Edit personal information (name, email, phone, specialty)
- Manage weekly availability schedule
- Add/remove time slots for each day
- View room and patient assignments

### Assistants Tab
- View assigned assistants
- See assistant contact information
- Track shared vs. exclusive assistant assignments

## Usage

1. Access via the main CareSync dashboard by clicking "Doctor Portal"
2. Navigate between tabs using the sidebar
3. For demo purposes, the first doctor in the system is used as the current user
4. In production, this would be tied to the authenticated user's role and ID

## Components

- `DoctorDashboard.tsx` - Main dashboard with room management
- `DoctorProfile.tsx` - Profile and schedule management
- `AssistantProfiles.tsx` - Assistant management and information
