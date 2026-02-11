import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bug, AlertTriangle, Loader2, ShieldAlert, Zap, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface DebugIssue {
  type: "infinite-loop" | "wrong-base-case" | "inefficient" | "off-by-one" | "logic-error";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  line?: number;
  suggestion: string;
}

interface SmartDebugPanelProps {
  code: string;
  language?: string;
}

const severityColors = {
  low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
};

const typeIcons = {
  "infinite-loop": <ShieldAlert className="h-4 w-4" />,
  "wrong-base-case": <AlertTriangle className="h-4 w-4" />,
  "inefficient": <Zap className="h-4 w-4" />,
  "off-by-one": <Bug className="h-4 w-4" />,
  "logic-error": <Bug className="h-4 w-4" />,
};

export const SmartDebugPanel = ({ code, language = "javascript" }: SmartDebugPanelProps) => {
  const [issues, setIssues] = useState<DebugIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  const analyzeCode = async () => {
    if (!code.trim()) {
      toast.error("No code to analyze");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("smart-debug", {
        body: { code, language },
      });

      if (error) throw error;

      setIssues(data.issues || []);
      setAnalyzed(true);

      if (data.issues?.length === 0) {
        toast.success("No issues detected! Your code looks good.");
      } else {
        toast.warning(`Found ${data.issues.length} potential issue(s)`);
      }
    } catch (err) {
      console.error("Smart debug error:", err);
      toast.error("Failed to analyze code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bug className="h-5 w-5 text-primary" />
            Smart Debug Assistant
          </CardTitle>
          <Button size="sm" onClick={analyzeCode} disabled={loading || !code.trim()} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            Analyze
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <AnimatePresence>
          {analyzed && issues.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              <span className="text-sm text-green-400 font-medium">No issues detected! Your code looks clean.</span>
            </motion.div>
          )}

          {issues.map((issue, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-muted/30 border border-border/50 rounded-lg p-4 space-y-2"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {typeIcons[issue.type]}
                  <span className="text-sm font-medium capitalize">{issue.type.replace("-", " ")}</span>
                  {issue.line && <span className="text-xs text-muted-foreground">Line {issue.line}</span>}
                </div>
                <Badge className={severityColors[issue.severity]} variant="outline">
                  {issue.severity}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{issue.message}</p>
              <div className="bg-primary/5 border border-primary/10 rounded p-2">
                <p className="text-xs text-primary">💡 {issue.suggestion}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {!analyzed && (
          <div className="text-center py-4 text-muted-foreground">
            <Bug className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Click "Analyze" to detect potential issues like infinite loops, wrong base cases, and inefficient patterns.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
