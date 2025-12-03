import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Code, 
  Search, 
  ArrowUpDown, 
  Binary, 
  TreeDeciduous, 
  Layers,
  Copy,
  Play,
  BookOpen
} from "lucide-react";
import { toast } from "sonner";

interface CodeSnippet {
  id: string;
  name: string;
  description: string;
  category: string;
  complexity: { time: string; space: string };
  code: string;
  language: string;
}

const snippets: CodeSnippet[] = [
  // Sorting Algorithms
  {
    id: "bubble-sort",
    name: "Bubble Sort",
    description: "Simple comparison-based sorting algorithm",
    category: "sorting",
    complexity: { time: "O(n²)", space: "O(1)" },
    language: "javascript",
    code: `function bubbleSort(arr) {
  let n = arr.length;
  let swapped;
  
  for (let i = 0; i < n - 1; i++) {
    swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        // Swap elements
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
      }
    }
    // If no swapping occurred, array is sorted
    if (!swapped) break;
  }
  return arr;
}

// Test
let array = [64, 34, 25, 12, 22, 11, 90];
console.log("Original:", array);
console.log("Sorted:", bubbleSort([...array]));`
  },
  {
    id: "quick-sort",
    name: "Quick Sort",
    description: "Efficient divide-and-conquer sorting algorithm",
    category: "sorting",
    complexity: { time: "O(n log n)", space: "O(log n)" },
    language: "javascript",
    code: `function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    let pivotIndex = partition(arr, low, high);
    quickSort(arr, low, pivotIndex - 1);
    quickSort(arr, pivotIndex + 1, high);
  }
  return arr;
}

function partition(arr, low, high) {
  let pivot = arr[high];
  let i = low - 1;
  
  for (let j = low; j < high; j++) {
    if (arr[j] < pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}

// Test
let array = [64, 34, 25, 12, 22, 11, 90];
console.log("Original:", array);
console.log("Sorted:", quickSort([...array]));`
  },
  {
    id: "merge-sort",
    name: "Merge Sort",
    description: "Stable divide-and-conquer sorting algorithm",
    category: "sorting",
    complexity: { time: "O(n log n)", space: "O(n)" },
    language: "javascript",
    code: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  
  return merge(left, right);
}

function merge(left, right) {
  let result = [];
  let i = 0, j = 0;
  
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }
  
  return result.concat(left.slice(i)).concat(right.slice(j));
}

// Test
let array = [64, 34, 25, 12, 22, 11, 90];
console.log("Original:", array);
console.log("Sorted:", mergeSort([...array]));`
  },
  {
    id: "insertion-sort",
    name: "Insertion Sort",
    description: "Simple sorting algorithm that builds the sorted array one item at a time",
    category: "sorting",
    complexity: { time: "O(n²)", space: "O(1)" },
    language: "javascript",
    code: `function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    let key = arr[i];
    let j = i - 1;
    
    // Move elements greater than key one position ahead
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
  return arr;
}

// Test
let array = [64, 34, 25, 12, 22, 11, 90];
console.log("Original:", array);
console.log("Sorted:", insertionSort([...array]));`
  },
  {
    id: "selection-sort",
    name: "Selection Sort",
    description: "Simple sorting by repeatedly finding the minimum element",
    category: "sorting",
    complexity: { time: "O(n²)", space: "O(1)" },
    language: "javascript",
    code: `function selectionSort(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    let minIdx = i;
    
    // Find minimum element in unsorted portion
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }
    
    // Swap if minimum is not at current position
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }
  }
  return arr;
}

// Test
let array = [64, 34, 25, 12, 22, 11, 90];
console.log("Original:", array);
console.log("Sorted:", selectionSort([...array]));`
  },
  {
    id: "heap-sort",
    name: "Heap Sort",
    description: "Comparison-based sorting using a binary heap data structure",
    category: "sorting",
    complexity: { time: "O(n log n)", space: "O(1)" },
    language: "javascript",
    code: `function heapSort(arr) {
  const n = arr.length;
  
  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(arr, n, i);
  }
  
  // Extract elements from heap
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    heapify(arr, i, 0);
  }
  return arr;
}

