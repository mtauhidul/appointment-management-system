'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StepComponentProps, FamilyHistory } from '@/lib/types/kiosk';
import { ArrowLeft, ArrowRight, Users } from 'lucide-react';

const FAMILY_CONDITIONS = [
  { key: 'diabetes', label: 'Diabetes' },
  { key: 'heartDisease', label: 'Heart Disease' },
  { key: 'cancer', label: 'Cancer' },
  { key: 'highBloodPressure', label: 'High Blood Pressure' },
  { key: 'stroke', label: 'Stroke' },
  { key: 'mentalIllness', label: 'Mental Illness' },
  { key: 'alzheimers', label: 'Alzheimer\'s Disease' },
  { key: 'kidneyDisease', label: 'Kidney Disease' },
  { key: 'asthma', label: 'Asthma' },
  { key: 'arthritis', label: 'Arthritis' }
];

export default function FamilyHistoryStep({ data, onNext, onBack }: StepComponentProps) {
  const [familyHistory, setFamilyHistory] = useState<FamilyHistory>(
    data.familyHistory || { diabetes: 'no' }
  );

  const updateCondition = (condition: string, value: 'yes' | 'no') => {
    setFamilyHistory({
      ...familyHistory,
      [condition]: value
    });
  };

  const handleContinue = () => {
    onNext({ familyHistory });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Family Medical History</span>
          </CardTitle>
          <p className="text-gray-600">
            Please indicate if any immediate family members (parents, siblings, grandparents) have had these conditions.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            {FAMILY_CONDITIONS.map((condition) => (
              <div key={condition.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <Label className="text-base font-medium">
                  {condition.label}
                </Label>
                <Select
                  value={familyHistory[condition.key] as string || 'no'}
                  onValueChange={(value: 'yes' | 'no') => updateCondition(condition.key, value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This information helps your healthcare provider understand potential genetic predispositions and provide better care.
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
