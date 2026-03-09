import { useState, useEffect, useCallback } from "react";
import { Navigation } from "@/components/Navigation";
import AnimatedBackground from "@/components/AnimatedBackground";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Trophy, Clock, CheckCircle2, XCircle, Brain, Zap, 
  RotateCcw, ChevronRight, Sparkles, Loader2, Target, Award
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { saveQuizResult, useStudyTracker } from "@/hooks/useUserProgress";

interface Question {
  question: string;
  options: string[];
  answer: number;
  category: string;
}

const staticQuestions: Question[] = [
  { question: "What is the time complexity of binary search?", options: ["O(n)", "O(log n)", "O(n²)", "O(1)"], answer: 1, category: "Technical" },
  { question: "Which data structure uses LIFO?", options: ["Queue", "Stack", "Array", "Linked List"], answer: 1, category: "Technical" },
  { question: "What does SQL stand for?", options: ["Structured Query Language", "Simple Query Language", "Standard Query Logic", "Sequential Query Language"], answer: 0, category: "Technical" },
  { question: "If a train travels 360 km in 4 hours, what is its speed?", options: ["80 km/h", "90 km/h", "100 km/h", "85 km/h"], answer: 1, category: "Quantitative" },
  { question: "Find the next: 2, 6, 12, 20, 30, ?", options: ["40", "42", "44", "38"], answer: 1, category: "Logical Reasoning" },
  { question: "Choose the synonym of 'Eloquent':", options: ["Articulate", "Silent", "Clumsy", "Rude"], answer: 0, category: "Verbal" },
  { question: "What is the worst-case time complexity of Quick Sort?", options: ["O(n log n)", "O(n²)", "O(n)", "O(log n)"], answer: 1, category: "Technical" },
  { question: "A pipe fills a tank in 6 hours and another empties it in 8 hours. How long to fill if both are open?", options: ["24 hours", "12 hours", "20 hours", "18 hours"], answer: 0, category: "Quantitative" },
  { question: "Which of these is NOT a valid HTTP method?", options: ["GET", "POST", "SEND", "DELETE"], answer: 2, category: "Technical" },
  { question: "All cats are animals. Some animals are dogs. Conclusion?", options: ["All cats are dogs", "Some dogs are cats", "No valid conclusion", "All dogs are cats"], answer: 2, category: "Logical Reasoning" },
  { question: "What is the space complexity of merge sort?", options: ["O(1)", "O(log n)", "O(n)", "O(n²)"], answer: 2, category: "Technical" },
  { question: "Choose the antonym of 'Benevolent':", options: ["Kind", "Malevolent", "Generous", "Gentle"], answer: 1, category: "Verbal" },
  { question: "15% of 200 is:", options: ["25", "30", "35", "20"], answer: 1, category: "Quantitative" },
  { question: "Which sorting algorithm is stable?", options: ["Quick Sort", "Heap Sort", "Merge Sort", "Selection Sort"], answer: 2, category: "Technical" },
  { question: "If APPLE is coded as 50, what is GRAPE?", options: ["52", "55", "57", "49"], answer: 0, category: "Logical Reasoning" },
];

const categories = ["Mixed", "Quantitative", "Logical Reasoning", "Verbal", "Technical"];
const questionCounts = [5, 10, 15, 20];

