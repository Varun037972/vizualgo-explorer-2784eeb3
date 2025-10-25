import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Network, Play, RotateCcw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
  x?: number;
  y?: number;
  highlight?: boolean;
}

type TreeType = "bst" | "heap" | "avl";

export const TreeVisualizer = () => {
  const [values, setValues] = useState("50,30,70,20,40,60,80");
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [treeType, setTreeType] = useState<TreeType>("bst");
  const [isAnimating, setIsAnimating] = useState(false);
  const [steps, setSteps] = useState<string[]>([]);

  const insertBST = (root: TreeNode | null, value: number): TreeNode => {
    if (!root) {
      return { value, left: null, right: null };
    }
    if (value < root.value) {
      root.left = insertBST(root.left, value);
    } else if (value > root.value) {
      root.right = insertBST(root.right, value);
    }
    return root;
  };

  const calculatePositions = (
    node: TreeNode | null,
    x: number,
    y: number,
    offset: number
  ): void => {
    if (!node) return;
    node.x = x;
    node.y = y;
    if (node.left) {
      calculatePositions(node.left, x - offset, y + 80, offset / 2);
    }
    if (node.right) {
      calculatePositions(node.right, x + offset, y + 80, offset / 2);
    }
  };

  const buildTree = () => {
    const vals = values.split(",").map((v) => parseInt(v.trim())).filter((v) => !isNaN(v));
    if (vals.length === 0) return;

    let root: TreeNode | null = null;
    const newSteps: string[] = [];

    vals.forEach((val, idx) => {
      root = insertBST(root, val);
      newSteps.push(`Inserted ${val} into ${treeType.toUpperCase()}`);
    });

    if (root) {
      calculatePositions(root, 400, 50, 100);
    }

    setTree(root);
    setSteps(newSteps);
  };

  const renderTree = (node: TreeNode | null): JSX.Element[] => {
    if (!node) return [];
    const elements: JSX.Element[] = [];

    // Draw lines to children
    if (node.left && node.x !== undefined && node.y !== undefined && node.left.x !== undefined && node.left.y !== undefined) {
      elements.push(
        <line
          key={`line-left-${node.value}-${node.x}`}
          x1={node.x}
          y1={node.y + 20}
          x2={node.left.x}
          y2={node.left.y + 20}
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          opacity="0.5"
        />
      );
    }
    if (node.right && node.x !== undefined && node.y !== undefined && node.right.x !== undefined && node.right.y !== undefined) {
      elements.push(
        <line
          key={`line-right-${node.value}-${node.x}`}
          x1={node.x}
          y1={node.y + 20}
          x2={node.right.x}
          y2={node.right.y + 20}
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          opacity="0.5"
        />
      );
    }

    // Draw node
    elements.push(
      <g key={`node-${node.value}-${node.x}`} className="animate-scale-in">
        <circle
          cx={node.x}
          cy={node.y}
          r="20"
          fill="hsl(var(--primary))"
          stroke="hsl(var(--primary-foreground))"
          strokeWidth="2"
          className="transition-all duration-300 hover:scale-110"
        />
        <text
          x={node.x}
          y={node.y}
          textAnchor="middle"
          dy="0.3em"
          fill="hsl(var(--primary-foreground))"
          fontSize="14"
          fontWeight="bold"
        >
          {node.value}
        </text>
      </g>
    );

    // Recursively render children
    elements.push(...renderTree(node.left));
    elements.push(...renderTree(node.right));

    return elements;
  };

  const reset = () => {
    setTree(null);
    setSteps([]);
  };

  return (
    <div className="space-y-4">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            Tree Visualization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Select value={treeType} onValueChange={(v: TreeType) => setTreeType(v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bst">Binary Search Tree</SelectItem>
                <SelectItem value="heap">Heap</SelectItem>
                <SelectItem value="avl">AVL Tree</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Enter values (comma-separated)"
              value={values}
              onChange={(e) => setValues(e.target.value)}
              className="flex-1"
            />
            <Button onClick={buildTree} disabled={isAnimating}>
              <Play className="h-4 w-4 mr-2" />
              Build
            </Button>
            <Button onClick={reset} variant="outline">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          <div className="bg-muted/30 rounded-lg border border-primary/10 p-4 min-h-[400px]">
            <svg width="800" height="400" className="w-full">
              {tree && renderTree(tree)}
            </svg>
          </div>

          {steps.length > 0 && (
            <div className="bg-card/50 rounded-lg p-4 border border-primary/10">
              <h3 className="font-semibold mb-2">Build Steps:</h3>
              <div className="space-y-1 max-h-[120px] overflow-y-auto text-sm text-muted-foreground">
                {steps.map((step, idx) => (
                  <div key={idx} className="animate-fade-in">
                    {idx + 1}. {step}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
