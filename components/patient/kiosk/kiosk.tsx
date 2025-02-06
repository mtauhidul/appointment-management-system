import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { X } from "lucide-react";
import { useState } from "react";

type Props = object;

export default function Kiosk({}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { id: 1, title: "Check In" },
    { id: 2, title: "Demographics" },
    { id: 3, title: "Insurance" },
    { id: 4, title: "Allergies" },
    { id: 5, title: "Medications" },
    { id: 6, title: "Family History" },
    { id: 7, title: "Medical History" },
    { id: 8, title: "Surgical History" },
    { id: 9, title: "Social History" },
    { id: 10, title: "Shoe Size" },
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
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="border border-primary p-2 px-4 cursor-pointer rounded-lg text-primary font-semibold text-sm hover:bg-primary hover:text-white h-10"
      >
        Start KIOSK
      </button>

      {/* Full-Screen Popover */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-white shadow-lg flex flex-col">
          {/* Header with Close Button */}
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-bold text-primary">KIOSK Steps</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-black"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 space-y-6 overflow-y-auto">
            {/* Stepper for larger screen only */}
            <div className="space-y-4 hidden sm:block">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className="flex items-center space-x-3 text-gray-600"
                >
                  {/* Step Indicator */}
                  <div
                    className={`w-6 h-6 flex items-center justify-center rounded-full border-2 ${
                      step.id <= currentStep
                        ? "bg-primary text-white border-primary"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {step.id}
                  </div>
                  {/* Step Title */}
                  <p
                    className={`text-sm md:text-base ${
                      step.id === currentStep
                        ? "text-primary font-bold"
                        : "text-gray-600"
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
              ))}
            </div>

            {/* Current Step Content */}
            <div className="mt-6 text-center">
              <h3 className="text-lg font-semibold text-primary">
                {steps[currentStep - 1].title}
              </h3>
              <p className="text-sm md:text-base text-gray-500">
                Content for {steps[currentStep - 1].title.toLowerCase()}
              </p>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="p-4 border-t flex justify-between flex-wrap gap-2">
            <button
              onClick={previousStep}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 w-full sm:w-auto"
              disabled={currentStep === 1}
            >
              Previous
            </button>
            <button
              onClick={nextStep}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg w-full sm:w-auto ${
                isLastStep
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary hover:bg-primary-dark"
              }`}
              disabled={isLastStep}
            >
              {isLastStep ? "Complete" : "Next"}
            </button>
            {/* Only show this steps below in smaller screen */}
            {
              <div className="md:hidden w-full">
                <Drawer>
                  <DrawerTrigger className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 w-full sm:w-auto">
                    Steps
                  </DrawerTrigger>
                  <DrawerContent>
                    {/* Steps list using drawer, add drawer close too */}
                    <DrawerHeader>
                      <DrawerClose />
                    </DrawerHeader>
                    <DrawerDescription>
                      <ul>
                        {steps.map((step) => (
                          <li
                            key={step.id}
                            className="flex items-center space-x-3 text-gray-600 p-2"
                          >
                            <div
                              className={`w-6 h-6 flex items-center justify-center rounded-full border-2 ${
                                step.id <= currentStep
                                  ? "bg-primary text-white border-primary"
                                  : "bg-gray-200 text-gray-400"
                              }`}
                            >
                              {step.id}
                            </div>
                            <p
                              className={`text-sm md:text-base ${
                                step.id === currentStep
                                  ? "text-primary font-bold"
                                  : "text-gray-600"
                              }`}
                            >
                              {step.title}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </DrawerDescription>
                  </DrawerContent>
                </Drawer>
              </div>
            }
          </div>
        </div>
      )}
    </div>
  );
}
