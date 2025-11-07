import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface Algorithm {
  name: string;
  color: string;
  complexity: string;
}

const algorithms: Algorithm[] = [
  { name: "Bubble Sort", color: "#FF6B6B", complexity: "O(n²)" },
  { name: "Quick Sort", color: "#4ECDC4", complexity: "O(n log n)" },
  { name: "Merge Sort", color: "#95E1D3", complexity: "O(n log n)" },
  { name: "Insertion Sort", color: "#FFE66D", complexity: "O(n²)" },
  { name: "Heap Sort", color: "#A8E6CF", complexity: "O(n log n)" },
  { name: "Selection Sort", color: "#FF8B94", complexity: "O(n²)" },
];

interface ComparisonSlot {
  algorithm: string;
  array: number[];
  currentIndex: number;
  comparisons: number;
  swaps: number;
  time: number;
  isComplete: boolean;
}

export const ComparisonMode = () => {
  const [slots, setSlots] = useState<ComparisonSlot[]>([
    { algorithm: "Bubble Sort", array: [], currentIndex: 0, comparisons: 0, swaps: 0, time: 0, isComplete: false },
    { algorithm: "Quick Sort", array: [], currentIndex: 0, comparisons: 0, swaps: 0, time: 0, isComplete: false },
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(50);
  const [arraySize, setArraySize] = useState(20);

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
              <div className="flex items-center justify-between">
                <Select value={slot.algorithm} onValueChange={(value) => updateSlotAlgorithm(index, value)}>
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
                {slots.length > 2 && (
                  <Button onClick={() => removeSlot(index)} variant="ghost" size="sm">
                    Remove
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-48 flex items-end gap-1 bg-card/50 p-4 rounded-lg">
                {slot.array.map((value, i) => (
                  <div
                    key={i}
                    className="flex-1 transition-all duration-300 rounded-t"
                    style={{
                      height: `${(value / 100) * 100}%`,
                      backgroundColor: i <= slot.currentIndex ? algorithms.find(a => a.name === slot.algorithm)?.color : "hsl(var(--muted))",
                    }}
                  />
                ))}
              </div>

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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
