// Patient Check-in Kiosk Types

export interface UserInfo {
  fullName: string;
  day: string;
  month: string;
  year: string;
  location: string;
}

export interface DemographicsInfo {
  user: UserInfo;
  address: string;
  city: string;
  zipcode: string;
  email: string;
  address2?: string;
  state: string;
  phone: string;
  patientsPicture?: string; // Base64 encoded image
}

export interface FamilyHistory {
  diabetes: 'yes' | 'no';
  [key: string]: string; // For extensibility
}

export interface SocialHistory {
  smoke: 'smoker' | 'non-smoker' | 'former-smoker';
  [key: string]: string; // For extensibility
}

export interface ShoeSize {
  shoeSize: number;
}

export interface Signature {
  signature: string; // Base64 encoded signature image
}

export interface Survey {
  question: string;
  answer: string;
}

export interface PatientCheckInData {
  userInfo: UserInfo;
  demographicsInfo: DemographicsInfo;
  allergies: string[];
  medications: string[];
  familyHistory: FamilyHistory;
  medicalHistory: string[];
  surgicalHistory: string[];
  socialHistory: SocialHistory;
  shoeSize: ShoeSize;
  hippaPolicy: Signature;
  practicePolicies: Signature;
  survey: Survey;
}

// Form Step Types
export type CheckInStep = 
  | 'welcome'
  | 'user-info'
  | 'demographics'
  | 'allergies'
  | 'medications'
  | 'family-history'
  | 'medical-history'
  | 'surgical-history'
  | 'social-history'
  | 'shoe-size'
  | 'hippa-policy'
  | 'practice-policies'
  | 'survey'
  | 'review'
  | 'complete';

export interface CheckInProgress {
  currentStep: CheckInStep;
  completedSteps: CheckInStep[];
  data: Partial<PatientCheckInData>;
}

// Component Props Types
export interface StepComponentProps {
  data: Partial<PatientCheckInData>;
  onNext: (stepData: Partial<PatientCheckInData>) => void;
  onBack: () => void;
  onSkip?: () => void;
}

export interface SignatureComponentProps extends StepComponentProps {
  title: string;
  description: string;
  policyText?: string;
}

// Validation Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface StepValidation {
  isValid: boolean;
  errors: ValidationError[];
}
