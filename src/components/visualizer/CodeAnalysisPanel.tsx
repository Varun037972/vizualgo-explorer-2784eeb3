import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Brain, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  ChevronDown, 
  Copy, 
  Lightbulb,
  FileCode,
  Loader2,
  X
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import type { CodeAnalysisResult, CodeError, CodeExplanation } from "@/hooks/useCodeAnalysis";

interface CodeAnalysisPanelProps {
  result: CodeAnalysisResult | null;
  isAnalyzing: boolean;
  error: string | null;
  onAnalyze: () => void;
  onApplyFix: (code: string) => void;
  onClear: () => void;
}

const severityConfig = {
  low: { icon: Info, color: "text-blue-500", bg: "bg-blue-500/10", badge: "outline" as const },
  medium: { icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-500/10", badge: "secondary" as const },
  high: { icon: AlertCircle, color: "text-orange-500", bg: "bg-orange-500/10", badge: "default" as const },
  critical: { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10", badge: "destructive" as const },
};

const typeConfig = {
  syntax: { label: "Syntax", color: "bg-red-500/20 text-red-400" },
  runtime: { label: "Runtime", color: "bg-orange-500/20 text-orange-400" },
  logic: { label: "Logic", color: "bg-yellow-500/20 text-yellow-400" },
  security: { label: "Security", color: "bg-purple-500/20 text-purple-400" },
};

const ErrorCard = ({ 
  error, 
  explanation 
}: { 
  error: CodeError; 
  explanation?: CodeExplanation;
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const config = severityConfig[error.severity];
  const typeStyle = typeConfig[error.type];
  const Icon = config.icon;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className={`rounded-lg border ${config.bg} p-3 space-y-2`}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-start gap-2">
            <Icon className={`h-4 w-4 mt-0.5 ${config.color} flex-shrink-0`} />
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded ${typeStyle.color}`}>
                  {typeStyle.label}
                </span>
                <Badge variant={config.badge} className="text-xs">
                  {error.severity}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Line {error.lines[0]}{error.lines[1] !== error.lines[0] ? `-${error.lines[1]}` : ""}
                </span>
                <Badge variant="outline" className="text-xs">
                  {error.confidence} confidence
                </Badge>
              </div>
              <p className="text-sm font-medium mt-1">{error.message}</p>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-2 pt-2 border-t border-border/50">
          <div className="text-xs text-muted-foreground">
            <strong>Probable cause:</strong> {error.probable_cause}
          </div>
          
          {explanation && (
            <>
              <div className="text-sm">{explanation.short}</div>
              {explanation.detailed && (
                <div className="text-xs text-muted-foreground bg-background/50 p-2 rounded">
                  {explanation.detailed}
                </div>
              )}
              {explanation.fix && (
                <div className="flex items-start gap-2 text-xs">
                  <FileCode className="h-3 w-3 mt-0.5 text-primary" />
                  <span><strong>Fix:</strong> {explanation.fix}</span>
                </div>
              )}
              {explanation.learning_tip && (
                <div className="flex items-start gap-2 text-xs bg-primary/5 p-2 rounded">
                  <Lightbulb className="h-3 w-3 mt-0.5 text-primary" />
                  <span>{explanation.learning_tip}</span>
                </div>
              )}
            </>
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export const CodeAnalysisPanel = ({
  result,
  isAnalyzing,
  error,
  onAnalyze,
  onApplyFix,
  onClear,
}: CodeAnalysisPanelProps) => {
  const handleCopyCode = () => {
    if (result?.corrected_code) {
      navigator.clipboard.writeText(result.corrected_code);
      toast.success("Corrected code copied");
    }
  };

  const hasErrors = result && result.errors.length > 0;
  const isClean = result && result.errors.length === 0;

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <span className="text-base">AI Code Analysis</span>
          </div>
          <div className="flex items-center gap-2">
            {result && (
              <Button variant="ghost" size="sm" onClick={onClear}>
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button 
              onClick={onAnalyze} 
              disabled={isAnalyzing}
              size="sm"
              className="gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  Analyze Code
                </>
              )}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!result && !isAnalyzing && !error && (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Click "Analyze Code" to get AI-powered feedback</p>
            <p className="text-xs mt-1 opacity-70">
              Detects syntax errors, logic issues, and suggests improvements
            </p>
          </div>
        )}

        {isAnalyzing && (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Analyzing your code...</p>
          </div>
        )}

        {result && (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {/* Summary */}
              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                isClean ? "bg-green-500/10" : "bg-yellow-500/10"
              }`}>
                {isClean ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium text-green-600">
                      No issues detected! Your code looks good.
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <span className="text-sm font-medium text-yellow-600">
                      Found {result.errors.length} issue{result.errors.length !== 1 ? "s" : ""}
                    </span>
                    <Badge variant="outline" className="ml-auto text-xs">
                      {result.overall_confidence} confidence
                    </Badge>
                  </>
                )}
              </div>

              {/* Errors */}
              {hasErrors && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Issues Found</h4>
                  {result.errors.map((err) => (
                    <ErrorCard 
                      key={err.id} 
                      error={err} 
                      explanation={result.explanations.find(e => e.id === err.id)}
                    />
                  ))}
                </div>
              )}

              {/* Corrected Code */}
              {hasErrors && result.corrected_code !== result.corrected_code && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Corrected Code</h4>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleCopyCode}>
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                      <Button size="sm" onClick={() => onApplyFix(result.corrected_code)}>
                        Apply Fix
                      </Button>
                    </div>
                  </div>
                  <pre className="text-xs bg-card/50 p-3 rounded-lg overflow-x-auto border">
                    <code>{result.corrected_code}</code>
                  </pre>
                </div>
              )}

              {/* Quick Edits */}
              {result.applyable_edits.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Quick Fixes</h4>
                  {result.applyable_edits.map((edit, idx) => (
                    <div key={idx} className="text-xs bg-card/50 p-2 rounded border">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">Line {edit.line}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="line-through text-destructive/70">{edit.old}</code>
                        <span>→</span>
                        <code className="text-green-500">{edit.new}</code>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Test Suggestion */}
              {result.minimal_test && (
                <div className="bg-primary/5 p-3 rounded-lg space-y-1">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <FileCode className="h-4 w-4" />
                    Test Suggestion
                  </h4>
                  <div className="text-xs">
                    <strong>Input:</strong> <code>{result.minimal_test.input}</code>
                  </div>
                  <div className="text-xs">
                    <strong>Expected:</strong> <code>{result.minimal_test.expected_output}</code>
                  </div>
                </div>
              )}

              {/* Visualizer Suggestions */}
              {result.suggested_visualizer_changes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Visualizer Tips</h4>
                  <ul className="text-xs space-y-1">
                    {result.suggested_visualizer_changes.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Lightbulb className="h-3 w-3 mt-0.5 text-primary" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
