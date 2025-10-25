import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, RotateCcw, SkipForward, SkipBack, Sparkles, CheckCircle2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CodeEditor } from "./CodeEditor";
import { ComplexityHeatmap } from "./ComplexityHeatmap";
import { MemoryVisualizer } from "./MemoryVisualizer";

interface Step {
  array: number[];
  comparing?: number[];
  swapping?: number[];
  sorted?: number[];
  pivot?: number;
  description: string;
}

type Algorithm = "bubble" | "quick" | "merge" | "insertion" | "selection";

const algorithms = {
  bubble: "Bubble Sort",
  quick: "Quick Sort",
  merge: "Merge Sort",
  insertion: "Insertion Sort",
  selection: "Selection Sort",
};

export const SortingVisualizer = () => {
  const [array, setArray] = useState<number[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [arraySize, setArraySize] = useState(15);
  const [algorithm, setAlgorithm] = useState<Algorithm>("bubble");
  const [stats, setStats] = useState({ comparisons: 0, swaps: 0, timeComplexity: "O(n²)" });
  const [isComplete, setIsComplete] = useState(false);
  const [customInput, setCustomInput] = useState("");

  const generateRandomArray = useCallback(() => {
    const newArray = Array.from({ length: arraySize }, () => Math.floor(Math.random() * 100) + 10);
    setArray(newArray);
    setSteps([]);
    setCurrentStep(0);
    setIsPlaying(false);
    setIsComplete(false);
  }, [arraySize]);

  const setCustomArray = () => {
    const values = customInput
      .split(",")
      .map((v) => parseInt(v.trim()))
      .filter((v) => !isNaN(v) && v > 0 && v <= 100);
    
    if (values.length === 0) {
      toast.error("Please enter valid numbers (1-100) separated by commas");
      return;
    }
    
    setArray(values);
    setArraySize(values.length);
    setSteps([]);
    setCurrentStep(0);
    setIsPlaying(false);
    setIsComplete(false);
    toast.success(`Custom array set with ${values.length} values`);
  };

  useEffect(() => {
    generateRandomArray();
  }, [generateRandomArray]);

  const bubbleSort = (arr: number[]): Step[] => {
    const steps: Step[] = [];
    const array = [...arr];
    let comparisons = 0;
    let swaps = 0;
    const sorted: number[] = [];

    steps.push({ array: [...array], description: "Starting Bubble Sort" });

    for (let i = 0; i < array.length; i++) {
      for (let j = 0; j < array.length - i - 1; j++) {
        comparisons++;
        steps.push({
          array: [...array],
          comparing: [j, j + 1],
          sorted,
          description: `Comparing ${array[j]} and ${array[j + 1]}`,
        });

        if (array[j] > array[j + 1]) {
          swaps++;
          [array[j], array[j + 1]] = [array[j + 1], array[j]];
          steps.push({
            array: [...array],
            swapping: [j, j + 1],
            sorted,
            description: `Swapping ${array[j + 1]} and ${array[j]}`,
          });
        }
      }
      sorted.push(array.length - i - 1);
    }

    steps.push({ array: [...array], sorted: Array.from({ length: array.length }, (_, i) => i), description: "Sorted!" });
    setStats({ comparisons, swaps, timeComplexity: "O(n²)" });
    return steps;
  };

  const insertionSort = (arr: number[]): Step[] => {
    const steps: Step[] = [];
    const array = [...arr];
    let comparisons = 0;
    let swaps = 0;
    const sorted: number[] = [0];

    steps.push({ array: [...array], sorted: [0], description: "Starting Insertion Sort" });

    for (let i = 1; i < array.length; i++) {
      const key = array[i];
      let j = i - 1;

      steps.push({
        array: [...array],
        comparing: [i],
        sorted: [...sorted],
        description: `Inserting ${key} into sorted portion`,
      });

      while (j >= 0 && array[j] > key) {
        comparisons++;
        swaps++;
        array[j + 1] = array[j];
        steps.push({
          array: [...array],
          swapping: [j, j + 1],
          sorted: [...sorted],
          description: `Moving ${array[j]} to the right`,
        });
        j--;
      }
      array[j + 1] = key;
      sorted.push(i);
    }

    steps.push({ array: [...array], sorted: Array.from({ length: array.length }, (_, i) => i), description: "Sorted!" });
    setStats({ comparisons, swaps, timeComplexity: "O(n²)" });
    return steps;
  };

  const selectionSort = (arr: number[]): Step[] => {
    const steps: Step[] = [];
    const array = [...arr];
    let comparisons = 0;
    let swaps = 0;
    const sorted: number[] = [];

    steps.push({ array: [...array], description: "Starting Selection Sort" });

    for (let i = 0; i < array.length - 1; i++) {
      let minIdx = i;

      for (let j = i + 1; j < array.length; j++) {
        comparisons++;
        steps.push({
          array: [...array],
          comparing: [minIdx, j],
          sorted,
          description: `Finding minimum: comparing ${array[minIdx]} and ${array[j]}`,
        });

        if (array[j] < array[minIdx]) {
          minIdx = j;
        }
      }

      if (minIdx !== i) {
        swaps++;
        [array[i], array[minIdx]] = [array[minIdx], array[i]];
        steps.push({
          array: [...array],
          swapping: [i, minIdx],
          sorted,
          description: `Swapping ${array[minIdx]} with ${array[i]}`,
        });
      }
      sorted.push(i);
    }

    steps.push({ array: [...array], sorted: Array.from({ length: array.length }, (_, i) => i), description: "Sorted!" });
    setStats({ comparisons, swaps, timeComplexity: "O(n²)" });
    return steps;
  };

  const quickSort = (arr: number[]): Step[] => {
    const steps: Step[] = [];
    const array = [...arr];
    let comparisons = 0;
    let swaps = 0;

    steps.push({ array: [...array], description: "Starting Quick Sort" });

    const partition = (low: number, high: number): number => {
      const pivot = array[high];
      let i = low - 1;

      steps.push({
        array: [...array],
        pivot: high,
        description: `Pivot selected: ${pivot}`,
      });

      for (let j = low; j < high; j++) {
        comparisons++;
        steps.push({
          array: [...array],
          comparing: [j, high],
          pivot: high,
          description: `Comparing ${array[j]} with pivot ${pivot}`,
        });

        if (array[j] < pivot) {
          i++;
          swaps++;
          [array[i], array[j]] = [array[j], array[i]];
          steps.push({
            array: [...array],
            swapping: [i, j],
            pivot: high,
            description: `Swapping ${array[j]} and ${array[i]}`,
          });
        }
      }

      swaps++;
      [array[i + 1], array[high]] = [array[high], array[i + 1]];
      steps.push({
        array: [...array],
        swapping: [i + 1, high],
        description: `Placing pivot ${pivot} in correct position`,
      });

      return i + 1;
    };

    const quickSortHelper = (low: number, high: number) => {
      if (low < high) {
        const pi = partition(low, high);
        quickSortHelper(low, pi - 1);
        quickSortHelper(pi + 1, high);
      }
    };

    quickSortHelper(0, array.length - 1);
    steps.push({ array: [...array], sorted: Array.from({ length: array.length }, (_, i) => i), description: "Sorted!" });
    setStats({ comparisons, swaps, timeComplexity: "O(n log n)" });
    return steps;
  };

  const mergeSort = (arr: number[]): Step[] => {
    const steps: Step[] = [];
    const array = [...arr];
    let comparisons = 0;
    let swaps = 0;

    steps.push({ array: [...array], description: "Starting Merge Sort" });

    const merge = (left: number, mid: number, right: number) => {
      const leftArr = array.slice(left, mid + 1);
      const rightArr = array.slice(mid + 1, right + 1);
      let i = 0, j = 0, k = left;

      steps.push({
        array: [...array],
        comparing: Array.from({ length: right - left + 1 }, (_, idx) => left + idx),
        description: `Merging subarrays`,
      });

      while (i < leftArr.length && j < rightArr.length) {
        comparisons++;
        if (leftArr[i] <= rightArr[j]) {
          array[k] = leftArr[i];
          i++;
        } else {
          array[k] = rightArr[j];
          j++;
        }
        swaps++;
        steps.push({
          array: [...array],
          swapping: [k],
          description: `Placing ${array[k]} in merged array`,
        });
        k++;
      }

      while (i < leftArr.length) {
        array[k] = leftArr[i];
        steps.push({ array: [...array], swapping: [k], description: `Copying remaining elements` });
        i++;
        k++;
      }

      while (j < rightArr.length) {
        array[k] = rightArr[j];
        steps.push({ array: [...array], swapping: [k], description: `Copying remaining elements` });
        j++;
        k++;
      }
    };

    const mergeSortHelper = (left: number, right: number) => {
      if (left < right) {
        const mid = Math.floor((left + right) / 2);
        mergeSortHelper(left, mid);
        mergeSortHelper(mid + 1, right);
        merge(left, mid, right);
      }
    };

    mergeSortHelper(0, array.length - 1);
    steps.push({ array: [...array], sorted: Array.from({ length: array.length }, (_, i) => i), description: "Sorted!" });
    setStats({ comparisons, swaps, timeComplexity: "O(n log n)" });
    return steps;
  };

  const startVisualization = () => {
    let sortSteps: Step[] = [];
    setIsComplete(false);
    
    switch (algorithm) {
      case "bubble":
        sortSteps = bubbleSort(array);
        break;
      case "insertion":
        sortSteps = insertionSort(array);
        break;
      case "selection":
        sortSteps = selectionSort(array);
        break;
      case "quick":
        sortSteps = quickSort(array);
        break;
      case "merge":
        sortSteps = mergeSort(array);
        break;
    }
    
    setSteps(sortSteps);
    setCurrentStep(0);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else if (currentStep >= steps.length - 1 && steps.length > 0) {
      setIsPlaying(false);
      setIsComplete(true);
    }
  }, [isPlaying, currentStep, steps.length, speed]);

  const currentStepData = steps[currentStep] || { array, description: "Click Visualize to start" };
  const maxValue = Math.max(...array);
  const progress = steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Code Editor */}
      <CodeEditor onCodeChange={(code, lang) => console.log("Code updated:", lang)} />

      {/* Controls */}
      <Card className="border-primary/20 hover:border-primary/40 transition-colors">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Algorithm</label>
              <Select value={algorithm} onValueChange={(value) => setAlgorithm(value as Algorithm)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(algorithms).map(([key, name]) => (
                    <SelectItem key={key} value={key}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Array Size: {arraySize}</label>
              <Slider
                value={[arraySize]}
                onValueChange={([value]) => setArraySize(value)}
                min={5}
                max={50}
                step={5}
                disabled={isPlaying || steps.length > 0}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Speed: {speed}ms</label>
              <Slider
                value={[speed]}
                onValueChange={([value]) => setSpeed(value)}
                min={50}
                max={1000}
                step={50}
              />
            </div>
          </div>

          <div className="space-y-2 border-t border-border pt-4">
            <label className="text-sm font-medium">Custom Values (comma-separated):</label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., 45,23,67,12,89,34"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="flex-1"
                disabled={isPlaying}
              />
              <Button onClick={setCustomArray} variant="outline" size="sm" disabled={isPlaying}>
                Set Array
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter numbers 1-100, separated by commas
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={startVisualization} 
              disabled={isPlaying || steps.length > 0} 
              className="bg-gradient-primary hover:shadow-glow-primary transition-all hover:scale-105"
            >
              <Play className="mr-2 h-4 w-4" />
              Visualize
            </Button>
            <Button 
              onClick={() => setIsPlaying(!isPlaying)} 
              disabled={steps.length === 0} 
              variant="outline"
              className="hover:scale-105 transition-transform"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0 || isPlaying}
              variant="outline"
              className="hover:scale-105 transition-transform"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              disabled={currentStep >= steps.length - 1 || isPlaying}
              variant="outline"
              className="hover:scale-105 transition-transform"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
            <Button 
              onClick={generateRandomArray} 
              disabled={isPlaying} 
              variant="outline"
              className="hover:scale-105 transition-transform"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Visualization */}
      <Card className={`border-primary/20 transition-all ${isComplete ? 'border-green-500/50 shadow-glow-primary' : ''}`}>
        <CardHeader>
          <div className="space-y-3">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                Visualization
                {isComplete && <CheckCircle2 className="h-5 w-5 text-green-500 animate-scale-in" />}
              </span>
              <span className="text-sm font-normal text-muted-foreground">
                Step {currentStep + 1} of {steps.length || 1}
              </span>
            </CardTitle>
            {steps.length > 0 && (
              <Progress value={progress} className="h-2" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="min-h-[400px] bg-gradient-to-b from-muted/50 to-muted rounded-lg p-6 flex items-end justify-center gap-1 relative overflow-hidden">
              {isComplete && (
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-primary/10 to-green-500/10 animate-pulse" />
              )}
              {currentStepData.array.map((value, idx) => {
                const isComparing = currentStepData.comparing?.includes(idx);
                const isSwapping = currentStepData.swapping?.includes(idx);
                const isSorted = currentStepData.sorted?.includes(idx);
                const isPivot = currentStepData.pivot === idx;

                return (
                  <div
                    key={idx}
                    className={`flex flex-col items-center gap-1 relative z-10 ${
                      isSwapping ? 'animate-bounce' : 'animate-fade-in'
                    }`}
                    style={{ flex: 1, maxWidth: "60px" }}
                  >
                    <span className={`text-xs font-mono font-bold transition-all duration-300 ${
                      isComparing || isSwapping ? 'text-primary scale-125' : ''
                    }`}>
                      {value}
                    </span>
                    <div
                      className={`w-full rounded-t transition-all duration-500 relative ${
                        isPivot
                          ? "bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.6)]"
                          : isSwapping
                          ? "bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)] scale-110"
                          : isComparing
                          ? "bg-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.6)]"
                          : isSorted
                          ? "bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]"
                          : "bg-gradient-to-t from-primary to-primary/60"
                      }`}
                      style={{
                        height: `${(value / maxValue) * 300}px`,
                        minHeight: "20px",
                        transform: isSwapping ? 'scale(1.1)' : 'scale(1)',
                      }}
                    >
                      {(isSwapping || isComparing) && (
                        <div className="absolute inset-0 bg-white/20 animate-pulse rounded-t" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-center space-y-2">
              <p className={`text-lg font-semibold transition-all duration-300 ${
                isComplete ? 'text-green-500 animate-pulse' : ''
              }`}>
                {currentStepData.description}
              </p>
              {isComplete && (
                <p className="text-sm text-green-500 animate-fade-in">
                  ✨ Array sorted successfully! ✨
                </p>
              )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded" />
                <span>Comparing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded" />
                <span>Swapping</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-500 rounded" />
                <span>Pivot</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded" />
                <span>Sorted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-primary rounded" />
                <span>Unsorted</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Analysis Panels */}
      <div className="grid md:grid-cols-3 gap-4">
        <ComplexityHeatmap 
          comparisons={stats.comparisons} 
          swaps={stats.swaps} 
          isActive={steps.length > 0}
        />
        <MemoryVisualizer 
          arraySize={array.length}
          currentStep={currentStep}
          totalSteps={steps.length}
          isActive={steps.length > 0}
        />
        <Card className="hover:border-primary/50 transition-all hover:shadow-glow-primary hover-scale">
          <CardHeader>
            <CardTitle className="text-lg text-muted-foreground">Performance Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Comparisons</span>
                <span className="text-2xl font-mono font-bold text-primary">
                  {stats.comparisons.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Swaps</span>
                <span className="text-2xl font-mono font-bold text-primary">
                  {stats.swaps.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Array Size</span>
                <span className="text-2xl font-mono font-bold text-primary">
                  {array.length}
                </span>
              </div>
            </div>
            <div className="pt-3 border-t border-border">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Time Complexity</p>
                <p className="text-3xl font-mono font-bold bg-gradient-primary bg-clip-text text-transparent">
                  {stats.timeComplexity}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Original Stats Row (Deprecated - kept for reference) */}
      <div className="grid md:grid-cols-3 gap-4 hidden">
        <Card className="hover:border-primary/50 transition-all hover:shadow-glow-primary hover-scale">
          <CardHeader>
            <CardTitle className="text-lg text-muted-foreground">Time Complexity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-mono font-bold bg-gradient-primary bg-clip-text text-transparent">
              {stats.timeComplexity}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {algorithm === "bubble" || algorithm === "insertion" || algorithm === "selection" 
                ? "Quadratic time" 
                : "Logarithmic time"}
            </p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/50 transition-all hover:shadow-glow-primary hover-scale">
          <CardHeader>
            <CardTitle className="text-lg text-muted-foreground">Comparisons</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-mono font-bold text-primary animate-fade-in">
              {stats.comparisons.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Element comparisons made
            </p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/50 transition-all hover:shadow-glow-primary hover-scale">
          <CardHeader>
            <CardTitle className="text-lg text-muted-foreground">Swaps</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-mono font-bold text-primary animate-fade-in">
              {stats.swaps.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Position changes made
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
