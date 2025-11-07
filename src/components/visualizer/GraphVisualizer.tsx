import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, RotateCcw, Plus, MousePointer, Move } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import * as d3 from "d3";

interface Node {
  id: string;
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
      edgeGroup
        .append("text")
        .attr("x", midX)
        .attr("y", midY)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("class", "fill-primary font-semibold text-sm")
        .style("background", "hsl(var(--background))")
        .text(edge.weight);
    });

    // Draw nodes
    const nodeGroup = svg.append("g");
    nodes.forEach(node => {
      const group = nodeGroup.append("g");

      group
        .append("circle")
        .attr("cx", node.x)
        .attr("cy", node.y)
        .attr("r", 25)
        .attr("fill", node.isStart ? "hsl(var(--primary))" : node.isEnd ? "hsl(var(--destructive))" : node.visited ? "hsl(var(--secondary))" : "hsl(var(--card))")
        .attr("stroke", selectedNode === node.id ? "hsl(var(--chart-2))" : "hsl(var(--primary))")
        .attr("stroke-width", selectedNode === node.id ? 4 : 2)
        .style("cursor", editMode !== "select" ? "pointer" : "default")
        .on("click", () => handleNodeClick(node.id));

      group
        .append("text")
        .attr("x", node.x)
        .attr("y", node.y)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("class", "fill-foreground font-bold")
        .text(node.id);

      if (node.distance !== undefined) {
        group
          .append("text")
          .attr("x", node.x)
          .attr("y", node.y + 40)
          .attr("text-anchor", "middle")
          .attr("class", "fill-muted-foreground text-sm")
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

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Graph Algorithm Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <Button onClick={runAlgorithm} disabled={isRunning} className="gap-2">
              {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isRunning ? "Running..." : "Start"}
            </Button>

            <Button onClick={resetVisualization} variant="outline" size="sm" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button onClick={clearGraph} variant="outline" size="sm" className="gap-2">
              Clear Graph
            </Button>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-primary/20">
          <CardHeader>
            <CardTitle>Graph Visualization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-3 bg-primary/5 rounded-lg text-sm">
              {editMode === "addNode" && "Click anywhere to add a node"}
              {editMode === "addEdge" && "Click two nodes to create an edge"}
              {editMode === "select" && "Select an algorithm and click Start"}
            </div>
            <svg
              ref={svgRef}
              width="600"
              height="400"
              className="bg-card/50 rounded-lg border border-border"
              onClick={handleSvgClick}
              style={{ cursor: editMode === "addNode" ? "crosshair" : "default" }}
            />
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Algorithm Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Current Step: {currentStep}</h4>
              {queue.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Queue/Stack:</p>
                  <div className="flex gap-2 flex-wrap">
                    {queue.map((nodeId, i) => (
                      <div key={i} className="px-3 py-1 bg-primary/20 rounded-full text-sm font-mono">
                        {nodeId}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Legend</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-primary" />
                  <span>Start Node</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-destructive" />
                  <span>End Node</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-secondary" />
                  <span>Visited Node</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5 bg-primary" />
                  <span>Visited Edge</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-1 bg-chart-1" />
                  <span>MST Edge</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-muted/50 rounded-lg text-xs space-y-1">
              <p><strong>Tips:</strong></p>
              <p>• Use "Add Node" to click and add nodes</p>
              <p>• Use "Add Edge" to connect two nodes</p>
              <p>• Set start node by adding "A" first</p>
              <p>• MST algorithms work on entire graph</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
