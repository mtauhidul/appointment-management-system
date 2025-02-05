import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";

type Props = object;

export default function Kiosk({}: Props) {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { id: 1, title: "Step 1: Welcome" },
    { id: 2, title: "Step 2: Information" },
    { id: 3, title: "Step 3: Confirmation" },
    { id: 4, title: "Step 4: Complete" },
  ];

  const isLastStep = currentStep === steps.length;

  const nextStep = () => {
    if (!isLastStep) setCurrentStep((prev) => prev + 1);
  };

  const previousStep = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  return (
    <div className="flex h-full w-full items-top justify-center p-6 md:p-10 bg-gray-100">
      <Popover>
        <PopoverTrigger className="border border-primary p-2 px-4 cursor-pointer rounded-lg text-primary font-semibold text-sm hover:bg-primary hover:text-white h-10">
          Start KIOSK
        </PopoverTrigger>
        {/* Full available area covering  */}
        <PopoverContent className="w-96">
          <div className="p-4 space-y-6">
            {/* Progress Stepper */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className={`flex-1 h-2 rounded-lg ${
                      step.id <= currentStep ? "bg-primary" : "bg-gray-300"
                    }`}
                  ></div>
                ))}
              </div>
              <p className="text-sm text-gray-600 text-center">
                {steps[currentStep - 1].title}
              </p>
            </div>

            {/* Content */}
            <div className="text-center">
              <p className="text-lg font-semibold">
                {steps[currentStep - 1].title}
              </p>
              <p className="text-gray-500">
                Content for {steps[currentStep - 1].title.toLowerCase()}
              </p>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <button
                onClick={previousStep}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
                disabled={currentStep === 1}
              >
                Previous
              </button>
              <button
                onClick={nextStep}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${
                  isLastStep
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-primary hover:bg-primary-dark"
                }`}
                disabled={isLastStep}
              >
                {isLastStep ? "Complete" : "Next"}
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
