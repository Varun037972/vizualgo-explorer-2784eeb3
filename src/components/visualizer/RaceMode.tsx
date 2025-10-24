import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Flag, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Algorithm {
  name: string;
  complexity: string;
  speed: number;
  color: string;
}

const algorithms: Algorithm[] = [
  { name: "Quick Sort", complexity: "O(n log n)", speed: 150, color: "bg-purple-500" },
  { name: "Merge Sort", complexity: "O(n log n)", speed: 180, color: "bg-blue-500" },
  { name: "Bubble Sort", complexity: "O(n²)", speed: 400, color: "bg-red-500" },
  { name: "Insertion Sort", complexity: "O(n²)", speed: 350, color: "bg-orange-500" },
];

interface RaceModeProps {
  isRacing: boolean;
  onRaceComplete: () => void;
}

export const RaceMode = ({ isRacing, onRaceComplete }: RaceModeProps) => {
  const [progress, setProgress] = useState<number[]>([0, 0, 0, 0]);
  const [winner, setWinner] = useState<string | null>(null);
  const [rankings, setRankings] = useState<string[]>([]);

  useEffect(() => {
    if (!isRacing) {
      setProgress([0, 0, 0, 0]);
      setWinner(null);
      setRankings([]);
      return;
    }

    const intervals = algorithms.map((algo, idx) => {
      return setInterval(() => {
        setProgress((prev) => {
          const newProgress = [...prev];
          newProgress[idx] = Math.min(newProgress[idx] + (100 / algo.speed) * 10, 100);
          
          // Check if this algorithm finished
          if (newProgress[idx] >= 100 && !rankings.includes(algo.name)) {
            setRankings((prevRankings) => [...prevRankings, algo.name]);
            
            // Set winner if it's the first to finish
            if (!winner) {
              setWinner(algo.name);
              setTimeout(onRaceComplete, 1000);
            }
          }
          
          return newProgress;
        });
      }, 100);
    });

    return () => intervals.forEach(clearInterval);
  }, [isRacing, winner, rankings, onRaceComplete]);

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Multi-Algorithm Race Mode
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isRacing && rankings.length === 0 ? (
          <div className="h-[300px] flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              <Flag className="h-16 w-16 text-primary animate-pulse" />
              <Zap className="h-6 w-6 text-yellow-500 absolute -top-2 -right-2 animate-bounce" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Ready to Race?</h3>
              <p className="text-sm text-muted-foreground">
                Compare algorithms side-by-side and see which one finishes first!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {algorithms.map((algo, idx) => (
              <div key={algo.name} className="space-y-2 animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${algo.color} ${progress[idx] < 100 ? 'animate-pulse' : ''}`} />
                    <span className="font-semibold">{algo.name}</span>
                    <span className="text-xs text-muted-foreground font-mono">{algo.complexity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {rankings.indexOf(algo.name) !== -1 && (
                      <span className="text-xs font-bold text-primary animate-scale-in">
                        #{rankings.indexOf(algo.name) + 1}
                      </span>
                    )}
                    {winner === algo.name && (
                      <Trophy className="h-4 w-4 text-yellow-500 animate-bounce" />
                    )}
                    <span className="text-sm font-mono w-12 text-right">{progress[idx].toFixed(0)}%</span>
                  </div>
                </div>
                <div className="relative">
                  <Progress value={progress[idx]} className="h-3" />
                  {progress[idx] >= 100 && (
                    <div className="absolute inset-0 bg-green-500/20 rounded-full animate-pulse" />
                  )}
                </div>
              </div>
            ))}

            {winner && (
              <div className="mt-6 p-4 bg-gradient-to-r from-yellow-500/10 to-primary/10 rounded-lg border-2 border-yellow-500/50 animate-scale-in">
                <div className="flex items-center gap-3">
                  <Trophy className="h-8 w-8 text-yellow-500 animate-bounce" />
                  <div>
                    <h4 className="font-bold text-lg">Winner: {winner}!</h4>
                    <p className="text-sm text-muted-foreground">
                      Most efficient algorithm for this dataset
                    </p>
                  </div>
                </div>
              </div>
            )}

            {rankings.length === algorithms.length && (
              <div className="space-y-2 animate-fade-in">
                <h4 className="font-semibold text-sm text-muted-foreground">Final Rankings:</h4>
                <div className="space-y-1">
                  {rankings.map((name, idx) => (
                    <div key={name} className="flex items-center gap-2 text-sm">
                      <span className="font-mono font-bold text-primary w-6">#{idx + 1}</span>
                      <span>{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
