import { CheckCircle, Circle, Clock } from 'lucide-react';
import { Step } from '../types';

interface StepsListProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (stepId: number) => void;
}

export function StepsList({ steps, currentStep, onStepClick }: StepsListProps) {
  return (
    <div className="bg-[#161B22] rounded-lg border border-[#30363D] p-4 h-full overflow-auto">
      <h2 className="text-lg font-semibold mb-4 text-[#E6EDF3]">Build Steps</h2>
      <div className="space-y-4">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`p-3 rounded-lg cursor-pointer transition-colors ${
              currentStep === step.id
                ? 'bg-[#1F2428] border border-[#30363D]'
                : 'hover:bg-[#1F2428]'
            }`}
            onClick={() => onStepClick(step.id)}
          >
            <div className="flex items-center gap-2">
              {step.status === 'completed' ? (
                <CheckCircle className="w-5 h-5 text-[#238636]" />
              ) : step.status === 'in-progress' ? (
                <Clock className="w-5 h-5 text-[#58A6FF]" />
              ) : (
                <Circle className="w-5 h-5 text-[#8B949E]" />
              )}
              <h3 className="font-medium text-[#E6EDF3]">{step.title}</h3>
            </div>
            <p className="text-sm text-[#8B949E] mt-2">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

