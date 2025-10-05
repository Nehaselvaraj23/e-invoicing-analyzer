import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, steps }) => {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                index === currentStep
                  ? 'bg-primary-600 text-white'
                  : index < currentStep
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {index < currentStep ? '✓' : index + 1}
            </div>
            <span
              className={`mt-2 text-sm font-medium ${
                index === currentStep ? 'text-primary-600' : 'text-gray-500'
              }`}
            >
              {step}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-16 h-1 mx-4 ${
                index < currentStep ? 'bg-green-500' : 'bg-gray-200'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default StepIndicator;