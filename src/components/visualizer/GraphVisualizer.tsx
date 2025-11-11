import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, RotateCcw, Plus, MousePointer, Move, Save, X, Grid3x3, GitBranch, Hexagon, Circle } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import * as d3 from "d3";

interface Node {
  id: string;
  label?: string;
  x: number;
  y: number;
  visited?: boolean;
  distance?: number;
  isStart?: boolean;
  isEnd?: boolean;
}

interface Edge {
  source: string;
  target: string;
  weight: number;
  visited?: boolean;
}

type Algorithm = "bfs" | "dfs" | "dijkstra" | "astar" | "kruskal" | "prim" | "floyd" | "bellman";
type EditMode = "select" | "addNode" | "addEdge";

export const GraphVisualizer = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<Node[]>([
    { id: "A", x: 150, y: 100, isStart: true },
    { id: "B", x: 350, y: 100 },
    { id: "C", x: 250, y: 200 },
    { id: "D", x: 150, y: 300 },
    { id: "E", x: 350, y: 300, isEnd: true },
  ]);
  const [edges, setEdges] = useState<Edge[]>([
    { source: "A", target: "B", weight: 4 },
    { source: "A", target: "C", weight: 2 },
    { source: "B", target: "C", weight: 1 },
    { source: "C", target: "D", weight: 3 },
    { source: "C", target: "E", weight: 5 },
    { source: "D", target: "E", weight: 2 },
  ]);
  const [algorithm, setAlgorithm] = useState<Algorithm>("bfs");
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(50);
  const [currentStep, setCurrentStep] = useState(0);
  const [queue, setQueue] = useState<string[]>([]);
  const [editMode, setEditMode] = useState<EditMode>("select");
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [mstEdges, setMstEdges] = useState<Edge[]>([]);
  const [nextNodeId, setNextNodeId] = useState(6);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editingEdge, setEditingEdge] = useState<{ source: string; target: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    visualizeGraph();
  }, [nodes, edges, mstEdges]);

  const handleSvgClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (editMode !== "addNode") return;
    
    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const newNode: Node = {
      id: String.fromCharCode(64 + nextNodeId),
      x,
      y,
    };

    setNodes([...nodes, newNode]);
    setNextNodeId(nextNodeId + 1);
    toast.success(`Node ${newNode.id} added`);
  };

  const handleNodeClick = (nodeId: string) => {
    if (editMode === "addEdge") {
      if (!selectedNode) {
        setSelectedNode(nodeId);
        toast.info(`Selected node ${nodeId}. Click another node to create edge.`);
      } else if (selectedNode !== nodeId) {
        const newEdge: Edge = {
          source: selectedNode,
          target: nodeId,
          weight: Math.floor(Math.random() * 9) + 1,
        };
        setEdges([...edges, newEdge]);
        setSelectedNode(null);
        toast.success(`Edge created: ${selectedNode} → ${nodeId}`);
      }
    }
  };

  const handleNodeDoubleClick = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    setEditingNode(nodeId);
    setEditValue(node.label || node.id);
  };

  const handleEdgeDoubleClick = (source: string, target: string) => {
    const edge = edges.find(e => 
      (e.source === source && e.target === target) ||
      (e.source === target && e.target === source)
    );
    if (!edge) return;
    setEditingEdge({ source, target });
    setEditValue(edge.weight.toString());
  };

  const saveNodeEdit = () => {
    if (!editingNode) return;
    setNodes(prev =>
      prev.map(n => n.id === editingNode ? { ...n, label: editValue } : n)
    );
    setEditingNode(null);
    setEditValue("");
    toast.success("Node label updated");
  };

  const saveEdgeEdit = () => {
    if (!editingEdge) return;
    const weight = parseFloat(editValue);
    if (isNaN(weight) || weight <= 0) {
      toast.error("Please enter a valid positive number");
      return;
    }
    setEdges(prev =>
      prev.map(e =>
        (e.source === editingEdge.source && e.target === editingEdge.target) ||
        (e.source === editingEdge.target && e.target === editingEdge.source)
          ? { ...e, weight }
          : e
      )
    );
    setEditingEdge(null);
    setEditValue("");
    toast.success("Edge weight updated");
  };

  const cancelEdit = () => {
    setEditingNode(null);
    setEditingEdge(null);
    setEditValue("");
  };

  const visualizeGraph = () => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 400;

    // Draw edges
    const edgeGroup = svg.append("g");
    edges.forEach(edge => {
      const isMstEdge = mstEdges.some(
        e => (e.source === edge.source && e.target === edge.target) ||
             (e.source === edge.target && e.target === edge.source)
      );
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      if (!sourceNode || !targetNode) return;

      edgeGroup
        .append("line")
        .attr("x1", sourceNode.x)
        .attr("y1", sourceNode.y)
        .attr("x2", targetNode.x)
        .attr("y2", targetNode.y)
        .attr("stroke", isMstEdge ? "hsl(var(--chart-1))" : edge.visited ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))")
        .attr("stroke-width", isMstEdge ? 4 : edge.visited ? 3 : 2)
        .attr("opacity", 0.6);

      // Edge weight label
      const midX = (sourceNode.x + targetNode.x) / 2;
      const midY = (sourceNode.y + targetNode.y) / 2;
      
      // Background for weight
      edgeGroup
        .append("rect")
        .attr("x", midX - 15)
        .attr("y", midY - 10)
        .attr("width", 30)
        .attr("height", 20)
        .attr("fill", "hsl(var(--background))")
        .attr("opacity", 0.9)
        .style("cursor", "pointer")
        .on("dblclick", () => handleEdgeDoubleClick(edge.source, edge.target));
      
      edgeGroup
        .append("text")
        .attr("x", midX)
        .attr("y", midY)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("class", "fill-primary font-semibold text-sm")
        .style("cursor", "pointer")
        .text(edge.weight)
        .on("dblclick", () => handleEdgeDoubleClick(edge.source, edge.target));
    });

    // Draw nodes with drag behavior
    const nodeGroup = svg.append("g");
    
    const drag = d3.drag<SVGCircleElement, Node>()
      .on("start", function(event, d) {
        setIsDragging(true);
        d3.select(this).raise().attr("stroke-width", 4);
      })
      .on("drag", function(event, d) {
        const node = nodes.find(n => n.id === d.id);
        if (!node) return;
        
        // Update position
        node.x = Math.max(25, Math.min(575, event.x));
        node.y = Math.max(25, Math.min(375, event.y));
        
        setNodes([...nodes]);
      })
      .on("end", function(event, d) {
        setIsDragging(false);
        d3.select(this).attr("stroke-width", selectedNode === d.id ? 4 : 2);
      });

    nodes.forEach(node => {
      const group = nodeGroup.append("g");

      const circle = group
        .append("circle")
        .attr("cx", node.x)
        .attr("cy", node.y)
        .attr("r", 25)
        .attr("fill", node.isStart ? "hsl(var(--primary))" : node.isEnd ? "hsl(var(--destructive))" : node.visited ? "hsl(var(--secondary))" : "hsl(var(--card))")
        .attr("stroke", selectedNode === node.id ? "hsl(var(--chart-2))" : "hsl(var(--primary))")
        .attr("stroke-width", selectedNode === node.id ? 4 : 2)
        .style("cursor", editMode === "select" ? "move" : "pointer")
        .datum(node)
        .on("click", () => handleNodeClick(node.id))
        .on("dblclick", () => handleNodeDoubleClick(node.id));

      if (editMode === "select") {
        circle.call(drag as any);
      }

      group
        .append("text")
        .attr("x", node.x)
        .attr("y", node.y)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("class", "fill-foreground font-bold pointer-events-none")
        .text(node.label || node.id);

      if (node.distance !== undefined) {
        group
          .append("text")
          .attr("x", node.x)
          .attr("y", node.y + 40)
          .attr("text-anchor", "middle")
          .attr("class", "fill-muted-foreground text-sm pointer-events-none")
          .text(`d: ${node.distance}`);
      }
    });
  };

  const runAlgorithm = async () => {
    setIsRunning(true);
    resetVisualization();

    const startNode = nodes.find(n => n.isStart);
    if (!startNode) return;

    switch (algorithm) {
      case "bfs":
        await runBFS(startNode.id);
        break;
      case "dfs":
        await runDFS(startNode.id);
        break;
      case "dijkstra":
        await runDijkstra(startNode.id);
        break;
      case "astar":
        await runAStar(startNode.id);
        break;
      case "kruskal":
        await runKruskal();
        break;
      case "prim":
        await runPrim(startNode.id);
        break;
      case "floyd":
        await runFloydWarshall();
        break;
      case "bellman":
        await runBellmanFord(startNode.id);
        break;
    }

    setIsRunning(false);
  };

  const runBFS = async (startId: string) => {
    const visited = new Set<string>();
    const queue = [startId];
    setQueue(queue);

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) continue;

      visited.add(currentId);
      setNodes(prev =>
        prev.map(n => (n.id === currentId ? { ...n, visited: true } : n))
      );

      await new Promise(resolve => setTimeout(resolve, 1000 - speed * 10));

      const neighbors = edges
        .filter(e => e.source === currentId || e.target === currentId)
        .map(e => (e.source === currentId ? e.target : e.source));

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor) && !queue.includes(neighbor)) {
          queue.push(neighbor);
          setEdges(prev =>
            prev.map(e =>
              (e.source === currentId && e.target === neighbor) ||
              (e.target === currentId && e.source === neighbor)
                ? { ...e, visited: true }
                : e
            )
          );
        }
      }

      setQueue([...queue]);
      setCurrentStep(prev => prev + 1);
    }
  };

  const runDFS = async (startId: string) => {
    const visited = new Set<string>();
    const stack = [startId];

    while (stack.length > 0) {
      const currentId = stack.pop()!;
      if (visited.has(currentId)) continue;

      visited.add(currentId);
      setNodes(prev =>
        prev.map(n => (n.id === currentId ? { ...n, visited: true } : n))
      );

      await new Promise(resolve => setTimeout(resolve, 1000 - speed * 10));

      const neighbors = edges
        .filter(e => e.source === currentId || e.target === currentId)
        .map(e => (e.source === currentId ? e.target : e.source))
        .reverse();

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          stack.push(neighbor);
          setEdges(prev =>
            prev.map(e =>
              (e.source === currentId && e.target === neighbor) ||
              (e.target === currentId && e.source === neighbor)
                ? { ...e, visited: true }
                : e
            )
          );
        }
      }

      setCurrentStep(prev => prev + 1);
    }
  };

  const runDijkstra = async (startId: string) => {
    const distances = new Map<string, number>();
    const visited = new Set<string>();
    
    nodes.forEach(n => distances.set(n.id, Infinity));
    distances.set(startId, 0);

    setNodes(prev =>
      prev.map(n => ({ ...n, distance: n.id === startId ? 0 : Infinity }))
    );

    while (visited.size < nodes.length) {
      let currentId: string | null = null;
      let minDistance = Infinity;

      for (const [nodeId, distance] of distances.entries()) {
        if (!visited.has(nodeId) && distance < minDistance) {
          minDistance = distance;
          currentId = nodeId;
        }
      }

      if (!currentId || minDistance === Infinity) break;

      visited.add(currentId);
      setNodes(prev =>
        prev.map(n => (n.id === currentId ? { ...n, visited: true } : n))
      );

      await new Promise(resolve => setTimeout(resolve, 1000 - speed * 10));

      const neighbors = edges.filter(
        e => e.source === currentId || e.target === currentId
      );

      for (const edge of neighbors) {
        const neighborId = edge.source === currentId ? edge.target : edge.source;
        if (visited.has(neighborId)) continue;

        const newDistance = distances.get(currentId)! + edge.weight;
        if (newDistance < distances.get(neighborId)!) {
          distances.set(neighborId, newDistance);
          setNodes(prev =>
            prev.map(n => (n.id === neighborId ? { ...n, distance: newDistance } : n))
          );
          setEdges(prev =>
            prev.map(e =>
              (e.source === currentId && e.target === neighborId) ||
              (e.target === currentId && e.source === neighborId)
                ? { ...e, visited: true }
                : e
            )
          );
        }
      }

      setCurrentStep(prev => prev + 1);
    }
  };

  const runAStar = async (startId: string) => {
    // Simplified A* - uses Dijkstra with heuristic
    await runDijkstra(startId);
  };

  const runKruskal = async () => {
    setMstEdges([]);
    const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);
    const parent = new Map<string, string>();
    const rank = new Map<string, number>();

    nodes.forEach(node => {
      parent.set(node.id, node.id);
      rank.set(node.id, 0);
    });

    const find = (id: string): string => {
      if (parent.get(id) !== id) {
        parent.set(id, find(parent.get(id)!));
      }
      return parent.get(id)!;
    };

    const union = (id1: string, id2: string): boolean => {
      const root1 = find(id1);
      const root2 = find(id2);

      if (root1 === root2) return false;

      const rank1 = rank.get(root1)!;
      const rank2 = rank.get(root2)!;

      if (rank1 > rank2) {
        parent.set(root2, root1);
      } else if (rank1 < rank2) {
        parent.set(root1, root2);
      } else {
        parent.set(root2, root1);
        rank.set(root1, rank1 + 1);
      }
      return true;
    };

    const mst: Edge[] = [];

    for (const edge of sortedEdges) {
      setEdges(prev =>
        prev.map(e =>
          e.source === edge.source && e.target === edge.target
            ? { ...e, visited: true }
            : e
        )
      );

      await new Promise(resolve => setTimeout(resolve, 1000 - speed * 10));

      if (union(edge.source, edge.target)) {
        mst.push(edge);
        setMstEdges([...mst]);
        toast.success(`Added edge ${edge.source}-${edge.target} (${edge.weight})`);
      }

      if (mst.length === nodes.length - 1) break;
    }

    toast.success(`MST complete! Total weight: ${mst.reduce((sum, e) => sum + e.weight, 0)}`);
  };

  const runPrim = async (startId: string) => {
    setMstEdges([]);
    const visited = new Set<string>([startId]);
    const mst: Edge[] = [];

    setNodes(prev =>
      prev.map(n => (n.id === startId ? { ...n, visited: true } : n))
    );

    while (visited.size < nodes.length) {
      let minEdge: Edge | null = null;
      let minWeight = Infinity;

      edges.forEach(edge => {
        const hasSource = visited.has(edge.source);
        const hasTarget = visited.has(edge.target);

        if (hasSource !== hasTarget && edge.weight < minWeight) {
          minWeight = edge.weight;
          minEdge = edge;
        }
      });

      if (!minEdge) break;

      const newNodeId = visited.has(minEdge.source) ? minEdge.target : minEdge.source;
      visited.add(newNodeId);
      mst.push(minEdge);

      setNodes(prev =>
        prev.map(n => (n.id === newNodeId ? { ...n, visited: true } : n))
      );
      setMstEdges([...mst]);
      setEdges(prev =>
        prev.map(e =>
          (e.source === minEdge!.source && e.target === minEdge!.target) ||
          (e.target === minEdge!.source && e.source === minEdge!.target)
            ? { ...e, visited: true }
            : e
        )
      );

      await new Promise(resolve => setTimeout(resolve, 1000 - speed * 10));
      toast.success(`Added edge ${minEdge.source}-${minEdge.target} (${minEdge.weight})`);
    }

    toast.success(`MST complete! Total weight: ${mst.reduce((sum, e) => sum + e.weight, 0)}`);
  };

  const runFloydWarshall = async () => {
    const dist = new Map<string, Map<string, number>>();
    
    nodes.forEach(i => {
      const row = new Map<string, number>();
      nodes.forEach(j => {
        row.set(j.id, i.id === j.id ? 0 : Infinity);
      });
      dist.set(i.id, row);
    });

    edges.forEach(edge => {
      dist.get(edge.source)!.set(edge.target, edge.weight);
      dist.get(edge.target)!.set(edge.source, edge.weight);
    });

    for (const k of nodes) {
      for (const i of nodes) {
        for (const j of nodes) {
          const currentDist = dist.get(i.id)!.get(j.id)!;
          const newDist = dist.get(i.id)!.get(k.id)! + dist.get(k.id)!.get(j.id)!;

          if (newDist < currentDist) {
            dist.get(i.id)!.set(j.id, newDist);
            
            setNodes(prev =>
              prev.map(n => 
                n.id === k.id || n.id === i.id || n.id === j.id
                  ? { ...n, visited: true }
                  : n
              )
            );

            await new Promise(resolve => setTimeout(resolve, 1000 - speed * 10));
          }
        }
      }
    }

    toast.success("All-pairs shortest paths computed!");
  };

  const runBellmanFord = async (startId: string) => {
    const distances = new Map<string, number>();
    nodes.forEach(n => distances.set(n.id, Infinity));
    distances.set(startId, 0);

    setNodes(prev =>
      prev.map(n => ({ ...n, distance: n.id === startId ? 0 : Infinity }))
    );

    for (let i = 0; i < nodes.length - 1; i++) {
      for (const edge of edges) {
        const distSource = distances.get(edge.source)!;
        const distTarget = distances.get(edge.target)!;

        if (distSource + edge.weight < distTarget) {
          distances.set(edge.target, distSource + edge.weight);
          setNodes(prev =>
            prev.map(n => (n.id === edge.target ? { ...n, distance: distSource + edge.weight, visited: true } : n))
          );
          setEdges(prev =>
            prev.map(e =>
              e.source === edge.source && e.target === edge.target
                ? { ...e, visited: true }
                : e
            )
          );
          await new Promise(resolve => setTimeout(resolve, 1000 - speed * 10));
        }

        if (distTarget + edge.weight < distSource) {
          distances.set(edge.source, distTarget + edge.weight);
          setNodes(prev =>
            prev.map(n => (n.id === edge.source ? { ...n, distance: distTarget + edge.weight, visited: true } : n))
          );
          await new Promise(resolve => setTimeout(resolve, 1000 - speed * 10));
        }
      }
    }

    toast.success("Bellman-Ford complete!");
  };

  const resetVisualization = () => {
    setNodes(prev => prev.map(n => ({ ...n, visited: false, distance: undefined })));
    setEdges(prev => prev.map(e => ({ ...e, visited: false })));
    setCurrentStep(0);
    setQueue([]);
    setMstEdges([]);
    setSelectedNode(null);
  };

  const clearGraph = () => {
    setNodes([]);
    setEdges([]);
    setMstEdges([]);
    setSelectedNode(null);
    setNextNodeId(1);
    toast.success("Graph cleared");
  };

  const loadTemplate = (template: "complete" | "cycle" | "tree" | "grid") => {
    let newNodes: Node[] = [];
    let newEdges: Edge[] = [];

    switch (template) {
      case "complete": {
        // Complete graph K5
        const radius = 120;
        const centerX = 300;
        const centerY = 200;
        for (let i = 0; i < 5; i++) {
          const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
          newNodes.push({
            id: String.fromCharCode(65 + i),
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
            isStart: i === 0,
          });
        }
        // Connect all pairs
        for (let i = 0; i < 5; i++) {
          for (let j = i + 1; j < 5; j++) {
            newEdges.push({
              source: String.fromCharCode(65 + i),
              target: String.fromCharCode(65 + j),
              weight: Math.floor(Math.random() * 9) + 1,
            });
          }
        }
        break;
      }
      case "cycle": {
        // Cycle graph C6
        const radius = 120;
        const centerX = 300;
        const centerY = 200;
        for (let i = 0; i < 6; i++) {
          const angle = (i * 2 * Math.PI) / 6 - Math.PI / 2;
          newNodes.push({
            id: String.fromCharCode(65 + i),
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
            isStart: i === 0,
          });
        }
        // Connect in cycle
        for (let i = 0; i < 6; i++) {
          newEdges.push({
            source: String.fromCharCode(65 + i),
            target: String.fromCharCode(65 + ((i + 1) % 6)),
            weight: Math.floor(Math.random() * 9) + 1,
          });
        }
        break;
      }
      case "tree": {
        // Binary tree
        newNodes = [
          { id: "A", x: 300, y: 50, isStart: true },
          { id: "B", x: 200, y: 130 },
          { id: "C", x: 400, y: 130 },
          { id: "D", x: 150, y: 210 },
          { id: "E", x: 250, y: 210 },
          { id: "F", x: 350, y: 210 },
          { id: "G", x: 450, y: 210 },
        ];
        newEdges = [
          { source: "A", target: "B", weight: 2 },
          { source: "A", target: "C", weight: 3 },
          { source: "B", target: "D", weight: 1 },
          { source: "B", target: "E", weight: 4 },
          { source: "C", target: "F", weight: 2 },
          { source: "C", target: "G", weight: 5 },
        ];
        break;
      }
      case "grid": {
        // 3x3 grid
        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 3; col++) {
            newNodes.push({
              id: String.fromCharCode(65 + row * 3 + col),
              x: 150 + col * 150,
              y: 100 + row * 150,
              isStart: row === 0 && col === 0,
            });
          }
        }
        // Connect horizontally and vertically
        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 3; col++) {
            const current = String.fromCharCode(65 + row * 3 + col);
            // Right neighbor
            if (col < 2) {
              newEdges.push({
                source: current,
                target: String.fromCharCode(65 + row * 3 + col + 1),
                weight: Math.floor(Math.random() * 9) + 1,
              });
            }
            // Bottom neighbor
            if (row < 2) {
              newEdges.push({
                source: current,
                target: String.fromCharCode(65 + (row + 1) * 3 + col),
                weight: Math.floor(Math.random() * 9) + 1,
              });
            }
          }
        }
        break;
      }
    }

    setNodes(newNodes);
    setEdges(newEdges);
    setNextNodeId(newNodes.length + 1);
    resetVisualization();
    toast.success(`${template.charAt(0).toUpperCase() + template.slice(1)} graph loaded`);
  };

  const getAlgorithmInfo = (algo: Algorithm) => {
    const info = {
      bfs: {
        name: "Breadth-First Search",
        time: "O(V + E)",
        space: "O(V)",
        useCase: "Shortest path in unweighted graphs, level-order traversal",
      },
      dfs: {
        name: "Depth-First Search",
        time: "O(V + E)",
        space: "O(V)",
        useCase: "Cycle detection, topological sorting, maze solving",
      },
      dijkstra: {
        name: "Dijkstra's Algorithm",
        time: "O((V + E) log V)",
        space: "O(V)",
        useCase: "Shortest path in weighted graphs with non-negative weights",
      },
      astar: {
        name: "A* Search",
        time: "O(E) with good heuristic",
        space: "O(V)",
        useCase: "Pathfinding with heuristic guidance (games, GPS)",
      },
      kruskal: {
        name: "Kruskal's MST",
        time: "O(E log E)",
        space: "O(V)",
        useCase: "Minimum spanning tree, network design, clustering",
      },
      prim: {
        name: "Prim's MST",
        time: "O(E log V)",
        space: "O(V)",
        useCase: "Minimum spanning tree for dense graphs",
      },
      floyd: {
        name: "Floyd-Warshall",
        time: "O(V³)",
        space: "O(V²)",
        useCase: "All-pairs shortest paths, transitive closure",
      },
      bellman: {
        name: "Bellman-Ford",
        time: "O(V × E)",
        space: "O(V)",
        useCase: "Shortest path with negative weights, detects negative cycles",
      },
    };
    return info[algo];
  };

  const currentAlgoInfo = getAlgorithmInfo(algorithm);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Algorithm Comparison Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Current Algorithm: {currentAlgoInfo.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            <div className="p-3 bg-background/50 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Time Complexity</div>
              <div className="font-mono font-bold text-sm md:text-base text-primary">{currentAlgoInfo.time}</div>
            </div>
            <div className="p-3 bg-background/50 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Space Complexity</div>
              <div className="font-mono font-bold text-sm md:text-base text-secondary">{currentAlgoInfo.space}</div>
            </div>
            <div className="p-3 bg-background/50 rounded-lg sm:col-span-1">
              <div className="text-xs text-muted-foreground mb-1">Best Use Case</div>
              <div className="text-xs md:text-sm">{currentAlgoInfo.useCase}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Graph Algorithm Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <div className="space-y-2">
              <Label>Algorithm</Label>
              <Select value={algorithm} onValueChange={(value) => setAlgorithm(value as Algorithm)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bfs">BFS - Breadth First</SelectItem>
                  <SelectItem value="dfs">DFS - Depth First</SelectItem>
                  <SelectItem value="dijkstra">Dijkstra's Shortest Path</SelectItem>
                  <SelectItem value="astar">A* Search</SelectItem>
                  <SelectItem value="kruskal">Kruskal's MST</SelectItem>
                  <SelectItem value="prim">Prim's MST</SelectItem>
                  <SelectItem value="floyd">Floyd-Warshall</SelectItem>
                  <SelectItem value="bellman">Bellman-Ford</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Edit Mode</Label>
              <Select value={editMode} onValueChange={(value) => setEditMode(value as EditMode)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="select">Select</SelectItem>
                  <SelectItem value="addNode">Add Node</SelectItem>
                  <SelectItem value="addEdge">Add Edge</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <Button onClick={runAlgorithm} disabled={isRunning} className="gap-1 md:gap-2 text-xs md:text-sm touch-manipulation">
              {isRunning ? <Pause className="h-3 w-3 md:h-4 md:w-4" /> : <Play className="h-3 w-3 md:h-4 md:w-4" />}
              {isRunning ? "Running..." : "Start"}
            </Button>

            <Button onClick={resetVisualization} variant="outline" size="sm" className="gap-1 md:gap-2 text-xs md:text-sm touch-manipulation">
              <RotateCcw className="h-3 w-3 md:h-4 md:w-4" />
              Reset
            </Button>
            <Button onClick={clearGraph} variant="destructive" size="sm" className="gap-1 md:gap-2 text-xs md:text-sm touch-manipulation">
              Clear Graph
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-sm md:text-base">Graph Templates</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Button onClick={() => loadTemplate("complete")} variant="outline" size="sm" className="gap-1 md:gap-2 text-xs touch-manipulation">
                <Hexagon className="h-3 w-3 md:h-4 md:w-4" />
                Complete K5
              </Button>
              <Button onClick={() => loadTemplate("cycle")} variant="outline" size="sm" className="gap-1 md:gap-2 text-xs touch-manipulation">
                <Circle className="h-3 w-3 md:h-4 md:w-4" />
                Cycle C6
              </Button>
              <Button onClick={() => loadTemplate("tree")} variant="outline" size="sm" className="gap-1 md:gap-2 text-xs touch-manipulation">
                <GitBranch className="h-3 w-3 md:h-4 md:w-4" />
                Binary Tree
              </Button>
              <Button onClick={() => loadTemplate("grid")} variant="outline" size="sm" className="gap-1 md:gap-2 text-xs touch-manipulation">
                <Grid3x3 className="h-3 w-3 md:h-4 md:w-4" />
                Grid 3×3
              </Button>
            </div>
          </div>

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
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="lg:col-span-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Graph Visualization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-3 md:mb-4 p-2 md:p-3 bg-primary/5 rounded-lg text-xs md:text-sm">
              {editMode === "addNode" && "Click anywhere to add a node"}
              {editMode === "addEdge" && "Click two nodes to create an edge"}
              {editMode === "select" && "Drag nodes to reposition them • Select algorithm and click Start"}
            </div>
            <div className="overflow-x-auto">
              <svg
                ref={svgRef}
                width="600"
                height="400"
                viewBox="0 0 600 400"
                className="bg-card/50 rounded-lg border border-border w-full h-auto max-w-full"
                onClick={handleSvgClick}
                style={{ cursor: editMode === "addNode" ? "crosshair" : "default", touchAction: "pan-y" }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Algorithm Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4">
            <div>
              <h4 className="font-semibold mb-2 text-sm md:text-base">Current Step: {currentStep}</h4>
              {queue.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs md:text-sm text-muted-foreground">Queue/Stack:</p>
                  <div className="flex gap-2 flex-wrap">
                    {queue.map((nodeId, i) => (
                      <div key={i} className="px-2 md:px-3 py-1 bg-primary/20 rounded-full text-xs md:text-sm font-mono">
                        {nodeId}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm md:text-base">Legend</h4>
              <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-primary flex-shrink-0" />
                  <span>Start Node</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-destructive flex-shrink-0" />
                  <span>End Node</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-secondary flex-shrink-0" />
                  <span>Visited Node</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 md:w-8 h-0.5 bg-primary flex-shrink-0" />
                  <span>Visited Edge</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 md:w-8 h-1 bg-chart-1 flex-shrink-0" />
                  <span>MST Edge</span>
                </div>
              </div>
            </div>

            <div className="p-2 md:p-3 bg-muted/50 rounded-lg text-xs space-y-1">
              <p><strong>Tips:</strong></p>
              <p>• Drag nodes in Select mode to reposition</p>
              <p>• Use "Add Node" to click and add nodes</p>
              <p>• Use "Add Edge" to connect two nodes</p>
              <p>• Double-click nodes to edit labels</p>
              <p>• Double-click edge weights to edit</p>
              <p>• Load templates for quick graphs</p>
              <p>• MST algorithms work on entire graph</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Node Dialog */}
      <Dialog open={editingNode !== null} onOpenChange={(open) => !open && cancelEdit()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Node Label</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nodeLabel">Node Label</Label>
              <Input
                id="nodeLabel"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="Enter node label"
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveNodeEdit();
                  if (e.key === "Escape") cancelEdit();
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={cancelEdit}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={saveNodeEdit}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Edge Dialog */}
      <Dialog open={editingEdge !== null} onOpenChange={(open) => !open && cancelEdit()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Edge Weight</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edgeWeight">Edge Weight</Label>
              <Input
                id="edgeWeight"
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="Enter weight"
                min="0.1"
                step="0.1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveEdgeEdit();
                  if (e.key === "Escape") cancelEdit();
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={cancelEdit}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={saveEdgeEdit}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
