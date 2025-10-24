import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

interface ComplexityHeatmapProps {
  comparisons: number;
  swaps: number;
  isActive: boolean;
}

export const ComplexityHeatmap = ({ comparisons, swaps, isActive }: ComplexityHeatmapProps) => {
  // Simulate code lines with complexity levels
  const codeLines = [
    { line: "for i in range(n):", complexity: 80, label: "Outer loop" },
    { line: "    for j in range(n-i-1):", complexity: 95, label: "Inner loop (hotspot)" },
    { line: "        if arr[j] > arr[j+1]:", complexity: 70, label: "Comparison" },
    { line: "            swap(arr[j], arr[j+1])", complexity: 60, label: "Swap operation" },
    { line: "return arr", complexity: 10, label: "Return" },
  ];

  const getHeatColor = (complexity: number) => {
    if (complexity >= 80) return "bg-red-500/90";
    if (complexity >= 60) return "bg-orange-500/90";
    if (complexity >= 40) return "bg-yellow-500/90";
    if (complexity >= 20) return "bg-green-500/90";
    return "bg-blue-500/90";
  };

  const getTextColor = (complexity: number) => {
    if (complexity >= 80) return "text-red-500";
    if (complexity >= 60) return "text-orange-500";
    if (complexity >= 40) return "text-yellow-500";
    if (complexity >= 20) return "text-green-500";
    return "text-blue-500";
  };

  return (
    <Card className="border-primary/20 h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5 text-primary" />
          Complexity Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!isActive ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
            Run visualization to see hotspots
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {codeLines.map((line, idx) => (
                <div key={idx} className="space-y-1 animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 h-8 bg-muted/50 rounded overflow-hidden">
                      <div
                        className={`absolute left-0 top-0 h-full transition-all duration-1000 ${getHeatColor(line.complexity)}`}
                        style={{ width: `${line.complexity}%` }}
                      />
                      <div className="relative z-10 px-3 py-1 text-xs font-mono flex items-center justify-between">
                        <span className="text-foreground/90">{line.line}</span>
                        <span className={`font-bold ${getTextColor(line.complexity)}`}>
                          {line.complexity}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground px-1">{line.label}</p>
                </div>
              ))}
            </div>
            
            <div className="pt-3 border-t border-border space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Total Operations:</span>
                <span className="font-mono font-bold">{(comparisons + swaps).toLocaleString()}</span>
              </div>
              <div className="flex gap-2 text-[10px]">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded" />
                  <span>Critical</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-orange-500 rounded" />
                  <span>High</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded" />
                  <span>Medium</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded" />
                  <span>Low</span>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
