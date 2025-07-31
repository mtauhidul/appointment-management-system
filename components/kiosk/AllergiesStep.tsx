'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StepComponentProps } from '@/lib/types/kiosk';
import { ArrowLeft, ArrowRight, AlertTriangle, Plus, X } from 'lucide-react';

const COMMON_ALLERGIES = [
  'Penicillin',
  'Peanuts',
  'Tree nuts',
  'Shellfish',
  'Fish',
  'Milk',
  'Eggs',
  'Soy',
  'Wheat',
  'Sulfa drugs',
  'Aspirin',
  'Latex',
  'Dust mites',
  'Pollen',
  'Pet dander',
  'Mold'
];

export default function AllergiesStep({ data, onNext, onBack }: StepComponentProps) {
  const [allergies, setAllergies] = useState<string[]>(data.allergies || []);
  const [customAllergy, setCustomAllergy] = useState('');

  const addCommonAllergy = (allergy: string) => {
    if (!allergies.includes(allergy)) {
      setAllergies([...allergies, allergy]);
    }
  };

  const addCustomAllergy = () => {
    if (customAllergy.trim() && !allergies.includes(customAllergy.trim())) {
      setAllergies([...allergies, customAllergy.trim()]);
      setCustomAllergy('');
    }
  };

  const removeAllergy = (index: number) => {
    setAllergies(allergies.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    onNext({ allergies });
  };

  const handleNoAllergies = () => {
    setAllergies([]);
    onNext({ allergies: [] });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span>Allergies</span>
          </CardTitle>
          <p className="text-gray-600">
            Please select any allergies you have. This information is important for your safety.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Allergies */}
          {allergies.length > 0 && (
            <div className="space-y-2">
              <Label>Your Selected Allergies:</Label>
              <div className="flex flex-wrap gap-2">
                {allergies.map((allergy, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
                  >
                    <span className="text-red-800">{allergy}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAllergy(index)}
                      className="h-4 w-4 p-0 text-red-600 hover:text-red-800"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Common Allergies */}
          <div className="space-y-3">
            <Label>Common Allergies (click to add):</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {COMMON_ALLERGIES.map((allergy) => (
                <Button
                  key={allergy}
                  variant={allergies.includes(allergy) ? "default" : "outline"}
                  size="sm"
                  onClick={() => addCommonAllergy(allergy)}
                  disabled={allergies.includes(allergy)}
                  className="justify-start text-left"
                >
                  {allergy}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Allergy Input */}
          <div className="space-y-3">
            <Label>Add Custom Allergy:</Label>
            <div className="flex space-x-2">
              <Input
                value={customAllergy}
                onChange={(e) => setCustomAllergy(e.target.value)}
                placeholder="Enter allergy name..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomAllergy();
                  }
                }}
              />
              <Button
                onClick={addCustomAllergy}
                disabled={!customAllergy.trim() || allergies.includes(customAllergy.trim())}
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </Button>
            </div>
          </div>

          {/* No Allergies Option */}
          <div className="border-t pt-4">
            <Button
              variant="outline"
              onClick={handleNoAllergies}
              className="w-full flex items-center justify-center space-x-2"
            >
              <span>I have no known allergies</span>
            </Button>
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
