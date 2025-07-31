'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StepComponentProps, CheckInStep } from '@/lib/types/kiosk';
import { useKioskStore } from '@/lib/store/kiosk/useKioskStore';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  User, 
  MapPin, 
  AlertTriangle, 
  Pill, 
  Users, 
  Coffee, 
  Footprints, 
  FileText, 
  MessageSquare,
  Edit,
  Heart,
  Scissors,
  Camera
} from 'lucide-react';

export default function ReviewStep({ data, onNext, onBack }: StepComponentProps) {
  const { enterEditMode } = useKioskStore();

  const formatDate = (day: string, month: string, year: string) => {
    if (!day || !month || !year) return 'Not provided';
    return `${month}/${day}/${year}`;
  };

  const handleSubmit = () => {
    onNext(data);
  };

  const goToStep = (step: string) => {
    enterEditMode(step as CheckInStep, 'review');
  };

  const renderEditButton = (stepName: string, label: string) => (
    <Button
      variant="outline"
      size="sm"
      onClick={() => goToStep(stepName)}
      className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
    >
      <Edit className="w-3 h-3" />
      <span>Edit {label}</span>
    </Button>
  );

  const isDataComplete = () => {
    return !!(
      data.userInfo?.fullName &&
      data.demographicsInfo?.address &&
      data.demographicsInfo?.email &&
      data.demographicsInfo?.phone &&
      data.hippaPolicy?.signature &&
      data.practicePolicies?.signature &&
      data.survey?.answer
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span>Review Your Information</span>
          </CardTitle>
          <p className="text-gray-600">
            Please review all the information you&apos;ve provided. Click &quot;Edit&quot; next to any section to make changes.
            {/* Add a subtle indicator that changes are saved automatically */}
            <br />
            <span className="text-sm text-green-600 mt-1 inline-block">
              ✓ Any changes you make will be automatically saved and you&apos;ll return here to continue.
            </span>
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Personal Information */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-blue-600" />
                <h3 className="font-medium text-gray-900">Personal Information</h3>
              </div>
              {renderEditButton('user-info', 'Personal Info')}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Full Name:</span> 
                <span className={!data.userInfo?.fullName ? 'text-red-500' : 'text-gray-700'}>
                  {data.userInfo?.fullName || 'Not provided'}
                </span>
              </div>
              <div>
                <span className="font-medium">Date of Birth:</span> 
                <span className={!data.userInfo?.day || !data.userInfo?.month || !data.userInfo?.year ? 'text-red-500' : 'text-gray-700'}>
                  {formatDate(
                    data.userInfo?.day || '', 
                    data.userInfo?.month || '', 
                    data.userInfo?.year || ''
                  )}
                </span>
              </div>
              <div>
                <span className="font-medium">Location:</span> 
                <span className={!data.userInfo?.location ? 'text-red-500' : 'text-gray-700'}>
                  {data.userInfo?.location || 'Not provided'}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <h3 className="font-medium text-gray-900">Contact Information</h3>
              </div>
              {renderEditButton('demographics', 'Contact Info')}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Address:</span> 
                <span className={!data.demographicsInfo?.address ? 'text-red-500' : 'text-gray-700'}>
                  {data.demographicsInfo?.address || 'Not provided'}
                  {data.demographicsInfo?.address2 && `, ${data.demographicsInfo.address2}`}
                </span>
              </div>
              <div>
                <span className="font-medium">City, State ZIP:</span> 
                <span className={!data.demographicsInfo?.city || !data.demographicsInfo?.state || !data.demographicsInfo?.zipcode ? 'text-red-500' : 'text-gray-700'}>
                  {data.demographicsInfo?.city && data.demographicsInfo?.state && data.demographicsInfo?.zipcode
                    ? `${data.demographicsInfo.city}, ${data.demographicsInfo.state} ${data.demographicsInfo.zipcode}`
                    : 'Not provided'
                  }
                </span>
              </div>
              <div>
                <span className="font-medium">Phone:</span> 
                <span className={!data.demographicsInfo?.phone ? 'text-red-500' : 'text-gray-700'}>
                  {data.demographicsInfo?.phone || 'Not provided'}
                </span>
              </div>
              <div>
                <span className="font-medium">Email:</span> 
                <span className={!data.demographicsInfo?.email ? 'text-red-500' : 'text-gray-700'}>
                  {data.demographicsInfo?.email || 'Not provided'}
                </span>
              </div>
              {data.demographicsInfo?.patientsPicture && (
                <div className="md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <Camera className="w-4 h-4 text-gray-600" />
                    <span className="font-medium">Patient Photo:</span> 
                    <span className="text-green-600">Provided</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Allergies */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <h3 className="font-medium text-gray-900">Allergies</h3>
              </div>
              {renderEditButton('allergies', 'Allergies')}
            </div>
            <div className="text-sm">
              {data.allergies && data.allergies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {data.allergies.map((allergy, index) => (
                    <span key={index} className="bg-red-50 text-red-800 px-2 py-1 rounded text-xs">
                      {allergy}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-gray-500">No known allergies</span>
              )}
            </div>
          </div>

          {/* Current Medications */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Pill className="w-4 h-4 text-blue-600" />
                <h3 className="font-medium text-gray-900">Current Medications</h3>
              </div>
              {renderEditButton('medications', 'Medications')}
            </div>
            <div className="text-sm">
              {data.medications && data.medications.length > 0 ? (
                <div className="space-y-1">
                  {data.medications.map((medication, index) => (
                    <div key={index} className="bg-blue-50 text-blue-800 px-2 py-1 rounded text-xs">
                      {medication}
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-gray-500">No current medications</span>
              )}
            </div>
          </div>

          {/* Family History */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-purple-600" />
                <h3 className="font-medium text-gray-900">Family History</h3>
              </div>
              {renderEditButton('family-history', 'Family History')}
            </div>
            <div className="text-sm">
              {data.familyHistory && Object.keys(data.familyHistory).length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(data.familyHistory).map(([condition, value]) => (
                    <div key={condition} className="flex justify-between">
                      <span className="capitalize">{condition.replace(/([A-Z])/g, ' $1')}:</span>
                      <span className={value === 'yes' ? 'text-red-600' : 'text-green-600'}>
                        {value === 'yes' ? 'Yes' : 'No'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-gray-500">No family history provided</span>
              )}
            </div>
          </div>

          {/* Medical History */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4 text-red-600" />
                <h3 className="font-medium text-gray-900">Medical History</h3>
              </div>
              {renderEditButton('medical-history', 'Medical History')}
            </div>
            <div className="text-sm">
              {data.medicalHistory && data.medicalHistory.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {data.medicalHistory.map((condition, index) => (
                    <span key={index} className="bg-blue-50 text-blue-800 px-2 py-1 rounded text-xs">
                      {condition}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-gray-500">No significant medical history</span>
              )}
            </div>
          </div>

          {/* Surgical History */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Scissors className="w-4 h-4 text-purple-600" />
                <h3 className="font-medium text-gray-900">Surgical History</h3>
              </div>
              {renderEditButton('surgical-history', 'Surgical History')}
            </div>
            <div className="text-sm">
              {data.surgicalHistory && data.surgicalHistory.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {data.surgicalHistory.map((surgery, index) => (
                    <span key={index} className="bg-purple-50 text-purple-800 px-2 py-1 rounded text-xs">
                      {surgery}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-gray-500">No surgical history</span>
              )}
            </div>
          </div>

          {/* Social History */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Coffee className="w-4 h-4 text-amber-600" />
                <h3 className="font-medium text-gray-900">Social History</h3>
              </div>
              {renderEditButton('social-history', 'Social History')}
            </div>
            <div className="text-sm">
              {data.socialHistory ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <span className="font-medium">Smoking:</span> {data.socialHistory.smoke?.replace('-', ' ') || 'Not specified'}
                  </div>
                  {data.socialHistory.alcohol && (
                    <div>
                      <span className="font-medium">Alcohol:</span> {data.socialHistory.alcohol}
                    </div>
                  )}
                  {data.socialHistory.exercise && (
                    <div>
                      <span className="font-medium">Exercise:</span> {data.socialHistory.exercise}
                    </div>
                  )}
                  {data.socialHistory.occupation && (
                    <div>
                      <span className="font-medium">Occupation:</span> {data.socialHistory.occupation}
                    </div>
                  )}
                  {data.socialHistory.maritalStatus && (
                    <div>
                      <span className="font-medium">Marital Status:</span> {data.socialHistory.maritalStatus}
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-gray-500">No social history provided</span>
              )}
            </div>
          </div>

          {/* Shoe Size */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Footprints className="w-4 h-4 text-gray-600" />
                <h3 className="font-medium text-gray-900">Shoe Size</h3>
              </div>
              {renderEditButton('shoe-size', 'Shoe Size')}
            </div>
            <div className="text-sm">
              {data.shoeSize ? (
                <span><span className="font-medium">US Size:</span> {data.shoeSize.shoeSize}</span>
              ) : (
                <span className="text-gray-500">No shoe size provided</span>
              )}
            </div>
          </div>

          {/* Pre-Visit Survey */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-green-600" />
                <h3 className="font-medium text-gray-900">Pre-Visit Survey</h3>
              </div>
              {renderEditButton('survey', 'Survey')}
            </div>
            <div className="text-sm">
              {data.survey ? (
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Main reason for visit:</span>
                    <div className="mt-1 p-2 bg-gray-50 rounded text-xs">
                      {data.survey.answer || 'Not provided'}
                    </div>
                  </div>
                </div>
              ) : (
                <span className="text-red-500">Survey not completed - Required</span>
              )}
            </div>
          </div>

          {/* Digital Signatures */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <h3 className="font-medium text-gray-900">Digital Signatures</h3>
              </div>
              <div className="space-x-2">
                {renderEditButton('hippa-policy', 'HIPAA')}
                {renderEditButton('practice-policies', 'Policies')}
              </div>
            </div>
            <div className="text-sm space-y-2">
              <div className="flex items-center space-x-2">
                {data.hippaPolicy?.signature ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <div className="w-4 h-4 border border-gray-300 rounded"></div>
                )}
                <span className={!data.hippaPolicy?.signature ? 'text-red-500' : 'text-gray-700'}>
                  HIPAA Privacy Policy - {data.hippaPolicy?.signature ? 'Signed' : 'Not signed (Required)'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {data.practicePolicies?.signature ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <div className="w-4 h-4 border border-gray-300 rounded"></div>
                )}
                <span className={!data.practicePolicies?.signature ? 'text-red-500' : 'text-gray-700'}>
                  Practice Policies - {data.practicePolicies?.signature ? 'Signed' : 'Not signed (Required)'}
                </span>
              </div>
            </div>
          </div>

          {/* Completion Status */}
          {!isDataComplete() && (
            <div className="border border-red-200 bg-red-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-red-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">Please complete all required sections before submitting:</span>
              </div>
              <ul className="mt-2 text-sm text-red-600 list-disc list-inside">
                {!data.userInfo?.fullName && <li>Personal Information (Name and Date of Birth)</li>}
                {!data.demographicsInfo?.address && <li>Contact Information (Address, Phone, Email)</li>}
                {!data.survey?.answer && <li>Pre-Visit Survey (Reason for visit)</li>}
                {!data.hippaPolicy?.signature && <li>HIPAA Privacy Policy Signature</li>}
                {!data.practicePolicies?.signature && <li>Practice Policies Signature</li>}
              </ul>
            </div>
          )}

        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>
        
        <Button 
          onClick={handleSubmit}
          disabled={!isDataComplete()}
          className={`flex items-center space-x-2 ${
            isDataComplete() 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          <span>Submit Check-in</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
