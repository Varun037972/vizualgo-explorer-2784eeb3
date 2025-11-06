import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, TrendingUp, Shuffle, ArrowDownUp } from "lucide-react";

interface QuickStartExample {
  title: string;
  description: string;
  icon: any;
  values: number[];
  algorithm: string;
  color: string;
}

const examples: QuickStartExample[] = [
  {
    title: "Nearly Sorted",
    description: "See how algorithms perform on almost-sorted data",
    icon: TrendingUp,
    values: [10, 20, 25, 30, 35, 28, 40, 50, 55, 60],
    algorithm: "insertion",
    color: "secondary",
  },
  {
    title: "Random Dataset",
    description: "Test with completely random numbers",
    icon: Shuffle,
    values: [64, 25, 12, 22, 11, 90, 88, 45, 50, 33],
    algorithm: "quick",
    color: "primary",
  },
  {
    title: "Reverse Sorted",
    description: "Watch worst-case scenarios in action",
    icon: ArrowDownUp,
    values: [100, 90, 80, 70, 60, 50, 40, 30, 20, 10],
    algorithm: "merge",
    color: "accent",
  },
];

interface QuickStartExamplesProps {
  onSelectExample: (values: number[], algorithm: string) => void;
}

export const QuickStartExamples = ({ onSelectExample }: QuickStartExamplesProps) => {
  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Quick Start Examples
        </CardTitle>
        <CardDescription>
          Get started instantly with pre-configured examples
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {examples.map((example) => {
            const Icon = example.icon;
            return (
              <button
                key={example.title}
                onClick={() => onSelectExample(example.values, example.algorithm)}
                className="text-left p-4 rounded-lg border border-border hover:border-primary/50 transition-all group hover:scale-105"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-${example.color}/20 flex items-center justify-center flex-shrink-0 group-hover:bg-${example.color}/30 transition-colors`}>
                    <Icon className={`h-5 w-5 text-${example.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                      {example.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {example.description}
                    </p>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {example.values.slice(0, 5).join(", ")}...
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
