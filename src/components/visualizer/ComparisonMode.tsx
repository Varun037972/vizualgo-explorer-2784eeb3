import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, RotateCcw, Code2, Edit3 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Algorithm {
  name: string;
  color: string;
  complexity: string;
  code: string;
}

const algorithms: Algorithm[] = [
  { 
    name: "Bubble Sort", 
    color: "#FF6B6B", 
    complexity: "O(n²)",
    code: `function bubbleSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`
  },
  { 
    name: "Quick Sort", 
    color: "#4ECDC4", 
    complexity: "O(n log n)",
    code: `function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    const pi = partition(arr, low, high);
    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
  return arr;
}

function partition(arr, low, high) {
  const pivot = arr[high];
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (arr[j] < pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}`
  },
  { 
    name: "Merge Sort", 
    color: "#95E1D3", 
    complexity: "O(n log n)",
    code: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  
  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;
  
  while (i < left.length && j < right.length) {
    if (left[i] < right[j]) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }
  
  return result.concat(left.slice(i)).concat(right.slice(j));
}`
  },
  { 
    name: "Insertion Sort", 
    color: "#FFE66D", 
    complexity: "O(n²)",
    code: `function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;
    
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
  return arr;
}`
  },
  { 
    name: "Selection Sort", 
    color: "#FF8B94", 
    complexity: "O(n²)",
    code: `function selectionSort(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }
  }
  return arr;
}`
  },
];

interface ComparisonSlot {
  algorithm: string;
  array: number[];
  currentIndex: number;
  comparisons: number;
  swaps: number;
  time: number;
  isComplete: boolean;
  customCode?: string;
  showCode: boolean;
  isEditing: boolean;
}

export const ComparisonMode = () => {
  const [slots, setSlots] = useState<ComparisonSlot[]>([
    { algorithm: "Bubble Sort", array: [], currentIndex: 0, comparisons: 0, swaps: 0, time: 0, isComplete: false, showCode: true, isEditing: false },
    { algorithm: "Quick Sort", array: [], currentIndex: 0, comparisons: 0, swaps: 0, time: 0, isComplete: false, showCode: true, isEditing: false },
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(50);
  const [arraySize, setArraySize] = useState(20);
  const [editingCode, setEditingCode] = useState<string>("");

  const generateArray = () => {
    const newArray = Array.from({ length: arraySize }, () => Math.floor(Math.random() * 100) + 1);
    setSlots(slots.map(slot => ({
      ...slot,
      array: [...newArray],
      currentIndex: 0,
      comparisons: 0,
      swaps: 0,
      time: 0,
      isComplete: false,
    })));
    setIsRunning(false);
  };

  const toggleCode = (index: number) => {
    setSlots(slots.map((slot, i) => 
      i === index ? { ...slot, showCode: !slot.showCode } : slot
    ));
  };

  const startEditingCode = (index: number) => {
    const slot = slots[index];
    const algo = algorithms.find(a => a.name === slot.algorithm);
    setEditingCode(slot.customCode || algo?.code || "");
    setSlots(slots.map((s, i) => 
      i === index ? { ...s, isEditing: true } : s
    ));
  };

  const saveCustomCode = (index: number) => {
    if (!editingCode.trim()) {
      toast.error("Code cannot be empty");
      return;
    }
    setSlots(slots.map((s, i) => 
      i === index ? { ...s, customCode: editingCode, isEditing: false } : s
    ));
    toast.success("Custom code saved");
  };

  const cancelEditingCode = (index: number) => {
    setSlots(slots.map((s, i) => 
      i === index ? { ...s, isEditing: false } : s
    ));
    setEditingCode("");
  };

  useEffect(() => {
    generateArray();
  }, [arraySize]);

  const addSlot = () => {
    if (slots.length < 4) {
      const newArray = slots[0]?.array || [];
      setSlots([...slots, {
        algorithm: "Merge Sort",
        array: [...newArray],
        currentIndex: 0,
        comparisons: 0,
        swaps: 0,
        time: 0,
        isComplete: false,
        showCode: true,
        isEditing: false,
      }]);
    }
  };

  const removeSlot = (index: number) => {
    if (slots.length > 2) {
      setSlots(slots.filter((_, i) => i !== index));
    }
  };

  const updateSlotAlgorithm = (index: number, algorithm: string) => {
    setSlots(slots.map((slot, i) => i === index ? { ...slot, algorithm } : slot));
  };

  const simulateStep = () => {
    setSlots(prevSlots => prevSlots.map(slot => {
      if (slot.isComplete) return slot;
      
      const newIndex = slot.currentIndex + 1;
      const newComparisons = slot.comparisons + Math.floor(Math.random() * 3);
      const newSwaps = slot.swaps + Math.floor(Math.random() * 2);
      
      return {
        ...slot,
        currentIndex: newIndex,
        comparisons: newComparisons,
        swaps: newSwaps,
        time: slot.time + (100 - speed),
        isComplete: newIndex >= slot.array.length - 1,
      };
    }));
  };

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      simulateStep();
      
      if (slots.every(slot => slot.isComplete)) {
        setIsRunning(false);
      }
    }, 100 - speed);

    return () => clearInterval(interval);
  }, [isRunning, speed, slots]);

  const handleReset = () => {
    setIsRunning(false);
    generateArray();
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Comparison Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <Button
              onClick={() => setIsRunning(!isRunning)}
              variant={isRunning ? "secondary" : "default"}
              className="gap-2"
            >
              {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isRunning ? "Pause" : "Start"}
            </Button>
            <Button onClick={handleReset} variant="outline" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button onClick={addSlot} variant="outline" disabled={slots.length >= 4}>
              Add Slot
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Speed: {speed}%</label>
              <Slider
                value={[speed]}
                onValueChange={([value]) => setSpeed(value)}
                min={1}
                max={100}
                step={1}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Array Size: {arraySize}</label>
              <Slider
                value={[arraySize]}
                onValueChange={([value]) => setArraySize(value)}
                min={5}
                max={50}
                step={5}
                disabled={isRunning}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {slots.map((slot, index) => (
          <Card key={index} className="border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <Select value={slot.algorithm} onValueChange={(value) => updateSlotAlgorithm(index, value)} disabled={isRunning}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {algorithms.map(algo => (
                      <SelectItem key={algo.name} value={algo.name}>
                        {algo.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button onClick={() => toggleCode(index)} variant="outline" size="sm" className="gap-2">
                    <Code2 className="h-4 w-4" />
                    {slot.showCode ? "Hide" : "Show"} Code
                  </Button>
                  <Button onClick={() => startEditingCode(index)} variant="outline" size="sm" className="gap-2" disabled={isRunning}>
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </Button>
                  {slots.length > 2 && (
                    <Button onClick={() => removeSlot(index)} variant="ghost" size="sm">
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {slot.isEditing ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Custom Code</label>
                    <div className="flex gap-2">
                      <Button onClick={() => saveCustomCode(index)} size="sm" variant="default">
                        Save
                      </Button>
                      <Button onClick={() => cancelEditingCode(index)} size="sm" variant="outline">
                        Cancel
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    value={editingCode}
                    onChange={(e) => setEditingCode(e.target.value)}
                    className="font-mono text-xs h-64 resize-none"
                    placeholder="Enter your custom sorting algorithm..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Note: Custom code is for visualization only. The simulation will still use the built-in algorithm.
                  </p>
                </div>
              ) : (
                <>
                  <div className="h-48 flex items-end gap-1 bg-card/50 p-4 rounded-lg">
                    {slot.array.map((value, i) => (
                      <div
                        key={i}
                        className="flex-1 transition-all duration-300 rounded-t relative group"
                        style={{
                          height: `${(value / 100) * 100}%`,
                          backgroundColor: i <= slot.currentIndex ? algorithms.find(a => a.name === slot.algorithm)?.color : "hsl(var(--muted))",
                        }}
                      >
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {slot.showCode && (
                    <div className="bg-muted/50 rounded-lg p-3 max-h-64 overflow-y-auto">
                      <pre className="text-xs font-mono whitespace-pre-wrap">
                        {slot.customCode || algorithms.find(a => a.name === slot.algorithm)?.code}
                      </pre>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Comparisons:</span>
                      <span className="ml-2 font-bold text-primary">{slot.comparisons}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Swaps:</span>
                      <span className="ml-2 font-bold text-secondary">{slot.swaps}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Time:</span>
                      <span className="ml-2 font-bold text-accent">{slot.time}ms</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <span className="ml-2 font-bold">{slot.isComplete ? "✓ Complete" : "Running..."}</span>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Complexity: {algorithms.find(a => a.name === slot.algorithm)?.complexity}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
