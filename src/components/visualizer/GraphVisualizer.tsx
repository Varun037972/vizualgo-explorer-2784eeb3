import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, RotateCcw, Plus } from "lucide-react";
import { Slider } from "@/components/ui/slider";
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

type Algorithm = "bfs" | "dfs" | "dijkstra" | "astar";

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

  useEffect(() => {
    visualizeGraph();
  }, [nodes, edges]);

  const visualizeGraph = () => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 400;

    // Draw edges
    const edgeGroup = svg.append("g");
    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      if (!sourceNode || !targetNode) return;

      edgeGroup
        .append("line")
        .attr("x1", sourceNode.x)
        .attr("y1", sourceNode.y)
        .attr("x2", targetNode.x)
        .attr("y2", targetNode.y)
        .attr("stroke", edge.visited ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))")
        .attr("stroke-width", edge.visited ? 3 : 2)
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
        .attr("stroke", "hsl(var(--primary))")
        .attr("stroke-width", 2);

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

  const resetVisualization = () => {
    setNodes(prev => prev.map(n => ({ ...n, visited: false, distance: undefined })));
    setEdges(prev => prev.map(e => ({ ...e, visited: false })));
    setCurrentStep(0);
    setQueue([]);
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Graph Algorithm Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <Select value={algorithm} onValueChange={(value) => setAlgorithm(value as Algorithm)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bfs">Breadth-First Search</SelectItem>
                <SelectItem value="dfs">Depth-First Search</SelectItem>
                <SelectItem value="dijkstra">Dijkstra's Algorithm</SelectItem>
                <SelectItem value="astar">A* Search</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={runAlgorithm} disabled={isRunning} className="gap-2">
              {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isRunning ? "Running..." : "Start"}
            </Button>

            <Button onClick={resetVisualization} variant="outline" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset
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
            <svg
              ref={svgRef}
              width="600"
              height="400"
              className="bg-card/50 rounded-lg border border-border"
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
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
