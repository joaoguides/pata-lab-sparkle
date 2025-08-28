import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  title: string;
  description: string;
}

interface CheckoutStepperProps {
  currentStep: number;
  steps: Step[];
}

export default function CheckoutStepper({ currentStep, steps }: CheckoutStepperProps) {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-center justify-between">
        {steps.map((step, stepIdx) => (
          <li key={step.id} className="flex-1">
            <div
              className={cn(
                "flex items-center",
                stepIdx !== steps.length - 1 ? "pb-0 pr-8 sm:pr-20" : ""
              )}
            >
              <div className="flex min-w-0 flex-col">
                <span className="text-sm font-medium">
                  <div className="flex items-center">
                    <span
                      className={cn(
                        "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2",
                        step.id < currentStep
                          ? "bg-primary border-primary"
                          : step.id === currentStep
                          ? "border-primary text-primary"
                          : "border-muted-foreground text-muted-foreground"
                      )}
                      aria-current={step.id === currentStep ? "step" : undefined}
                    >
                      {step.id < currentStep ? (
                        <Check className="h-5 w-5 text-primary-foreground" />
                      ) : (
                        <span className="text-sm font-medium">{step.id}</span>
                      )}
                    </span>
                    <span className="ml-3 hidden sm:block">
                      <span
                        className={cn(
                          "text-sm font-medium",
                          step.id <= currentStep ? "text-primary" : "text-muted-foreground"
                        )}
                      >
                        {step.title}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {step.description}
                      </span>
                    </span>
                  </div>
                </span>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}