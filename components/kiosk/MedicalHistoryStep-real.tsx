'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StepComponentProps } from '@/lib/types/kiosk';
import { ArrowLeft, ArrowRight, Heart, Plus, X, Loader2 } from 'lucide-react';
import kioskDataService from '@/lib/services/kiosk-data-service';

export default function MedicalHistoryStep({ data, onNext, onBack }: StepComponentProps) {
  const [medicalHistory, setMedicalHistory] = useState<string[]>(data.medicalHistory || []);
  const [customCondition, setCustomCondition] = useState('');
  const [availableConditions, setAvailableConditions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load real medical conditions from Firestore
  useEffect(() => {
    const loadMedicalConditions = async () => {
      try {
        setLoading(true);
        const conditions = await kioskDataService.getMedicalConditions();
        setAvailableConditions(conditions);
      } catch (error) {
        console.error('Error loading medical conditions:', error);
        // Fallback will be used automatically by the service
        setAvailableConditions([]);
      } finally {
        setLoading(false);
      }
    };

    loadMedicalConditions();
  }, []);

  const addCommonCondition = (condition: string) => {
    if (!medicalHistory.includes(condition)) {
      setMedicalHistory([...medicalHistory, condition]);
    }
  };

  const addCustomCondition = () => {
    if (customCondition.trim() && !medicalHistory.includes(customCondition.trim())) {
      setMedicalHistory([...medicalHistory, customCondition.trim()]);
      setCustomCondition('');
    }
  };

  const removeCondition = (index: number) => {
    setMedicalHistory(medicalHistory.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    onNext({ medicalHistory });
  };

  const handleNoConditions = () => {
    setMedicalHistory([]);
    onNext({ medicalHistory: [] });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="w-5 h-5" />
            <span>Medical History</span>
          </CardTitle>
          <p className="text-gray-600">
            Please select any medical conditions you currently have or have had in the past.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Conditions */}
          {medicalHistory.length > 0 && (
            <div className="space-y-2">
              <Label>Your Medical History:</Label>
              <div className="flex flex-wrap gap-2">
                {medicalHistory.map((condition, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2"
                  >
                    <span className="text-blue-800">{condition}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCondition(index)}
                      className="h-4 w-4 p-0 text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-muted-foreground">Loading medical conditions...</span>
            </div>
          )}

          {/* Available Conditions */}
          {!loading && availableConditions.length > 0 && (
            <div className="space-y-3">
              <Label>Common Medical Conditions (click to add):</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableConditions.map((condition) => (
                  <Button
                    key={condition}
                    variant={medicalHistory.includes(condition) ? "default" : "outline"}
                    size="sm"
                    onClick={() => addCommonCondition(condition)}
                    disabled={medicalHistory.includes(condition)}
                    className="justify-start text-left text-xs"
                  >
                    {condition}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Condition Input */}
          <div className="space-y-3">
            <Label>Add a custom condition:</Label>
            <div className="flex space-x-2">
              <Input
                placeholder="Enter condition name..."
                value={customCondition}
                onChange={(e) => setCustomCondition(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addCustomCondition();
                  }
                }}
              />
              <Button
                onClick={addCustomCondition}
                disabled={!customCondition.trim()}
                size="sm"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <div className="space-x-2">
          <Button variant="outline" onClick={handleNoConditions}>
            No Medical History
          </Button>
          <Button onClick={handleContinue}>
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
