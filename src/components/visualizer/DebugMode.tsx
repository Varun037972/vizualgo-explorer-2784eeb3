import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipForward, SkipBack, Circle, Upload, RotateCcw, Trash2, AlertCircle, BookOpen, FastForward, StepForward } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { toast } from "sonner";
import { CodeSnippetsLibrary } from "./CodeSnippetsLibrary";
import { CodeAnalysisPanel } from "./CodeAnalysisPanel";
import { InlineCodeEditor } from "./InlineCodeEditor";
import { useJavaScriptInterpreter, Variable } from "@/hooks/useJavaScriptInterpreter";
import { useCodeAnalysis } from "@/hooks/useCodeAnalysis";

const exampleCode = `let array = [64, 34, 25, 12, 22];
let n = array.length;

for (let i = 0; i < n - 1; i++) {
  for (let j = 0; j < n - i - 1; j++) {
    if (array[j] > array[j + 1]) {
      let temp = array[j];
      array[j] = array[j + 1];
      array[j + 1] = temp;
    }
  }
}

console.log(array);`;

export const DebugMode = () => {
  const [customCode, setCustomCode] = useState("");
  const [isEditingCode, setIsEditingCode] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [breakpoints, setBreakpoints] = useState<Set<number>>(new Set());
  const [showSnippets, setShowSnippets] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const interpreter = useJavaScriptInterpreter();
  const { state, initializeCode, step, stepBack, runToEnd, reset } = interpreter;
  const codeAnalysis = useCodeAnalysis();

  const activeCode = isCustomMode && customCode.trim() ? customCode : exampleCode;
  const codeLines = activeCode.split("\n");

  const handleAnalyze = useCallback(() => {
    codeAnalysis.analyze(activeCode, "javascript");
  }, [activeCode, codeAnalysis]);

  const handleApplyFix = useCallback((code: string) => {
    setCustomCode(code);
    setIsCustomMode(true);
    setIsInitialized(false);
    toast.success("Fix applied - click 'Load Code' to run");
  }, []);

  // Initialize code when it changes
  useEffect(() => {
    initializeCode(activeCode);
    setIsInitialized(true);
  }, [activeCode, initializeCode]);

  const loadSnippet = useCallback((snippetCode: string, name: string) => {
    setCustomCode(snippetCode);
    setIsCustomMode(true);
    setIsEditingCode(false);
    setShowSnippets(false);
    setIsInitialized(false);
    toast.success(`Loaded ${name}`);
  }, []);

  const handleStep = useCallback(() => {
    if (state.isComplete || state.error) return;
    
    const hasMore = step();
    
    // Check for breakpoints
    if (hasMore && breakpoints.has(state.currentLine + 1)) {
      setIsRunning(false);
      toast.info(`Hit breakpoint at line ${state.currentLine + 1}`);
    }
  }, [step, state.isComplete, state.error, state.currentLine, breakpoints]);

  const handleStepBack = useCallback(() => {
    stepBack();
  }, [stepBack]);

  const handleReset = useCallback(() => {
    reset();
    setIsRunning(false);
    toast.success("Debug session reset");
  }, [reset]);

  const handleRunToEnd = useCallback(() => {
    runToEnd();
    setIsRunning(false);
    if (state.error) {
      toast.error(`${state.error.name}: ${state.error.message}`);
    } else {
      toast.success("Execution complete");
    }
  }, [runToEnd, state.error]);

  const loadCustomCode = useCallback(() => {
    if (customCode.trim() === "") {
      toast.error("Please enter some code");
      return;
    }
    setIsCustomMode(true);
    setIsEditingCode(false);
    setIsInitialized(false);
    toast.success("Custom code loaded");
  }, [customCode]);

  const resetToExample = useCallback(() => {
    setCustomCode("");
    setIsCustomMode(false);
    setIsEditingCode(false);
    setIsInitialized(false);
    setBreakpoints(new Set());
    toast.success("Reset to example code");
  }, []);

  const toggleBreakpoint = useCallback((lineNumber: number) => {
    setBreakpoints(prev => {
      const newBreakpoints = new Set(prev);
      if (newBreakpoints.has(lineNumber)) {
        newBreakpoints.delete(lineNumber);
      } else {
        newBreakpoints.add(lineNumber);
      }
      return newBreakpoints;
    });
  }, []);

  const togglePause = useCallback(() => {
    setIsRunning(prev => !prev);
  }, []);

  // Auto-step when running
  useEffect(() => {
    if (!isRunning || state.isComplete || state.error) {
      if (isRunning) setIsRunning(false);
      return;
    }

    const interval = setInterval(() => {
      if (breakpoints.has(state.currentLine + 1)) {
        setIsRunning(false);
        toast.info(`Hit breakpoint at line ${state.currentLine + 1}`);
        return;
      }
      step();
    }, 300);

    return () => clearInterval(interval);
  }, [isRunning, state.isComplete, state.error, state.currentLine, breakpoints, step]);

  return (
    <div className="space-y-4">
      {/* Mode Toggle & Controls */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="text-base md:text-lg">Step-Through Debugger</span>
              <Badge variant={isCustomMode ? "default" : "outline"}>
                {isCustomMode ? "Custom Code" : "Example Code"}
              </Badge>
              {state.isComplete && (
                <Badge variant="secondary" className="bg-green-500/20 text-green-600">
                  Complete
                </Badge>
              )}
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Custom</span>
                <Switch 
                  checked={isCustomMode} 
                  onCheckedChange={(checked) => {
                    setIsCustomMode(checked);
                    setIsInitialized(false);
                  }} 
                />
              </div>
              <Button onClick={handleReset} variant="outline" size="sm" className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
              <Button onClick={resetToExample} variant="outline" size="sm">
                Example
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={() => setShowSnippets(!showSnippets)} 
              variant={showSnippets ? "secondary" : "outline"}
              size="sm"
              className="gap-2"
            >
              <BookOpen className="h-4 w-4" />
              {showSnippets ? "Hide Templates" : "Templates"}
            </Button>
            <Button 
              onClick={() => setIsEditingCode(!isEditingCode)} 
              variant={isEditingCode ? "secondary" : "outline"}
              size="sm"
            >
              {isEditingCode ? "Cancel" : "Edit Code"}
            </Button>
            <Button 
              onClick={handleRunToEnd} 
              variant="default" 
              size="sm" 
              className="gap-2"
              disabled={state.isComplete}
            >
              <FastForward className="h-4 w-4" />
              Run All
            </Button>
          </div>
          
          {isEditingCode && (
            <div className="mt-4 space-y-3">
              <div className="relative">
                <InlineCodeEditor
                  value={customCode}
                  onChange={setCustomCode}
                  placeholder="Enter your JavaScript code here...

Type to see autocomplete suggestions:
• Keywords: let, const, for, if, while...
• Methods: .push(), .map(), .filter()...
• Functions: Math.floor(), console.log()...
• Snippets: for-loop, if-else, swap..."
                />
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <Badge variant="outline" className="text-xs bg-background/80">
                    Tab to accept
                  </Badge>
                </div>
              </div>
              <Button onClick={loadCustomCode} className="w-full md:w-auto gap-2">
                <Upload className="h-4 w-4" />
                Load Code
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Algorithm Templates Library */}
      <Collapsible open={showSnippets} onOpenChange={setShowSnippets}>
        <CollapsibleContent className="animate-in slide-in-from-top-2 duration-200">
          <CodeSnippetsLibrary onLoadSnippet={loadSnippet} />
        </CollapsibleContent>
      </Collapsible>

      {/* Error Display */}
      {state.error && (
        <Alert variant="destructive" className="border-destructive/50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold">{state.error.name}: {state.error.message}</div>
            <div className="text-xs mt-1">Line {state.error.line}</div>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Debug Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="lg:col-span-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-base md:text-lg">Code Execution</span>
                <Badge variant="outline" className="text-xs">
                  Line {state.currentLine} / {codeLines.length}
                </Badge>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button 
                  onClick={handleStepBack} 
                  variant="outline" 
                  size="sm" 
                  disabled={state.currentLine <= 0}
                  title="Step Back"
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={togglePause} 
                  variant={isRunning ? "secondary" : "default"} 
                  size="sm"
                  disabled={state.isComplete}
                  title={isRunning ? "Pause" : "Auto-Run"}
                >
                  {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button 
                  onClick={handleStep} 
                  variant="outline" 
                  size="sm" 
                  disabled={state.isComplete || state.error !== null}
                  title="Step Forward"
                >
                  <StepForward className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={handleStep} 
                  variant="outline" 
                  size="sm" 
                  disabled={state.isComplete || state.error !== null}
                  title="Skip to Next"
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] md:h-[500px]">
              <div className="font-mono text-xs md:text-sm bg-card/50 rounded-lg p-2 md:p-4 space-y-0.5">
                {codeLines.map((line, index) => {
                  const lineNumber = index + 1;
                  const isCurrentLine = lineNumber === state.currentLine;
                  const isNextLine = lineNumber === state.currentLine + 1;
                  const isErrorLine = state.error && lineNumber === state.error.line;
                  const hasBreakpoint = breakpoints.has(lineNumber);
                  const isExecuted = lineNumber < state.currentLine;
                  
                  return (
                    <div
                      key={lineNumber}
                      className={`flex items-center gap-1 md:gap-2 px-1 md:px-2 py-0.5 rounded transition-all duration-150 ${
                        isErrorLine 
                          ? "bg-destructive/20 border-l-4 border-destructive" 
                          : isCurrentLine 
                          ? "bg-primary/30 border-l-4 border-primary shadow-sm" 
                          : isNextLine
                          ? "bg-primary/10 border-l-2 border-primary/50"
                          : isExecuted
                          ? "opacity-60"
                          : ""
                      }`}
                    >
                      <button
                        onClick={() => toggleBreakpoint(lineNumber)}
                        className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 flex items-center justify-center hover:bg-primary/10 rounded touch-manipulation"
                      >
                        {isErrorLine ? (
                          <AlertCircle className="h-3 w-3 md:h-4 md:w-4 text-destructive" />
                        ) : hasBreakpoint ? (
                          <Circle className="h-3 w-3 md:h-4 md:w-4 fill-destructive text-destructive" />
                        ) : isCurrentLine ? (
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        ) : (
                          <Circle className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground/20 hover:text-muted-foreground/50" />
                        )}
                      </button>
                      <span className={`w-6 md:w-8 text-right flex-shrink-0 ${isCurrentLine ? "text-primary font-bold" : "text-muted-foreground"}`}>
                        {lineNumber}
                      </span>
                      <span className={`break-all ${isCurrentLine ? "font-semibold text-foreground" : isErrorLine ? "font-semibold" : ""}`}>
                        {line || " "}
                      </span>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="space-y-4 md:space-y-6">
          {/* Variables Panel */}
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base md:text-lg flex items-center justify-between">
                Variables
                <Badge variant="outline" className="text-xs">
                  {state.variables.length} vars
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48 md:h-56">
                {state.variables.length === 0 ? (
                  <div className="text-xs md:text-sm text-muted-foreground text-center py-8">
                    <p>Step through code to see variables</p>
                    <p className="text-xs mt-2 opacity-70">Click the step button or press play</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {state.variables.map((variable, index) => (
                      <div 
                        key={`${variable.name}-${index}`} 
                        className={`p-2 md:p-3 rounded-lg space-y-1 transition-all duration-300 ${
                          variable.changed 
                            ? "bg-primary/20 border border-primary/30 animate-pulse" 
                            : "bg-card/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-semibold text-sm md:text-base">
                            {variable.name}
                          </span>
                          <div className="flex items-center gap-1">
                            {variable.changed && (
                              <Badge variant="default" className="text-xs bg-primary/80">
                                changed
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {variable.type}
                            </Badge>
                          </div>
                        </div>
                        <div className="font-mono text-xs md:text-sm text-muted-foreground break-all max-h-24 overflow-y-auto bg-background/50 rounded p-1.5">
                          {variable.value}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Console Output */}
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span className="text-base md:text-lg">Console Output</span>
                <Badge variant="outline" className="text-xs">
                  {state.output.length} logs
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-32 md:h-40">
                {state.output.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    console.log() output appears here
                  </p>
                ) : (
                  <div className="space-y-1 font-mono text-xs">
                    {state.output.map((log, index) => (
                      <div 
                        key={index} 
                        className="p-1.5 bg-card/50 rounded border-l-2 border-primary/50 animate-in slide-in-from-left-2 duration-200"
                      >
                        <span className="text-muted-foreground mr-2">›</span>
                        {log}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Breakpoints */}
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base md:text-lg flex items-center justify-between">
                Breakpoints
                <Button 
                  onClick={() => setBreakpoints(new Set())} 
                  variant="ghost" 
                  size="sm"
                  className="h-6 px-2 text-xs"
                  disabled={breakpoints.size === 0}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-24">
                {breakpoints.size === 0 ? (
                  <p className="text-xs md:text-sm text-muted-foreground text-center py-4">
                    Click line numbers to add breakpoints
                  </p>
                ) : (
                  <div className="space-y-1">
                    {Array.from(breakpoints).sort((a, b) => a - b).map(line => (
                      <div key={line} className="flex items-center justify-between p-1.5 bg-destructive/10 rounded text-sm">
                        <span className="font-mono">Line {line}</span>
                        <Button
                          onClick={() => toggleBreakpoint(line)}
                          variant="ghost"
                          size="sm"
                          className="h-5 px-2 text-xs"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Code Analysis Panel */}
      <CodeAnalysisPanel
        result={codeAnalysis.result}
        isAnalyzing={codeAnalysis.isAnalyzing}
        error={codeAnalysis.error}
        onAnalyze={handleAnalyze}
        onApplyFix={handleApplyFix}
        onClear={codeAnalysis.clearResult}
      />
    </div>
  );
};
