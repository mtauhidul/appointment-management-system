'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { SignatureComponentProps } from '@/lib/types/kiosk';
import { ArrowLeft, ArrowRight, Building, RotateCcw } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';

const PRACTICE_POLICIES_TEXT = `
PRACTICE POLICIES AND CONSENT

By signing below, I acknowledge and agree to the following practice policies:

APPOINTMENT POLICIES:
• Appointments should be cancelled at least 24 hours in advance
• A cancellation fee may apply for appointments cancelled with less than 24 hours notice
• Patients arriving more than 15 minutes late may need to reschedule

PAYMENT POLICIES:
• Payment is due at the time of service unless other arrangements have been made
• We accept cash, checks, and most major credit cards
• Patients are responsible for knowing their insurance benefits and any applicable copays

COMMUNICATION POLICIES:
• Non-urgent questions can be submitted through our patient portal
• Urgent medical concerns should be addressed by calling our office
• For medical emergencies, please call 911 or go to the nearest emergency room

TREATMENT CONSENT:
• I consent to the medical treatment and procedures deemed necessary by my healthcare provider
• I understand that no guarantee has been made regarding the outcome of treatment
• I agree to follow prescribed treatment plans and medication instructions

PRIVACY AND RECORDS:
• I understand my rights under HIPAA regarding my medical information
• I consent to the practice sharing my information as necessary for treatment, payment, and operations
• I understand I have the right to request copies of my medical records

By signing below, I acknowledge that I have read, understand, and agree to these practice policies.
`;

export default function PracticePoliciesStep({ data, onNext, onBack }: SignatureComponentProps) {
  const [hasRead, setHasRead] = useState(false);
  const [signature, setSignature] = useState<string>(data.practicePolicies?.signature || '');
  const signatureRef = useRef<SignatureCanvas>(null);

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setSignature('');
    }
  };

  const saveSignature = () => {
    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      const signatureData = signatureRef.current.toDataURL();
      setSignature(signatureData);
    }
  };

  const handleContinue = () => {
    if (signature && hasRead) {
      onNext({ 
        practicePolicies: { signature } 
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="w-5 h-5" />
            <span>Practice Policies & Consent</span>
          </CardTitle>
          <p className="text-gray-600">
            Please review and acknowledge our practice policies by reading the policies and providing your digital signature.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Policy Text */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 max-h-64 overflow-y-auto">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
              {PRACTICE_POLICIES_TEXT}
            </pre>
          </div>

          {/* Acknowledgment Checkbox */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="hasReadPolicies"
              checked={hasRead}
              onChange={(e) => setHasRead(e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <Label htmlFor="hasReadPolicies" className="text-sm">
              I have read, understand, and agree to the practice policies and consent terms above.
            </Label>
          </div>

          {/* Signature Area */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Digital Signature *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <SignatureCanvas
                ref={signatureRef}
                penColor="black"
                canvasProps={{
                  width: 500,
                  height: 200,
                  className: 'signature-canvas w-full border border-gray-200 rounded bg-white'
                }}
                onEnd={saveSignature}
              />
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Please sign above to agree to our practice policies
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={clearSignature}
                className="flex items-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Clear</span>
              </Button>
            </div>
          </div>

          {/* Status */}
          {signature && (
            <div className="flex items-center space-x-2 text-green-600">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <span className="text-sm">Signature captured</span>
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
          onClick={handleContinue}
          disabled={!signature || !hasRead}
          className="flex items-center space-x-2"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
