import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Send, Loader2, Lightbulb, BookOpen, Target, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Suggestion {
  topic: string;
  reason: string;
  difficulty: string;
}

interface AITutorPanelProps {
  currentAlgorithm?: string;
  userCode?: string;
  performance?: { accuracy: number; weakTopics: string[] };
}

export const AITutorPanel = ({ currentAlgorithm, userCode, performance }: AITutorPanelProps) => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [feedback, setFeedback] = useState("");
  const [userQuestion, setUserQuestion] = useState("");

  const getSuggestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-tutor", {
        body: {
          type: "suggest",
          currentAlgorithm,
          userCode,
          performance,
        },
      });

      if (error) throw error;

      if (data.suggestions) {
        setSuggestions(data.suggestions);
      }
      if (data.feedback) {
        setFeedback(data.feedback);
      }
    } catch (err) {
      console.error("AI tutor error:", err);
      toast.error("Failed to get AI suggestions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const askQuestion = async () => {
    if (!userQuestion.trim()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-tutor", {
        body: {
          type: "question",
          question: userQuestion,
          currentAlgorithm,
          userCode,
        },
      });

      if (error) throw error;
      setFeedback(data.answer || data.feedback || "No response received.");
      setUserQuestion("");
    } catch (err) {
      console.error("AI tutor error:", err);
      toast.error("Failed to get an answer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Learning Tutor
          <Badge variant="outline" className="ml-auto text-xs bg-primary/10 text-primary border-primary/20">
            Powered by AI
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={getSuggestions} disabled={loading} className="gap-2 text-xs">
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Lightbulb className="h-3 w-3" />}
            Get Suggestions
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSuggestions([]);
              setFeedback("");
              getSuggestions();
            }}
            disabled={loading}
            className="gap-2 text-xs"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </Button>
        </div>

        {/* Ask a Question */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ask about algorithms, complexity, approach..."
            value={userQuestion}
            onChange={(e) => setUserQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && askQuestion()}
            className="flex-1 bg-background/50 border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <Button size="sm" onClick={askQuestion} disabled={loading || !userQuestion.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* AI Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{feedback}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Suggestions */}
        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Target className="h-4 w-4 text-accent" />
                Recommended Next Topics
              </h4>
              {suggestions.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-muted/30 rounded-lg p-3 flex items-start gap-3"
                >
                  <BookOpen className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{s.topic}</span>
                      <Badge variant="outline" className="text-xs capitalize">{s.difficulty}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{s.reason}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!feedback && suggestions.length === 0 && !loading && (
          <div className="text-center py-4 text-muted-foreground">
            <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Click "Get Suggestions" or ask a question to get personalized learning guidance.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
