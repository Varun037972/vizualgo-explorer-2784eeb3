import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Network, Play, Trash2, Search, Moon, Sun, Code2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BinarySearchTree } from "@/lib/trees/BinarySearchTree";
import { AVLTree } from "@/lib/trees/AVLTree";
import { RedBlackTree } from "@/lib/trees/RedBlackTree";
import { Heap } from "@/lib/trees/Heap";
import { Trie } from "@/lib/trees/Trie";
import { TreeNode } from "@/lib/trees/TreeNode";
import { toast } from "sonner";
import * as d3 from "d3";

type TreeType = "bst" | "avl" | "redblack" | "maxheap" | "minheap" | "trie";
type TraversalType = "inorder" | "preorder" | "postorder" | "levelorder";

export const TreeVisualizerAdvanced = () => {
  const [value, setValue] = useState("");
  const [treeType, setTreeType] = useState<TreeType>("bst");
  const [tree, setTree] = useState<BinarySearchTree | AVLTree | RedBlackTree | Heap | Trie | null>(null);
  const [animationSpeed, setAnimationSpeed] = useState([50]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set());
  const [traversalResult, setTraversalResult] = useState<(number | string)[]>([]);
  const [showCode, setShowCode] = useState(true);
  const [currentOperation, setCurrentOperation] = useState<string>("");
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    initializeTree(treeType);
  }, [treeType]);

  useEffect(() => {
    if (tree) {
      visualizeTree();
    }
  }, [tree, highlightedNodes, isDarkMode]);

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
    } else if (tree instanceof Trie) {
      tree.insert(val as string);
      setCurrentOperation(`INSERT "${val}"`);
    } else if (tree) {
      tree.insert(val);
      setCurrentOperation(`INSERT ${val}`);
    }

    setTree({ ...tree } as any);
    setValue("");
    toast.success(`Inserted ${val}`);
  };

  const handleDelete = () => {
    if (!value.trim()) return;
    
    const val = treeType === "trie" ? value : parseFloat(value);
    
    if (tree instanceof Heap) {
      tree.delete();
      setCurrentOperation("DELETE ROOT");
    } else if (tree instanceof Trie) {
      tree.delete(val as string);
      setCurrentOperation(`DELETE "${val}"`);
    } else if (tree) {
      tree.delete(val);
      setCurrentOperation(`DELETE ${val}`);
    }

    setTree({ ...tree } as any);
    setValue("");
    toast.success(`Deleted ${val}`);
  };

  const handleSearch = () => {
    if (!value.trim()) return;
    
    const val = treeType === "trie" ? value : parseFloat(value);
    
    let found = false;
    if (tree instanceof Trie) {
      found = tree.search(val as string);
    } else if (tree && !(tree instanceof Heap)) {
      const node = tree.search(val);
      found = node !== null;
      if (node) {
        setHighlightedNodes(new Set([node.id]));
        setTimeout(() => setHighlightedNodes(new Set()), 2000);
      }
    }

    setCurrentOperation(`SEARCH ${val}`);
    toast(found ? `Found ${val}!` : `${val} not found`, { 
      style: { background: found ? 'hsl(var(--primary))' : 'hsl(var(--destructive))' }
    });
  };

  const handleTraversal = async (type: TraversalType) => {
    if (!tree || tree instanceof Heap || tree instanceof Trie) return;

    let result: (number | string)[] = [];
    switch (type) {
      case "inorder":
        result = tree.inorder();
        setCurrentOperation("INORDER TRAVERSAL");
        break;
      case "preorder":
        result = tree.preorder();
        setCurrentOperation("PREORDER TRAVERSAL");
        break;
      case "postorder":
        result = tree.postorder();
        setCurrentOperation("POSTORDER TRAVERSAL");
        break;
      case "levelorder":
        result = tree.levelorder();
        setCurrentOperation("LEVEL ORDER TRAVERSAL");
        break;
    }

    setTraversalResult(result);
    
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
    toast.info("Tree cleared");
  };

  const visualizeTree = () => {
    if (!svgRef.current || !tree) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 900;
    const height = 500;
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
    if (!root) return;

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
      .attr("r", 25)
      .attr("fill", (d: any) => {
        if (highlightedNodes.has(d.data.id)) return "hsl(var(--chart-2))";
        if (d.data.color === "red") return "hsl(0 84% 60%)";
        if (d.data.color === "black") return "hsl(0 0% 20%)";
        return "hsl(var(--primary))";
      })
      .attr("stroke", isDarkMode ? "hsl(var(--border))" : "hsl(var(--primary-foreground))")
      .attr("stroke-width", 2)
      .style("transition", "all 0.3s ease");

    nodes.append("text")
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .attr("fill", (d: any) => d.data.color === "black" ? "white" : "hsl(var(--primary-foreground))")
      .style("font-weight", "bold")
      .style("font-size", "14px")
      .text((d: any) => d.data.value);
  };

  const visualizeHeap = (g: any, heap: Heap, width: number, height: number) => {
    const arr = heap.getArray();
    if (arr.length === 0) return;

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

      // Draw node
      g.append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", nodeRadius)
        .attr("fill", "hsl(var(--chart-1))")
        .attr("stroke", isDarkMode ? "hsl(var(--border))" : "hsl(var(--primary-foreground))")
        .attr("stroke-width", 2);

      g.append("text")
        .attr("x", x)
        .attr("y", y)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .attr("fill", "hsl(var(--primary-foreground))")
        .style("font-weight", "bold")
        .style("font-size", "14px")
        .text(value);
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
        .attr("width", word.length * 10 + 10)
        .attr("height", 30)
        .attr("fill", "hsl(var(--primary))")
        .attr("rx", 5);

      g.append("text")
        .attr("x", x)
        .attr("y", y)
        .attr("fill", "hsl(var(--primary-foreground))")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text(word);
    });

    if (words.length === 0) {
      g.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("fill", "hsl(var(--muted-foreground))")
        .style("font-size", "16px")
        .text("No words inserted yet");
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
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Network className="h-5 w-5 text-primary" />
              Advanced Tree Visualizer
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCode(!showCode)}
              >
                <Code2 className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDarkMode(!isDarkMode)}
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Select value={treeType} onValueChange={(v: TreeType) => setTreeType(v)}>
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
              placeholder={treeType === "trie" ? "Enter word" : "Enter number"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleInsert()}
            />

            <div className="flex gap-2">
              <Button onClick={handleInsert} size="sm" className="flex-1">
                <Play className="h-3 w-3 mr-1" />
                Insert
              </Button>
              <Button onClick={handleDelete} size="sm" variant="secondary" className="flex-1">
                Delete
              </Button>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSearch} size="sm" variant="outline" className="flex-1">
                <Search className="h-3 w-3 mr-1" />
                Search
              </Button>
              <Button onClick={handleClear} size="sm" variant="destructive" className="flex-1">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>

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
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => handleTraversal("inorder")} size="sm" variant="outline">
                Inorder
              </Button>
              <Button onClick={() => handleTraversal("preorder")} size="sm" variant="outline">
                Preorder
              </Button>
              <Button onClick={() => handleTraversal("postorder")} size="sm" variant="outline">
                Postorder
              </Button>
              <Button onClick={() => handleTraversal("levelorder")} size="sm" variant="outline">
                Level Order
              </Button>
            </div>
          )}

          {/* Main Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Visualization Canvas */}
            <div className={`${showCode ? 'lg:col-span-2' : 'lg:col-span-3'} bg-muted/30 rounded-lg border border-primary/10 p-4`}>
              <svg
                ref={svgRef}
                width="100%"
                height="500"
                className="w-full"
                style={{ background: isDarkMode ? 'hsl(var(--muted))' : 'hsl(var(--background))' }}
              />
            </div>

            {/* Code Panel */}
            {showCode && (
              <div className="space-y-4">
                <Card className="border-primary/10">
                  <CardHeader>
                    <CardTitle className="text-sm">Pseudocode</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-muted/50 p-3 rounded overflow-auto max-h-[200px]">
                      {getPseudocode()}
                    </pre>
                  </CardContent>
                </Card>

                {traversalResult.length > 0 && (
                  <Card className="border-primary/10">
                    <CardHeader>
                      <CardTitle className="text-sm">Traversal Result</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {traversalResult.map((val, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium"
                          >
                            {val}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="border-primary/10">
                  <CardHeader>
                    <CardTitle className="text-sm">Current Operation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-mono text-primary">
                      {currentOperation || "No operation yet"}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
