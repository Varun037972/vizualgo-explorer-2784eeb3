import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import AnimatedBackground from "@/components/AnimatedBackground";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, CheckCircle2, Target, BookOpen, Eye, Code2, Trophy, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface ModuleData {
  title: string;
  category: string;
  difficulty: string;
  explanation: {
    definition: string;
    steps: string[];
    complexity: { time: string; space: string; best: string; worst: string };
    pseudocode: string;
  };
  preQuiz: QuizQuestion[];
  postQuiz: QuizQuestion[];
  codingChallenge: { prompt: string; starterCode: string; hint: string };
  realWorld: string;
}

const moduleDataMap: Record<string, ModuleData> = {
  "bubble-sort": {
    title: "Bubble Sort",
    category: "Sorting",
    difficulty: "beginner",
    explanation: {
      definition: "Bubble Sort is a simple comparison-based sorting algorithm. It repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. The pass through the list is repeated until the list is sorted.",
      steps: [
        "Start from the first element, compare it with the next element.",
        "If the current element is greater than the next, swap them.",
        "Move to the next pair and repeat the comparison.",
        "After each full pass, the largest unsorted element 'bubbles up' to its correct position.",
        "Repeat until no swaps are needed in a complete pass."
      ],
      complexity: { time: "O(n²)", space: "O(1)", best: "O(n)", worst: "O(n²)" },
      pseudocode: `function bubbleSort(arr):
  n = length(arr)
  for i from 0 to n-1:
    swapped = false
    for j from 0 to n-i-2:
      if arr[j] > arr[j+1]:
        swap(arr[j], arr[j+1])
        swapped = true
    if not swapped:
      break
  return arr`
    },
    preQuiz: [
      { question: "What is the worst-case time complexity of Bubble Sort?", options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"], correct: 2, explanation: "Bubble Sort compares every pair in nested loops, resulting in O(n²) in the worst case." },
      { question: "Bubble Sort is a:", options: ["Divide and conquer algorithm", "Greedy algorithm", "Comparison-based algorithm", "Dynamic programming algorithm"], correct: 2, explanation: "Bubble Sort works by comparing adjacent elements, making it comparison-based." },
      { question: "What happens after the first pass of Bubble Sort?", options: ["Array is fully sorted", "Smallest element is in position", "Largest element is in its final position", "Nothing changes"], correct: 2, explanation: "The largest element 'bubbles up' to the end of the array after the first pass." },
    ],
    postQuiz: [
      { question: "What optimization can make Bubble Sort detect an already sorted array?", options: ["Use recursion", "Track if any swaps occurred", "Sort in reverse", "Use a stack"], correct: 1, explanation: "By tracking if swaps occurred in a pass, we can exit early if the array is already sorted, achieving O(n) best case." },
      { question: "How many comparisons does Bubble Sort make for an array of size 5?", options: ["5", "10", "20", "25"], correct: 1, explanation: "For n=5: 4+3+2+1 = 10 comparisons in the worst case (n*(n-1)/2)." },
      { question: "Is Bubble Sort stable?", options: ["Yes", "No", "Only for integers", "Depends on implementation"], correct: 0, explanation: "Bubble Sort is stable because equal elements maintain their relative order — it only swaps when strictly greater." },
    ],
    codingChallenge: {
      prompt: "Implement Bubble Sort that sorts an array in ascending order. Include the early termination optimization.",
      starterCode: `function bubbleSort(arr) {
  // Your code here
  
  return arr;
}`,
      hint: "Use a 'swapped' flag in the inner loop. If no swaps occur in a pass, the array is already sorted."
    },
    realWorld: "Bubble Sort is used in simple embedded systems, educational tools, and situations where simplicity is more important than performance."
  },
  "quick-sort": {
    title: "Quick Sort",
    category: "Sorting",
    difficulty: "intermediate",
    explanation: {
      definition: "Quick Sort is a divide-and-conquer algorithm that works by selecting a 'pivot' element and partitioning the array around it, so that elements less than pivot go left and greater go right.",
      steps: [
        "Choose a pivot element from the array.",
        "Partition: rearrange elements so smaller ones are left of pivot, larger ones are right.",
        "Recursively apply Quick Sort to the left and right sub-arrays.",
        "Base case: arrays of size 0 or 1 are already sorted.",
        "Combine: the array is sorted in-place, no merging needed."
      ],
      complexity: { time: "O(n log n)", space: "O(log n)", best: "O(n log n)", worst: "O(n²)" },
      pseudocode: `function quickSort(arr, low, high):
  if low < high:
    pivotIndex = partition(arr, low, high)
    quickSort(arr, low, pivotIndex - 1)
    quickSort(arr, pivotIndex + 1, high)

function partition(arr, low, high):
  pivot = arr[high]
  i = low - 1
  for j from low to high - 1:
    if arr[j] <= pivot:
      i++
      swap(arr[i], arr[j])
  swap(arr[i+1], arr[high])
  return i + 1`
    },
    preQuiz: [
      { question: "What technique does Quick Sort use?", options: ["Dynamic Programming", "Divide and Conquer", "Greedy", "Backtracking"], correct: 1, explanation: "Quick Sort divides the array around a pivot and conquers each half recursively." },
      { question: "What is the average time complexity?", options: ["O(n)", "O(n²)", "O(n log n)", "O(log n)"], correct: 2, explanation: "On average, Quick Sort runs in O(n log n) time." },
      { question: "Quick Sort sorts:", options: ["Out of place", "In place", "Using extra array", "Using linked list"], correct: 1, explanation: "Quick Sort partitions in-place, using only O(log n) stack space for recursion." },
    ],
    postQuiz: [
      { question: "When does Quick Sort have O(n²) worst case?", options: ["Random pivot", "Already sorted array with last element as pivot", "Median pivot", "Never"], correct: 1, explanation: "When the pivot is always the smallest or largest element, partitioning is maximally unbalanced." },
      { question: "Is Quick Sort stable?", options: ["Yes", "No"], correct: 1, explanation: "Standard Quick Sort is not stable because partitioning can change the relative order of equal elements." },
      { question: "What is the space complexity of Quick Sort?", options: ["O(1)", "O(n)", "O(log n)", "O(n log n)"], correct: 2, explanation: "Quick Sort uses O(log n) space for the recursive call stack on average." },
    ],
    codingChallenge: {
      prompt: "Implement Quick Sort using the last element as pivot. Include the partition function.",
      starterCode: `function quickSort(arr, low = 0, high = arr.length - 1) {
  // Your code here
  
  return arr;
}`,
      hint: "Implement partition() separately. Use two pointers: one for tracking the boundary of smaller elements."
    },
    realWorld: "Quick Sort is used in most standard library sort functions (e.g., V8's Array.sort), database query optimization, and file system sorting."
  },
  "merge-sort": {
    title: "Merge Sort",
    category: "Sorting",
    difficulty: "intermediate",
    explanation: {
      definition: "Merge Sort is a stable, divide-and-conquer sorting algorithm that divides the array into halves, recursively sorts each half, then merges the sorted halves back together.",
      steps: [
        "Divide the array into two halves.",
        "Recursively sort each half.",
        "Merge the two sorted halves by comparing elements one by one.",
        "Base case: a single element array is already sorted.",
        "The merge step ensures stability and O(n) merging per level."
      ],
      complexity: { time: "O(n log n)", space: "O(n)", best: "O(n log n)", worst: "O(n log n)" },
      pseudocode: `function mergeSort(arr):
  if length(arr) <= 1: return arr
  mid = length(arr) / 2
  left = mergeSort(arr[0..mid])
  right = mergeSort(arr[mid..end])
  return merge(left, right)

function merge(left, right):
  result = []
  while left and right not empty:
    if left[0] <= right[0]:
      result.append(left.removeFirst())
    else:
      result.append(right.removeFirst())
  return result + left + right`
    },
    preQuiz: [
      { question: "Merge Sort guarantees:", options: ["O(n²) worst case", "O(n log n) in all cases", "O(n) best case", "O(1) space"], correct: 1, explanation: "Merge Sort always runs in O(n log n) regardless of input." },
      { question: "Is Merge Sort stable?", options: ["Yes", "No"], correct: 0, explanation: "Merge Sort preserves the relative order of equal elements during the merge step." },
      { question: "What extra space does Merge Sort need?", options: ["O(1)", "O(log n)", "O(n)", "O(n²)"], correct: 2, explanation: "Merge Sort requires O(n) additional space for the temporary arrays during merging." },
    ],
    postQuiz: [
      { question: "How many levels of recursion does Merge Sort have for n elements?", options: ["n", "n/2", "log n", "n log n"], correct: 2, explanation: "The array is halved at each level, so there are log n levels of recursion." },
      { question: "What is the time complexity of the merge operation?", options: ["O(1)", "O(log n)", "O(n)", "O(n²)"], correct: 2, explanation: "Merging two sorted halves requires examining each element once, so it's O(n)." },
      { question: "Merge Sort is preferred over Quick Sort when:", options: ["Speed is priority", "Stability is required", "Space is limited", "Data is small"], correct: 1, explanation: "Merge Sort is stable and has guaranteed O(n log n), making it ideal when stability matters." },
    ],
    codingChallenge: {
      prompt: "Implement Merge Sort with a separate merge function that combines two sorted arrays.",
      starterCode: `function mergeSort(arr) {
  // Your code here
  
  return arr;
}`,
      hint: "Split the array at the midpoint, recursively sort both halves, then merge by comparing front elements."
    },
    realWorld: "Merge Sort is used in external sorting (sorting data on disk), Java's Arrays.sort for objects, and anywhere stability is required."
  },
  "bst": {
    title: "Binary Search Tree",
    category: "Trees",
    difficulty: "intermediate",
    explanation: {
      definition: "A Binary Search Tree (BST) is a binary tree where each node's left subtree contains only values less than the node, and the right subtree contains only values greater.",
      steps: [
        "To insert: compare with root, go left if smaller, right if larger, recursively.",
        "To search: follow the same comparison path until found or reach null.",
        "To delete: handle 3 cases — leaf node, one child, two children (find inorder successor).",
        "Inorder traversal of a BST gives sorted output.",
        "Balanced BSTs provide O(log n) operations; unbalanced can degrade to O(n)."
      ],
      complexity: { time: "O(log n) avg", space: "O(n)", best: "O(log n)", worst: "O(n)" },
      pseudocode: `function insert(root, value):
  if root is null: return new Node(value)
  if value < root.value:
    root.left = insert(root.left, value)
  else:
    root.right = insert(root.right, value)
  return root

function search(root, value):
  if root is null or root.value == value:
    return root
  if value < root.value:
    return search(root.left, value)
  return search(root.right, value)`
    },
    preQuiz: [
      { question: "In a BST, left child is always:", options: ["Greater than parent", "Less than parent", "Equal to parent", "Random"], correct: 1, explanation: "BST property: all left descendants are less than the node." },
      { question: "Inorder traversal of a BST gives:", options: ["Random order", "Reverse order", "Sorted order", "Level order"], correct: 2, explanation: "Inorder (left-root-right) traversal visits BST nodes in ascending order." },
      { question: "Worst case for BST operations occurs when:", options: ["Tree is balanced", "Tree is a linked list (skewed)", "Tree has one node", "Never"], correct: 1, explanation: "A skewed BST degrades to a linked list, making operations O(n)." },
    ],
    postQuiz: [
      { question: "To delete a node with two children, we replace it with:", options: ["Left child", "Right child", "Inorder successor or predecessor", "Parent"], correct: 2, explanation: "The inorder successor (smallest in right subtree) maintains BST property." },
      { question: "What tree balances itself to avoid O(n) worst case?", options: ["BST", "AVL Tree", "Binary Tree", "Linked List"], correct: 1, explanation: "AVL trees self-balance using rotations to maintain O(log n) height." },
      { question: "How many comparisons to search in a balanced BST of 1000 nodes?", options: ["1000", "500", "~10", "~100"], correct: 2, explanation: "log₂(1000) ≈ 10, so about 10 comparisons in a balanced BST." },
    ],
    codingChallenge: {
      prompt: "Implement a BST with insert and search methods.",
      starterCode: `class Node {
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
    // Your code here
  }
  
  search(value) {
    // Your code here
  }
}`,
      hint: "For insert, recursively compare and go left/right. For search, return the node when found or null."
    },
    realWorld: "BSTs are used in database indexing, file systems, auto-complete features, and symbol tables in compilers."
  },
  "dijkstra": {
    title: "Dijkstra's Algorithm",
    category: "Graphs",
    difficulty: "advanced",
    explanation: {
      definition: "Dijkstra's algorithm finds the shortest path from a source node to all other nodes in a weighted graph with non-negative edge weights. It uses a greedy approach with a priority queue.",
      steps: [
        "Initialize distances: source = 0, all others = infinity.",
        "Add source to a priority queue (min-heap).",
        "Extract the node with smallest distance from the queue.",
        "For each neighbor, if current distance + edge weight < known distance, update it.",
        "Repeat until all nodes are processed or queue is empty."
      ],
      complexity: { time: "O((V+E) log V)", space: "O(V)", best: "O((V+E) log V)", worst: "O((V+E) log V)" },
      pseudocode: `function dijkstra(graph, source):
  dist = {v: ∞ for v in graph}
  dist[source] = 0
  pq = MinHeap()
  pq.add((0, source))
  
  while pq is not empty:
    (d, u) = pq.extractMin()
    if d > dist[u]: continue
    for (v, weight) in neighbors(u):
      if dist[u] + weight < dist[v]:
        dist[v] = dist[u] + weight
        pq.add((dist[v], v))
  
  return dist`
    },
    preQuiz: [
      { question: "Dijkstra's algorithm works with:", options: ["Negative weights", "Only unweighted graphs", "Non-negative weights only", "Any graph"], correct: 2, explanation: "Dijkstra's greedy approach fails with negative weights; use Bellman-Ford instead." },
      { question: "What data structure optimizes Dijkstra?", options: ["Stack", "Queue", "Priority Queue / Min-Heap", "Array"], correct: 2, explanation: "A min-heap efficiently extracts the node with the smallest tentative distance." },
      { question: "Dijkstra finds:", options: ["All paths", "Longest path", "Shortest path from source", "Minimum spanning tree"], correct: 2, explanation: "Dijkstra finds the shortest path from a single source to all reachable nodes." },
    ],
    postQuiz: [
      { question: "What real-world application uses Dijkstra?", options: ["Social media feed", "GPS navigation", "Image compression", "Email filtering"], correct: 1, explanation: "GPS systems use Dijkstra (or variants like A*) to find shortest routes." },
      { question: "If we use an unsorted array instead of a heap, time complexity becomes:", options: ["O(V log V)", "O(V²)", "O(E log V)", "O(V + E)"], correct: 1, explanation: "Without a heap, finding the minimum takes O(V) per extraction, leading to O(V²)." },
      { question: "Dijkstra is a type of:", options: ["Dynamic programming", "Greedy algorithm", "Backtracking", "Brute force"], correct: 1, explanation: "Dijkstra greedily selects the closest unvisited node at each step." },
    ],
    codingChallenge: {
      prompt: "Implement Dijkstra's algorithm for a graph represented as an adjacency list.",
      starterCode: `function dijkstra(graph, source) {
  // graph = { 'A': [['B', 4], ['C', 2]], ... }
  // Return distances object: { 'A': 0, 'B': 4, ... }
  
  return {};
}`,
      hint: "Use an array as a simple priority queue. Track visited nodes to avoid reprocessing."
    },
    realWorld: "Google Maps, network routing protocols (OSPF), robot path planning, and airline route optimization all use Dijkstra's algorithm."
  },
  "bfs-dfs": {
    title: "BFS & DFS Traversal",
    category: "Graphs",
    difficulty: "intermediate",
    explanation: {
      definition: "BFS (Breadth-First Search) explores nodes level by level using a queue. DFS (Depth-First Search) explores as deep as possible before backtracking using a stack or recursion.",
      steps: [
        "BFS: Start at source, visit all neighbors first, then their neighbors (level-by-level).",
        "BFS uses a queue (FIFO) to track the next node to visit.",
        "DFS: Start at source, go as deep as possible along each branch before backtracking.",
        "DFS uses a stack (LIFO) or recursion.",
        "Both visit every reachable node exactly once with O(V+E) time complexity."
      ],
      complexity: { time: "O(V + E)", space: "O(V)", best: "O(V + E)", worst: "O(V + E)" },
      pseudocode: `function BFS(graph, source):
  visited = set()
  queue = [source]
  visited.add(source)
  while queue not empty:
    node = queue.dequeue()
    process(node)
    for neighbor in graph[node]:
      if neighbor not in visited:
        visited.add(neighbor)
        queue.enqueue(neighbor)

function DFS(graph, node, visited):
  visited.add(node)
  process(node)
  for neighbor in graph[node]:
    if neighbor not in visited:
      DFS(graph, neighbor, visited)`
    },
    preQuiz: [
      { question: "BFS uses which data structure?", options: ["Stack", "Queue", "Heap", "Tree"], correct: 1, explanation: "BFS processes nodes in FIFO order using a queue." },
      { question: "DFS uses which data structure?", options: ["Queue", "Stack / Recursion", "Heap", "Array"], correct: 1, explanation: "DFS uses a stack (explicit or via recursion call stack) for LIFO processing." },
      { question: "Time complexity of both BFS and DFS?", options: ["O(V)", "O(E)", "O(V + E)", "O(V × E)"], correct: 2, explanation: "Both visit each vertex and edge once, giving O(V + E)." },
    ],
    postQuiz: [
      { question: "BFS finds the shortest path in:", options: ["Weighted graphs", "Unweighted graphs", "All graphs", "No graphs"], correct: 1, explanation: "In unweighted graphs, BFS finds shortest path since it explores level-by-level." },
      { question: "Which is better for finding connected components?", options: ["Only BFS", "Only DFS", "Both work equally well", "Neither"], correct: 2, explanation: "Both BFS and DFS can identify connected components by tracking visited nodes." },
      { question: "DFS can detect:", options: ["Shortest paths", "Cycles in a graph", "Minimum spanning tree", "Maximum flow"], correct: 1, explanation: "DFS detects cycles by finding back edges — edges pointing to already-visited ancestors." },
    ],
    codingChallenge: {
      prompt: "Implement both BFS and DFS for a graph represented as an adjacency list.",
      starterCode: `function bfs(graph, start) {
  // Return array of visited nodes in BFS order
  return [];
}

function dfs(graph, start) {
  // Return array of visited nodes in DFS order
  return [];
}`,
      hint: "BFS: use a queue and shift(). DFS: use recursion or a stack with pop()."
    },
    realWorld: "BFS: social network friend suggestions, GPS navigation. DFS: maze solving, topological sorting, cycle detection in dependency graphs."
  },
};

const LearnModule = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const [currentStep, setCurrentStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [userCode, setUserCode] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);

  const moduleData = moduleId ? moduleDataMap[moduleId] : null;

  const steps = ["Pre-Assessment", "Explanation", "Visualization", "Coding Practice", "Post-Assessment"];

  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    setQuizAnswers((prev) => ({ ...prev, [questionIndex]: answerIndex }));
  };

  const handleNarrate = (text: string) => {
    if (isNarrating) {
      speechSynthesis.cancel();
      setIsNarrating(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.onend = () => setIsNarrating(false);
    setIsNarrating(true);
    speechSynthesis.speak(utterance);
  };

  const calculateScore = (questions: QuizQuestion[]) => {
    let correct = 0;
    questions.forEach((q, i) => {
      if (quizAnswers[i] === q.correct) correct++;
    });
    return { correct, total: questions.length, percentage: Math.round((correct / questions.length) * 100) };
  };

  if (!moduleData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Module Not Found</h2>
          <Link to="/learn">
            <Button>Back to Modules</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const renderQuiz = (questions: QuizQuestion[], isPost: boolean) => {
    const score = calculateScore(questions);
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">{isPost ? "Post-Assessment" : "Pre-Assessment"}</h3>
          {showResults && (
            <Badge className={score.percentage >= 70 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
              {score.correct}/{score.total} ({score.percentage}%)
            </Badge>
          )}
        </div>
        {questions.map((q, qi) => (
          <Card key={qi} className="bg-card/50 border-border/50">
            <CardContent className="pt-6">
              <p className="font-semibold mb-3">{qi + 1}. {q.question}</p>
              <div className="space-y-2">
                {q.options.map((opt, oi) => (
                  <button
                    key={oi}
                    onClick={() => !showResults && handleQuizAnswer(qi, oi)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      showResults
                        ? oi === q.correct
                          ? "border-green-500 bg-green-500/10"
                          : quizAnswers[qi] === oi
                          ? "border-red-500 bg-red-500/10"
                          : "border-border/50"
                        : quizAnswers[qi] === oi
                        ? "border-primary bg-primary/10"
                        : "border-border/50 hover:border-primary/50"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {showResults && quizAnswers[qi] !== undefined && (
                <p className="mt-3 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                  💡 {q.explanation}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
        <div className="flex gap-3">
          {!showResults ? (
            <Button onClick={() => setShowResults(true)} disabled={Object.keys(quizAnswers).length < questions.length}>
              Submit Answers
            </Button>
          ) : (
            <Button onClick={() => { setShowResults(false); setQuizAnswers({}); setCurrentStep(currentStep + 1); }}>
              Continue to Next Step <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  };

  const renderExplanation = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">{moduleData.title} — Explanation</h3>
        <Button variant="outline" size="sm" onClick={() => handleNarrate(moduleData.explanation.definition + ". " + moduleData.explanation.steps.join(". "))}>
          {isNarrating ? <VolumeX className="h-4 w-4 mr-2" /> : <Volume2 className="h-4 w-4 mr-2" />}
          {isNarrating ? "Stop" : "Narrate"}
        </Button>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardHeader><CardTitle>Definition</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground leading-relaxed">{moduleData.explanation.definition}</p></CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50">
        <CardHeader><CardTitle>Steps</CardTitle></CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {moduleData.explanation.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">{i + 1}</span>
                <span className="text-muted-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(moduleData.explanation.complexity).map(([key, val]) => (
          <Card key={key} className="bg-card/50 border-border/50">
            <CardContent className="pt-4 text-center">
              <p className="text-xs text-muted-foreground uppercase">{key}</p>
              <p className="text-lg font-bold text-primary">{val}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardHeader><CardTitle>Pseudocode</CardTitle></CardHeader>
        <CardContent>
          <pre className="bg-background/50 p-4 rounded-lg text-sm overflow-x-auto font-mono">{moduleData.explanation.pseudocode}</pre>
        </CardContent>
      </Card>

      {moduleData.realWorld && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <p className="text-sm"><span className="font-semibold text-primary">🌍 Real-World:</span> {moduleData.realWorld}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderVisualization = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Interactive Visualization</h3>
      <Card className="bg-card/50 border-border/50">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground mb-4">Launch the full visualizer to see {moduleData.title} in action!</p>
          <Link to="/visualizer">
            <Button variant="glow" size="lg" className="gap-2">
              <Eye className="h-5 w-5" />
              Open in Visualizer
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );

  const renderCoding = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Coding Practice</h3>
      <Card className="bg-card/50 border-border/50">
        <CardHeader><CardTitle>Challenge</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{moduleData.codingChallenge.prompt}</p>
          <textarea
            className="w-full h-64 bg-background/50 border border-border rounded-lg p-4 font-mono text-sm resize-none focus:border-primary focus:outline-none"
            value={userCode || moduleData.codingChallenge.starterCode}
            onChange={(e) => setUserCode(e.target.value)}
          />
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => { setShowHint(!showHint); }}>
              {showHint ? "Hide Hint" : "Show Hint"}
            </Button>
            <Link to="/visualizer">
              <Button variant="glow" className="gap-2">
                <Code2 className="h-4 w-4" />
                Test in Visualizer
              </Button>
            </Link>
          </div>
          {showHint && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm text-muted-foreground">💡 <strong>Hint:</strong> {moduleData.codingChallenge.hint}</p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0: return renderQuiz(moduleData.preQuiz, false);
      case 1: return renderExplanation();
      case 2: return renderVisualization();
      case 3: return renderCoding();
      case 4: {
        // Reset quiz state for post-assessment
        return renderQuiz(moduleData.postQuiz, true);
      }
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground />
      <Navigation />

      <div className="container mx-auto px-4 py-8 relative z-10 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/learn">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{moduleData.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{moduleData.category}</Badge>
              <Badge variant="outline" className="capitalize">{moduleData.difficulty}</Badge>
            </div>
          </div>
        </div>

        {/* Step Progress */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {steps.map((step, i) => (
            <button
              key={i}
              onClick={() => { setQuizAnswers({}); setShowResults(false); setCurrentStep(i); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                i === currentStep
                  ? "bg-primary text-primary-foreground"
                  : i < currentStep
                  ? "bg-primary/20 text-primary"
                  : "bg-muted/50 text-muted-foreground"
              }`}
            >
              {i < currentStep ? <CheckCircle2 className="h-4 w-4" /> : <span className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-xs">{i + 1}</span>}
              <span className="hidden sm:inline">{step}</span>
            </button>
          ))}
        </div>

        <Progress value={(currentStep / (steps.length - 1)) * 100} className="mb-8 h-2" />

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={() => { setQuizAnswers({}); setShowResults(false); setCurrentStep(Math.max(0, currentStep - 1)); }} disabled={currentStep === 0}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Previous
          </Button>
          {currentStep < steps.length - 1 && (
            <Button onClick={() => { setQuizAnswers({}); setShowResults(false); setCurrentStep(currentStep + 1); }}>
              Next <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
          {currentStep === steps.length - 1 && (
            <Link to="/learn">
              <Button variant="glow">Complete Module <CheckCircle2 className="h-4 w-4 ml-2" /></Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearnModule;