function heapify(arr, n, i) {
  let largest = i;
  let left = 2 * i + 1;
  let right = 2 * i + 2;
  
  if (left < n && arr[left] > arr[largest]) largest = left;
  if (right < n && arr[right] > arr[largest]) largest = right;
  
  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    heapify(arr, n, largest);
  }
}

// Test
let array = [64, 34, 25, 12, 22, 11, 90];
console.log("Original:", array);
console.log("Sorted:", heapSort([...array]));`
  },
  // Searching Algorithms
  {
    id: "binary-search",
    name: "Binary Search",
    description: "Efficient search algorithm for sorted arrays",
    category: "searching",
    complexity: { time: "O(log n)", space: "O(1)" },
    language: "javascript",
    code: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      return mid; // Found
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return -1; // Not found
}

// Test
let sortedArray = [11, 12, 22, 25, 34, 64, 90];
let target = 25;
let result = binarySearch(sortedArray, target);
console.log("Array:", sortedArray);
console.log("Target:", target);
console.log("Found at index:", result);`
  },
  {
    id: "linear-search",
    name: "Linear Search",
    description: "Simple search algorithm that checks each element sequentially",
    category: "searching",
    complexity: { time: "O(n)", space: "O(1)" },
    language: "javascript",
    code: `function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      return i; // Found
    }
  }
  return -1; // Not found
}

// Test
let array = [64, 34, 25, 12, 22, 11, 90];
let target = 22;
let result = linearSearch(array, target);
console.log("Array:", array);
console.log("Target:", target);
console.log("Found at index:", result);`
  },
  {
    id: "jump-search",
    name: "Jump Search",
    description: "Search algorithm that jumps ahead by fixed steps",
    category: "searching",
    complexity: { time: "O(√n)", space: "O(1)" },
    language: "javascript",
    code: `function jumpSearch(arr, target) {
  const n = arr.length;
  const step = Math.floor(Math.sqrt(n));
  let prev = 0;
  
  // Jump ahead to find the block
  while (arr[Math.min(step, n) - 1] < target) {
    prev = step;
    step += Math.floor(Math.sqrt(n));
    if (prev >= n) return -1;
  }
  
  // Linear search within the block
  while (arr[prev] < target) {
    prev++;
    if (prev === Math.min(step, n)) return -1;
  }
  
  if (arr[prev] === target) return prev;
  return -1;
}

// Test
let sortedArray = [11, 12, 22, 25, 34, 64, 90];
let target = 34;
console.log("Array:", sortedArray);
console.log("Target:", target);
console.log("Found at index:", jumpSearch(sortedArray, target));`
  },
  // Tree Algorithms
  {
    id: "bst-operations",
    name: "Binary Search Tree",
    description: "BST implementation with insert, search, and traversal",
    category: "trees",
    complexity: { time: "O(log n) avg", space: "O(n)" },
    language: "javascript",
    code: `class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

class BST {
  constructor() {
    this.root = null;
  }
  
  insert(value) {
    const node = new TreeNode(value);
    if (!this.root) {
      this.root = node;
      return;
    }
    
    let current = this.root;
    while (true) {
      if (value < current.value) {
        if (!current.left) {
          current.left = node;
          return;
        }
        current = current.left;
      } else {
        if (!current.right) {
          current.right = node;
          return;
        }
        current = current.right;
      }
    }
  }
  
  inorder(node = this.root, result = []) {
    if (node) {
      this.inorder(node.left, result);
      result.push(node.value);
      this.inorder(node.right, result);
    }
    return result;
  }
}

// Test
let bst = new BST();
[50, 30, 70, 20, 40, 60, 80].forEach(v => bst.insert(v));
console.log("Inorder traversal:", bst.inorder());`
  },
  {
    id: "tree-traversals",
    name: "Tree Traversals",
    description: "Inorder, Preorder, and Postorder traversals",
    category: "trees",
    complexity: { time: "O(n)", space: "O(h)" },
    language: "javascript",
    code: `class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

function inorder(node, result = []) {
  if (node) {
    inorder(node.left, result);
    result.push(node.value);
    inorder(node.right, result);
  }
  return result;
}

function preorder(node, result = []) {
  if (node) {
    result.push(node.value);
    preorder(node.left, result);
    preorder(node.right, result);
  }
  return result;
}

function postorder(node, result = []) {
  if (node) {
    postorder(node.left, result);
    postorder(node.right, result);
    result.push(node.value);
  }
  return result;
}

// Build sample tree
let root = new TreeNode(1);
root.left = new TreeNode(2);
root.right = new TreeNode(3);
root.left.left = new TreeNode(4);
root.left.right = new TreeNode(5);

console.log("Inorder:", inorder(root));
console.log("Preorder:", preorder(root));
console.log("Postorder:", postorder(root));`
  },
  // Graph Algorithms
  {
    id: "bfs",
    name: "Breadth-First Search",
    description: "Graph traversal using queue (level by level)",
    category: "graphs",
    complexity: { time: "O(V + E)", space: "O(V)" },
    language: "javascript",
    code: `function bfs(graph, start) {
  let visited = new Set();
  let queue = [start];
  let result = [];
  
  visited.add(start);
  
  while (queue.length > 0) {
    let vertex = queue.shift();
    result.push(vertex);
    
    for (let neighbor of graph[vertex]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return result;
}

// Test with adjacency list
let graph = {
  'A': ['B', 'C'],
  'B': ['A', 'D', 'E'],
  'C': ['A', 'F'],
  'D': ['B'],
  'E': ['B', 'F'],
  'F': ['C', 'E']
};

console.log("BFS from A:", bfs(graph, 'A'));`
  },
  {
    id: "dfs",
    name: "Depth-First Search",
    description: "Graph traversal using stack (goes deep first)",
    category: "graphs",
    complexity: { time: "O(V + E)", space: "O(V)" },
    language: "javascript",
    code: `function dfs(graph, start, visited = new Set()) {
  visited.add(start);
  console.log("Visiting:", start);
  
  for (let neighbor of graph[start]) {
    if (!visited.has(neighbor)) {
      dfs(graph, neighbor, visited);
    }
  }
  return [...visited];
}

// Test with adjacency list
let graph = {
  'A': ['B', 'C'],
  'B': ['A', 'D', 'E'],
  'C': ['A', 'F'],
  'D': ['B'],
  'E': ['B', 'F'],
  'F': ['C', 'E']
};

console.log("DFS from A:", dfs(graph, 'A'));`
  },
  {
    id: "dijkstra",
    name: "Dijkstra's Algorithm",
    description: "Shortest path algorithm for weighted graphs",
    category: "graphs",
    complexity: { time: "O(V² or E log V)", space: "O(V)" },
    language: "javascript",
    code: `function dijkstra(graph, start) {
  let distances = {};
  let visited = new Set();
  let nodes = Object.keys(graph);
  
  // Initialize distances
  for (let node of nodes) {
    distances[node] = Infinity;
  }
  distances[start] = 0;
  
  while (visited.size < nodes.length) {
    // Find unvisited node with minimum distance
    let minNode = null;
    for (let node of nodes) {
      if (!visited.has(node)) {
        if (minNode === null || distances[node] < distances[minNode]) {
          minNode = node;
        }
      }
    }
    
    if (distances[minNode] === Infinity) break;
    visited.add(minNode);
    
    // Update distances to neighbors
    for (let [neighbor, weight] of Object.entries(graph[minNode])) {
      let newDist = distances[minNode] + weight;
      if (newDist < distances[neighbor]) {
        distances[neighbor] = newDist;
      }
    }
  }
  return distances;
}

// Test with weighted adjacency list
let graph = {
  'A': { 'B': 4, 'C': 2 },
  'B': { 'A': 4, 'C': 1, 'D': 5 },
  'C': { 'A': 2, 'B': 1, 'D': 8 },
  'D': { 'B': 5, 'C': 8 }
};

console.log("Shortest paths from A:", dijkstra(graph, 'A'));`
  },
  // Dynamic Programming
  {
    id: "fibonacci",
    name: "Fibonacci (DP)",
    description: "Fibonacci sequence using dynamic programming",
    category: "dynamic",
    complexity: { time: "O(n)", space: "O(n)" },
    language: "javascript",
    code: `// Memoization approach
function fibMemo(n, memo = {}) {
  if (n in memo) return memo[n];
  if (n <= 1) return n;
  
  memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
  return memo[n];
}

// Tabulation approach
function fibTab(n) {
  if (n <= 1) return n;
  
  let dp = [0, 1];
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  return dp[n];
}

// Test
console.log("Fibonacci (memo) of 10:", fibMemo(10));
console.log("Fibonacci (tab) of 10:", fibTab(10));
console.log("Sequence:", Array.from({length: 10}, (_, i) => fibTab(i)));`
  },
  {
    id: "knapsack",
    name: "0/1 Knapsack",
    description: "Classic dynamic programming problem",
    category: "dynamic",
    complexity: { time: "O(nW)", space: "O(nW)" },
    language: "javascript",
    code: `function knapsack(weights, values, capacity) {
  const n = weights.length;
  const dp = Array(n + 1).fill(null)
    .map(() => Array(capacity + 1).fill(0));
  
  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      if (weights[i - 1] <= w) {
        dp[i][w] = Math.max(
          values[i - 1] + dp[i - 1][w - weights[i - 1]],
          dp[i - 1][w]
        );
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }
  return dp[n][capacity];
}

// Test
let weights = [2, 3, 4, 5];
let values = [3, 4, 5, 6];
let capacity = 5;

console.log("Weights:", weights);
console.log("Values:", values);
console.log("Capacity:", capacity);
console.log("Max value:", knapsack(weights, values, capacity));`
  },
  {
    id: "lcs",
    name: "Longest Common Subsequence",
    description: "Find the longest subsequence common to two sequences",
    category: "dynamic",
    complexity: { time: "O(mn)", space: "O(mn)" },
    language: "javascript",
    code: `function lcs(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  const dp = Array(m + 1).fill(null)
    .map(() => Array(n + 1).fill(0));
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  // Backtrack to find the actual LCS
  let lcsStr = '';
  let i = m, j = n;
  while (i > 0 && j > 0) {
    if (str1[i - 1] === str2[j - 1]) {
      lcsStr = str1[i - 1] + lcsStr;
      i--; j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }
  
  return { length: dp[m][n], sequence: lcsStr };
}

// Test
let str1 = "AGGTAB";
let str2 = "GXTXAYB";
let result = lcs(str1, str2);
console.log("String 1:", str1);
console.log("String 2:", str2);
console.log("LCS Length:", result.length);
console.log("LCS:", result.sequence);`
  }
];

