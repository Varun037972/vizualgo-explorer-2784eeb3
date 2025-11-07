import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Trophy, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Challenge {
  id: number;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  type: "predict" | "identify" | "complexity";
  visualization: number[];
  currentStep: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const challenges: Challenge[] = [
  {
    id: 1,
    title: "Bubble Sort Next Step",
    description: "Predict what happens in the next step",
    difficulty: "Easy",
    type: "predict",
    visualization: [5, 2, 8, 1, 9],
    currentStep: 0,
    question: "After comparing 5 and 2, what will the array look like?",
    options: ["[5, 2, 8, 1, 9]", "[2, 5, 8, 1, 9]", "[2, 5, 1, 8, 9]", "[5, 8, 2, 1, 9]"],
    correctAnswer: 1,
    explanation: "Bubble Sort compares adjacent elements. Since 5 > 2, they swap positions.",
  },
  {
    id: 2,
    title: "Identify the Algorithm",
    description: "Watch the visualization and identify which algorithm is running",
    difficulty: "Medium",
    type: "identify",
    visualization: [64, 34, 25, 12, 22, 11, 90],
    currentStep: 3,
    question: "Which sorting algorithm is being used?",
    options: ["Bubble Sort", "Quick Sort", "Merge Sort", "Selection Sort"],
    correctAnswer: 3,
    explanation: "This is Selection Sort - it finds the minimum element and places it at the beginning.",
  },
  {
    id: 3,
    title: "Time Complexity Challenge",
    description: "Analyze the algorithm and determine its time complexity",
    difficulty: "Hard",
    type: "complexity",
    visualization: [8, 4, 2, 1, 7, 3, 9],
    currentStep: 0,
    question: "What is the worst-case time complexity of Quick Sort?",
    options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
    correctAnswer: 2,
    explanation: "Quick Sort has O(n²) worst case when the pivot is always the smallest or largest element.",
  },
];

export const ChallengeMode = () => {
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentChallenge = challenges[currentChallengeIndex];
  const progress = ((currentChallengeIndex + 1) / challenges.length) * 100;

  const handleSubmit = () => {
    if (selectedAnswer === null) return;

    setIsAnswered(true);
    setShowExplanation(true);

    if (selectedAnswer === currentChallenge.correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentChallengeIndex < challenges.length - 1) {
      setCurrentChallengeIndex(currentChallengeIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setShowExplanation(false);
    }
  };

  const handleReset = () => {
    setCurrentChallengeIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setShowExplanation(false);
    setScore(0);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-500/20 text-green-700 dark:text-green-300";
      case "Medium":
        return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300";
      case "Hard":
        return "bg-red-500/20 text-red-700 dark:text-red-300";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Challenge Mode</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Test your algorithm knowledge with interactive challenges
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span className="text-2xl font-bold">{score}/{challenges.length}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">Challenge {currentChallengeIndex + 1} of {challenges.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{currentChallenge.title}</CardTitle>
              <Badge className={getDifficultyColor(currentChallenge.difficulty)}>
                {currentChallenge.difficulty}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{currentChallenge.description}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="h-48 flex items-end gap-2 bg-card/50 p-4 rounded-lg">
              {currentChallenge.visualization.map((value, index) => (
                <div
                  key={index}
                  className="flex-1 transition-all duration-500 rounded-t flex items-end justify-center pb-2"
                  style={{
                    height: `${(value / 100) * 100}%`,
                    backgroundColor: index <= currentChallenge.currentStep ? "hsl(var(--primary))" : "hsl(var(--muted))",
                  }}
                >
                  <span className="text-xs font-bold text-primary-foreground">{value}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">{currentChallenge.question}</h3>

              <RadioGroup value={selectedAnswer?.toString()} onValueChange={(value) => setSelectedAnswer(parseInt(value))} disabled={isAnswered}>
                <div className="space-y-3">
                  {currentChallenge.options.map((option, index) => (
                    <div
                      key={index}
                      className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${
                        isAnswered
                          ? index === currentChallenge.correctAnswer
                            ? "border-green-500 bg-green-500/10"
                            : selectedAnswer === index
                            ? "border-red-500 bg-red-500/10"
                            : "border-border"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label
                        htmlFor={`option-${index}`}
                        className="flex-1 cursor-pointer"
                      >
                        {option}
                      </Label>
                      {isAnswered && index === currentChallenge.correctAnswer && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                      {isAnswered && selectedAnswer === index && index !== currentChallenge.correctAnswer && (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  ))}
                </div>
              </RadioGroup>

              {showExplanation && (
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 animate-fade-in">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    {selectedAnswer === currentChallenge.correctAnswer ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        Correct!
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-500" />
                        Incorrect
                      </>
                    )}
                  </h4>
                  <p className="text-sm text-muted-foreground">{currentChallenge.explanation}</p>
                </div>
              )}

              <div className="flex gap-3">
                {!isAnswered ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={selectedAnswer === null}
                    className="flex-1"
                  >
                    Submit Answer
                  </Button>
                ) : currentChallengeIndex < challenges.length - 1 ? (
                  <Button onClick={handleNext} className="flex-1 gap-2">
                    Next Challenge
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={handleReset} className="flex-1">
                    Restart Challenges
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Correct Answers</span>
                  <span className="font-bold text-green-500">{score}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Incorrect Answers</span>
                  <span className="font-bold text-red-500">{currentChallengeIndex + (isAnswered ? 1 : 0) - score}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Accuracy</span>
                  <span className="font-bold">
                    {currentChallengeIndex + (isAnswered ? 1 : 0) > 0
                      ? Math.round((score / (currentChallengeIndex + (isAnswered ? 1 : 0))) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Challenge Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Badge variant="outline" className="w-full justify-start gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  Predict Next Step
                </Badge>
                <Badge variant="outline" className="w-full justify-start gap-2">
                  <div className="h-2 w-2 rounded-full bg-purple-500" />
                  Identify Algorithm
                </Badge>
                <Badge variant="outline" className="w-full justify-start gap-2">
                  <div className="h-2 w-2 rounded-full bg-orange-500" />
                  Complexity Analysis
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
