'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StepComponentProps, UserInfo } from '@/lib/types/kiosk';
import { ArrowLeft, ArrowRight, User } from 'lucide-react';

export default function UserInfoStep({ data, onNext, onBack }: StepComponentProps) {
  const [formData, setFormData] = useState<UserInfo>({
    fullName: data.userInfo?.fullName || '',
    day: data.userInfo?.day || '',
    month: data.userInfo?.month || '',
    year: data.userInfo?.year || '',
    location: data.userInfo?.location || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  const years = Array.from({ length: 100 }, (_, i) => (new Date().getFullYear() - i).toString());

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.day) {
      newErrors.day = 'Birth day is required';
    }

    if (!formData.month) {
      newErrors.month = 'Birth month is required';
    }

    if (!formData.year) {
      newErrors.year = 'Birth year is required';
    }

    if (!formData.location) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext({ userInfo: formData });
    }
  };

  const handleInputChange = (field: keyof UserInfo, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Personal Information</span>
          </CardTitle>
          <p className="text-gray-600">
            Please provide your basic information to begin check-in.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium">
              Full Name *
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className={errors.fullName ? 'border-red-500' : ''}
            />
            {errors.fullName && (
              <p className="text-sm text-red-500">{errors.fullName}</p>
            )}
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Date of Birth *</Label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Select
                  value={formData.month}
                  onValueChange={(value) => handleInputChange('month', value)}
                >
                  <SelectTrigger className={errors.month ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month} value={month}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.month && (
                  <p className="text-xs text-red-500 mt-1">{errors.month}</p>
                )}
              </div>

              <div>
                <Select
                  value={formData.day}
                  onValueChange={(value) => handleInputChange('day', value)}
                >
                  <SelectTrigger className={errors.day ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Day" />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map((day) => (
                      <SelectItem key={day} value={day}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.day && (
                  <p className="text-xs text-red-500 mt-1">{errors.day}</p>
                )}
              </div>

              <div>
                <Select
                  value={formData.year}
                  onValueChange={(value) => handleInputChange('year', value)}
                >
                  <SelectTrigger className={errors.year ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.year && (
                  <p className="text-xs text-red-500 mt-1">{errors.year}</p>
                )}
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium">
              Location *
            </Label>
            <Select
              value={formData.location}
              onValueChange={(value) => handleInputChange('location', value)}
            >
              <SelectTrigger className={errors.location ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">Location A</SelectItem>
                <SelectItem value="B">Location B</SelectItem>
                <SelectItem value="C">Location C</SelectItem>
              </SelectContent>
            </Select>
            {errors.location && (
              <p className="text-sm text-red-500">{errors.location}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>
        
        <Button onClick={handleNext} className="flex items-center space-x-2">
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
