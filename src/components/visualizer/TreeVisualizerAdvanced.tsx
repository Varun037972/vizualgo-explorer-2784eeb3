import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Network, Play, Trash2, Search, Moon, Sun, Code2, History, Maximize2, Minimize2, LogOut, User } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BinarySearchTree } from "@/lib/trees/BinarySearchTree";
import { AVLTree } from "@/lib/trees/AVLTree";
import { RedBlackTree } from "@/lib/trees/RedBlackTree";
import { Heap } from "@/lib/trees/Heap";
import { Trie } from "@/lib/trees/Trie";
import { TreeNode } from "@/lib/trees/TreeNode";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import * as d3 from "d3";

type TreeType = "bst" | "avl" | "redblack" | "maxheap" | "minheap" | "trie";
type TraversalType = "inorder" | "preorder" | "postorder" | "levelorder";

export const TreeVisualizerAdvanced = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [value, setValue] = useState("");
  const [treeType, setTreeType] = useState<TreeType>("bst");
  const [tree, setTree] = useState<BinarySearchTree | AVLTree | RedBlackTree | Heap | Trie | null>(null);
  const [updateCounter, setUpdateCounter] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState([50]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set());
  const [traversalResult, setTraversalResult] = useState<(number | string)[]>([]);
  const [showCode, setShowCode] = useState(true);
  const [currentOperation, setCurrentOperation] = useState<string>("");
  const [operationLogs, setOperationLogs] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState(true);
  const [bulkInput, setBulkInput] = useState("");
  const [isConstructing, setIsConstructing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const forceUpdate = () => setUpdateCounter(prev => prev + 1);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Save operation to database
  const saveOperation = async (operationType: string, operationData: any, codeInput?: string) => {
    if (!user) return;

    try {
      await supabase.from('user_operations').insert({
        user_id: user.id,
        tree_type: treeType,
        operation_type: operationType,
        operation_data: operationData,
        code_input: codeInput
      });
    } catch (error: any) {
      console.error("Failed to save operation:", error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  useEffect(() => {
    initializeTree(treeType);
  }, [treeType]);

  useEffect(() => {
    if (tree) {
      visualizeTree();
    }
  }, [tree, highlightedNodes, isDarkMode, isFullscreen, updateCounter]);

  const initializeTree = (type: TreeType) => {
    switch (type) {
      case "bst":
        setTree(new BinarySearchTree());
        break;
      case "avl":
        setTree(new AVLTree());
        break;
      case "redblack":
        setTree(new RedBlackTree());
        break;
      case "maxheap":
        setTree(new Heap(true));
        break;
      case "minheap":
        setTree(new Heap(false));
        break;
      case "trie":
        setTree(new Trie());
        break;
    }
    setHighlightedNodes(new Set());
    setTraversalResult([]);
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setOperationLogs(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 50));
  };

  const handleConstructTree = async () => {
    if (!bulkInput.trim()) {
      toast.error("Please enter values to construct the tree");
      return;
    }

    setIsConstructing(true);
    handleClear();
    
    await new Promise(resolve => setTimeout(resolve, 300));

    const values = bulkInput
      .split(',')
      .map(v => v.trim())
      .filter(v => v !== '');

    saveOperation("construct", { values });

    if (treeType === "trie") {
      addLog(`Constructing Trie with ${values.length} words`);
      for (let i = 0; i < values.length; i++) {
        const word = values[i];
        if (tree instanceof Trie) {
          tree.insert(word);
          addLog(`[${i + 1}/${values.length}] Inserted "${word}"`);
          forceUpdate();
          await new Promise(resolve => setTimeout(resolve, 1000 - animationSpeed[0] * 8));
        }
      }
    } else {
      const numbers = values
        .map(v => parseFloat(v))
        .filter(v => !isNaN(v));

      if (numbers.length === 0) {
        toast.error("Please enter valid numbers");
        setIsConstructing(false);
        return;
      }

      addLog(`Constructing ${treeType.toUpperCase()} with ${numbers.length} values: [${numbers.join(', ')}]`);

      for (let i = 0; i < numbers.length; i++) {
        const num = numbers[i];
        if (tree instanceof Heap) {
          tree.insert(num);
          addLog(`[${i + 1}/${numbers.length}] Inserted ${num} into heap`);
        } else if (tree && 'insert' in tree) {
          (tree as BinarySearchTree | AVLTree | RedBlackTree).insert(num);
          addLog(`[${i + 1}/${numbers.length}] Inserted ${num}`);
        }
        forceUpdate();
        await new Promise(resolve => setTimeout(resolve, 1000 - animationSpeed[0] * 8));
      }
    }

    setCurrentOperation(`CONSTRUCTED TREE WITH ${values.length} VALUES`);
    toast.success(`Tree constructed with ${values.length} values!`);
    setBulkInput("");
    setIsConstructing(false);
  };

  const handleInsert = () => {
    if (!value.trim()) return;
    
    const val = treeType === "trie" ? value : parseFloat(value);
    if (treeType !== "trie" && isNaN(val as number)) {
      toast.error("Please enter a valid number");
      return;
    }

    if (tree instanceof Heap) {
      tree.insert(val as number);
      setCurrentOperation(`INSERT ${val}`);
      addLog(`Inserted ${val} into ${treeType === "maxheap" ? "Max" : "Min"} Heap`);
      saveOperation("insert", { value: val });
    } else if (tree instanceof Trie) {
      tree.insert(val as string);
      setCurrentOperation(`INSERT "${val}"`);
      addLog(`Inserted word "${val}" into Trie`);
      saveOperation("insert", { value: val });
    } else if (tree) {
      tree.insert(val);
      setCurrentOperation(`INSERT ${val}`);
      addLog(`Inserted ${val} into ${treeType.toUpperCase()}`);
      saveOperation("insert", { value: val });
    }

    forceUpdate();
    setValue("");
    toast.success(`Inserted ${val}`);
  };

  const handleDelete = () => {
    if (!value.trim()) return;
    
    const val = treeType === "trie" ? value : parseFloat(value);
    
    if (tree instanceof Heap) {
      tree.delete();
      setCurrentOperation("DELETE ROOT");
      addLog(`Deleted root from ${treeType === "maxheap" ? "Max" : "Min"} Heap`);
      saveOperation("delete", { value: "root" });
    } else if (tree instanceof Trie) {
      tree.delete(val as string);
      setCurrentOperation(`DELETE "${val}"`);
      addLog(`Deleted word "${val}" from Trie`);
      saveOperation("delete", { value: val });
    } else if (tree) {
      tree.delete(val);
      setCurrentOperation(`DELETE ${val}`);
      addLog(`Deleted ${val} from ${treeType.toUpperCase()}`);
      saveOperation("delete", { value: val });
    }

    forceUpdate();
    setValue("");
    toast.success(`Deleted ${val}`);
  };

  const handleSearch = () => {
    if (!value.trim()) return;
    
    const val = treeType === "trie" ? value : parseFloat(value);
    
    let found = false;
    if (tree instanceof Trie) {
      found = tree.search(val as string);
      addLog(`Searched for "${val}" in Trie: ${found ? "Found" : "Not found"}`);
    } else if (tree && !(tree instanceof Heap)) {
      const node = tree.search(val);
      found = node !== null;
      if (node) {
        setHighlightedNodes(new Set([node.id]));
        setTimeout(() => setHighlightedNodes(new Set()), 2000);
      }
      addLog(`Searched for ${val} in ${treeType.toUpperCase()}: ${found ? "Found" : "Not found"}`);
    }

    setCurrentOperation(`SEARCH ${val}`);
    toast(found ? `Found ${val}!` : `${val} not found`, { 
      style: { background: found ? 'hsl(var(--primary))' : 'hsl(var(--destructive))' }
    });
  };

  const handleTraversal = async (type: TraversalType) => {
    if (!tree || tree instanceof Heap || tree instanceof Trie) {
      toast.error("Traversal not available for this tree type");
      return;
    }

    let result: (number | string)[] = [];
    switch (type) {
      case "inorder":
        result = tree.inorder();
        setCurrentOperation("INORDER TRAVERSAL");
        addLog(`Performed Inorder Traversal: ${result.join(" → ")}`);
        break;
      case "preorder":
        result = tree.preorder();
        setCurrentOperation("PREORDER TRAVERSAL");
        addLog(`Performed Preorder Traversal: ${result.join(" → ")}`);
        break;
      case "postorder":
        result = tree.postorder();
        setCurrentOperation("POSTORDER TRAVERSAL");
        addLog(`Performed Postorder Traversal: ${result.join(" → ")}`);
        break;
      case "levelorder":
        result = tree.levelorder();
        setCurrentOperation("LEVEL ORDER TRAVERSAL");
        addLog(`Performed Level Order Traversal: ${result.join(" → ")}`);
        break;
    }

    setTraversalResult(result);
    saveOperation("traversal", { type, result });
    
    // Animate traversal
    for (let i = 0; i < result.length; i++) {
      const node = tree.search(result[i]);
      if (node) {
        setHighlightedNodes(new Set([node.id]));
        await new Promise(resolve => setTimeout(resolve, 1000 - animationSpeed[0] * 8));
      }
    }
    setHighlightedNodes(new Set());
  };

  const handleClear = () => {
    initializeTree(treeType);
    setCurrentOperation("CLEAR");
    setOperationLogs([]);
    addLog(`Cleared ${treeType.toUpperCase()}`);
    saveOperation("clear", {});
    toast.info("Tree cleared");
  };

  const visualizeTree = () => {
    if (!svgRef.current || !tree) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = isFullscreen ? window.innerWidth - 100 : Math.min(1200, window.innerWidth - 100);
    const height = isFullscreen ? window.innerHeight - 200 : 700;
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    if (tree instanceof Heap) {
      visualizeHeap(g, tree, width - margin.left - margin.right, height - margin.top - margin.bottom);
    } else if (tree instanceof Trie) {
      visualizeTrie(g, tree, width - margin.left - margin.right, height - margin.top - margin.bottom);
    } else {
      visualizeBinaryTree(g, tree.root, width - margin.left - margin.right, height - margin.top - margin.bottom);
    }
  };

  const visualizeBinaryTree = (g: any, root: TreeNode | null, width: number, height: number) => {
    if (!root) {
      g.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("fill", "hsl(var(--muted-foreground))")
        .style("font-size", "18px")
        .style("font-weight", "500")
        .text("Tree is empty. Add values to visualize.");
      return;
    }

    interface NodeWithPosition extends TreeNode {
      x?: number;
      y?: number;
    }

    const treeLayout = d3.tree<NodeWithPosition>().size([width, height - 100]);
    const hierarchy = d3.hierarchy(root, (d: TreeNode) => {
      const children = [];
      if (d.left) children.push(d.left);
      if (d.right) children.push(d.right);
      return children.length > 0 ? children : null;
    });

    const treeData = treeLayout(hierarchy);

    // Draw links
    g.selectAll(".link")
      .data(treeData.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", d3.linkVertical()
        .x((d: any) => d.x)
        .y((d: any) => d.y))
      .attr("fill", "none")
      .attr("stroke", isDarkMode ? "hsl(var(--primary) / 0.6)" : "hsl(var(--primary) / 0.4)")
      .attr("stroke-width", 2);

    // Draw nodes
    const nodes = g.selectAll(".node")
      .data(treeData.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d: any) => `translate(${d.x},${d.y})`);

    nodes.append("circle")
      .attr("r", 0)
      .attr("fill", (d: any) => {
        if (highlightedNodes.has(d.data.id)) return "hsl(var(--chart-2))";
        if (d.data.color === "red") return "hsl(0 84% 60%)";
        if (d.data.color === "black") return "hsl(0 0% 20%)";
        return "hsl(var(--primary))";
      })
      .attr("stroke", isDarkMode ? "hsl(var(--border))" : "hsl(var(--primary-foreground))")
      .attr("stroke-width", 2)
      .style("filter", "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))")
      .transition()
      .duration(500)
      .attr("r", 25);

    nodes.append("text")
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .attr("fill", (d: any) => d.data.color === "black" ? "white" : "hsl(var(--primary-foreground))")
      .style("font-weight", "bold")
      .style("font-size", "14px")
      .style("opacity", 0)
      .text((d: any) => d.data.value)
      .transition()
      .delay(300)
      .duration(300)
      .style("opacity", 1);
  };

  const visualizeHeap = (g: any, heap: Heap, width: number, height: number) => {
    const arr = heap.getArray();
    if (arr.length === 0) {
      g.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("fill", "hsl(var(--muted-foreground))")
        .style("font-size", "18px")
        .style("font-weight", "500")
        .text("Heap is empty. Add values to visualize.");
      return;
    }

    const nodeRadius = 25;
    const levelHeight = 80;
    
    arr.forEach((value, index) => {
      const level = Math.floor(Math.log2(index + 1));
      const posInLevel = index - (Math.pow(2, level) - 1);
      const nodesInLevel = Math.pow(2, level);
      
      const x = ((posInLevel + 1) * width) / (nodesInLevel + 1);
      const y = level * levelHeight + 30;

      // Draw connections
      if (index > 0) {
        const parentIndex = Math.floor((index - 1) / 2);
        const parentLevel = Math.floor(Math.log2(parentIndex + 1));
        const parentPosInLevel = parentIndex - (Math.pow(2, parentLevel) - 1);
        const parentNodesInLevel = Math.pow(2, parentLevel);
        const parentX = ((parentPosInLevel + 1) * width) / (parentNodesInLevel + 1);
        const parentY = parentLevel * levelHeight + 30;

        g.append("line")
          .attr("x1", parentX)
          .attr("y1", parentY)
          .attr("x2", x)
          .attr("y2", y)
          .attr("stroke", isDarkMode ? "hsl(var(--primary) / 0.6)" : "hsl(var(--primary) / 0.4)")
          .attr("stroke-width", 2);
      }

      // Draw node with animation
      g.append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", 0)
        .attr("fill", "hsl(var(--chart-1))")
        .attr("stroke", isDarkMode ? "hsl(var(--border))" : "hsl(var(--primary-foreground))")
        .attr("stroke-width", 2)
        .style("filter", "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))")
        .transition()
        .duration(500)
        .delay(index * 50)
        .attr("r", nodeRadius);

      g.append("text")
        .attr("x", x)
        .attr("y", y)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .attr("fill", "hsl(var(--primary-foreground))")
        .style("font-weight", "bold")
        .style("font-size", "14px")
        .style("opacity", 0)
        .text(value)
        .transition()
        .delay(index * 50 + 300)
        .duration(300)
        .style("opacity", 1);
    });
  };

  const visualizeTrie = (g: any, trie: Trie, width: number, height: number) => {
    const words = trie.getAllWords();
    
    g.append("text")
      .attr("x", width / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .attr("fill", "hsl(var(--foreground))")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .text("Stored Words:");

    words.forEach((word, index) => {
      const row = Math.floor(index / 5);
      const col = index % 5;
      const x = (col * (width / 5)) + 50;
      const y = row * 40 + 80;

      g.append("rect")
        .attr("x", x - 5)
        .attr("y", y - 20)
        .attr("width", 0)
        .attr("height", 30)
        .attr("fill", "hsl(var(--primary))")
        .attr("rx", 5)
        .style("filter", "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))")
        .transition()
        .duration(400)
        .delay(index * 100)
        .attr("width", word.length * 10 + 10);

      g.append("text")
        .attr("x", x)
        .attr("y", y)
        .attr("fill", "hsl(var(--primary-foreground))")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("opacity", 0)
        .text(word)
        .transition()
        .delay(index * 100 + 200)
        .duration(300)
        .style("opacity", 1);
    });

    if (words.length === 0) {
      g.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("fill", "hsl(var(--muted-foreground))")
        .style("font-size", "18px")
        .style("font-weight", "500")
        .text("Trie is empty. Add words to visualize.");
    }
  };

  const getPseudocode = () => {
    const codes: Record<string, string> = {
      "INSERT": `function insert(value):
  if tree is empty:
    create new root node
  else:
    find correct position
    insert new node
    rebalance if needed`,
      "DELETE": `function delete(value):
  find node to delete
  if node has 0-1 children:
    remove directly
  else:
    replace with successor
    rebalance if needed`,
      "SEARCH": `function search(value):
  current = root
  while current exists:
    if value == current.value:
      return found
    else if value < current.value:
      current = current.left
    else:
      current = current.right
  return not found`,
      "INORDER": `function inorder(node):
  if node exists:
    inorder(node.left)
    visit(node)
    inorder(node.right)`,
      "PREORDER": `function preorder(node):
  if node exists:
    visit(node)
    preorder(node.left)
    preorder(node.right)`,
      "POSTORDER": `function postorder(node):
  if node exists:
    postorder(node.left)
    postorder(node.right)
    visit(node)`,
      "LEVEL ORDER": `function levelorder():
  queue = [root]
  while queue not empty:
    node = queue.dequeue()
    visit(node)
    enqueue(node.left)
    enqueue(node.right)`,
    };

    for (const [key, code] of Object.entries(codes)) {
      if (currentOperation.includes(key)) {
        return code;
      }
    }
    return "// Select an operation to see pseudocode";
  };

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-primary/20 backdrop-blur-sm bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <motion.div 
                className="flex items-center gap-2"
                initial={{ x: -20 }}
                animate={{ x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Network className="h-5 w-5 text-primary" />
                <span className="bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                  Tree Visualizer
                </span>
              </motion.div>
              <div className="flex gap-2">
                {user && (
                  <>
                    <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-md border border-primary/20">
                      <User className="h-4 w-4 text-primary" />
                      <span className="text-sm text-primary">{user.email}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                      className="hover:scale-105 transition-transform"
                      title="Logout"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="hover:scale-105 transition-transform"
                  title={isFullscreen ? "Exit fullscreen" : "Fullscreen view"}
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLogs(!showLogs)}
                  className="hover:scale-105 transition-transform"
                >
                  <History className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCode(!showCode)}
                  className="hover:scale-105 transition-transform"
                >
                  <Code2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="hover:scale-105 transition-transform"
                >
                  {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Bulk Construction Input */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className="text-sm font-medium flex items-center gap-2">
                <Network className="h-4 w-4 text-primary" />
                Construct Tree from Values
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder={treeType === "trie" ? "Enter words separated by commas (e.g., cat, dog, car)" : "Enter numbers separated by commas (e.g., 50, 30, 70, 20, 40)"}
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !isConstructing && handleConstructTree()}
                  disabled={isConstructing}
                  className="flex-1"
                />
                <Button 
                  onClick={handleConstructTree} 
                  disabled={isConstructing}
                  className="hover:scale-105 transition-transform whitespace-nowrap"
                >
                  {isConstructing ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"
                      />
                      Building...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Construct Tree
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {treeType === "trie" 
                  ? "Enter multiple words separated by commas to build the Trie at once"
                  : "Enter multiple numbers separated by commas to build the tree step-by-step"}
              </p>
            </motion.div>

            {/* Single Value Controls */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Select value={treeType} onValueChange={(v: TreeType) => setTreeType(v)} disabled={isConstructing}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bst">Binary Search Tree</SelectItem>
                  <SelectItem value="avl">AVL Tree</SelectItem>
                  <SelectItem value="redblack">Red-Black Tree</SelectItem>
                  <SelectItem value="maxheap">Max Heap</SelectItem>
                  <SelectItem value="minheap">Min Heap</SelectItem>
                  <SelectItem value="trie">Trie</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder={treeType === "trie" ? "Single word" : "Single number"}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !isConstructing && handleInsert()}
                disabled={isConstructing}
              />

              <div className="flex gap-2">
                <Button 
                  onClick={handleInsert} 
                  size="sm" 
                  className="flex-1 hover:scale-105 transition-transform"
                  disabled={isConstructing}
                >
                  <Play className="h-3 w-3 mr-1" />
                  Insert
                </Button>
                <Button 
                  onClick={handleDelete} 
                  size="sm" 
                  variant="secondary" 
                  className="flex-1 hover:scale-105 transition-transform"
                  disabled={isConstructing}
                >
                  Delete
                </Button>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleSearch} 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 hover:scale-105 transition-transform"
                  disabled={isConstructing}
                >
                  <Search className="h-3 w-3 mr-1" />
                  Search
                </Button>
                <Button 
                  onClick={handleClear} 
                  size="sm" 
                  variant="destructive" 
                  className="flex-1 hover:scale-105 transition-transform"
                  disabled={isConstructing}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </motion.div>

          {/* Speed Control */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Animation Speed</label>
            <Slider
              value={animationSpeed}
              onValueChange={setAnimationSpeed}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

            {/* Traversal Buttons */}
            {!(tree instanceof Heap) && !(tree instanceof Trie) && (
              <motion.div 
                className="flex flex-wrap gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button 
                  onClick={() => handleTraversal("inorder")} 
                  size="sm" 
                  variant="outline"
                  className="hover:scale-105 transition-transform"
                >
                  Inorder
                </Button>
                <Button 
                  onClick={() => handleTraversal("preorder")} 
                  size="sm" 
                  variant="outline"
                  className="hover:scale-105 transition-transform"
                >
                  Preorder
                </Button>
                <Button 
                  onClick={() => handleTraversal("postorder")} 
                  size="sm" 
                  variant="outline"
                  className="hover:scale-105 transition-transform"
                >
                  Postorder
                </Button>
                <Button 
                  onClick={() => handleTraversal("levelorder")} 
                  size="sm" 
                  variant="outline"
                  className="hover:scale-105 transition-transform"
                >
                  Level Order
                </Button>
              </motion.div>
            )}

            {/* Main Layout */}
            <div className={`grid grid-cols-1 ${isFullscreen ? 'lg:grid-cols-1' : 'lg:grid-cols-4'} gap-4`}>
              {/* Visualization Canvas */}
              <motion.div 
                className={`${isFullscreen ? 'lg:col-span-1' : (showCode || showLogs) ? 'lg:col-span-3' : 'lg:col-span-4'} bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl border border-primary/20 p-4 shadow-lg ${isFullscreen ? 'min-h-[calc(100vh-16rem)]' : ''}`}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <svg
                  ref={svgRef}
                  width="100%"
                  height={isFullscreen ? "calc(100vh - 18rem)" : "700"}
                  className="w-full rounded-lg"
                  style={{ 
                    background: isDarkMode 
                      ? 'hsl(var(--muted))' 
                      : 'linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--muted)) 100%)' 
                  }}
                />
              </motion.div>

              {/* Side Panel */}
              {!isFullscreen && (showCode || showLogs) && (
                <motion.div 
                  className="space-y-4"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {showLogs && (
                    <Card className="border-primary/10 backdrop-blur-sm bg-card/80">
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <History className="h-4 w-4 text-primary" />
                          Operation Logs
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[200px]">
                          <AnimatePresence>
                            {operationLogs.length === 0 ? (
                              <p className="text-xs text-muted-foreground">No operations yet</p>
                            ) : (
                              <div className="space-y-1">
                                {operationLogs.map((log, idx) => (
                                  <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    transition={{ duration: 0.2 }}
                                    className="text-xs font-mono bg-muted/50 p-2 rounded border-l-2 border-primary/50"
                                  >
                                    {log}
                                  </motion.div>
                                ))}
                              </div>
                            )}
                          </AnimatePresence>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  )}

                  {showCode && (
                    <Card className="border-primary/10 backdrop-blur-sm bg-card/80">
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Code2 className="h-4 w-4 text-primary" />
                          Pseudocode
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <pre className="text-xs bg-muted/50 p-3 rounded overflow-auto max-h-[180px] font-mono">
                          {getPseudocode()}
                        </pre>
                      </CardContent>
                    </Card>
                  )}

                  {traversalResult.length > 0 && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="border-primary/10 backdrop-blur-sm bg-card/80">
                        <CardHeader>
                          <CardTitle className="text-sm">Traversal Result</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {traversalResult.map((val, idx) => (
                              <motion.span
                                key={idx}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className="px-3 py-1 bg-gradient-to-r from-primary to-chart-2 text-primary-foreground rounded-full text-sm font-medium shadow-md"
                              >
                                {val}
                              </motion.span>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  <Card className="border-primary/10 backdrop-blur-sm bg-card/80">
                    <CardHeader>
                      <CardTitle className="text-sm">Current Operation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <motion.p 
                        key={currentOperation}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm font-mono text-primary font-bold"
                      >
                        {currentOperation || "No operation yet"}
                      </motion.p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
