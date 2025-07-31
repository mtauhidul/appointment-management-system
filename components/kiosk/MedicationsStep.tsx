'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StepComponentProps } from '@/lib/types/kiosk';
import { ArrowLeft, ArrowRight, Pill, Plus, X } from 'lucide-react';

export default function MedicationsStep({ data, onNext, onBack }: StepComponentProps) {
  const [medications, setMedications] = useState<string[]>(data.medications || []);
  const [newMedication, setNewMedication] = useState('');

  const addMedication = () => {
    if (newMedication.trim() && !medications.includes(newMedication.trim())) {
      setMedications([...medications, newMedication.trim()]);
      setNewMedication('');
    }
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    onNext({ medications });
  };

  const handleNoMedications = () => {
    setMedications([]);
    onNext({ medications: [] });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Pill className="w-5 h-5" />
            <span>Current Medications</span>
          </CardTitle>
          <p className="text-gray-600">
            Please list all medications you are currently taking, including over-the-counter drugs and supplements.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Medications List */}
          {medications.length > 0 && (
            <div className="space-y-2">
              <Label>Your Current Medications:</Label>
              <div className="space-y-2">
                {medications.map((medication, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-3"
                  >
                    <span className="text-blue-800 font-medium">{medication}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMedication(index)}
                      className="text-blue-600 hover:text-blue-800 h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Medication */}
          <div className="space-y-3">
            <Label>Add Medication:</Label>
            <div className="flex space-x-2">
              <Input
                value={newMedication}
                onChange={(e) => setNewMedication(e.target.value)}
                placeholder="Enter medication name and dosage (e.g., Lisinopril 10mg)"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addMedication();
                  }
                }}
                className="flex-1"
              />
              <Button
                onClick={addMedication}
                disabled={!newMedication.trim() || medications.includes(newMedication.trim())}
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              Include the medication name, strength, and how often you take it
            </p>
          </div>

          {/* Examples */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <Label className="text-sm font-medium text-gray-700">Examples:</Label>
            <ul className="text-sm text-gray-600 mt-2 space-y-1">
              <li>• Lisinopril 10mg - once daily</li>
              <li>• Metformin 500mg - twice daily with meals</li>
              <li>• Vitamin D3 1000 IU - once daily</li>
              <li>• Ibuprofen 200mg - as needed for pain</li>
            </ul>
          </div>

          {/* No Medications Option */}
          <div className="border-t pt-4">
            <Button
              variant="outline"
              onClick={handleNoMedications}
              className="w-full flex items-center justify-center space-x-2"
            >
              <span>I am not currently taking any medications</span>
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
