import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Play, Pause, SkipForward, SkipBack, Circle, Upload, RotateCcw, Trash2, AlertCircle, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import { CodeSnippetsLibrary } from "./CodeSnippetsLibrary";

interface Variable {
  name: string;
  value: string;
  type: string;
}

interface CallStackFrame {
  function: string;
  line: number;
}

interface ExecutionError {
  message: string;
  line: number;
  column: number;
  name: string;
}

const exampleCode = `function bubbleSort(arr) {
  let n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}

let array = [64, 34, 25, 12, 22];
bubbleSort(array);`;

const executeCodeSafely = (code: string): { variables: Variable[], error: ExecutionError | null } => {
  try {
    const capturedVariables: Variable[] = [];
    const timeout = 2000; // 2 second timeout
    
    // Create a safe execution context
    const wrappedCode = `
      (function() {
        const __captured__ = {};
        try {
          ${code}
          
          // Capture all variables in scope
          const localVars = Object.keys(this).filter(k => !k.startsWith('__'));
          for (const key of localVars) {
            __captured__[key] = this[key];
          }
          return { success: true, captured: __captured__ };
        } catch (e) {
          return { success: false, error: e };
        }
      }).call({});
    `;
    
    const startTime = Date.now();
    const result = new Function(wrappedCode)();
    
    if (Date.now() - startTime > timeout) {
      throw new Error("Execution timeout - possible infinite loop");
    }
    
    if (!result.success) {
      throw result.error;
    }
    
    // Extract variables
    for (const [name, value] of Object.entries(result.captured)) {
      const type = Array.isArray(value) ? "Array" : typeof value;
      let displayValue = String(value);
      
      if (Array.isArray(value)) {
        displayValue = JSON.stringify(value);
      } else if (typeof value === "object" && value !== null) {
        displayValue = JSON.stringify(value, null, 2);
      }
      
      capturedVariables.push({ name, value: displayValue, type });
    }
    
    return { variables: capturedVariables, error: null };
  } catch (error: any) {
    const errorLine = extractErrorLine(error.stack, code);
    return {
      variables: [],
      error: {
        name: error.name || "Error",
        message: error.message || "Unknown error",
        line: errorLine,
        column: 0,
      },
    };
  }
};

const extractErrorLine = (stack: string, code: string): number => {
  // Try to extract line number from error stack
  const match = stack?.match(/<anonymous>:(\d+):/);
  if (match) {
    // Adjust for wrapper code offset
    const rawLine = parseInt(match[1]);
    return Math.max(1, rawLine - 3);
  }
  return 1;
};

