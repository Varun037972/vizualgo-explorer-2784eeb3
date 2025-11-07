import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Code2, Flame, Network, HelpCircle, GitCompare, Bug, Trophy, Share2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SortingVisualizer } from "@/components/visualizer/SortingVisualizer";
import { RaceMode } from "@/components/visualizer/RaceMode";
import { TreeVisualizer } from "@/components/visualizer/TreeVisualizer";
import { TreeVisualizerAdvanced } from "@/components/visualizer/TreeVisualizerAdvanced";
import { ComparisonMode } from "@/components/visualizer/ComparisonMode";
import { DebugMode } from "@/components/visualizer/DebugMode";
import { ChallengeMode } from "@/components/visualizer/ChallengeMode";
import { GraphVisualizer } from "@/components/visualizer/GraphVisualizer";
import AnimatedBackground from "@/components/AnimatedBackground";
import { Navigation } from "@/components/Navigation";
import { OnboardingTutorial } from "@/components/OnboardingTutorial";
import { useExportVisualization } from "@/hooks/useExportVisualization";
import { toast } from "sonner";

const Visualizer = () => {
  const [isRacing, setIsRacing] = useState(false);
  const [activeTab, setActiveTab] = useState("standard");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { exportAsImage, startVideoRecording, exportAsGIF, isExporting } = useExportVisualization();
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  const handleExportImage = () => {
    exportAsImage("visualizer-content", `${activeTab}-visualization.png`);
  };

  const handleStartRecording = () => {
    const recorder = startVideoRecording("visualizer-content");
    setMediaRecorder(recorder);
  };

  const handleStopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null);
      toast.success("Recording stopped");
    }
  };

  const handleExportGIF = () => {
    exportAsGIF("visualizer-content", 5000);
  };

  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground />
      <Navigation />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 animate-fade-in-up relative" id="visualizer-content">
        <div className="mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Algorithm Visualizer</h1>
                  <p className="text-muted-foreground">
                    Visualize algorithms with real code execution and performance analysis
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowOnboarding(true)}
                    className="gap-2"
                  >
                    <HelpCircle className="h-4 w-4" />
                    Tutorial
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportImage}
                    disabled={isExporting}
                    className="gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Export Image
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportGIF}
                    disabled={isExporting}
                    className="gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Export GIF
                  </Button>
                </div>
              </div>

              <TabsList className="w-fit grid grid-cols-3 md:grid-cols-7 gap-1">
                <TabsTrigger value="standard" className="gap-2">
                  <Code2 className="h-4 w-4" />
                  <span className="hidden md:inline">Standard</span>
                </TabsTrigger>
                <TabsTrigger value="comparison" className="gap-2">
                  <GitCompare className="h-4 w-4" />
                  <span className="hidden md:inline">Compare</span>
                </TabsTrigger>
                <TabsTrigger value="debug" className="gap-2">
                  <Bug className="h-4 w-4" />
                  <span className="hidden md:inline">Debug</span>
                </TabsTrigger>
                <TabsTrigger value="challenge" className="gap-2">
                  <Trophy className="h-4 w-4" />
                  <span className="hidden md:inline">Challenge</span>
                </TabsTrigger>
                <TabsTrigger value="race" className="gap-2">
                  <Flame className="h-4 w-4" />
                  <span className="hidden md:inline">Race</span>
                </TabsTrigger>
                <TabsTrigger value="tree" className="gap-2">
                  <Network className="h-4 w-4" />
                  <span className="hidden md:inline">Trees</span>
                </TabsTrigger>
                <TabsTrigger value="graph" className="gap-2">
                  <Network className="h-4 w-4" />
                  <span className="hidden md:inline">Graphs</span>
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

            <TabsContent value="comparison" className="mt-0">
              <ComparisonMode />
            </TabsContent>

            <TabsContent value="debug" className="mt-0">
              <DebugMode />
            </TabsContent>

            <TabsContent value="challenge" className="mt-0">
              <ChallengeMode />
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

            <TabsContent value="graph" className="mt-0 space-y-6">
              <div className="text-center space-y-4 p-6 bg-card/50 rounded-lg border border-primary/20">
                <h2 className="text-2xl font-bold">Graph Algorithm Visualizer</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Explore graph traversal and pathfinding algorithms including BFS, DFS, Dijkstra, and A* with interactive node and edge manipulation.
                </p>
              </div>
              
              <GraphVisualizer />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <OnboardingTutorial open={showOnboarding} onClose={() => setShowOnboarding(false)} />
    </div>
  );
};

export default Visualizer;
