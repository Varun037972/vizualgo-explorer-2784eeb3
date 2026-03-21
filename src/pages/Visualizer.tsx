import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Code2, Flame, Network, HelpCircle, GitCompare, Bug, Trophy,
  Share2, ChevronDown, ChevronUp, Sparkles, Zap
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SortingVisualizer } from "@/components/visualizer/SortingVisualizer";
import { RaceMode } from "@/components/visualizer/RaceMode";
import { TreeVisualizerAdvanced } from "@/components/visualizer/TreeVisualizerAdvanced";
import { ComparisonMode } from "@/components/visualizer/ComparisonMode";
import { DebugMode } from "@/components/visualizer/DebugMode";
import { ChallengeMode } from "@/components/visualizer/ChallengeMode";
import { GraphVisualizer } from "@/components/visualizer/GraphVisualizer";
import { ComplexityComparisonPanel } from "@/components/visualizer/ComplexityComparisonPanel";
import { AITutorPanel } from "@/components/visualizer/AITutorPanel";
import { SmartDebugPanel } from "@/components/visualizer/SmartDebugPanel";
import { AdaptiveDifficulty } from "@/components/visualizer/AdaptiveDifficulty";
import { VoiceNarration } from "@/components/visualizer/VoiceNarration";
import AnimatedBackground from "@/components/AnimatedBackground";
import { Navigation } from "@/components/Navigation";
import { OnboardingTutorial } from "@/components/OnboardingTutorial";
import { useExportVisualization } from "@/hooks/useExportVisualization";
import { toast } from "sonner";
import { KeyboardShortcutsHelp } from "@/components/KeyboardShortcutsHelp";
import { motion, AnimatePresence } from "framer-motion";

const tabItems = [
  { value: "standard", icon: Code2, label: "Standard" },
  { value: "comparison", icon: GitCompare, label: "Compare" },
  { value: "debug", icon: Bug, label: "Debug" },
  { value: "challenge", icon: Trophy, label: "Challenge" },
  { value: "race", icon: Flame, label: "Race" },
  { value: "tree", icon: Network, label: "Trees" },
  { value: "graph", icon: Network, label: "Graphs" },
];

const Visualizer = () => {
  const [isRacing, setIsRacing] = useState(false);
  const [activeTab, setActiveTab] = useState("standard");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { exportAsImage, startVideoRecording, exportAsGIF, isExporting } = useExportVisualization();
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [showAITools, setShowAITools] = useState(false);
  const [userCode, setUserCode] = useState("");

  const handleExportImage = () => {
    exportAsImage("visualizer-content", `${activeTab}-visualization.png`);
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

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 relative" id="visualizer-content">
        {/* Premium Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
                  <Zap className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    Algorithm Visualizer
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Interactive visualization with real-time code execution
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOnboarding(true)}
                className="gap-2 rounded-xl border-border/30 hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <HelpCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Tutorial</span>
              </Button>
              <KeyboardShortcutsHelp triggerClassName="gap-2 text-sm rounded-xl" />
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportImage}
                disabled={isExporting}
                className="gap-2 rounded-xl border-border/30 hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportGIF}
                disabled={isExporting}
                className="gap-2 rounded-xl border-border/30 hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">GIF</span>
              </Button>
            </div>
          </div>

          {/* Premium Tab Bar */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full h-auto p-1.5 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/30 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-1">
              {tabItems.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="gap-2 text-sm rounded-xl py-2.5 px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/10 data-[state=active]:text-primary data-[state=active]:shadow-md data-[state=active]:shadow-primary/10 transition-all duration-300"
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="mt-6"
              >
                <TabsContent value="standard" className="mt-0" forceMount={activeTab === "standard" ? true : undefined}>
                  <SortingVisualizer />
                </TabsContent>

                <TabsContent value="race" className="mt-0 space-y-6" forceMount={activeTab === "race" ? true : undefined}>
                  <div className="premium-card p-8 text-center space-y-4">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center mb-4">
                      <Flame className="h-7 w-7 text-orange-400" />
                    </div>
                    <h2 className="text-2xl font-bold">Algorithm Race Mode</h2>
                    <p className="text-muted-foreground max-w-xl mx-auto text-sm">
                      Watch multiple sorting algorithms compete head-to-head on the same dataset in real-time.
                    </p>
                    <Button
                      size="lg"
                      onClick={() => setIsRacing(true)}
                      disabled={isRacing}
                      className="rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all hover:scale-105"
                    >
                      <Flame className="mr-2 h-5 w-5" />
                      Start Race
                    </Button>
                  </div>
                  <RaceMode isRacing={isRacing} onRaceComplete={() => setTimeout(() => setIsRacing(false), 3000)} />
                </TabsContent>

                <TabsContent value="comparison" className="mt-0" forceMount={activeTab === "comparison" ? true : undefined}>
                  <ComparisonMode />
                </TabsContent>

                <TabsContent value="debug" className="mt-0" forceMount={activeTab === "debug" ? true : undefined}>
                  <DebugMode />
                </TabsContent>

                <TabsContent value="challenge" className="mt-0" forceMount={activeTab === "challenge" ? true : undefined}>
                  <ChallengeMode />
                </TabsContent>

                <TabsContent value="tree" className="mt-0 space-y-6" forceMount={activeTab === "tree" ? true : undefined}>
                  <div className="premium-card p-8 text-center space-y-4">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4">
                      <Network className="h-7 w-7 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold">Tree Data Structures</h2>
                    <p className="text-muted-foreground max-w-xl mx-auto text-sm">
                      Build and explore BST, AVL, Red-Black Trees, Heaps, and Tries with animated operations.
                    </p>
                  </div>
                  <TreeVisualizerAdvanced />
                </TabsContent>

                <TabsContent value="graph" className="mt-0 space-y-6" forceMount={activeTab === "graph" ? true : undefined}>
                  <div className="premium-card p-8 text-center space-y-4">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center mb-4">
                      <Network className="h-7 w-7 text-accent" />
                    </div>
                    <h2 className="text-2xl font-bold">Graph Algorithms</h2>
                    <p className="text-muted-foreground max-w-xl mx-auto text-sm">
                      Explore BFS, DFS, Dijkstra, and A* with interactive node and edge manipulation.
                    </p>
                  </div>
                  <GraphVisualizer />
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </motion.div>

        {/* AI Tools Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Button
            variant="outline"
            onClick={() => setShowAITools(!showAITools)}
            className="w-full gap-2 mb-4 rounded-xl border-border/30 hover:border-primary/50 bg-card/50 backdrop-blur-sm py-3 transition-all"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            {showAITools ? "Hide" : "Show"} AI Learning Tools
            {showAITools ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>

          <AnimatePresence>
            {showAITools && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="space-y-6">
                  <div className="premium-card p-4 flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Voice Narration
                    </span>
                    <VoiceNarration text="Welcome to the Algorithm Visualizer." />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ComplexityComparisonPanel selectedAlgorithm="Bubble Sort" userCode={userCode} />
                    <AITutorPanel currentAlgorithm="Bubble Sort" userCode={userCode} />
                    <SmartDebugPanel code={userCode || "// Paste your code here"} />
                    <AdaptiveDifficulty />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <OnboardingTutorial open={showOnboarding} onClose={() => setShowOnboarding(false)} />
    </div>
  );
};

export default Visualizer;
