'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StepComponentProps } from '@/lib/types/kiosk';
import { ArrowLeft, ArrowRight, Scissors, Plus, X } from 'lucide-react';

const COMMON_SURGERIES = [
  'Appendectomy',
  'Gallbladder Surgery',
  'Hernia Repair',
  'Tonsillectomy',
  'Knee Surgery',
  'Hip Replacement',
  'Cataract Surgery',
  'Colonoscopy',
  'Endoscopy',
  'Heart Surgery',
  'Cesarean Section',
  'Hysterectomy',
  'Back Surgery',
  'Shoulder Surgery',
  'Skin Cancer Removal',
  'Dental Surgery'
];

export default function SurgicalHistoryStep({ data, onNext, onBack }: StepComponentProps) {
  const [surgicalHistory, setSurgicalHistory] = useState<string[]>(data.surgicalHistory || []);
  const [customSurgery, setCustomSurgery] = useState('');

  const addCommonSurgery = (surgery: string) => {
    if (!surgicalHistory.includes(surgery)) {
      setSurgicalHistory([...surgicalHistory, surgery]);
    }
  };

  const addCustomSurgery = () => {
    if (customSurgery.trim() && !surgicalHistory.includes(customSurgery.trim())) {
      setSurgicalHistory([...surgicalHistory, customSurgery.trim()]);
      setCustomSurgery('');
    }
  };

  const removeSurgery = (index: number) => {
    setSurgicalHistory(surgicalHistory.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    onNext({ surgicalHistory });
  };

  const handleNoSurgeries = () => {
    setSurgicalHistory([]);
    onNext({ surgicalHistory: [] });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Scissors className="w-5 h-5" />
            <span>Surgical History</span>
          </CardTitle>
          <p className="text-gray-600">
            Please select any surgeries or procedures you have had in the past, including minor procedures.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Surgery History */}
          {surgicalHistory.length > 0 && (
            <div className="space-y-2">
              <Label>Your Surgical History:</Label>
              <div className="flex flex-wrap gap-2">
                {surgicalHistory.map((surgery, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2"
                  >
                    <span className="text-purple-800">{surgery}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSurgery(index)}
                      className="h-4 w-4 p-0 text-purple-600 hover:text-purple-800"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Common Surgeries */}
          <div className="space-y-3">
            <Label>Common Surgeries & Procedures (click to add):</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {COMMON_SURGERIES.map((surgery) => (
                <Button
                  key={surgery}
                  variant={surgicalHistory.includes(surgery) ? "default" : "outline"}
                  size="sm"
                  onClick={() => addCommonSurgery(surgery)}
                  disabled={surgicalHistory.includes(surgery)}
                  className="justify-start text-left text-xs"
                >
                  {surgery}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Surgery Input */}
          <div className="space-y-3">
            <Label>Add Other Surgery/Procedure:</Label>
            <div className="flex space-x-2">
              <Input
                value={customSurgery}
                onChange={(e) => setCustomSurgery(e.target.value)}
                placeholder="Enter surgery/procedure name and year (e.g., Knee arthroscopy 2020)"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomSurgery();
                  }
                }}
              />
              <Button
                onClick={addCustomSurgery}
                disabled={!customSurgery.trim() || surgicalHistory.includes(customSurgery.trim())}
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              Include the year if you remember it (e.g., &quot;Hip replacement 2019&quot;)
            </p>
          </div>

          {/* No Surgeries Option */}
          <div className="border-t pt-4">
            <Button
              variant="outline"
              onClick={handleNoSurgeries}
              className="w-full flex items-center justify-center space-x-2"
            >
              <span>I have never had any surgeries or procedures</span>
            </Button>
          </div>

          {/* Information Note */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-800">
              <strong>Include:</strong> Major surgeries, minor procedures, biopsies, endoscopies, arthroscopies, cosmetic procedures, and dental surgeries.
            </p>
          </div>
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
          className="flex items-center space-x-2"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
