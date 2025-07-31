'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { StepComponentProps, Survey } from '@/lib/types/kiosk';
import { ArrowLeft, ArrowRight, MessageSquare } from 'lucide-react';

const SURVEY_QUESTIONS = [
  {
    id: 'reason-for-visit',
    question: 'What is the main reason for your visit today?',
    type: 'textarea',
    required: true
  },
  {
    id: 'pain-level',
    question: 'On a scale of 0-10, what is your current pain level? (0 = no pain, 10 = worst pain)',
    type: 'select',
    options: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    required: false
  },
  {
    id: 'symptoms-duration',
    question: 'How long have you been experiencing your current symptoms?',
    type: 'select',
    options: [
      'Less than 24 hours',
      '1-3 days',
      '4-7 days',
      '1-2 weeks',
      '2-4 weeks',
      '1-3 months',
      '3-6 months',
      'More than 6 months'
    ],
    required: false
  },
  {
    id: 'overall-health',
    question: 'How would you rate your overall health?',
    type: 'select',
    options: ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'],
    required: false
  },
  {
    id: 'additional-concerns',
    question: 'Do you have any additional concerns or questions you would like to discuss with your healthcare provider?',
    type: 'textarea',
    required: false
  }
];

export default function SurveyStep({ data, onNext, onBack }: StepComponentProps) {
  const [answers, setAnswers] = useState<Record<string, string>>(
    data.survey ? { [data.survey.question]: data.survey.answer } : {}
  );

  const updateAnswer = (questionId: string, answer: string) => {
    setAnswers({
      ...answers,
      [questionId]: answer
    });
  };

  const handleContinue = () => {
    // Convert answers to the expected Survey format
    // For now, we'll use the first question as the primary survey data
    const primaryQuestion = SURVEY_QUESTIONS.find(q => q.required);
    const survey: Survey = {
      question: primaryQuestion?.question || 'Reason for visit',
      answer: answers[primaryQuestion?.id || 'reason-for-visit'] || ''
    };

    onNext({ survey });
  };

  const isValid = () => {
    const requiredQuestions = SURVEY_QUESTIONS.filter(q => q.required);
    return requiredQuestions.every(q => answers[q.id]?.trim());
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Pre-Visit Survey</span>
          </CardTitle>
          <p className="text-gray-600">
            Please answer a few questions to help us better understand your visit and prepare for your appointment.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {SURVEY_QUESTIONS.map((question) => (
            <div key={question.id} className="space-y-3">
              <Label className="text-base font-medium">
                {question.question}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </Label>

              {question.type === 'textarea' ? (
                <Textarea
                  value={answers[question.id] || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateAnswer(question.id, e.target.value)}
                  placeholder="Please provide details..."
                  rows={3}
                  className="w-full"
                />
              ) : (
                <Select
                  value={answers[question.id] || ''}
                  onValueChange={(value) => updateAnswer(question.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Please select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {question.options?.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This information will be reviewed by your healthcare provider before your appointment to ensure they can provide the best possible care.
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
          disabled={!isValid()}
          className="flex items-center space-x-2"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
