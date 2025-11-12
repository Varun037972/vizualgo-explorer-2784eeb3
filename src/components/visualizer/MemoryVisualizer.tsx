import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "lucide-react";

interface MemoryVisualizerProps {
  arraySize: number;
  currentStep: number;
  totalSteps: number;
  isActive: boolean;
  currentArray?: number[];
}

export const MemoryVisualizer = ({ arraySize, currentStep, totalSteps, isActive, currentArray }: MemoryVisualizerProps) => {
  // Calculate memory usage
  const baseMemory = arraySize * 4; // 4 bytes per integer
  const stackMemory = Math.floor((currentStep / totalSteps) * 50) || 0;
  const totalMemory = baseMemory + stackMemory;
  const maxMemory = 500;
  
  const memoryPercentage = Math.min((totalMemory / maxMemory) * 100, 100);

  const stackFrames = isActive ? [
    { name: "main()", size: 16, color: "bg-blue-500" },
    { name: "sort()", size: 24, color: "bg-purple-500" },
    { name: "partition()", size: stackMemory, color: "bg-primary", active: currentStep < totalSteps },
  ] : [];

  return (
    <Card className="border-primary/20 h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Database className="h-5 w-5 text-primary" />
          Memory Visualization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isActive ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
            Run visualization to track memory
          </div>
        ) : (
          <>
            {/* Memory Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Total Memory Usage</span>
                <span className="font-mono font-bold">{totalMemory} bytes</span>
              </div>
              <div className="relative h-6 bg-muted rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500"
                  style={{ width: `${memoryPercentage}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
                  {memoryPercentage.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Stack Visualization */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground">Call Stack</h4>
              <div className="space-y-1">
                {stackFrames.map((frame, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded border transition-all duration-300 ${
                      frame.active ? 'border-primary/50 bg-primary/10' : 'border-border bg-muted/30'
                    } animate-fade-in`}
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${frame.color} ${frame.active ? 'animate-pulse' : ''}`} />
                        <span className="text-xs font-mono">{frame.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{frame.size}B</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Heap Visualization */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground">Heap Memory</h4>
              <div className="grid grid-cols-8 gap-1">
                {(currentArray || Array.from({ length: Math.min(arraySize, 16) }, (_, i) => i + 1)).slice(0, 16).map((value, idx) => (
                  <div
                    key={idx}
                    className="aspect-square bg-primary/20 rounded border border-primary/30 animate-fade-in flex items-center justify-center text-xs font-bold text-primary"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    {value}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Array: {arraySize} elements × 4 bytes = {baseMemory} bytes
                {currentArray && currentArray.length > 16 && ` (showing first 16 of ${currentArray.length})`}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
