import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { 
  PatientCheckInData, 
  CheckInStep, 
  CheckInProgress,
  ValidationError 
} from '@/lib/types/kiosk';

interface KioskState {
  // State
  progress: CheckInProgress;
  isLoading: boolean;
  errors: ValidationError[];
  isEditMode: boolean;
  returnToStep: CheckInStep | null;
  
  // Actions
  setCurrentStep: (step: CheckInStep) => void;
  markStepComplete: (step: CheckInStep) => void;
  updateData: (stepData: Partial<PatientCheckInData>) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  setLoading: (loading: boolean) => void;
  setErrors: (errors: ValidationError[]) => void;
  clearErrors: () => void;
  resetKiosk: () => void;
  submitCheckIn: () => Promise<boolean>;
  enterEditMode: (targetStep: CheckInStep, returnTo: CheckInStep) => void;
  exitEditMode: () => void;
}

const initialState: CheckInProgress = {
  currentStep: 'welcome',
  completedSteps: [],
  data: {}
};

const stepOrder: CheckInStep[] = [
  'welcome',
  'user-info',
  'demographics',
  'allergies',
  'medications',
  'family-history',
  'medical-history',
  'surgical-history',
  'social-history',
  'shoe-size',
  'hippa-policy',
  'practice-policies',
  'survey',
  'review',
  'complete'
];

export const useKioskStore = create<KioskState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        progress: initialState,
        isLoading: false,
        errors: [],
        isEditMode: false,
        returnToStep: null,

        // Actions
        setCurrentStep: (step: CheckInStep) => {
          set((state) => ({
            progress: {
              ...state.progress,
              currentStep: step
            }
          }));
        },

        markStepComplete: (step: CheckInStep) => {
          set((state) => ({
            progress: {
              ...state.progress,
              completedSteps: Array.from(new Set([...state.progress.completedSteps, step]))
            }
          }));
        },

        updateData: (stepData: Partial<PatientCheckInData>) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('Updating data:', { stepData, currentData: get().progress.data });
          }
          set((state) => ({
            progress: {
              ...state.progress,
              data: {
                ...state.progress.data,
                ...stepData
              }
            }
          }));
          if (process.env.NODE_ENV === 'development') {
            console.log('Data updated:', get().progress.data);
          }
        },

        goToNextStep: () => {
          const { progress, isEditMode, returnToStep } = get();
          
          // If in edit mode, return to the specified step instead of following normal flow
          if (isEditMode && returnToStep) {
            set((state) => ({
              progress: {
                ...state.progress,
                currentStep: returnToStep
              },
              isEditMode: false,
              returnToStep: null
            }));
            return;
          }
          
          const currentIndex = stepOrder.indexOf(progress.currentStep);
          
          if (currentIndex < stepOrder.length - 1) {
            const nextStep = stepOrder[currentIndex + 1];
            
            set((state) => ({
              progress: {
                ...state.progress,
                currentStep: nextStep,
                completedSteps: Array.from(new Set([...state.progress.completedSteps, progress.currentStep]))
              }
            }));
          }
        },

        goToPreviousStep: () => {
          const { progress } = get();
          const currentIndex = stepOrder.indexOf(progress.currentStep);
          
          if (currentIndex > 0) {
            const previousStep = stepOrder[currentIndex - 1];
            
            set((state) => ({
              progress: {
                ...state.progress,
                currentStep: previousStep
              }
            }));
          }
        },

        setLoading: (loading: boolean) => {
          set({ isLoading: loading });
        },

        setErrors: (errors: ValidationError[]) => {
          set({ errors });
        },

        clearErrors: () => {
          set({ errors: [] });
        },

        resetKiosk: () => {
          set({
            progress: initialState,
            isLoading: false,
            errors: [],
            isEditMode: false,
            returnToStep: null
          });
        },

        enterEditMode: (targetStep: CheckInStep, returnTo: CheckInStep) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('Entering edit mode:', { targetStep, returnTo, currentData: get().progress.data });
          }
          set({
            isEditMode: true,
            returnToStep: returnTo,
            progress: {
              ...get().progress,
              currentStep: targetStep
            }
          });
        },

        exitEditMode: () => {
          set({
            isEditMode: false,
            returnToStep: null
          });
        },

        submitCheckIn: async () => {
          const { progress, setLoading } = get();
          
          try {
            setLoading(true);
            
            // TODO: Implement API call to submit check-in data
            // For now, simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            console.log('Submitting check-in data:', progress.data);
            
            // Reset after successful submission
            set({
              progress: { ...initialState, currentStep: 'complete' },
              isLoading: false,
              errors: [],
              isEditMode: false,
              returnToStep: null
            });
            
            return true;
          } catch (error) {
            console.error('Error submitting check-in:', error);
            setLoading(false);
            return false;
          }
        }
      }),
      {
        name: 'kiosk-patient-checkin-v1',
        partialize: (state) => ({ 
          progress: state.progress,
          isEditMode: state.isEditMode,
          returnToStep: state.returnToStep
        })
      }
    )
  )
);

// Utility functions
export const useKioskProgress = () => {
  const { progress } = useKioskStore();
  const currentIndex = stepOrder.indexOf(progress.currentStep);
  const totalSteps = stepOrder.length - 2; // Exclude welcome and complete
  const completedCount = progress.completedSteps.length;
  
  return {
    currentStep: progress.currentStep,
    currentIndex,
    totalSteps,
    completedCount,
    progressPercentage: Math.round((completedCount / totalSteps) * 100),
    isFirstStep: currentIndex === 0,
    isLastStep: currentIndex === stepOrder.length - 1
  };
};

export const getStepTitle = (step: CheckInStep): string => {
  const titles: Record<CheckInStep, string> = {
    'welcome': 'Welcome',
    'user-info': 'Personal Information',
    'demographics': 'Demographics',
    'allergies': 'Allergies',
    'medications': 'Current Medications',
    'family-history': 'Family History',
    'medical-history': 'Medical History',
    'surgical-history': 'Surgical History',
    'social-history': 'Social History',
    'shoe-size': 'Shoe Size',
    'hippa-policy': 'HIPAA Policy',
    'practice-policies': 'Practice Policies',
    'survey': 'Survey',
    'review': 'Review Information',
    'complete': 'Check-in Complete'
  };
  
  return titles[step] || step;
};