export const DebugMode = () => {
  const [code, setCode] = useState(exampleCode);
  const [customCode, setCustomCode] = useState("");
  const [isEditingCode, setIsEditingCode] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [currentLine, setCurrentLine] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [breakpoints, setBreakpoints] = useState<Set<number>>(new Set());
  const [variables, setVariables] = useState<Variable[]>([]);
  const [callStack, setCallStack] = useState<CallStackFrame[]>([]);
  const [executionError, setExecutionError] = useState<ExecutionError | null>(null);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [showSnippets, setShowSnippets] = useState(false);

  const loadSnippet = (snippetCode: string, name: string) => {
    setCustomCode(snippetCode);
    setIsCustomMode(true);
    setIsEditingCode(false);
    setShowSnippets(false);
    
    // Execute the loaded snippet
    setTimeout(() => {
      const { variables: extractedVars, error } = executeCodeSafely(snippetCode);
      if (error) {
        setExecutionError(error);
        setCurrentLine(error.line);
      } else {
        setVariables(extractedVars);
        setExecutionError(null);
      }
    }, 100);
  };

  const executeCode = () => {
    const activeCode = isCustomMode && customCode.trim() ? customCode : code;
    
    // Clear previous state
    setVariables([]);
    setExecutionError(null);
    setConsoleOutput([]);
    setCurrentLine(0);
    
    // Execute code
    const { variables: extractedVars, error } = executeCodeSafely(activeCode);
    
    if (error) {
      setExecutionError(error);
      setCurrentLine(error.line);
      toast.error(`${error.name}: ${error.message}`, {
        description: `Line ${error.line}`,
        duration: 5000,
      });
    } else {
      setVariables(extractedVars);
      toast.success("Code executed successfully");
    }
  };

  const loadCustomCode = () => {
    if (customCode.trim() === "") {
      toast.error("Please enter some code");
      return;
    }
    setIsCustomMode(true);
    setIsEditingCode(false);
    executeCode();
    toast.success("Custom code loaded and executed");
  };

  const resetToExample = () => {
    setCode(exampleCode);
    setCustomCode("");
    setIsCustomMode(false);
    setIsEditingCode(false);
    setVariables([]);
    setExecutionError(null);
    setConsoleOutput([]);
    setCurrentLine(0);
    toast.success("Reset to example code");
  };

  const restartDebug = () => {
    setCurrentLine(0);
    setVariables([]);
    setExecutionError(null);
    setIsRunning(false);
    executeCode();
  };

  const clearConsole = () => {
    setConsoleOutput([]);
    toast.success("Console cleared");
  };

  const toggleBreakpoint = (lineNumber: number) => {
    const newBreakpoints = new Set(breakpoints);
    if (newBreakpoints.has(lineNumber)) {
      newBreakpoints.delete(lineNumber);
    } else {
      newBreakpoints.add(lineNumber);
    }
    setBreakpoints(newBreakpoints);
  };

  const activeCode = isCustomMode && customCode.trim() ? customCode : code;
  const codeLines = activeCode.split("\n");

  const stepForward = () => {
    if (executionError) return;
    setCurrentLine(prev => Math.min(prev + 1, codeLines.length));
  };

  const stepBack = () => {
    setCurrentLine(prev => Math.max(prev - 1, 0));
  };

  const togglePause = () => {
    setIsRunning(!isRunning);
  };

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      if (breakpoints.has(currentLine + 1)) {
        setIsRunning(false);
        return;
      }
      stepForward();
    }, 500);

    return () => clearInterval(interval);
  }, [isRunning, currentLine, breakpoints, stepForward]);

  return (
    <div className="space-y-4">
      {/* Mode Toggle & Controls */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="text-base md:text-lg">Debug Mode</span>
              <Badge variant={isCustomMode ? "default" : "outline"}>
                {isCustomMode ? "Custom Mode" : "Standard Mode"}
              </Badge>
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Custom Mode</span>
                <Switch checked={isCustomMode} onCheckedChange={setIsCustomMode} />
              </div>
              <Button onClick={restartDebug} variant="outline" size="sm" className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Restart
              </Button>
              <Button onClick={resetToExample} variant="outline" size="sm" className="gap-2">
                Reset Example
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
              {showSnippets ? "Hide Templates" : "Algorithm Templates"}
            </Button>
            <Button 
              onClick={() => setIsEditingCode(!isEditingCode)} 
              variant={isEditingCode ? "secondary" : "outline"}
              size="sm"
              className="gap-2"
            >
              {isEditingCode ? "Cancel Edit" : "Edit Custom Code"}
            </Button>
            <Button onClick={executeCode} variant="default" size="sm" className="gap-2">
              <Play className="h-4 w-4" />
              Execute Code
            </Button>
          </div>
          
          {isEditingCode && (
            <div className="mt-4 space-y-3">
              <Textarea
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                placeholder="Paste your JavaScript code here..."
                className="font-mono text-sm min-h-[200px] md:min-h-[300px]"
              />
              <Button onClick={loadCustomCode} className="w-full md:w-auto gap-2">
                <Upload className="h-4 w-4" />
                Load & Execute Custom Code
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
      {executionError && !showSnippets && (
        <Alert variant="destructive" className="border-destructive/50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold">{executionError.name}: {executionError.message}</div>
            <div className="text-xs mt-1">Line {executionError.line}, Column {executionError.column}</div>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Debug Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="lg:col-span-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span className="text-base md:text-lg">Code View</span>
              <div className="flex gap-2 flex-wrap">
                <Button onClick={stepBack} variant="outline" size="sm" disabled={currentLine <= 0}>
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button onClick={togglePause} variant={isRunning ? "secondary" : "default"} size="sm">
                  {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button onClick={stepForward} variant="outline" size="sm" disabled={currentLine >= codeLines.length}>
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] md:h-[500px]">
              <div className="font-mono text-xs md:text-sm bg-card/50 rounded-lg p-2 md:p-4 space-y-1">
                {codeLines.map((line, index) => {
                  const lineNumber = index + 1;
                  const isCurrentLine = lineNumber === currentLine;
                  const isErrorLine = executionError && lineNumber === executionError.line;
                  const hasBreakpoint = breakpoints.has(lineNumber);
                  
                  return (
                    <div
                      key={lineNumber}
                      className={`flex items-center gap-1 md:gap-2 px-1 md:px-2 py-1 rounded transition-colors ${
                        isErrorLine 
                          ? "bg-destructive/20 border-l-4 border-destructive" 
                          : isCurrentLine 
                          ? "bg-primary/20 border-l-2 border-primary" 
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
                        ) : (
                          <Circle className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground/30" />
                        )}
                      </button>
                      <span className="text-muted-foreground w-6 md:w-8 text-right flex-shrink-0">{lineNumber}</span>
                      <span className={`break-all ${isCurrentLine || isErrorLine ? "font-semibold" : ""}`}>{line}</span>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="space-y-4 md:space-y-6">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-base md:text-lg">Variables</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-40 md:h-48">
                {variables.length === 0 ? (
                  <p className="text-xs md:text-sm text-muted-foreground text-center py-8">
                    {isCustomMode && !customCode.trim() 
                      ? "Enter custom code and execute to see variables"
                      : "Execute code to see variables"}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {variables.map((variable, index) => (
                      <div key={index} className="p-2 md:p-3 bg-card/50 rounded-lg space-y-1 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-semibold text-sm md:text-base">{variable.name}</span>
                          <Badge variant="outline" className="text-xs">{variable.type}</Badge>
                        </div>
                        <div className="font-mono text-xs md:text-sm text-muted-foreground break-all max-h-32 overflow-y-auto">
                          {variable.value}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-base md:text-lg">Console</span>
                <Button onClick={clearConsole} variant="ghost" size="sm" className="gap-2">
                  <Trash2 className="h-3 w-3" />
                  Clear
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-32 md:h-40">
                {consoleOutput.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No console output</p>
                ) : (
                  <div className="space-y-1 font-mono text-xs">
                    {consoleOutput.map((log, index) => (
                      <div key={index} className="p-1 bg-card/50 rounded">
                        {log}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-base md:text-lg">Breakpoints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Array.from(breakpoints).map(line => (
                  <div key={line} className="flex items-center justify-between p-2 bg-destructive/10 rounded">
                    <span className="font-mono text-sm md:text-base">Line {line}</span>
                    <Button
                      onClick={() => toggleBreakpoint(line)}
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs md:text-sm touch-manipulation"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                {breakpoints.size === 0 && (
                  <p className="text-xs md:text-sm text-muted-foreground text-center py-4">
                    Click line numbers to add breakpoints
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
