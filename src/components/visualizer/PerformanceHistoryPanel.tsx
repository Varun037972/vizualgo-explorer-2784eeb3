import { History, Trash2, BarChart3, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import type { PerformanceRun } from "@/hooks/usePerformanceHistory";

interface PerformanceHistoryPanelProps {
  history: PerformanceRun[];
  onClearHistory: () => void;
  getComparisonChartData: (algorithm?: string) => any[];
  getAlgorithmComparisonData: () => any[];
}

const algorithmColors: Record<string, string> = {
  bubble: "#f59e0b",
  quick: "#10b981",
  merge: "#3b82f6",
  insertion: "#8b5cf6",
  selection: "#ef4444",
};

const algorithmNames: Record<string, string> = {
  bubble: "Bubble Sort",
  quick: "Quick Sort",
  merge: "Merge Sort",
  insertion: "Insertion Sort",
  selection: "Selection Sort",
};

export const PerformanceHistoryPanel = ({
  history,
  onClearHistory,
  getComparisonChartData,
  getAlgorithmComparisonData,
}: PerformanceHistoryPanelProps) => {
  const chartData = getComparisonChartData();
  const algorithmData = getAlgorithmComparisonData();

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            Performance History
            {history.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {history.length} runs
              </Badge>
            )}
          </div>
          {history.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onClearHistory}
              className="h-7 px-2 text-destructive hover:text-destructive"
              title="Clear history"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        {history.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">
            No performance history yet. Run some algorithms to see metrics here.
          </p>
        ) : (
          <Tabs defaultValue="chart" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-8">
              <TabsTrigger value="chart" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                Trend
              </TabsTrigger>
              <TabsTrigger value="compare" className="text-xs">
                <BarChart3 className="h-3 w-3 mr-1" />
                Compare
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs">
                <History className="h-3 w-3 mr-1" />
                Log
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chart" className="mt-3">
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData.slice(-10)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                    <Line
                      type="monotone"
                      dataKey="comparisons"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name="Comparisons"
                    />
                    <Line
                      type="monotone"
                      dataKey="swaps"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name="Swaps"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="compare" className="mt-3">
              {algorithmData.length > 0 ? (
                <div className="h-[180px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={algorithmData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="algorithm"
                        tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                        tickFormatter={(value) => algorithmNames[value]?.split(" ")[0] || value}
                      />
                      <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                        labelFormatter={(value) => algorithmNames[value] || value}
                      />
                      <Legend wrapperStyle={{ fontSize: "11px" }} />
                      <Bar
                        dataKey="avgComparisons"
                        fill="hsl(var(--primary))"
                        name="Avg Comparisons"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="avgSwaps"
                        fill="#10b981"
                        name="Avg Swaps"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-6">
                  Run multiple algorithms to compare performance.
                </p>
              )}
            </TabsContent>

            <TabsContent value="history" className="mt-3">
              <ScrollArea className="h-[180px]">
                <div className="space-y-2">
                  {history.slice(0, 15).map((run) => (
                    <div
                      key={run.id}
                      className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: algorithmColors[run.algorithm] || "hsl(var(--primary))" }}
                        />
                        <div>
                          <p className="text-xs font-medium">
                            {algorithmNames[run.algorithm] || run.algorithm}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {formatTime(run.timestamp)} • n={run.arraySize}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-mono">
                          {run.comparisons} cmp
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          {run.swaps} swp • {run.elapsedTime.toFixed(2)}s
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};
