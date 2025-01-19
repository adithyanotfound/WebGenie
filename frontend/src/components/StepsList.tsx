import { CheckCircle, Circle, Clock } from "lucide-react";
import { Step } from "../types";

interface StepsListProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (stepId: number) => void;
}

export function StepsList({ steps, currentStep, onStepClick }: StepsListProps) {
  return (
    <div className="bg-[#1C2128] rounded-lg border border-[#30363D] p-3">
      <h2 className="text-sm font-medium mb-3 text-[#ADBAC7]">Build Steps</h2>
      <div className="space-y-2">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`p-2 rounded cursor-pointer transition-colors ${
              currentStep === step.id
                ? "bg-[#2D333B] border border-[#444C56]"
                : "hover:bg-[#2D333B]"
            }`}
            onClick={() => onStepClick(step.id)}
          >
            <div className="flex items-center gap-2">
              {step.status === "completed" ? (
                <CheckCircle className="w-4 h-4 text-[#2DA44E]" />
              ) : step.status === "in-progress" ? (
                <Clock className="w-4 h-4 text-[#539BF5]" />
              ) : (
                <Circle className="w-4 h-4 text-[#768390]" />
              )}
              <h3 className="text-sm font-medium text-[#ADBAC7]">
                {step.title}
              </h3>
            </div>
            <p className="text-xs text-[#768390] mt-1">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
