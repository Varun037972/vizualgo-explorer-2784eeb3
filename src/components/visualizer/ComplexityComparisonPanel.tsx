import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, TrendingUp, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ComplexityData {
  algorithm: string;
  userComplexity: { time: string; space: string };
  optimalComplexity: { time: string; space: string };
  hints: string[];
  isOptimal: boolean;
}

const algorithmComplexities: Record<string, { time: string; space: string; hints: string[] }> = {
  "Bubble Sort": {
    time: "O(n²)", space: "O(1)",
    hints: [
      "Add a 'swapped' flag to achieve O(n) best case for sorted arrays",
      "Consider using Quick Sort or Merge Sort for O(n log n) average performance",
      "Reduce inner loop range by i positions since last i elements are already sorted",
    ],
  },
  "Quick Sort": {
    time: "O(n log n)", space: "O(log n)",
    hints: [
      "Use median-of-three pivot selection to avoid O(n²) worst case",
      "Switch to Insertion Sort for small subarrays (< 10 elements)",
      "Use tail recursion optimization to reduce stack depth",
    ],
  },
  "Merge Sort": {
    time: "O(n log n)", space: "O(n)",
    hints: [
      "Use in-place merge to reduce space to O(1) (but increases constant factor)",
      "Switch to Insertion Sort for small subarrays for better cache performance",
      "Consider TimSort (hybrid) for real-world data with existing order",
    ],
  },
  "Insertion Sort": {
    time: "O(n²)", space: "O(1)",
    hints: [
      "Great for nearly sorted data — achieves O(n) best case",
      "Use binary search to find insertion position (reduces comparisons but not shifts)",
      "Consider Shell Sort as a generalized improvement with gap sequences",
    ],
  },
  "Selection Sort": {
    time: "O(n²)", space: "O(1)",
    hints: [
      "Always O(n²) regardless of input — no early termination possible",
      "Consider Heap Sort for in-place O(n log n) sorting",
      "Minimizes swaps (O(n)) which can be useful for expensive swap operations",
    ],
  },
  "Binary Search": {
    time: "O(log n)", space: "O(1)",
    hints: [
      "Array must be sorted first — factor in sorting cost if needed",
      "Use iterative version to avoid stack overflow on very large arrays",
      "Consider interpolation search for uniformly distributed data",
    ],
  },
  "DFS": {
    time: "O(V + E)", space: "O(V)",
    hints: [
      "Use iterative DFS with explicit stack to avoid recursion limit",
      "Track discovery and finish times for topological sorting",
      "Color nodes (white/gray/black) to detect cycle types",
    ],
  },
  "BFS": {
    time: "O(V + E)", space: "O(V)",
    hints: [
      "BFS finds shortest path in unweighted graphs",
      "Use deque for 0-1 BFS (edges with weight 0 or 1)",
      "Bidirectional BFS can reduce time from O(b^d) to O(b^(d/2))",
    ],
  },
  "Dijkstra": {
    time: "O((V+E) log V)", space: "O(V)",
    hints: [
      "Use a Fibonacci heap for O(V log V + E) theoretical improvement",
      "A* with a good heuristic outperforms Dijkstra for point-to-point queries",
      "Fails with negative edges — use Bellman-Ford instead",
    ],
  },
};

interface Props {
  selectedAlgorithm?: string;
  userCode?: string;
}

export const ComplexityComparisonPanel = ({ selectedAlgorithm = "Bubble Sort", userCode }: Props) => {
  const [expanded, setExpanded] = useState(true);
  const [selectedAlgo, setSelectedAlgo] = useState(selectedAlgorithm);

  const optimal = algorithmComplexities[selectedAlgo];
  if (!optimal) return null;

  // Simple heuristic analysis of user code complexity
  const analyzeUserComplexity = (): { time: string; space: string } => {
    if (!userCode) return { time: "—", space: "—" };
    const nestedLoops = (userCode.match(/for\s*\(|while\s*\(/g) || []).length;
    const recursion = userCode.includes("function") && (userCode.match(/return\s+\w+\(/g) || []).length > 0;

    if (nestedLoops >= 3) return { time: "O(n³)", space: "O(1)" };
    if (nestedLoops === 2) return { time: "O(n²)", space: "O(1)" };
    if (recursion && nestedLoops >= 1) return { time: "O(n log n)", space: "O(log n)" };
    if (nestedLoops === 1) return { time: "O(n)", space: "O(1)" };
    return { time: "O(1)", space: "O(1)" };
  };

  const userComplexity = analyzeUserComplexity();
  const isOptimal = userComplexity.time === optimal.time;

  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
      <CardHeader className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Complexity Analysis
          </CardTitle>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </CardHeader>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <CardContent className="space-y-4">
              {/* Algorithm Selector */}
              <div className="flex flex-wrap gap-2">
                {Object.keys(algorithmComplexities).map((algo) => (
                  <Button
                    key={algo}
                    variant={selectedAlgo === algo ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedAlgo(algo)}
                    className="text-xs"
                  >
                    {algo}
                  </Button>
                ))}
              </div>

              {/* Comparison Table */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-sm font-semibold text-muted-foreground">Metric</div>
                <div className="text-sm font-semibold text-primary text-center">Your Code</div>
                <div className="text-sm font-semibold text-green-400 text-center">Optimal</div>

                <div className="text-sm">Time</div>
                <div className="text-center">
                  <Badge variant="outline" className={userCode ? (isOptimal ? "border-green-500/30 text-green-400" : "border-yellow-500/30 text-yellow-400") : ""}>
                    {userComplexity.time}
                  </Badge>
                </div>
                <div className="text-center">
                  <Badge variant="outline" className="border-green-500/30 text-green-400">{optimal.time}</Badge>
                </div>

                <div className="text-sm">Space</div>
                <div className="text-center">
                  <Badge variant="outline">{userComplexity.space}</Badge>
                </div>
                <div className="text-center">
                  <Badge variant="outline" className="border-green-500/30 text-green-400">{optimal.space}</Badge>
                </div>
              </div>

              {/* Status */}
              {userCode && (
                <div className={`flex items-center gap-2 p-3 rounded-lg ${isOptimal ? "bg-green-500/10 border border-green-500/20" : "bg-yellow-500/10 border border-yellow-500/20"}`}>
                  {isOptimal ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                      <span className="text-sm font-medium text-green-400">Your code matches optimal complexity!</span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-5 w-5 text-yellow-400" />
                      <span className="text-sm font-medium text-yellow-400">Room for improvement — see hints below</span>
                    </>
                  )}
                </div>
              )}

              {/* Hints */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-accent" />
                  Optimization Hints
                </h4>
                {optimal.hints.map((hint, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground pl-6">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{hint}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};
