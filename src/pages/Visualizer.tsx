import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Play, RotateCcw, Settings, Code2 } from "lucide-react";

const Visualizer = () => {
  const [code, setCode] = useState(`def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr

# Example usage
numbers = [64, 34, 25, 12, 22, 11, 90]
sorted_numbers = bubble_sort(numbers)
print(sorted_numbers)`);

  const [language, setLanguage] = useState("python");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Code2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Algorithm Visualizer</span>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Code Editor Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Code Editor</span>
                <Tabs value={language} onValueChange={setLanguage} className="w-auto">
                  <TabsList>
                    <TabsTrigger value="python">Python</TabsTrigger>
                    <TabsTrigger value="java">Java</TabsTrigger>
                    <TabsTrigger value="cpp">C++</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="font-mono text-sm min-h-[400px] bg-muted"
                placeholder="Write your algorithm here..."
              />
              <div className="flex gap-3">
                <Button className="bg-gradient-primary text-primary-foreground flex-1">
                  <Play className="mr-2 h-4 w-4" />
                  Visualize
                </Button>
                <Button variant="outline">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Visualization Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="min-h-[400px] bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                <div className="text-center space-y-4 p-8">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                    <Play className="h-8 w-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">Ready to Visualize</h3>
                    <p className="text-muted-foreground">
                      Click "Visualize" to see your algorithm come alive with step-by-step execution
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Panels */}
        <div className="grid md:grid-cols-3 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Complexity Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                No data yet - Run visualization first
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Memory Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                No data yet - Run visualization first
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                No data yet - Run visualization first
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Visualizer;