const Quiz = () => {
  const [phase, setPhase] = useState<"setup" | "quiz" | "results">("setup");
  const [category, setCategory] = useState("Mixed");
  const [questionCount, setQuestionCount] = useState(10);
  const [useAI, setUseAI] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const { toast } = useToast();

  useStudyTracker("quiz");

  // Timer
  useEffect(() => {
    if (phase !== "quiz" || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setPhase("results");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, timeLeft]);

  const generateQuestions = async () => {
    setIsLoading(true);
    try {
      if (useAI) {
        const { data, error } = await supabase.functions.invoke("ai-tutor", {
          body: { type: "aptitude", category, count: questionCount },
        });
        if (error) throw error;
        if (data?.questions) {
          setQuestions(data.questions);
          setAnswers(new Array(data.questions.length).fill(null));
          setTimeLeft(data.questions.length * 60);
          setStartTime(Date.now());
          setPhase("quiz");
          return;
        }
      }
      // Fallback to static
      let filtered = category === "Mixed" ? staticQuestions : staticQuestions.filter(q => q.category === category);
      const shuffled = [...filtered].sort(() => Math.random() - 0.5).slice(0, questionCount);
      if (shuffled.length < questionCount) {
        const remaining = [...staticQuestions].sort(() => Math.random() - 0.5).slice(0, questionCount - shuffled.length);
        shuffled.push(...remaining);
      }
      setQuestions(shuffled.slice(0, questionCount));
      setAnswers(new Array(Math.min(shuffled.length, questionCount)).fill(null));
      setTimeLeft(Math.min(shuffled.length, questionCount) * 60);
      setPhase("quiz");
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to generate questions", variant: "destructive" });
      // Fallback to static
      const shuffled = [...staticQuestions].sort(() => Math.random() - 0.5).slice(0, questionCount);
      setQuestions(shuffled);
      setAnswers(new Array(shuffled.length).fill(null));
      setTimeLeft(shuffled.length * 60);
      setPhase("quiz");
    } finally {
      setIsLoading(false);
    }
  };

  const selectAnswer = (optionIndex: number) => {
    const updated = [...answers];
    updated[currentIndex] = optionIndex;
    setAnswers(updated);
  };

  const score = questions.reduce((acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0), 0);
  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  // Setup
  if (phase === "setup") {
    return (
      <div className="min-h-screen bg-background relative">
        <AnimatedBackground />
        <Navigation />
        <div className="container mx-auto px-4 py-8 relative z-10 max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-8 w-8 text-amber-400" />
                </div>
                <CardTitle className="text-3xl">Quiz Arena</CardTitle>
                <CardDescription className="text-lg">Configure your quiz and test your knowledge</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Number of Questions</Label>
                  <div className="flex gap-2">
                    {questionCounts.map(n => (
                      <Button key={n} variant={questionCount === n ? "default" : "outline"} size="sm" onClick={() => setQuestionCount(n)}>
                        {n}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <Label htmlFor="ai-toggle">AI-Generated Questions</Label>
                  </div>
                  <Switch id="ai-toggle" checked={useAI} onCheckedChange={setUseAI} />
                </div>
                <Button onClick={generateQuestions} disabled={isLoading} className="w-full gap-2" variant="glow" size="lg">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                  Start Quiz
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Results
  if (phase === "results") {
    return (
      <div className="min-h-screen bg-background relative">
        <AnimatedBackground />
        <Navigation />
        <div className="container mx-auto px-4 py-8 relative z-10 max-w-2xl">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-4">
                  <Award className="h-10 w-10 text-amber-400" />
                </div>
                <CardTitle className="text-4xl">{percentage}%</CardTitle>
                <CardDescription className="text-lg">
                  {score} out of {questions.length} correct
                </CardDescription>
                <Badge className={percentage >= 70 ? "bg-green-500/20 text-green-400" : percentage >= 40 ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"}>
                  {percentage >= 70 ? "Excellent!" : percentage >= 40 ? "Good effort" : "Keep practicing"}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                {showReview && questions.map((q, i) => (
                  <div key={i} className={`p-4 rounded-lg border ${answers[i] === q.answer ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"}`}>
                    <p className="font-medium text-sm mb-2">{i + 1}. {q.question}</p>
                    <div className="space-y-1">
                      {q.options.map((opt, j) => (
                        <div key={j} className={`text-xs px-2 py-1 rounded ${j === q.answer ? "text-green-400 font-semibold" : j === answers[i] ? "text-red-400" : "text-muted-foreground"}`}>
                          {j === q.answer ? "✓" : j === answers[i] ? "✗" : " "} {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 gap-2" onClick={() => setShowReview(!showReview)}>
                    {showReview ? "Hide" : "Review"} Answers
                  </Button>
                  <Button variant="glow" className="flex-1 gap-2" onClick={() => { setPhase("setup"); setCurrentIndex(0); }}>
                    <RotateCcw className="h-4 w-4" /> Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Quiz
  const q = questions[currentIndex];
  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground />
      <Navigation />
      <div className="container mx-auto px-4 py-8 relative z-10 max-w-2xl">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6">
          <Badge variant="outline" className="text-sm">{q.category}</Badge>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1}/{questions.length}
            </span>
            <Badge className={timeLeft < 60 ? "bg-red-500/20 text-red-400 animate-pulse" : "bg-muted text-foreground"}>
              <Clock className="h-3 w-3 mr-1" /> {formatTime(timeLeft)}
            </Badge>
          </div>
        </div>
        <Progress value={((currentIndex + 1) / questions.length) * 100} className="mb-6 h-2" />

        <AnimatePresence mode="wait">
          <motion.div key={currentIndex} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg leading-relaxed">{q.question}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {q.options.map((opt, j) => (
                  <Button
                    key={j}
                    variant={answers[currentIndex] === j ? "default" : "outline"}
                    className={`w-full justify-start text-left h-auto py-3 px-4 ${answers[currentIndex] === j ? "bg-primary/20 border-primary" : ""}`}
                    onClick={() => selectAnswer(j)}
                  >
                    <span className="w-6 h-6 rounded-full border flex items-center justify-center mr-3 text-xs flex-shrink-0">
                      {String.fromCharCode(65 + j)}
                    </span>
                    {opt}
                  </Button>
                ))}
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" disabled={currentIndex === 0} onClick={() => setCurrentIndex(prev => prev - 1)} className="flex-1">
                    Previous
                  </Button>
                  {currentIndex < questions.length - 1 ? (
                    <Button variant="glow" onClick={() => setCurrentIndex(prev => prev + 1)} className="flex-1 gap-2">
                      Next <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button variant="glow" onClick={() => setPhase("results")} className="flex-1 gap-2">
                      Submit <Trophy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Quiz;
