import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import AnimatedBackground from "@/components/AnimatedBackground";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  GraduationCap, BookOpen, Brain, Trophy, Briefcase, BarChart3, 
  Code2, FlaskConical, MessageSquare, ChevronRight, Sparkles, Target,
  Layers
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useUserProgress, useStudyTracker, getStudyHours } from "@/hooks/useUserProgress";

const branches = [
  { id: "cse", name: "Computer Science", icon: <Code2 className="h-5 w-5" /> },
  { id: "ece", name: "Electronics & Communication", icon: <Layers className="h-5 w-5" /> },
  { id: "mech", name: "Mechanical Engineering", icon: <FlaskConical className="h-5 w-5" /> },
  { id: "civil", name: "Civil Engineering", icon: <Layers className="h-5 w-5" /> },
  { id: "eee", name: "Electrical Engineering", icon: <Sparkles className="h-5 w-5" /> },
];

const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

const dashboardModules = [
  { title: "AI Tutor", description: "Chat with your personal AI tutor for explanations, MCQs, code reviews, and notes.", icon: <Brain className="h-8 w-8" />, link: "/ai-tutor", color: "from-primary/20 to-accent/20", borderColor: "border-primary/30", badge: "AI Powered" },
  { title: "Animation Lab", description: "Visualize algorithms with step-by-step animations and interactive controls.", icon: <FlaskConical className="h-8 w-8" />, link: "/visualizer", color: "from-secondary/20 to-primary/20", borderColor: "border-secondary/30", badge: "Interactive" },
  { title: "Quiz Arena", description: "Test your knowledge with timed quizzes, AI-generated questions, and leaderboards.", icon: <Trophy className="h-8 w-8" />, link: "/quiz", color: "from-amber-500/20 to-orange-500/20", borderColor: "border-amber-500/30", badge: "Gamified" },
  { title: "Learning Modules", description: "Structured learning paths from basics to advanced with assessments.", icon: <BookOpen className="h-8 w-8" />, link: "/learn", color: "from-green-500/20 to-emerald-500/20", borderColor: "border-green-500/30", badge: "Guided" },
  { title: "Placement Portal", description: "Aptitude tests, company cards, resume builder, and interview practice.", icon: <Briefcase className="h-8 w-8" />, link: "/placement", color: "from-purple-500/20 to-violet-500/20", borderColor: "border-purple-500/30", badge: "Career" },
  { title: "Analytics", description: "Track your progress, performance charts, study statistics, and weak areas.", icon: <BarChart3 className="h-8 w-8" />, link: "/analytics", color: "from-rose-500/20 to-pink-500/20", borderColor: "border-rose-500/30", badge: "Insights" },
];

const Dashboard = () => {
  const { progress, loading, userId, updateProgress } = useUserProgress();
  const [showYearDialog, setShowYearDialog] = useState(false);
  const [pendingBranch, setPendingBranch] = useState<string | null>(null);
  const [studyHours, setStudyHours] = useState(0);

  useStudyTracker("dashboard");

  useEffect(() => {
    getStudyHours().then(setStudyHours);
  }, []);

  const handleBranchSelect = (branchId: string) => {
    setPendingBranch(branchId);
    setShowYearDialog(true);
  };

  const handleYearSelect = async (y: string) => {
    setShowYearDialog(false);
    await updateProgress({ branch: pendingBranch, year: y });
  };

  const branch = progress.branch;
  const year = progress.year;
  const selectedBranch = branches.find(b => b.id === branch);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Branch selection screen
  if (!branch || !year) {
    return (
      <div className="min-h-screen bg-background relative">
        <AnimatedBackground />
        <Navigation />
        <div className="container mx-auto px-4 py-16 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/30">
              <GraduationCap className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome to <span className="text-primary">EngiAnimate</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Select your branch to get started with personalized learning
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {branches.map((b, i) => (
              <motion.div key={b.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="bg-card/50 border-border/50 backdrop-blur-sm hover:border-primary/50 transition-all hover:-translate-y-2 cursor-pointer group" onClick={() => handleBranchSelect(b.id)}>
                  <CardContent className="pt-8 pb-8 text-center">
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors text-primary">{b.icon}</div>
                    <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{b.name}</h3>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Dialog open={showYearDialog} onOpenChange={setShowYearDialog}>
            <DialogContent className="bg-card border-border/50">
              <DialogHeader><DialogTitle className="text-xl">Select Your Year</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {years.map(y => (
                  <Button key={y} variant="outline" className="h-16 text-lg hover:bg-primary/10 hover:border-primary/50" onClick={() => handleYearSelect(y)}>
                    {y}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  // Main Dashboard
  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground />
      <Navigation />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Student <span className="text-primary">Dashboard</span></h1>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant="outline" className="border-primary/30 text-primary">{selectedBranch?.name}</Badge>
                <Badge variant="outline" className="border-secondary/30 text-secondary">{year}</Badge>
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => updateProgress({ branch: null, year: null })}>Change</Button>
              </div>
            </div>
            <Link to="/ai-tutor">
              <Button variant="glow" className="gap-2"><MessageSquare className="h-4 w-4" />Ask AI Tutor</Button>
            </Link>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Modules Completed", value: `${progress.modules_completed}/6`, icon: <BookOpen className="h-4 w-4" />, color: "text-primary" },
            { label: "Quizzes Taken", value: String(progress.total_quizzes), icon: <Trophy className="h-4 w-4" />, color: "text-amber-400" },
            { label: "Study Hours", value: `${studyHours}h`, icon: <Target className="h-4 w-4" />, color: "text-green-400" },
            { label: "AI Sessions", value: String(progress.total_ai_sessions), icon: <Brain className="h-4 w-4" />, color: "text-accent" },
          ].map((stat, i) => (
            <Card key={i} className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className={stat.color}>{stat.icon}</span>
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardModules.map((mod, i) => (
            <motion.div key={mod.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.08 }}>
              <Link to={mod.link}>
                <Card className={`bg-gradient-to-br ${mod.color} border ${mod.borderColor} hover:shadow-lg transition-all hover:-translate-y-1 h-full group cursor-pointer`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="w-14 h-14 rounded-xl bg-background/30 flex items-center justify-center text-primary mb-3 group-hover:scale-110 transition-transform">{mod.icon}</div>
                      <Badge variant="outline" className="text-xs">{mod.badge}</Badge>
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">{mod.title}</CardTitle>
                    <CardDescription>{mod.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full gap-2">Open <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></Button>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
