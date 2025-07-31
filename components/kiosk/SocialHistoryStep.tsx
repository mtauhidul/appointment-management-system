'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { StepComponentProps, SocialHistory } from '@/lib/types/kiosk';
import { ArrowLeft, ArrowRight, Coffee } from 'lucide-react';

export default function SocialHistoryStep({ data, onNext, onBack }: StepComponentProps) {
  const [socialHistory, setSocialHistory] = useState<SocialHistory>(
    data.socialHistory || { smoke: 'non-smoker' }
  );

  const updateSocialHistory = (key: string, value: string) => {
    setSocialHistory({
      ...socialHistory,
      [key]: value
    });
  };

  const handleContinue = () => {
    onNext({ socialHistory });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Coffee className="w-5 h-5" />
            <span>Social History</span>
          </CardTitle>
          <p className="text-gray-600">
            Please provide information about your lifestyle habits. This information is confidential and helps us provide better care.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Smoking Status */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Smoking Status</Label>
            <Select
              value={socialHistory.smoke}
              onValueChange={(value: 'smoker' | 'non-smoker' | 'former-smoker') => 
                updateSocialHistory('smoke', value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="non-smoker">Non-smoker</SelectItem>
                <SelectItem value="former-smoker">Former smoker</SelectItem>
                <SelectItem value="smoker">Current smoker</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Alcohol Consumption */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Alcohol Consumption</Label>
            <Select
              value={socialHistory.alcohol || 'none'}
              onValueChange={(value) => updateSocialHistory('alcohol', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select alcohol consumption" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">I don&apos;t drink alcohol</SelectItem>
                <SelectItem value="occasional">Occasional (1-2 drinks per week)</SelectItem>
                <SelectItem value="moderate">Moderate (3-7 drinks per week)</SelectItem>
                <SelectItem value="heavy">Heavy (8+ drinks per week)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Exercise */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Exercise Frequency</Label>
            <Select
              value={socialHistory.exercise || 'none'}
              onValueChange={(value) => updateSocialHistory('exercise', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select exercise frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No regular exercise</SelectItem>
                <SelectItem value="light">Light exercise (1-2 times per week)</SelectItem>
                <SelectItem value="moderate">Moderate exercise (3-4 times per week)</SelectItem>
                <SelectItem value="frequent">Frequent exercise (5+ times per week)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Occupation */}
          <div className="space-y-3">
            <Label htmlFor="occupation" className="text-base font-medium">Occupation</Label>
            <Input
              id="occupation"
              value={socialHistory.occupation || ''}
              onChange={(e) => updateSocialHistory('occupation', e.target.value)}
              placeholder="Enter your occupation"
            />
          </div>

          {/* Marital Status */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Marital Status</Label>
            <Select
              value={socialHistory.maritalStatus || 'single'}
              onValueChange={(value) => updateSocialHistory('maritalStatus', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select marital status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="married">Married</SelectItem>
                <SelectItem value="divorced">Divorced</SelectItem>
                <SelectItem value="widowed">Widowed</SelectItem>
                <SelectItem value="partnered">Domestic Partner</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              <strong>Privacy Note:</strong> All information provided is confidential and protected by HIPAA. This information helps your healthcare team provide personalized care.
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
