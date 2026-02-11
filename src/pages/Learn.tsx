import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import AnimatedBackground from "@/components/AnimatedBackground";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, BookOpen, Eye, Code2, Trophy, Lock, ChevronRight, Brain, Target, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface Module {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string;
  steps: { label: string; icon: React.ReactNode }[];
  completed: boolean;
}

const modules: Module[] = [
  {
    id: "bubble-sort",
    title: "Bubble Sort",
    description: "Learn the simplest comparison-based sorting algorithm step by step.",
    difficulty: "beginner",
    category: "Sorting",
    steps: [
      { label: "Pre-Assessment", icon: <Target className="h-4 w-4" /> },
      { label: "Explanation", icon: <BookOpen className="h-4 w-4" /> },
      { label: "Visualization", icon: <Eye className="h-4 w-4" /> },
      { label: "Coding Practice", icon: <Code2 className="h-4 w-4" /> },
      { label: "Post-Assessment", icon: <Trophy className="h-4 w-4" /> },
    ],
    completed: false,
  },
  {
    id: "quick-sort",
    title: "Quick Sort",
    description: "Master the divide-and-conquer sorting with pivot selection strategies.",
    difficulty: "intermediate",
    category: "Sorting",
    steps: [
      { label: "Pre-Assessment", icon: <Target className="h-4 w-4" /> },
      { label: "Explanation", icon: <BookOpen className="h-4 w-4" /> },
      { label: "Visualization", icon: <Eye className="h-4 w-4" /> },
      { label: "Coding Practice", icon: <Code2 className="h-4 w-4" /> },
      { label: "Post-Assessment", icon: <Trophy className="h-4 w-4" /> },
    ],
    completed: false,
  },
  {
    id: "merge-sort",
    title: "Merge Sort",
    description: "Understand the stable divide-and-conquer sorting with guaranteed O(n log n).",
    difficulty: "intermediate",
    category: "Sorting",
    steps: [
      { label: "Pre-Assessment", icon: <Target className="h-4 w-4" /> },
      { label: "Explanation", icon: <BookOpen className="h-4 w-4" /> },
      { label: "Visualization", icon: <Eye className="h-4 w-4" /> },
      { label: "Coding Practice", icon: <Code2 className="h-4 w-4" /> },
      { label: "Post-Assessment", icon: <Trophy className="h-4 w-4" /> },
    ],
    completed: false,
  },
  {
    id: "bst",
    title: "Binary Search Tree",
    description: "Build and traverse BSTs with insert, delete, and search operations.",
    difficulty: "intermediate",
    category: "Trees",
    steps: [
      { label: "Pre-Assessment", icon: <Target className="h-4 w-4" /> },
      { label: "Explanation", icon: <BookOpen className="h-4 w-4" /> },
      { label: "Visualization", icon: <Eye className="h-4 w-4" /> },
      { label: "Coding Practice", icon: <Code2 className="h-4 w-4" /> },
      { label: "Post-Assessment", icon: <Trophy className="h-4 w-4" /> },
    ],
    completed: false,
  },
  {
    id: "dijkstra",
    title: "Dijkstra's Algorithm",
    description: "Find shortest paths in weighted graphs using greedy approach.",
    difficulty: "advanced",
    category: "Graphs",
    steps: [
      { label: "Pre-Assessment", icon: <Target className="h-4 w-4" /> },
      { label: "Explanation", icon: <BookOpen className="h-4 w-4" /> },
      { label: "Visualization", icon: <Eye className="h-4 w-4" /> },
      { label: "Coding Practice", icon: <Code2 className="h-4 w-4" /> },
      { label: "Post-Assessment", icon: <Trophy className="h-4 w-4" /> },
    ],
    completed: false,
  },
  {
    id: "bfs-dfs",
    title: "BFS & DFS Traversal",
    description: "Explore graph traversal strategies — breadth-first vs depth-first.",
    difficulty: "intermediate",
    category: "Graphs",
    steps: [
      { label: "Pre-Assessment", icon: <Target className="h-4 w-4" /> },
      { label: "Explanation", icon: <BookOpen className="h-4 w-4" /> },
      { label: "Visualization", icon: <Eye className="h-4 w-4" /> },
      { label: "Coding Practice", icon: <Code2 className="h-4 w-4" /> },
      { label: "Post-Assessment", icon: <Trophy className="h-4 w-4" /> },
    ],
    completed: false,
  },
];

const difficultyColors = {
  beginner: "bg-green-500/20 text-green-400 border-green-500/30",
  intermediate: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  advanced: "bg-red-500/20 text-red-400 border-red-500/30",
};

const Learn = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const categories = ["all", "Sorting", "Trees", "Graphs"];

  const filteredModules = selectedCategory === "all"
    ? modules
    : modules.filter((m) => m.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground />
      <Navigation />

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Learning <span className="text-primary">Modules</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Structured learning path: Pre-Assessment → Explanation → Visualization → Coding → Post-Assessment
          </p>
        </motion.div>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{modules.length}</p>
                  <p className="text-sm text-muted-foreground">Total Modules</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <Progress value={0} className="w-24 h-2" />
                  <p className="text-sm text-muted-foreground mt-1">Overall Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className="capitalize"
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm hover:border-primary/30 transition-all hover:-translate-y-1 group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">
                        {module.title}
                      </CardTitle>
                      <CardDescription className="mt-1">{module.description}</CardDescription>
                    </div>
                    <Badge className={difficultyColors[module.difficulty]} variant="outline">
                      {module.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Learning Steps */}
                  <div className="space-y-2 mb-4">
                    {module.steps.map((step, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <div className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center text-xs">
                          {i + 1}
                        </div>
                        {step.icon}
                        <span>{step.label}</span>
                      </div>
                    ))}
                  </div>

                  <Link to={`/learn/${module.id}`}>
                    <Button className="w-full gap-2 group-hover:bg-primary transition-colors" variant="outline">
                      Start Module
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Learn;
