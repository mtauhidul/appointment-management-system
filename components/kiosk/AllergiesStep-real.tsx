'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StepComponentProps } from '@/lib/types/kiosk';
import { ArrowLeft, ArrowRight, AlertTriangle, Plus, X, Loader2 } from 'lucide-react';
import kioskDataService from '@/lib/services/kiosk-data-service';

export default function AllergiesStep({ data, onNext, onBack }: StepComponentProps) {
  const [allergies, setAllergies] = useState<string[]>(data.allergies || []);
  const [customAllergy, setCustomAllergy] = useState('');
  const [availableAllergies, setAvailableAllergies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load real allergies from Firestore
  useEffect(() => {
    const loadAllergies = async () => {
      try {
        setLoading(true);
        const allergyList = await kioskDataService.getAllergies();
        setAvailableAllergies(allergyList);
      } catch (error) {
        console.error('Error loading allergies:', error);
        // Fallback will be used automatically by the service
        setAvailableAllergies([]);
      } finally {
        setLoading(false);
      }
    };

    loadAllergies();
  }, []);

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

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-muted-foreground">Loading allergies...</span>
            </div>
          )}

          {/* Available Allergies */}
          {!loading && availableAllergies.length > 0 && (
            <div className="space-y-3">
              <Label>Common Allergies (click to add):</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableAllergies.map((allergy) => (
                  <Button
                    key={allergy}
                    variant={allergies.includes(allergy) ? "default" : "outline"}
                    size="sm"
                    onClick={() => addCommonAllergy(allergy)}
                    disabled={allergies.includes(allergy)}
                    className="justify-start text-left text-xs"
                  >
                    {allergy}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Allergy Input */}
          <div className="space-y-3">
            <Label>Add a custom allergy:</Label>
            <div className="flex space-x-2">
              <Input
                placeholder="Enter allergy name..."
                value={customAllergy}
                onChange={(e) => setCustomAllergy(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addCustomAllergy();
                  }
                }}
              />
              <Button
                onClick={addCustomAllergy}
                disabled={!customAllergy.trim()}
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
          <Button variant="outline" onClick={handleNoAllergies}>
            No Known Allergies
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
