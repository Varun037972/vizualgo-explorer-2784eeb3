import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, Code2, Zap, ChevronLeft, ChevronRight, X } from "lucide-react";

interface OnboardingTutorialProps {
  open: boolean;
  onClose: () => void;
}

const steps = [
  {
    title: "Welcome to AlgoViz! 🎉",
    description: "Your interactive platform for mastering algorithms through real-time visualization and code execution.",
    icon: Play,
    content: "Watch algorithms come to life with step-by-step animations. Debug, learn, and understand how code actually works.",
  },
  {
    title: "Choose Your Algorithm 🎯",
    description: "Browse through our extensive library of sorting, graph, tree, and string algorithms.",
    icon: Code2,
    content: "Select from categories like Divide & Conquer, Greedy, Dynamic Programming, and more. Each algorithm comes with detailed explanations.",
  },
  {
    title: "Control & Customize ⚡",
    description: "Take full control of the visualization process with our intuitive controls.",
    icon: Zap,
    content: "Play, pause, step forward/back, adjust speed, change input size, or provide custom values. You're in the driver's seat!",
  },
];

export const OnboardingTutorial = ({ open, onClose }: OnboardingTutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (open) {
      setCurrentStep(0);
    }
  }, [open]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    localStorage.setItem("algoviz-onboarding-completed", "true");
    onClose();
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl border-primary/30 bg-gradient-to-br from-card via-card to-card/50">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {step.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center animate-glow-pulse">
              <Icon className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>

          <div className="text-center space-y-3">
            <p className="text-lg text-muted-foreground">{step.description}</p>
            <p className="text-sm text-muted-foreground/80 leading-relaxed">{step.content}</p>
          </div>

          <div className="flex justify-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? "w-8 bg-primary"
                    : index < currentStep
                    ? "w-2 bg-primary/50"
                    : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>

          <div className="flex justify-between items-center pt-4">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <Button onClick={handleNext} className="bg-gradient-primary gap-2">
              {currentStep === steps.length - 1 ? (
                "Get Started"
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          <button
            onClick={handleFinish}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto block"
          >
            Skip tutorial
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
