'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { SignatureComponentProps } from '@/lib/types/kiosk';
import { ArrowLeft, ArrowRight, FileText, RotateCcw } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';

const HIPAA_POLICY_TEXT = `
HIPAA PRIVACY NOTICE

This notice describes how medical information about you may be used and disclosed and how you can get access to this information. Please review it carefully.

Your Health Information:
• We may use your health information for treatment, payment, and healthcare operations
• We may share your information with other healthcare providers involved in your care
• We may use your information for appointment reminders and health-related communications

Your Rights:
• You have the right to request restrictions on certain uses and disclosures
• You have the right to request confidential communications
• You have the right to inspect and copy your health information
• You have the right to request amendments to your health information

By signing below, you acknowledge that you have received and understand this notice.
`;

export default function HippaPolicyStep({ data, onNext, onBack }: SignatureComponentProps) {
  const [hasRead, setHasRead] = useState(false);
  const [signature, setSignature] = useState<string>(data.hippaPolicy?.signature || '');
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
        hippaPolicy: { signature } 
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>HIPAA Privacy Policy</span>
          </CardTitle>
          <p className="text-gray-600">
            Please review and acknowledge our HIPAA privacy policy by reading the policy and providing your digital signature.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Policy Text */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 max-h-64 overflow-y-auto">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
              {HIPAA_POLICY_TEXT}
            </pre>
          </div>

          {/* Acknowledgment Checkbox */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="hasRead"
              checked={hasRead}
              onChange={(e) => setHasRead(e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <Label htmlFor="hasRead" className="text-sm">
              I have read and understand the HIPAA Privacy Notice above. I acknowledge receipt of this notice.
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
                Please sign above to acknowledge the HIPAA policy
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
