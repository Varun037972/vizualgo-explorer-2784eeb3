import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Code2, Flame, Network } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SortingVisualizer } from "@/components/visualizer/SortingVisualizer";
import { RaceMode } from "@/components/visualizer/RaceMode";
import { TreeVisualizer } from "@/components/visualizer/TreeVisualizer";
import { TreeVisualizerAdvanced } from "@/components/visualizer/TreeVisualizerAdvanced";

const Visualizer = () => {
  const [isRacing, setIsRacing] = useState(false);
  const [activeTab, setActiveTab] = useState("standard");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 animate-fade-in-down">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button 
                variant="ghost" 
                size="sm"
                className="hover:scale-105 hover:bg-primary/10 transition-all duration-300"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center animate-glow-pulse">
                <Code2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shift">
                Algorithm Visualizer
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 animate-fade-in-up">
        <div className="mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Algorithm Visualizer</h1>
                <p className="text-muted-foreground">
                  Visualize algorithms with real code execution and performance analysis
                </p>
              </div>
              <TabsList className="w-fit">
                <TabsTrigger value="standard" className="gap-2">
                  <Code2 className="h-4 w-4" />
                  Standard Mode
                </TabsTrigger>
                <TabsTrigger value="race" className="gap-2">
                  <Flame className="h-4 w-4" />
                  Race Mode
                </TabsTrigger>
                <TabsTrigger value="tree" className="gap-2">
                  <Network className="h-4 w-4" />
                  Tree Structures
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="standard" className="mt-0">
              <SortingVisualizer />
            </TabsContent>

            <TabsContent value="race" className="mt-0 space-y-6">
              <div className="text-center space-y-4 p-6 bg-card/50 rounded-lg border border-primary/20">
                <h2 className="text-2xl font-bold">Compare Algorithms Head-to-Head</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Watch multiple sorting algorithms race against each other on the same dataset. 
                  See which algorithm performs best in real-time!
                </p>
                <Button
                  size="lg"
                  onClick={() => setIsRacing(true)}
                  disabled={isRacing}
                  className="bg-gradient-primary hover:shadow-glow-primary hover:scale-105 transition-all"
                >
                  <Flame className="mr-2 h-5 w-5" />
                  Start Race
                </Button>
              </div>
              
              <RaceMode isRacing={isRacing} onRaceComplete={() => setTimeout(() => setIsRacing(false), 3000)} />
            </TabsContent>

            <TabsContent value="tree" className="mt-0 space-y-6">
              <div className="text-center space-y-4 p-6 bg-card/50 rounded-lg border border-primary/20">
                <h2 className="text-2xl font-bold">Interactive Tree Data Structure Explorer</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Build and visualize BST, AVL, Red-Black Trees, Heaps, and Tries with animated operations. 
                  Insert, delete, search, and traverse - watch algorithms come to life with step-by-step animations!
                </p>
              </div>
              
              <TreeVisualizerAdvanced />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Visualizer;
