import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, RotateCcw, SkipForward, SkipBack, Sparkles, CheckCircle2, Accessibility, FileText, ArrowLeftRight, GitCompare, Pointer, Volume2, VolumeX, Volume1, RotateCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CodeEditor } from "./CodeEditor";
import { ComplexityHeatmap } from "./ComplexityHeatmap";
import { MemoryVisualizer } from "./MemoryVisualizer";
import { AlgorithmInfo } from "@/components/AlgorithmInfo";
import { QuickStartExamples } from "@/components/QuickStartExamples";
import { MetricsDashboard } from "@/components/MetricsDashboard";
import { AccessibilityControls } from "@/components/AccessibilityControls";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { KeyboardShortcutsHelp } from "@/components/KeyboardShortcutsHelp";

interface StepExplanation {
  action: string;
  pointerChanges: string;
  comparison: string;
}

interface Step {
  array: number[];
  comparing?: number[];
  swapping?: number[];
  sorted?: number[];
  pivot?: number;
  description: string;
  explanation?: StepExplanation;
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
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [showStepExplanation, setShowStepExplanation] = useState(true);
  const [voiceNarrationEnabled, setVoiceNarrationEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('voiceNarrationEnabled');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });
  const [voiceSpeed, setVoiceSpeed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('voiceSpeed');
      return saved ? parseFloat(saved) : 1;
    }
    return 1;
  });
  const [voicePitch, setVoicePitch] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('voicePitch');
      return saved ? parseFloat(saved) : 1;
    }
    return 1;
  });
  const [voiceVolume, setVoiceVolume] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('voiceVolume');
      return saved ? parseFloat(saved) : 1;
    }
    return 1;
  });
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('selectedVoiceIndex');
      return saved ? parseInt(saved) : -1;
    }
    return -1;
  });
  const lastSpokenStepRef = useRef<number>(-1);
  const speechSynthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      speechSynthRef.current = window.speechSynthesis;
      
      const loadVoices = () => {
        const voices = speechSynthRef.current?.getVoices() || [];
        setAvailableVoices(voices);
      };
      
      loadVoices();
      speechSynthRef.current.onvoiceschanged = loadVoices;
      
      return () => {
        speechSynthRef.current?.cancel();
      };
    }
  }, []);

  // Persist voice settings to localStorage
  useEffect(() => {
    localStorage.setItem('voiceNarrationEnabled', JSON.stringify(voiceNarrationEnabled));
  }, [voiceNarrationEnabled]);

  useEffect(() => {
    localStorage.setItem('voiceSpeed', voiceSpeed.toString());
  }, [voiceSpeed]);

  useEffect(() => {
    localStorage.setItem('voicePitch', voicePitch.toString());
  }, [voicePitch]);

  useEffect(() => {
    localStorage.setItem('voiceVolume', voiceVolume.toString());
  }, [voiceVolume]);

  useEffect(() => {
    localStorage.setItem('selectedVoiceIndex', selectedVoiceIndex.toString());
  }, [selectedVoiceIndex]);

  // Voice narration function
  const speak = useCallback((text: string) => {
    if (!speechSynthRef.current || !voiceNarrationEnabled) return;
    
    // Cancel any ongoing speech
    speechSynthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Use selected voice or find a good default English voice
    let voice: SpeechSynthesisVoice | undefined;
    if (selectedVoiceIndex >= 0 && availableVoices[selectedVoiceIndex]) {
      voice = availableVoices[selectedVoiceIndex];
    } else {
      voice = availableVoices.find(
        v => v.lang.startsWith('en') && v.name.includes('Google')
      ) || availableVoices.find(
        v => v.lang.startsWith('en')
      ) || availableVoices[0];
    }
    
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.rate = voiceSpeed;
    utterance.pitch = voicePitch;
    utterance.volume = voiceVolume;
    
    speechSynthRef.current.speak(utterance);
  }, [voiceNarrationEnabled, availableVoices, voiceSpeed, voicePitch, voiceVolume, selectedVoiceIndex]);

  // Speak step explanation when step changes
  useEffect(() => {
    if (voiceNarrationEnabled && steps.length > 0 && currentStep !== lastSpokenStepRef.current) {
      const stepData = steps[currentStep];
      if (stepData?.explanation) {
        const narrationText = stepData.explanation.action;
        speak(narrationText);
        lastSpokenStepRef.current = currentStep;
      } else if (stepData?.description) {
        speak(stepData.description);
        lastSpokenStepRef.current = currentStep;
      }
    }
  }, [currentStep, steps, voiceNarrationEnabled, speak]);

  // Stop speech when narration is disabled
  useEffect(() => {
    if (!voiceNarrationEnabled && speechSynthRef.current) {
      speechSynthRef.current.cancel();
    }
  }, [voiceNarrationEnabled]);

  // Handle voice narration toggle
  const handleVoiceNarrationToggle = (enabled: boolean) => {
    if (enabled && !window.speechSynthesis) {
      toast.error("Voice narration is not supported in your browser");
      return;
    }
    setVoiceNarrationEnabled(enabled);
    if (enabled) {
      toast.success("Voice narration enabled");
    } else {
      speechSynthRef.current?.cancel();
      toast.info("Voice narration disabled");
    }
  };

  // Test voice function
  const testVoice = useCallback(() => {
    if (!speechSynthRef.current) {
      toast.error("Speech synthesis not available");
      return;
    }
    
    speechSynthRef.current.cancel();
    const testText = "Testing voice settings. Comparing element 5 with element 8, swap needed!";
    const utterance = new SpeechSynthesisUtterance(testText);
    
    let voice: SpeechSynthesisVoice | undefined;
    if (selectedVoiceIndex >= 0 && availableVoices[selectedVoiceIndex]) {
      voice = availableVoices[selectedVoiceIndex];
    } else {
      voice = availableVoices.find(
        v => v.lang.startsWith('en') && v.name.includes('Google')
      ) || availableVoices.find(
        v => v.lang.startsWith('en')
      ) || availableVoices[0];
    }
    
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.rate = voiceSpeed;
    utterance.pitch = voicePitch;
    utterance.volume = voiceVolume;
    
    speechSynthRef.current.speak(utterance);
    toast.info("Playing test voice...");
  }, [availableVoices, selectedVoiceIndex, voiceSpeed, voicePitch, voiceVolume]);

  // Reset voice settings to defaults
  const resetVoiceSettings = useCallback(() => {
    setVoiceSpeed(1);
    setVoicePitch(1);
    setVoiceVolume(1);
    setSelectedVoiceIndex(-1);
    toast.success("Voice settings reset to defaults");
  }, []);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onPlay: () => steps.length > 0 && !isPlaying && setIsPlaying(true),
    onPause: () => isPlaying && setIsPlaying(false),
    onStepForward: () => !isPlaying && currentStep < steps.length - 1 && setCurrentStep(prev => prev + 1),
    onStepBackward: () => !isPlaying && currentStep > 0 && setCurrentStep(prev => prev - 1),
    onReset: () => !isPlaying && generateRandomArray(),
  });

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

    steps.push({ 
      array: [...array], 
      description: "Starting Bubble Sort",
      explanation: {
        action: "Initializing Bubble Sort algorithm",
        pointerChanges: "No pointers set yet",
        comparison: "No comparisons made"
      }
    });

    for (let i = 0; i < array.length; i++) {
      for (let j = 0; j < array.length - i - 1; j++) {
        comparisons++;
        steps.push({
          array: [...array],
          comparing: [j, j + 1],
          sorted: [...sorted],
          description: `Comparing ${array[j]} and ${array[j + 1]}`,
          explanation: {
            action: `Comparing adjacent elements at positions ${j} and ${j + 1}`,
            pointerChanges: `j = ${j}, comparing indices [${j}, ${j + 1}]`,
            comparison: `${array[j]} ${array[j] > array[j + 1] ? '>' : '≤'} ${array[j + 1]} → ${array[j] > array[j + 1] ? 'Swap needed' : 'No swap needed'}`
          }
        });

        if (array[j] > array[j + 1]) {
          swaps++;
          const temp = array[j];
          [array[j], array[j + 1]] = [array[j + 1], array[j]];
          steps.push({
            array: [...array],
            swapping: [j, j + 1],
            sorted: [...sorted],
            description: `Swapping ${array[j]} and ${array[j + 1]}`,
            explanation: {
              action: `Swapping elements: ${array[j + 1]} ↔ ${array[j]}`,
              pointerChanges: `Positions ${j} and ${j + 1} exchanged`,
              comparison: `Swap #${swaps}: Moved larger element (${temp}) right`
            }
          });
        }
      }
      sorted.push(array.length - i - 1);
    }

    steps.push({ 
      array: [...array], 
      sorted: Array.from({ length: array.length }, (_, i) => i), 
      description: "Sorted!",
      explanation: {
        action: "Bubble Sort complete! Array is now sorted",
        pointerChanges: "All elements in final positions",
        comparison: `Total: ${comparisons} comparisons, ${swaps} swaps`
      }
    });
    setStats({ comparisons, swaps, timeComplexity: "O(n²)" });
    return steps;
  };

  const insertionSort = (arr: number[]): Step[] => {
    const steps: Step[] = [];
    const array = [...arr];
    let comparisons = 0;
    let swaps = 0;
    const sorted: number[] = [0];

    steps.push({ 
      array: [...array], 
      sorted: [0], 
      description: "Starting Insertion Sort",
      explanation: {
        action: "Initializing Insertion Sort - first element is already 'sorted'",
        pointerChanges: "Sorted portion: [0], unsorted: [1..n-1]",
        comparison: "No comparisons made yet"
      }
    });

    for (let i = 1; i < array.length; i++) {
      const key = array[i];
      let j = i - 1;

      steps.push({
        array: [...array],
        comparing: [i],
        sorted: [...sorted],
        description: `Inserting ${key} into sorted portion`,
        explanation: {
          action: `Picking element ${key} from position ${i} to insert`,
          pointerChanges: `i = ${i}, key = ${key}, scanning left from j = ${j}`,
          comparison: `Will compare ${key} with sorted elements`
        }
      });

      while (j >= 0 && array[j] > key) {
        comparisons++;
        swaps++;
        const shiftedVal = array[j];
        array[j + 1] = array[j];
        steps.push({
          array: [...array],
          swapping: [j, j + 1],
          sorted: [...sorted],
          description: `Moving ${shiftedVal} to the right`,
          explanation: {
            action: `Shifting ${shiftedVal} from position ${j} to ${j + 1}`,
            pointerChanges: `j = ${j} → ${j - 1}`,
            comparison: `${shiftedVal} > ${key} → Shift right`
          }
        });
        j--;
      }
      array[j + 1] = key;
      sorted.push(i);
    }

    steps.push({ 
      array: [...array], 
      sorted: Array.from({ length: array.length }, (_, i) => i), 
      description: "Sorted!",
      explanation: {
        action: "Insertion Sort complete! Array is now sorted",
        pointerChanges: "All elements in final positions",
        comparison: `Total: ${comparisons} comparisons, ${swaps} shifts`
      }
    });
    setStats({ comparisons, swaps, timeComplexity: "O(n²)" });
    return steps;
  };

  const selectionSort = (arr: number[]): Step[] => {
    const steps: Step[] = [];
    const array = [...arr];
    let comparisons = 0;
    let swaps = 0;
    const sorted: number[] = [];

    steps.push({ 
      array: [...array], 
      description: "Starting Selection Sort",
      explanation: {
        action: "Initializing Selection Sort - will find minimum in each pass",
        pointerChanges: "No pointers set yet",
        comparison: "No comparisons made yet"
      }
    });

    for (let i = 0; i < array.length - 1; i++) {
      let minIdx = i;

      for (let j = i + 1; j < array.length; j++) {
        comparisons++;
        const isNewMin = array[j] < array[minIdx];
        steps.push({
          array: [...array],
          comparing: [minIdx, j],
          sorted: [...sorted],
          description: `Finding minimum: comparing ${array[minIdx]} and ${array[j]}`,
          explanation: {
            action: `Scanning for minimum in unsorted portion [${i}..${array.length - 1}]`,
            pointerChanges: `i = ${i}, j = ${j}, minIdx = ${minIdx}${isNewMin ? ` → ${j}` : ''}`,
            comparison: `${array[j]} ${isNewMin ? '<' : '≥'} ${array[minIdx]} → ${isNewMin ? 'New minimum found!' : 'Keep current minimum'}`
          }
        });

        if (isNewMin) {
          minIdx = j;
        }
      }

      if (minIdx !== i) {
        swaps++;
        const swappedVals = [array[i], array[minIdx]];
        [array[i], array[minIdx]] = [array[minIdx], array[i]];
        steps.push({
          array: [...array],
          swapping: [i, minIdx],
          sorted: [...sorted],
          description: `Swapping ${swappedVals[0]} with ${swappedVals[1]}`,
          explanation: {
            action: `Placing minimum ${swappedVals[1]} at position ${i}`,
            pointerChanges: `Swapped positions ${i} ↔ ${minIdx}`,
            comparison: `Swap #${swaps}: ${swappedVals[1]} is the minimum for this pass`
          }
        });
      }
      sorted.push(i);
    }

    steps.push({ 
      array: [...array], 
      sorted: Array.from({ length: array.length }, (_, i) => i), 
      description: "Sorted!",
      explanation: {
        action: "Selection Sort complete! Array is now sorted",
        pointerChanges: "All elements in final positions",
        comparison: `Total: ${comparisons} comparisons, ${swaps} swaps`
      }
    });
    setStats({ comparisons, swaps, timeComplexity: "O(n²)" });
    return steps;
  };

  const quickSort = (arr: number[]): Step[] => {
    const steps: Step[] = [];
    const array = [...arr];
    let comparisons = 0;
    let swaps = 0;

    steps.push({ 
      array: [...array], 
      description: "Starting Quick Sort",
      explanation: {
        action: "Initializing Quick Sort - divide and conquer approach",
        pointerChanges: "No pointers set yet",
        comparison: "No comparisons made yet"
      }
    });

    const partition = (low: number, high: number): number => {
      const pivot = array[high];
      let i = low - 1;

      steps.push({
        array: [...array],
        pivot: high,
        description: `Pivot selected: ${pivot}`,
        explanation: {
          action: `Selected pivot element ${pivot} at position ${high}`,
          pointerChanges: `low = ${low}, high = ${high}, i = ${i}`,
          comparison: `Will partition around pivot ${pivot}`
        }
      });

      for (let j = low; j < high; j++) {
        comparisons++;
        const isLessThanPivot = array[j] < pivot;
        steps.push({
          array: [...array],
          comparing: [j, high],
          pivot: high,
          description: `Comparing ${array[j]} with pivot ${pivot}`,
          explanation: {
            action: `Checking if ${array[j]} should go left of pivot`,
            pointerChanges: `j = ${j}, i = ${i}`,
            comparison: `${array[j]} ${isLessThanPivot ? '<' : '≥'} ${pivot} → ${isLessThanPivot ? 'Move to left partition' : 'Stay in right partition'}`
          }
        });

        if (isLessThanPivot) {
          i++;
          swaps++;
          const swappedVals = [array[i], array[j]];
          [array[i], array[j]] = [array[j], array[i]];
          steps.push({
            array: [...array],
            swapping: [i, j],
            pivot: high,
            description: `Swapping ${swappedVals[0]} and ${swappedVals[1]}`,
            explanation: {
              action: `Moving ${swappedVals[1]} to left partition`,
              pointerChanges: `i incremented to ${i}, swapped positions ${i} ↔ ${j}`,
              comparison: `Swap #${swaps}: Building left partition`
            }
          });
        }
      }

      swaps++;
      const pivotVal = array[high];
      [array[i + 1], array[high]] = [array[high], array[i + 1]];
      steps.push({
        array: [...array],
        swapping: [i + 1, high],
        description: `Placing pivot ${pivotVal} in correct position`,
        explanation: {
          action: `Pivot ${pivotVal} placed at final position ${i + 1}`,
          pointerChanges: `Pivot moved from ${high} to ${i + 1}`,
          comparison: `Partition complete: left [${low}..${i}], pivot at ${i + 1}, right [${i + 2}..${high}]`
        }
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
    steps.push({ 
      array: [...array], 
      sorted: Array.from({ length: array.length }, (_, i) => i), 
      description: "Sorted!",
      explanation: {
        action: "Quick Sort complete! Array is now sorted",
        pointerChanges: "All elements in final positions",
        comparison: `Total: ${comparisons} comparisons, ${swaps} swaps`
      }
    });
    setStats({ comparisons, swaps, timeComplexity: "O(n log n)" });
    return steps;
  };

  const mergeSort = (arr: number[]): Step[] => {
    const steps: Step[] = [];
    const array = [...arr];
    let comparisons = 0;
    let swaps = 0;

    steps.push({ 
      array: [...array], 
      description: "Starting Merge Sort",
      explanation: {
        action: "Initializing Merge Sort - divide array then merge sorted halves",
        pointerChanges: "No pointers set yet",
        comparison: "No comparisons made yet"
      }
    });

    const merge = (left: number, mid: number, right: number) => {
      const leftArr = array.slice(left, mid + 1);
      const rightArr = array.slice(mid + 1, right + 1);
      let i = 0, j = 0, k = left;

      steps.push({
        array: [...array],
        comparing: Array.from({ length: right - left + 1 }, (_, idx) => left + idx),
        description: `Merging subarrays`,
        explanation: {
          action: `Merging subarrays [${left}..${mid}] and [${mid + 1}..${right}]`,
          pointerChanges: `left pointer i = ${i}, right pointer j = ${j}, write position k = ${k}`,
          comparison: `Comparing elements from left [${leftArr.join(', ')}] and right [${rightArr.join(', ')}]`
        }
      });

      while (i < leftArr.length && j < rightArr.length) {
        comparisons++;
        const pickedLeft = leftArr[i] <= rightArr[j];
        const pickedVal = pickedLeft ? leftArr[i] : rightArr[j];
        if (pickedLeft) {
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
          description: `Placing ${pickedVal} in merged array`,
          explanation: {
            action: `Picked ${pickedVal} from ${pickedLeft ? 'left' : 'right'} subarray`,
            pointerChanges: `${pickedLeft ? `i: ${i - 1} → ${i}` : `j: ${j - 1} → ${j}`}, k: ${k} → ${k + 1}`,
            comparison: `${leftArr[i - (pickedLeft ? 1 : 0)] || '—'} vs ${rightArr[j - (pickedLeft ? 0 : 1)] || '—'} → Picked smaller`
          }
        });
        k++;
      }

      while (i < leftArr.length) {
        array[k] = leftArr[i];
        steps.push({ 
          array: [...array], 
          swapping: [k], 
          description: `Copying remaining elements`,
          explanation: {
            action: `Copying remaining element ${leftArr[i]} from left subarray`,
            pointerChanges: `i: ${i} → ${i + 1}, k: ${k} → ${k + 1}`,
            comparison: `Right subarray exhausted, copying left remainder`
          }
        });
        i++;
        k++;
      }

      while (j < rightArr.length) {
        array[k] = rightArr[j];
        steps.push({ 
          array: [...array], 
          swapping: [k], 
          description: `Copying remaining elements`,
          explanation: {
            action: `Copying remaining element ${rightArr[j]} from right subarray`,
            pointerChanges: `j: ${j} → ${j + 1}, k: ${k} → ${k + 1}`,
            comparison: `Left subarray exhausted, copying right remainder`
          }
        });
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
    steps.push({ 
      array: [...array], 
      sorted: Array.from({ length: array.length }, (_, i) => i), 
      description: "Sorted!",
      explanation: {
        action: "Merge Sort complete! Array is now sorted",
        pointerChanges: "All elements in final positions",
        comparison: `Total: ${comparisons} comparisons, ${swaps} merges`
      }
    });
    setStats({ comparisons, swaps, timeComplexity: "O(n log n)" });
    return steps;
  };

  const startVisualization = () => {
    let sortSteps: Step[] = [];
    setIsComplete(false);
    setStartTime(Date.now());
    setElapsedTime(0);
    
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

  const handleQuickStartExample = (values: number[], algorithmType: string) => {
    setArray(values);
    setArraySize(values.length);
    setAlgorithm(algorithmType as Algorithm);
    setSteps([]);
    setCurrentStep(0);
    setIsPlaying(false);
    setIsComplete(false);
    toast.success(`Loaded ${algorithmType} sort example with ${values.length} values`);
  };

  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
        if (startTime > 0) {
          setElapsedTime((Date.now() - startTime) / 1000);
        }
      }, speed);
      return () => clearTimeout(timer);
    } else if (currentStep >= steps.length - 1 && steps.length > 0) {
      setIsPlaying(false);
      setIsComplete(true);
      if (startTime > 0) {
        setElapsedTime((Date.now() - startTime) / 1000);
      }
    }
  }, [isPlaying, currentStep, steps.length, speed, startTime]);

  const currentStepData = steps[currentStep] || { array, description: "Click Visualize to start" };
  const maxValue = Math.max(...array);
  const progress = steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Accessibility Controls */}
      <AccessibilityControls />

      {/* Quick Start Examples */}
      <QuickStartExamples onSelectExample={handleQuickStartExample} />

      {/* Algorithm Information */}
      <AlgorithmInfo algorithm={algorithm} />

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

          <div className="flex gap-2 flex-wrap items-center">
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
            
            {/* Keyboard Shortcuts Help */}
            <KeyboardShortcutsHelp triggerClassName="gap-1 md:gap-2 text-xs md:text-sm" />

            <div className="flex items-center gap-4 ml-auto border-l border-border pl-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Switch
                  id="step-explanation"
                  checked={showStepExplanation}
                  onCheckedChange={setShowStepExplanation}
                />
                <Label htmlFor="step-explanation" className="text-sm font-medium flex items-center gap-1.5 cursor-pointer">
                  <FileText className="h-4 w-4" />
                  Step Explanation
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="voice-narration"
                  checked={voiceNarrationEnabled}
                  onCheckedChange={handleVoiceNarrationToggle}
                />
                <Label htmlFor="voice-narration" className="text-sm font-medium flex items-center gap-1.5 cursor-pointer">
                  {voiceNarrationEnabled ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4" />}
                  Voice
                </Label>
              </div>
              {voiceNarrationEnabled && (
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="voice-select" className="text-xs text-muted-foreground whitespace-nowrap">
                      Voice:
                    </Label>
                    <Select
                      value={selectedVoiceIndex.toString()}
                      onValueChange={(value) => setSelectedVoiceIndex(parseInt(value))}
                    >
                      <SelectTrigger className="w-[140px] h-8 text-xs">
                        <SelectValue placeholder="Auto" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px]">
                        <SelectItem value="-1">Auto (English)</SelectItem>
                        {availableVoices.map((voice, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            {voice.name.length > 20 ? voice.name.slice(0, 20) + '...' : voice.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2 min-w-[120px]">
                    <Label htmlFor="voice-speed" className="text-xs text-muted-foreground whitespace-nowrap">
                      Speed: {voiceSpeed.toFixed(1)}x
                    </Label>
                    <Slider
                      id="voice-speed"
                      value={[voiceSpeed]}
                      onValueChange={([value]) => setVoiceSpeed(value)}
                      min={0.5}
                      max={2}
                      step={0.1}
                      className="w-14"
                    />
                  </div>
                  <div className="flex items-center gap-2 min-w-[110px]">
                    <Label htmlFor="voice-pitch" className="text-xs text-muted-foreground whitespace-nowrap">
                      Pitch: {voicePitch.toFixed(1)}
                    </Label>
                    <Slider
                      id="voice-pitch"
                      value={[voicePitch]}
                      onValueChange={([value]) => setVoicePitch(value)}
                      min={0.5}
                      max={2}
                      step={0.1}
                      className="w-14"
                    />
                  </div>
                  <div className="flex items-center gap-2 min-w-[110px]">
                    <Label htmlFor="voice-volume" className="text-xs text-muted-foreground whitespace-nowrap">
                      Vol: {Math.round(voiceVolume * 100)}%
                    </Label>
                    <Slider
                      id="voice-volume"
                      value={[voiceVolume]}
                      onValueChange={([value]) => setVoiceVolume(value)}
                      min={0}
                      max={1}
                      step={0.1}
                      className="w-14"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={testVoice}
                    className="h-8 text-xs gap-1"
                  >
                    <Volume1 className="h-3 w-3" />
                    Test
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetVoiceSettings}
                    className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground"
                  >
                    <RotateCw className="h-3 w-3" />
                    Reset
                  </Button>
                </div>
              )}
            </div>
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

            {/* Step Explanation Panel */}
            {showStepExplanation && currentStepData.explanation && (
              <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-3 animate-fade-in">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <FileText className="h-4 w-4" />
                  Step Explanation
                </div>
                <div className="grid gap-3 text-sm">
                  <div className="flex items-start gap-3 p-2 bg-background/50 rounded-md">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-500 shrink-0">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">What's happening</p>
                      <p className="text-muted-foreground">{currentStepData.explanation.action}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-2 bg-background/50 rounded-md">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 shrink-0">
                      <Pointer className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Pointer/Index Changes</p>
                      <p className="text-muted-foreground font-mono text-xs">{currentStepData.explanation.pointerChanges}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-2 bg-background/50 rounded-md">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/20 text-green-500 shrink-0">
                      <GitCompare className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Key Comparison/Swap</p>
                      <p className="text-muted-foreground font-mono text-xs">{currentStepData.explanation.comparison}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
      <div className="grid md:grid-cols-2 gap-4">
        <MetricsDashboard
          comparisons={stats.comparisons}
          swaps={stats.swaps}
          timeComplexity={stats.timeComplexity}
          currentStep={currentStep}
          totalSteps={steps.length}
          elapsedTime={elapsedTime}
        />
        <ComplexityHeatmap 
          comparisons={stats.comparisons} 
          swaps={stats.swaps} 
          isActive={steps.length > 0}
        />
      </div>

      <MemoryVisualizer 
        arraySize={array.length}
        currentStep={currentStep}
        totalSteps={steps.length}
        isActive={steps.length > 0}
        currentArray={steps[currentStep]?.array || array}
      />

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
