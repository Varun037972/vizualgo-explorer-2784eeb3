import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Database, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AlgorithmInfoProps {
  algorithm: string;
}

const algorithmData: Record<string, {
  name: string;
  description: string;
  timeComplexity: { best: string; average: string; worst: string };
  spaceComplexity: string;
  stability: boolean;
  howItWorks: string[];
  useCases: string[];
  pseudocode: string;
}> = {
  bubble: {
    name: "Bubble Sort",
    description: "A simple comparison-based sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.",
    timeComplexity: { best: "O(n)", average: "O(n²)", worst: "O(n²)" },
    spaceComplexity: "O(1)",
    stability: true,
    howItWorks: [
      "Compare adjacent elements in the array",
      "Swap them if they're in wrong order",
      "Repeat until no swaps are needed",
      "Largest elements 'bubble' to the end",
    ],
    useCases: [
      "Small datasets (< 100 elements)",
      "Nearly sorted data",
      "Educational purposes",
      "When simplicity is preferred over efficiency",
    ],
    pseudocode: `function bubbleSort(arr):
    n = length(arr)
    for i from 0 to n-1:
        for j from 0 to n-i-2:
            if arr[j] > arr[j+1]:
                swap(arr[j], arr[j+1])`,
  },
  quick: {
    name: "Quick Sort",
    description: "An efficient divide-and-conquer algorithm that picks a pivot element and partitions the array around it.",
    timeComplexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n²)" },
    spaceComplexity: "O(log n)",
    stability: false,
    howItWorks: [
      "Pick a pivot element from the array",
      "Partition array: smaller left, larger right",
      "Recursively sort the sub-arrays",
      "Combine the sorted sub-arrays",
    ],
    useCases: [
      "Large datasets",
      "General-purpose sorting",
      "When average-case performance matters",
      "In-place sorting requirements",
    ],
    pseudocode: `function quickSort(arr, low, high):
    if low < high:
        pivot = partition(arr, low, high)
        quickSort(arr, low, pivot-1)
        quickSort(arr, pivot+1, high)`,
  },
  merge: {
    name: "Merge Sort",
    description: "A stable divide-and-conquer algorithm that divides the array into halves, sorts them, and merges them back together.",
    timeComplexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)" },
    spaceComplexity: "O(n)",
    stability: true,
    howItWorks: [
      "Divide array into two halves",
      "Recursively sort both halves",
      "Merge the sorted halves together",
      "Repeat until fully sorted",
    ],
    useCases: [
      "Large datasets requiring stability",
      "Linked list sorting",
      "External sorting (disk-based)",
      "When consistent O(n log n) is needed",
    ],
    pseudocode: `function mergeSort(arr):
    if length(arr) <= 1:
        return arr
    mid = length(arr) / 2
    left = mergeSort(arr[0:mid])
    right = mergeSort(arr[mid:])
    return merge(left, right)`,
  },
  insertion: {
    name: "Insertion Sort",
    description: "A simple sorting algorithm that builds the final sorted array one item at a time by inserting elements into their correct position.",
    timeComplexity: { best: "O(n)", average: "O(n²)", worst: "O(n²)" },
    spaceComplexity: "O(1)",
    stability: true,
    howItWorks: [
      "Start with second element",
      "Compare with elements before it",
      "Insert at correct position",
      "Repeat for all elements",
    ],
    useCases: [
      "Small datasets (< 50 elements)",
      "Nearly sorted arrays",
      "Online sorting (sorting as data arrives)",
      "When simplicity and stability matter",
    ],
    pseudocode: `function insertionSort(arr):
    for i from 1 to length(arr)-1:
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j+1] = arr[j]
            j = j - 1
        arr[j+1] = key`,
  },
  selection: {
    name: "Selection Sort",
    description: "A simple sorting algorithm that repeatedly finds the minimum element and places it at the beginning.",
    timeComplexity: { best: "O(n²)", average: "O(n²)", worst: "O(n²)" },
    spaceComplexity: "O(1)",
    stability: false,
    howItWorks: [
      "Find minimum element in unsorted portion",
      "Swap it with the first unsorted element",
      "Move boundary of sorted portion",
      "Repeat until array is sorted",
    ],
    useCases: [
      "Small datasets",
      "When memory writes are expensive",
      "When simplicity is important",
      "Educational purposes",
    ],
    pseudocode: `function selectionSort(arr):
    for i from 0 to length(arr)-2:
        minIdx = i
        for j from i+1 to length(arr)-1:
            if arr[j] < arr[minIdx]:
                minIdx = j
        swap(arr[i], arr[minIdx])`,
  },
};

export const AlgorithmInfo = ({ algorithm }: AlgorithmInfoProps) => {
  const info = algorithmData[algorithm];

  if (!info) return null;

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            {info.name}
          </CardTitle>
          <Badge variant={info.stability ? "default" : "secondary"}>
            {info.stability ? "Stable" : "Unstable"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-2">{info.description}</p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="complexity" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="complexity">Complexity</TabsTrigger>
            <TabsTrigger value="how">How It Works</TabsTrigger>
            <TabsTrigger value="usage">Use Cases</TabsTrigger>
            <TabsTrigger value="code">Pseudocode</TabsTrigger>
          </TabsList>

          <TabsContent value="complexity" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="h-4 w-4 text-primary" />
                  Time Complexity
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Best:</span>
                    <code className="text-secondary">{info.timeComplexity.best}</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Average:</span>
                    <code className="text-accent">{info.timeComplexity.average}</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Worst:</span>
                    <code className="text-destructive">{info.timeComplexity.worst}</code>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Database className="h-4 w-4 text-primary" />
                  Space Complexity
                </div>
                <div className="text-2xl font-bold text-primary">{info.spaceComplexity}</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="how" className="space-y-2">
            <ol className="space-y-2">
              {info.howItWorks.map((step, index) => (
                <li key={index} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center font-semibold">
                    {index + 1}
                  </span>
                  <span className="text-sm text-muted-foreground">{step}</span>
                </li>
              ))}
            </ol>
          </TabsContent>

          <TabsContent value="usage" className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium mb-3">
              <TrendingUp className="h-4 w-4 text-primary" />
              Best Use Cases
            </div>
            <ul className="space-y-2">
              {info.useCases.map((useCase, index) => (
                <li key={index} className="flex gap-2 text-sm text-muted-foreground">
                  <span className="text-primary">•</span>
                  {useCase}
                </li>
              ))}
            </ul>
          </TabsContent>

          <TabsContent value="code">
            <pre className="bg-muted/30 p-4 rounded-lg text-xs overflow-x-auto">
              <code className="text-foreground">{info.pseudocode}</code>
            </pre>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