const categories = [
  { id: "all", name: "All", icon: Layers },
  { id: "sorting", name: "Sorting", icon: ArrowUpDown },
  { id: "searching", name: "Searching", icon: Search },
  { id: "trees", name: "Trees", icon: TreeDeciduous },
  { id: "graphs", name: "Graphs", icon: Binary },
  { id: "dynamic", name: "Dynamic Programming", icon: Code }
];

interface CodeSnippetsLibraryProps {
  onLoadSnippet: (code: string, name: string) => void;
}

export const CodeSnippetsLibrary = ({ onLoadSnippet }: CodeSnippetsLibraryProps) => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSnippets = snippets.filter(snippet => {
    const matchesCategory = activeCategory === "all" || snippet.category === activeCategory;
    const matchesSearch = snippet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         snippet.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  };

  const handleLoadSnippet = (snippet: CodeSnippet) => {
    onLoadSnippet(snippet.code, snippet.name);
    toast.success(`Loaded ${snippet.name}`);
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Algorithm Templates
        </CardTitle>
        <CardDescription>
          Quick-load common algorithm implementations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search algorithms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="w-full flex-wrap h-auto gap-1 bg-muted/50 p-1">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <TabsTrigger
                  key={cat.id}
                  value={cat.id}
                  className="flex items-center gap-1.5 text-xs data-[state=active]:bg-background"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {cat.name}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value={activeCategory} className="mt-3">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {filteredSnippets.map((snippet) => (
                  <Card key={snippet.id} className="border-border/50 hover:border-primary/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm">{snippet.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {snippet.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              Time: {snippet.complexity.time}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Space: {snippet.complexity.space}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Button
                            size="sm"
                            variant="default"
                            className="h-8 px-3"
                            onClick={() => handleLoadSnippet(snippet)}
                          >
                            <Play className="h-3.5 w-3.5 mr-1" />
                            Load
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-3"
                            onClick={() => handleCopyCode(snippet.code)}
                          >
                            <Copy className="h-3.5 w-3.5 mr-1" />
                            Copy
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {filteredSnippets.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No algorithms found matching your search.
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
