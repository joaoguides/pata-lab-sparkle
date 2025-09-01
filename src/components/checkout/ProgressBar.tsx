import { cn } from "@/lib/utils";

interface ProgressBarProps {
  currentStep: number;
  steps: Array<{ id: number; title: string; description: string }>;
}

export default function ProgressBar({ currentStep, steps }: ProgressBarProps) {
  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="mb-8">
      {/* Progress bar */}
      <div className="relative mb-6">
        <div className="h-2 bg-muted rounded-full">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
            role="progressbar"
            aria-valuenow={progressPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progresso do checkout: ${Math.round(progressPercentage)}%`}
          />
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex justify-between">
        {steps.map((step) => (
          <div key={step.id} className="flex flex-col items-center flex-1">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
                step.id < currentStep
                  ? "bg-primary text-primary-foreground border-primary"
                  : step.id === currentStep
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-muted-foreground"
              )}
            >
              {step.id < currentStep ? (
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                step.id
              )}
            </div>
            <div className="mt-2 text-center">
              <div
                className={cn(
                  "text-sm font-medium",
                  step.id <= currentStep
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {step.title}
              </div>
              <div className="text-xs text-muted-foreground hidden sm:block">
                {step.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}