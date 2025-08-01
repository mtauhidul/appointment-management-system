'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StepComponentProps, DemographicsInfo } from '@/lib/types/kiosk';
import { ArrowLeft, ArrowRight, MapPin } from 'lucide-react';
import kioskDataService from '@/lib/services/kiosk-data-service';

export default function DemographicsStep({ data, onNext, onBack }: StepComponentProps) {
  const [formData, setFormData] = useState<Partial<DemographicsInfo>>({
    address: data.demographicsInfo?.address || '',
    address2: data.demographicsInfo?.address2 || '',
    city: data.demographicsInfo?.city || '',
    state: data.demographicsInfo?.state || '',
    zipcode: data.demographicsInfo?.zipcode || '',
    phone: data.demographicsInfo?.phone || '',
    email: data.demographicsInfo?.email || '',
    user: data.userInfo || data.demographicsInfo?.user || {
      fullName: '',
      day: '',
      month: '',
      year: '',
      location: ''
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [usStates, setUsStates] = useState<Array<{ code: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);

  // Load US states data
  useEffect(() => {
    const loadStatesData = async () => {
      try {
        setLoading(true);
        const states = await kioskDataService.getUSStates();
        setUsStates(states);
      } catch (error) {
        console.error('Error loading US states:', error);
        // Fallback states list
        setUsStates([
          { code: 'AL', name: 'Alabama' },
          { code: 'AK', name: 'Alaska' },
          { code: 'AZ', name: 'Arizona' },
          { code: 'AR', name: 'Arkansas' },
          { code: 'CA', name: 'California' },
          { code: 'CO', name: 'Colorado' },
          { code: 'CT', name: 'Connecticut' },
          { code: 'DE', name: 'Delaware' },
          { code: 'FL', name: 'Florida' },
          { code: 'GA', name: 'Georgia' },
          { code: 'HI', name: 'Hawaii' },
          { code: 'ID', name: 'Idaho' },
          { code: 'IL', name: 'Illinois' },
          { code: 'IN', name: 'Indiana' },
          { code: 'IA', name: 'Iowa' },
          { code: 'KS', name: 'Kansas' },
          { code: 'KY', name: 'Kentucky' },
          { code: 'LA', name: 'Louisiana' },
          { code: 'ME', name: 'Maine' },
          { code: 'MD', name: 'Maryland' },
          { code: 'MA', name: 'Massachusetts' },
          { code: 'MI', name: 'Michigan' },
          { code: 'MN', name: 'Minnesota' },
          { code: 'MS', name: 'Mississippi' },
          { code: 'MO', name: 'Missouri' },
          { code: 'MT', name: 'Montana' },
          { code: 'NE', name: 'Nebraska' },
          { code: 'NV', name: 'Nevada' },
          { code: 'NH', name: 'New Hampshire' },
          { code: 'NJ', name: 'New Jersey' },
          { code: 'NM', name: 'New Mexico' },
          { code: 'NY', name: 'New York' },
          { code: 'NC', name: 'North Carolina' },
          { code: 'ND', name: 'North Dakota' },
          { code: 'OH', name: 'Ohio' },
          { code: 'OK', name: 'Oklahoma' },
          { code: 'OR', name: 'Oregon' },
          { code: 'PA', name: 'Pennsylvania' },
          { code: 'RI', name: 'Rhode Island' },
          { code: 'SC', name: 'South Carolina' },
          { code: 'SD', name: 'South Dakota' },
          { code: 'TN', name: 'Tennessee' },
          { code: 'TX', name: 'Texas' },
          { code: 'UT', name: 'Utah' },
          { code: 'VT', name: 'Vermont' },
          { code: 'VA', name: 'Virginia' },
          { code: 'WA', name: 'Washington' },
          { code: 'WV', name: 'West Virginia' },
          { code: 'WI', name: 'Wisconsin' },
          { code: 'WY', name: 'Wyoming' },
          { code: 'DC', name: 'District of Columbia' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadStatesData();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.address?.trim()) newErrors.address = 'Address is required';
    if (!formData.city?.trim()) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.zipcode?.trim()) newErrors.zipcode = 'ZIP code is required';
    if (!formData.phone?.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.email?.trim()) newErrors.email = 'Email is required';
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate ZIP code
    const zipRegex = /^\d{5}(-\d{4})?$/;
    if (formData.zipcode && !zipRegex.test(formData.zipcode)) {
      newErrors.zipcode = 'Please enter a valid ZIP code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      onNext({ 
        demographicsInfo: formData as DemographicsInfo,
        userInfo: formData.user 
      });
    }
  };

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length >= 6) {
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
    } else if (numbers.length >= 3) {
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    }
    return numbers;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Contact & Demographics</span>
          </CardTitle>
          <p className="text-gray-600">
            Please provide your contact and demographic information.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address">Street Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Main Street"
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address2">Address Line 2</Label>
              <Input
                id="address2"
                value={formData.address2}
                onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
                placeholder="Apt, Suite, Unit, etc. (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="City"
                className={errors.city ? 'border-red-500' : ''}
              />
              {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Select 
                value={formData.state} 
                onValueChange={(value) => setFormData({ ...formData, state: value })}
              >
                <SelectTrigger className={errors.state ? 'border-red-500' : ''}>
                  <SelectValue placeholder={loading ? "Loading states..." : "Select state"} />
                </SelectTrigger>
                <SelectContent>
                  {loading ? (
                    <SelectItem value="" disabled>
                      Loading states...
                    </SelectItem>
                  ) : (
                    usStates.map((state) => (
                      <SelectItem key={state.code} value={state.code}>
                        {state.name} ({state.code})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.state && <p className="text-sm text-red-500">{errors.state}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="zipcode">ZIP Code *</Label>
              <Input
                id="zipcode"
                value={formData.zipcode}
                onChange={(e) => setFormData({ ...formData, zipcode: e.target.value })}
                placeholder="12345"
                className={errors.zipcode ? 'border-red-500' : ''}
              />
              {errors.zipcode && <p className="text-sm text-red-500">{errors.zipcode}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => {
                  const formatted = formatPhoneNumber(e.target.value);
                  setFormData({ ...formData, phone: formatted });
                }}
                placeholder="(555) 123-4567"
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john.doe@email.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
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
