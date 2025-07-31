'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StepComponentProps, ShoeSize } from '@/lib/types/kiosk';
import { ArrowLeft, ArrowRight, Footprints } from 'lucide-react';

// Generate shoe sizes from 5 to 15 including half sizes
const SHOE_SIZES: number[] = [];
for (let i = 5; i <= 15; i++) {
  SHOE_SIZES.push(i);
  if (i < 15) SHOE_SIZES.push(i + 0.5);
}

export default function ShoeSizeStep({ data, onNext, onBack }: StepComponentProps) {
  const [shoeSize, setShoeSize] = useState<ShoeSize>(
    data.shoeSize || { shoeSize: 9 }
  );

  const handleShoeSizeChange = (size: string) => {
    setShoeSize({ shoeSize: parseFloat(size) });
  };

  const handleContinue = () => {
    onNext({ shoeSize });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Footprints className="w-5 h-5" />
            <span>Shoe Size</span>
          </CardTitle>
          <p className="text-gray-600">
            Please select your shoe size. This information may be helpful for certain medical assessments.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="text-base font-medium">US Shoe Size</Label>
            <Select
              value={shoeSize.shoeSize.toString()}
              onValueChange={handleShoeSizeChange}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SHOE_SIZES.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size % 1 === 0 ? size.toString() : size.toString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Why we ask:</strong> Shoe size can be relevant for diabetic foot care, orthopedic assessments, and ensuring proper fitting of medical devices if needed.
            </p>
          </div>

          {/* Size Guide */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-700 mb-2">Size Guide:</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Select your regular US shoe size</p>
              <p>• If you wear different sizes for different brands, choose the most common size</p>
              <p>• This information is optional but can be helpful for medical care</p>
            </div>
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
