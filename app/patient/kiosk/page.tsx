'use client';

import { useEffect, useState } from 'react';
import { useKioskStore, useKioskProgress, getStepTitle } from '@/lib/store/kiosk/useKioskStore';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PatientCheckInData } from '@/lib/types/kiosk';

// Step Components (to be created)
import WelcomeStep from '@/components/kiosk/WelcomeStep';
import UserInfoStep from '@/components/kiosk/UserInfoStep';
import DemographicsStep from '@/components/kiosk/DemographicsStep';
import AllergiesStep from '@/components/kiosk/AllergiesStep';
import MedicationsStep from '@/components/kiosk/MedicationsStep';
import FamilyHistoryStep from '@/components/kiosk/FamilyHistoryStep';
import MedicalHistoryStep from '@/components/kiosk/MedicalHistoryStep';
import SurgicalHistoryStep from '@/components/kiosk/SurgicalHistoryStep';
import SocialHistoryStep from '@/components/kiosk/SocialHistoryStep';
import ShoeSizeStep from '@/components/kiosk/ShoeSizeStep';
import HippaPolicyStep from '@/components/kiosk/HippaPolicyStep';
import PracticePoliciesStep from '@/components/kiosk/PracticePoliciesStep';
import SurveyStep from '@/components/kiosk/SurveyStep';
import ReviewStep from '@/components/kiosk/ReviewStep';
import CompleteStep from '@/components/kiosk/CompleteStep';

export default function KioskPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const { 
    progress, 
    isLoading, 
    errors, 
    updateData, 
    goToNextStep, 
    goToPreviousStep, 
    clearErrors,
    resetKiosk 
  } = useKioskStore();

  const progressInfo = useKioskProgress();

  useEffect(() => {
    // Set mounted to true to prevent hydration mismatch
    setIsMounted(true);
    // Clear any previous errors when component mounts
    clearErrors();
  }, [clearErrors]);

  const handleNext = (stepData?: Partial<PatientCheckInData>) => {
    if (stepData) {
      updateData(stepData);
    }
    goToNextStep();
  };

  const handleBack = () => {
    goToPreviousStep();
  };

  const handleHome = () => {
    resetKiosk();
    router.push('/patient');
  };

  // Show errors if any
  useEffect(() => {
    if (errors.length > 0) {
      // Errors will be displayed in the UI instead of toast
      console.log('Kiosk errors:', errors);
    }
  }, [errors]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading kiosk...</p>
        </div>
      </div>
    );
  }

  const renderCurrentStep = () => {
    const stepProps = {
      data: progress.data,
      onNext: handleNext,
      onBack: handleBack,
      onSkip: () => goToNextStep()
    };

    switch (progress.currentStep) {
      case 'welcome':
        return <WelcomeStep {...stepProps} />;
      case 'user-info':
        return <UserInfoStep {...stepProps} />;
      case 'demographics':
        return <DemographicsStep {...stepProps} />;
      case 'allergies':
        return <AllergiesStep {...stepProps} />;
      case 'medications':
        return <MedicationsStep {...stepProps} />;
      case 'family-history':
        return <FamilyHistoryStep {...stepProps} />;
      case 'medical-history':
        return <MedicalHistoryStep {...stepProps} />;
      case 'surgical-history':
        return <SurgicalHistoryStep {...stepProps} />;
      case 'social-history':
        return <SocialHistoryStep {...stepProps} />;
      case 'shoe-size':
        return <ShoeSizeStep {...stepProps} />;
      case 'hippa-policy':
        return <HippaPolicyStep 
          {...stepProps} 
          title="HIPAA Privacy Policy" 
          description="Please review and sign the HIPAA Privacy Policy"
        />;
      case 'practice-policies':
        return <PracticePoliciesStep 
          {...stepProps} 
          title="Practice Policies" 
          description="Please review and sign our practice policies"
        />;
      case 'survey':
        return <SurveyStep {...stepProps} />;
      case 'review':
        return <ReviewStep {...stepProps} />;
      case 'complete':
        return <CompleteStep {...stepProps} />;
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Header */}
      <div className="w-full max-w-6xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">K</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Patient Check-in</h1>
              <p className="text-gray-600">YTFCS Healthcare Management</p>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            onClick={handleHome}
            className="flex items-center space-x-2"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Button>
        </div>

        {/* Progress Bar */}
        {progress.currentStep !== 'welcome' && progress.currentStep !== 'complete' && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {getStepTitle(progress.currentStep)}
                </span>
                <span className="text-sm text-gray-500">
                  {progressInfo.completedCount} of {progressInfo.totalSteps} completed
                </span>
              </div>
              <Progress 
                value={progressInfo.progressPercentage} 
                className="w-full h-2"
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Main Content */}
      <div className="w-full max-w-4xl mx-auto">
        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Processing your information...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          renderCurrentStep()
        )}
      </div>

      {/* Error Display */}
      {errors.length > 0 && (
        <div className="fixed bottom-4 right-4 max-w-md">
          <Card className="bg-red-50 border-red-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-red-800 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                Please correct the following errors:
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="list-disc list-inside text-sm text-red-700">
                {errors.map((error, index) => (
                  <li key={index}>{error.field}: {error.message}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
