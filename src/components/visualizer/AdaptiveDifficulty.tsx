import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Target, TrendingUp, Award, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

interface PerformanceData {
  correctAnswers: number;
  totalQuestions: number;
  avgTimePerQuestion: number; // seconds
  streakCount: number;
  topicsCompleted: string[];
  weakTopics: string[];
}

interface AdaptiveDifficultyProps {
  onDifficultyChange?: (level: DifficultyLevel) => void;
  currentDifficulty?: DifficultyLevel;
}

const STORAGE_KEY = "algoviz-performance-data";

const defaultPerformance: PerformanceData = {
  correctAnswers: 0,
  totalQuestions: 0,
  avgTimePerQuestion: 0,
  streakCount: 0,
  topicsCompleted: [],
  weakTopics: [],
};

export const AdaptiveDifficulty = ({ onDifficultyChange, currentDifficulty: externalDifficulty }: AdaptiveDifficultyProps) => {
  const [performance, setPerformance] = useState<PerformanceData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultPerformance;
  });

  const [difficulty, setDifficulty] = useState<DifficultyLevel>(externalDifficulty || "beginner");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(performance));
  }, [performance]);

  // Auto-adjust difficulty based on performance
  useEffect(() => {
    if (performance.totalQuestions < 3) return; // Need minimum data

    const accuracy = performance.correctAnswers / performance.totalQuestions;
    const isQuick = performance.avgTimePerQuestion < 15;
    let newDifficulty: DifficultyLevel = difficulty;

    if (accuracy >= 0.85 && isQuick && performance.streakCount >= 3) {
      if (difficulty === "beginner") newDifficulty = "intermediate";
      else if (difficulty === "intermediate") newDifficulty = "advanced";
    } else if (accuracy < 0.5 && performance.totalQuestions >= 5) {
      if (difficulty === "advanced") newDifficulty = "intermediate";
      else if (difficulty === "intermediate") newDifficulty = "beginner";
    }

    if (newDifficulty !== difficulty) {
      setDifficulty(newDifficulty);
      onDifficultyChange?.(newDifficulty);
      toast.info(`Difficulty adjusted to ${newDifficulty}`, {
        description: accuracy >= 0.85
          ? "Great job! You're ready for harder challenges."
          : "Let's strengthen your fundamentals first.",
      });
    }
  }, [performance, difficulty, onDifficultyChange]);

  const accuracy = performance.totalQuestions > 0
    ? Math.round((performance.correctAnswers / performance.totalQuestions) * 100)
    : 0;

  const difficultyConfig = {
    beginner: { label: "Beginner", color: "bg-green-500/20 text-green-400 border-green-500/30", icon: <Target className="h-4 w-4" /> },
    intermediate: { label: "Intermediate", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: <TrendingUp className="h-4 w-4" /> },
    advanced: { label: "Advanced", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: <Flame className="h-4 w-4" /> },
  };

  const manualSetDifficulty = (level: DifficultyLevel) => {
    setDifficulty(level);
    onDifficultyChange?.(level);
    toast.success(`Difficulty set to ${level}`);
  };

  const resetProgress = () => {
    setPerformance(defaultPerformance);
    setDifficulty("beginner");
    toast.success("Progress reset");
  };

  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Adaptive Difficulty
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Difficulty */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Current Level</span>
          <Badge className={difficultyConfig[difficulty].color} variant="outline">
            {difficultyConfig[difficulty].icon}
            <span className="ml-1">{difficultyConfig[difficulty].label}</span>
          </Badge>
        </div>

        {/* Manual Override */}
        <div className="flex gap-2">
          {(["beginner", "intermediate", "advanced"] as DifficultyLevel[]).map((level) => (
            <Button
              key={level}
              variant={difficulty === level ? "default" : "outline"}
              size="sm"
              onClick={() => manualSetDifficulty(level)}
              className="flex-1 text-xs capitalize"
            >
              {level}
            </Button>
          ))}
        </div>

        {/* Stats */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Accuracy</span>
              <span className="font-semibold">{accuracy}%</span>
            </div>
            <Progress value={accuracy} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/30 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-primary">{performance.streakCount}</p>
              <p className="text-xs text-muted-foreground">Streak</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-primary">{performance.totalQuestions}</p>
              <p className="text-xs text-muted-foreground">Attempted</p>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg">
          <p className="font-semibold mb-1">How adaptive difficulty works:</p>
          <ul className="space-y-1">
            <li>• 85%+ accuracy + fast answers + 3 streak → Level up</li>
            <li>• Below 50% accuracy after 5 questions → Level down</li>
            <li>• You can override manually anytime</li>
          </ul>
        </div>

        <Button variant="ghost" size="sm" onClick={resetProgress} className="w-full text-xs text-muted-foreground">
          Reset Progress
        </Button>
      </CardContent>
    </Card>
  );
};

// Hook for other components to record performance
export const useAdaptivePerformance = () => {
  const recordAnswer = (correct: boolean, timeSpent: number) => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const data: PerformanceData = saved ? JSON.parse(saved) : defaultPerformance;

    data.totalQuestions++;
    if (correct) {
      data.correctAnswers++;
      data.streakCount++;
    } else {
      data.streakCount = 0;
    }
    data.avgTimePerQuestion = (data.avgTimePerQuestion * (data.totalQuestions - 1) + timeSpent) / data.totalQuestions;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const recordTopic = (topic: string, weak: boolean) => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const data: PerformanceData = saved ? JSON.parse(saved) : defaultPerformance;

    if (weak && !data.weakTopics.includes(topic)) {
      data.weakTopics.push(topic);
    } else if (!weak) {
      data.weakTopics = data.weakTopics.filter((t) => t !== topic);
      if (!data.topicsCompleted.includes(topic)) data.topicsCompleted.push(topic);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  return { recordAnswer, recordTopic };
};
