'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StepComponentProps } from '@/lib/types/kiosk';
import { ArrowRight, Stethoscope, Shield, Clock } from 'lucide-react';

export default function WelcomeStep({ onNext }: StepComponentProps) {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
            <Stethoscope className="w-8 h-8" />
          </div>
          <CardTitle className="text-3xl font-bold">
            Welcome to YTFCS Healthcare
          </CardTitle>
          <p className="text-blue-100 text-lg">
            Thank you for choosing our healthcare services. Let&apos;s get you checked in!
          </p>
        </CardHeader>
        <CardContent className="text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-semibold">Quick Process</h3>
              <p className="text-sm text-blue-100">
                Complete check-in in 5-10 minutes
              </p>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-semibold">Secure & Private</h3>
              <p className="text-sm text-blue-100">
                Your information is protected
              </p>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="font-semibold">Quality Care</h3>
              <p className="text-sm text-blue-100">
                Professional healthcare services
              </p>
            </div>
          </div>
          
          <Button 
            onClick={() => onNext({})}
            size="lg"
            variant="secondary"
            className="text-lg px-8 py-3 bg-white text-blue-600 hover:bg-blue-50"
          >
            Start Check-in
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              What You&apos;ll Need:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Valid ID or Insurance Card</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Current Medications List</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Emergency Contact Information</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Medical History Details</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
