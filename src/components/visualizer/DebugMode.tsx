import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Play, Pause, SkipForward, SkipBack, Circle, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface Variable {
  name: string;
  value: string;
  type: string;
}

interface CallStackFrame {
  function: string;
  line: number;
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

export const DebugMode = () => {
  const [code, setCode] = useState(exampleCode);
  const [customCode, setCustomCode] = useState("");
  const [isEditingCode, setIsEditingCode] = useState(false);
  const [currentLine, setCurrentLine] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [breakpoints, setBreakpoints] = useState<Set<number>>(new Set([4]));
  const [variables, setVariables] = useState<Variable[]>([
    { name: "arr", value: "[64, 34, 25, 12, 22]", type: "Array" },
    { name: "n", value: "5", type: "number" },
    { name: "i", value: "0", type: "number" },
  ]);
  const [callStack, setCallStack] = useState<CallStackFrame[]>([
    { function: "bubbleSort", line: 4 },
    { function: "global", line: 14 },
  ]);

  const loadCustomCode = () => {
    if (customCode.trim() === "") {
      toast.error("Please enter some code");
      return;
    }
    setCode(customCode);
    setCurrentLine(1);
    setBreakpoints(new Set());
    setIsEditingCode(false);
    toast.success("Custom code loaded");
  };

  const resetToExample = () => {
    setCode(exampleCode);
    setCustomCode("");
    setCurrentLine(1);
    setBreakpoints(new Set([4]));
    setIsEditingCode(false);
    toast.success("Reset to example code");
  };

  const codeLines = code.split("\n");

  const toggleBreakpoint = (lineNumber: number) => {
    const newBreakpoints = new Set(breakpoints);
    if (newBreakpoints.has(lineNumber)) {
      newBreakpoints.delete(lineNumber);
    } else {
      newBreakpoints.add(lineNumber);
    }
    setBreakpoints(newBreakpoints);
  };

  const stepForward = () => {
    setCurrentLine(prev => {
      const next = Math.min(prev + 1, codeLines.length);
      
      // Simulate variable updates
      if (next === 3) {
        setVariables([
          { name: "arr", value: "[64, 34, 25, 12, 22]", type: "Array" },
          { name: "n", value: "5", type: "number" },
        ]);
      } else if (next === 4) {
        setVariables(prev => [...prev, { name: "i", value: "0", type: "number" }]);
      } else if (next === 5) {
        setVariables(prev => [...prev, { name: "j", value: "0", type: "number" }]);
      }
      
      return next;
    });
  };

  const stepBack = () => {
    setCurrentLine(prev => Math.max(prev - 1, 1));
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
  }, [isRunning, currentLine]);

  return (
    <div className="space-y-4">
      {/* Custom Code Input Section */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-base md:text-lg">Custom Code Input</span>
            <div className="flex gap-2 flex-wrap">
              <Button 
                onClick={() => setIsEditingCode(!isEditingCode)} 
                variant="outline" 
                size="sm"
                className="text-xs md:text-sm"
              >
                {isEditingCode ? "Cancel" : "Edit Code"}
              </Button>
              <Button 
                onClick={resetToExample} 
                variant="outline" 
                size="sm"
                className="text-xs md:text-sm"
              >
                Reset Example
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        {isEditingCode && (
          <CardContent className="space-y-4">
            <Textarea
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              placeholder="Paste your code here..."
              className="font-mono text-sm min-h-[200px] md:min-h-[300px]"
            />
            <Button onClick={loadCustomCode} className="w-full md:w-auto gap-2">
              <Upload className="h-4 w-4" />
              Load Custom Code
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Main Debug Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="lg:col-span-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span className="text-base md:text-lg">Code Editor</span>
              <div className="flex gap-2 flex-wrap">
                <Button onClick={stepBack} variant="outline" size="sm" disabled={currentLine <= 1}>
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
                const hasBreakpoint = breakpoints.has(lineNumber);
                
                return (
                  <div
                    key={lineNumber}
                    className={`flex items-center gap-1 md:gap-2 px-1 md:px-2 py-1 rounded transition-colors ${
                      isCurrentLine ? "bg-primary/20 border-l-2 border-primary" : ""
                    }`}
                  >
                    <button
                      onClick={() => toggleBreakpoint(lineNumber)}
                      className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 flex items-center justify-center hover:bg-primary/10 rounded touch-manipulation"
                    >
                      {hasBreakpoint ? (
                        <Circle className="h-3 w-3 md:h-4 md:w-4 fill-destructive text-destructive" />
                      ) : (
                        <Circle className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground/30" />
                      )}
                    </button>
                    <span className="text-muted-foreground w-6 md:w-8 text-right flex-shrink-0">{lineNumber}</span>
                    <span className={`break-all ${isCurrentLine ? "font-semibold" : ""}`}>{line}</span>
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
                <div className="space-y-2">
                  {variables.map((variable, index) => (
                    <div key={index} className="p-2 md:p-3 bg-card/50 rounded-lg space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-semibold text-sm md:text-base">{variable.name}</span>
                        <Badge variant="outline" className="text-xs">{variable.type}</Badge>
                      </div>
                      <div className="font-mono text-xs md:text-sm text-muted-foreground break-all">{variable.value}</div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-base md:text-lg">Call Stack</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {callStack.map((frame, index) => (
                  <div
                    key={index}
                    className={`p-2 md:p-3 rounded-lg ${
                      index === 0 ? "bg-primary/10 border border-primary/20" : "bg-card/50"
                    }`}
                  >
                    <div className="font-mono font-semibold text-sm md:text-base">{frame.function}()</div>
                    <div className="text-xs md:text-sm text-muted-foreground">Line {frame.line}</div>
                  </div>
                ))}
              </div>
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
