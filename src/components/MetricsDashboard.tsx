import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Repeat, Clock, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface MetricsDashboardProps {
  comparisons: number;
  swaps: number;
  timeComplexity: string;
  currentStep: number;
  totalSteps: number;
  elapsedTime?: number;
}

export const MetricsDashboard = ({
  comparisons,
  swaps,
  timeComplexity,
  currentStep,
  totalSteps,
  elapsedTime,
}: MetricsDashboardProps) => {
  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Performance Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              Comparisons
            </div>
            <div className="text-2xl font-bold text-primary">{comparisons}</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Repeat className="h-4 w-4" />
              Swaps
            </div>
            <div className="text-2xl font-bold text-secondary">{swaps}</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Time Complexity
            </div>
            <div className="text-2xl font-bold text-accent">{timeComplexity}</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="h-4 w-4" />
              Operations
            </div>
            <div className="text-2xl font-bold">{comparisons + swaps}</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              Step {currentStep} / {totalSteps}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {elapsedTime !== undefined && (
          <div className="pt-2 border-t border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Elapsed Time</span>
              <span className="font-mono font-medium">{elapsedTime.toFixed(2)}s</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
