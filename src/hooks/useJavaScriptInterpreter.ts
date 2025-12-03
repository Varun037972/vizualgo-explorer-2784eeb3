import { useState, useCallback, useRef } from "react";

export interface Variable {
  name: string;
  value: string;
  type: string;
  changed: boolean;
}

export interface ExecutionState {
  variables: Variable[];
  currentLine: number;
  callStack: string[];
  output: string[];
  isComplete: boolean;
  error: { message: string; line: number; name: string } | null;
}

interface Scope {
  [key: string]: any;
}

// Simple JavaScript tokenizer and interpreter for step-through debugging
export const useJavaScriptInterpreter = () => {
  const [state, setState] = useState<ExecutionState>({
    variables: [],
    currentLine: 0,
    callStack: [],
    output: [],
    isComplete: false,
    error: null,
  });

  const executionRef = useRef<{
    code: string;
    lines: string[];
    scope: Scope;
    previousScope: Scope;
    lineIndex: number;
    loopStack: { start: number; condition: string; increment?: string; type: string }[];
    functionDefs: { [name: string]: { params: string[]; body: string; startLine: number; endLine: number } };
    callStack: string[];
    output: string[];
    skipUntilLine: number;
  }>({
    code: "",
    lines: [],
    scope: {},
    previousScope: {},
    lineIndex: 0,
    loopStack: [],
    functionDefs: {},
    callStack: ["global"],
    output: [],
    skipUntilLine: -1,
  });

  const parseValue = (expr: string, scope: Scope): any => {
    expr = expr.trim();
    
    // Handle string literals
    if ((expr.startsWith('"') && expr.endsWith('"')) || 
        (expr.startsWith("'") && expr.endsWith("'"))) {
      return expr.slice(1, -1);
    }
    
    // Handle template literals (basic)
    if (expr.startsWith('`') && expr.endsWith('`')) {
      return expr.slice(1, -1);
    }
    
    // Handle numbers
    if (!isNaN(Number(expr)) && expr !== "") {
      return Number(expr);
    }
    
    // Handle booleans
    if (expr === "true") return true;
    if (expr === "false") return false;
    if (expr === "null") return null;
    if (expr === "undefined") return undefined;
    
    // Handle array literals
    if (expr.startsWith("[") && expr.endsWith("]")) {
      const inner = expr.slice(1, -1).trim();
      if (inner === "") return [];
      // Split by comma but respect nested structures
      const elements = splitByComma(inner);
      return elements.map(el => parseValue(el.trim(), scope));
    }
    
    // Handle object literals (basic)
    if (expr.startsWith("{") && expr.endsWith("}")) {
      const inner = expr.slice(1, -1).trim();
      if (inner === "") return {};
      const obj: any = {};
      const pairs = splitByComma(inner);
      for (const pair of pairs) {
        const colonIdx = pair.indexOf(":");
        if (colonIdx > -1) {
          let key = pair.slice(0, colonIdx).trim();
          if ((key.startsWith('"') || key.startsWith("'")) && key.length > 2) {
            key = key.slice(1, -1);
          }
          const value = parseValue(pair.slice(colonIdx + 1).trim(), scope);
          obj[key] = value;
        }
      }
      return obj;
    }
    
    // Handle array spread [...arr]
    if (expr.startsWith("[...") && expr.endsWith("]")) {
      const arrName = expr.slice(4, -1).trim();
      const arr = scope[arrName];
      return Array.isArray(arr) ? [...arr] : [];
    }
    
    // Handle array access
    const arrayAccessMatch = expr.match(/^(\w+)\[(.+)\]$/);
    if (arrayAccessMatch) {
      const arrName = arrayAccessMatch[1];
      const indexExpr = arrayAccessMatch[2];
      const arr = scope[arrName];
      const index = parseValue(indexExpr, scope);
      if (Array.isArray(arr) && typeof index === "number") {
        return arr[index];
      }
      return undefined;
    }
    
    // Handle property access
    if (expr.includes(".") && !expr.includes("(")) {
      const parts = expr.split(".");
      let value = scope[parts[0]];
      for (let i = 1; i < parts.length && value !== undefined; i++) {
        value = value[parts[i]];
      }
      return value;
    }
    
    // Handle function calls
    const funcCallMatch = expr.match(/^(\w+(?:\.\w+)*)\((.*)?\)$/);
    if (funcCallMatch) {
      const funcPath = funcCallMatch[1];
      const argsStr = funcCallMatch[2] || "";
      return evaluateFunctionCall(funcPath, argsStr, scope, executionRef.current);
    }
    
    // Handle simple arithmetic
    if (expr.includes("+") || expr.includes("-") || expr.includes("*") || expr.includes("/") || expr.includes("%")) {
      return evaluateExpression(expr, scope);
    }
    
    // Handle comparisons
    if (expr.includes("===") || expr.includes("!==") || expr.includes("<=") || 
        expr.includes(">=") || expr.includes("<") || expr.includes(">") || expr.includes("==")) {
      return evaluateComparison(expr, scope);
    }
    
    // Handle logical operators
    if (expr.includes("&&") || expr.includes("||")) {
      return evaluateLogical(expr, scope);
    }
    
    // Handle variable reference
    if (scope.hasOwnProperty(expr)) {
      return scope[expr];
    }
    
    // Handle Math functions
    if (expr.startsWith("Math.")) {
      return evaluateMath(expr, scope);
    }
    
    return undefined;
  };

  const splitByComma = (str: string): string[] => {
    const result: string[] = [];
    let depth = 0;
    let current = "";
    for (const char of str) {
      if (char === "[" || char === "{" || char === "(") depth++;
      if (char === "]" || char === "}" || char === ")") depth--;
      if (char === "," && depth === 0) {
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    if (current) result.push(current);
    return result;
  };

  const evaluateExpression = (expr: string, scope: Scope): number => {
    // Replace variables with values
    let processed = expr;
    const varMatches = expr.match(/[a-zA-Z_]\w*/g) || [];
    for (const varName of varMatches) {
      if (scope.hasOwnProperty(varName)) {
        const val = scope[varName];
        if (typeof val === "number") {
          processed = processed.replace(new RegExp(`\\b${varName}\\b`), String(val));
        }
      }
    }
    
    try {
      // Safe evaluation of arithmetic
      const sanitized = processed.replace(/[^0-9+\-*/%().\s]/g, "");
      return Function(`"use strict"; return (${sanitized})`)();
    } catch {
      return NaN;
    }
  };

  const evaluateComparison = (expr: string, scope: Scope): boolean => {
    const operators = ["===", "!==", "==", "!=", "<=", ">=", "<", ">"];
    for (const op of operators) {
      const idx = expr.indexOf(op);
      if (idx > -1) {
        const left = parseValue(expr.slice(0, idx).trim(), scope);
        const right = parseValue(expr.slice(idx + op.length).trim(), scope);
        switch (op) {
          case "===": return left === right;
          case "!==": return left !== right;
          case "==": return left == right;
          case "!=": return left != right;
          case "<=": return left <= right;
          case ">=": return left >= right;
          case "<": return left < right;
          case ">": return left > right;
        }
      }
    }
    return false;
  };

  const evaluateLogical = (expr: string, scope: Scope): boolean => {
    if (expr.includes("&&")) {
      const parts = expr.split("&&");
      return parts.every(p => parseValue(p.trim(), scope));
    }
    if (expr.includes("||")) {
      const parts = expr.split("||");
      return parts.some(p => parseValue(p.trim(), scope));
    }
    return Boolean(parseValue(expr, scope));
  };

  const evaluateMath = (expr: string, scope: Scope): number => {
    const match = expr.match(/Math\.(\w+)\((.*)?\)/);
    if (!match) return NaN;
    
    const func = match[1];
    const argsStr = match[2] || "";
    const args = argsStr ? splitByComma(argsStr).map(a => parseValue(a.trim(), scope)) : [];
    
    switch (func) {
      case "floor": return Math.floor(args[0] as number);
      case "ceil": return Math.ceil(args[0] as number);
      case "round": return Math.round(args[0] as number);
      case "abs": return Math.abs(args[0] as number);
      case "sqrt": return Math.sqrt(args[0] as number);
      case "pow": return Math.pow(args[0] as number, args[1] as number);
      case "min": return Math.min(...(args as number[]));
      case "max": return Math.max(...(args as number[]));
      case "random": return Math.random();
      default: return NaN;
    }
  };

  const evaluateFunctionCall = (
    funcPath: string, 
    argsStr: string, 
    scope: Scope,
    execRef: typeof executionRef.current
  ): any => {
    const args = argsStr ? splitByComma(argsStr).map(a => parseValue(a.trim(), scope)) : [];
    
    // Handle console.log
    if (funcPath === "console.log") {
      const output = args.map(a => 
        typeof a === "object" ? JSON.stringify(a) : String(a)
      ).join(" ");
      execRef.output.push(output);
      return undefined;
    }
    
    // Handle array methods
    const dotIdx = funcPath.lastIndexOf(".");
    if (dotIdx > -1) {
      const objPath = funcPath.slice(0, dotIdx);
      const method = funcPath.slice(dotIdx + 1);
      let obj = scope[objPath];
      
      if (Array.isArray(obj)) {
        switch (method) {
          case "push": obj.push(...args); return obj.length;
          case "pop": return obj.pop();
          case "shift": return obj.shift();
          case "unshift": obj.unshift(...args); return obj.length;
          case "slice": return obj.slice(args[0] as number, args[1] as number);
          case "concat": return obj.concat(args[0]);
          case "join": return obj.join(args[0] as string || ",");
          case "length": return obj.length;
          case "map": return obj; // Simplified
          case "filter": return obj; // Simplified
          case "forEach": return undefined;
        }
      }
      
      if (typeof obj === "string") {
        switch (method) {
          case "toLowerCase": return obj.toLowerCase();
          case "toUpperCase": return obj.toUpperCase();
          case "split": return obj.split(args[0] as string);
          case "charAt": return obj.charAt(args[0] as number);
          case "substring": return obj.substring(args[0] as number, args[1] as number);
          case "slice": return obj.slice(args[0] as number, args[1] as number);
          case "length": return obj.length;
        }
      }
      
      if (typeof obj === "object" && obj !== null) {
        if (method === "entries") return Object.entries(obj);
        if (method === "keys") return Object.keys(obj);
        if (method === "values") return Object.values(obj);
      }
    }
    
    // Handle Object static methods
    if (funcPath === "Object.keys") return Object.keys(args[0]);
    if (funcPath === "Object.values") return Object.values(args[0]);
    if (funcPath === "Object.entries") return Object.entries(args[0]);
    
    // Handle Array static methods
    if (funcPath === "Array.from") {
      const source = args[0];
      if (typeof source === "object" && source?.length !== undefined) {
        return Array.from({ length: source.length }, (_, i) => 
          args[1] ? i : undefined
        );
      }
      return [];
    }
    
    // Handle user-defined functions
    if (execRef.functionDefs[funcPath]) {
      const funcDef = execRef.functionDefs[funcPath];
      // Create new scope with parameters
      const funcScope = { ...scope };
      funcDef.params.forEach((param, i) => {
        funcScope[param] = args[i];
      });
      // Execute function body (simplified - returns last value)
      return undefined;
    }
    
    return undefined;
  };

  const extractVariables = (scope: Scope, previousScope: Scope): Variable[] => {
    const vars: Variable[] = [];
    for (const [name, value] of Object.entries(scope)) {
      if (name.startsWith("__")) continue;
      
      const type = Array.isArray(value) ? "Array" : typeof value;
      let displayValue: string;
      
      if (Array.isArray(value)) {
        displayValue = JSON.stringify(value);
      } else if (typeof value === "object" && value !== null) {
        displayValue = JSON.stringify(value);
      } else if (typeof value === "function") {
        displayValue = "ƒ()";
      } else {
        displayValue = String(value);
      }
      
      const prevValue = previousScope[name];
      const changed = JSON.stringify(value) !== JSON.stringify(prevValue);
      
      vars.push({ name, value: displayValue, type, changed });
    }
    return vars.sort((a, b) => a.name.localeCompare(b.name));
  };

  const initializeCode = useCallback((code: string) => {
    const lines = code.split("\n");
    
    // Pre-parse function definitions
    const functionDefs: typeof executionRef.current.functionDefs = {};
    let inFunction = false;
    let funcName = "";
    let funcParams: string[] = [];
    let funcStartLine = 0;
    let braceDepth = 0;
    
    lines.forEach((line, idx) => {
      const funcMatch = line.match(/function\s+(\w+)\s*\(([^)]*)\)/);
      if (funcMatch && !inFunction) {
        inFunction = true;
        funcName = funcMatch[1];
        funcParams = funcMatch[2].split(",").map(p => p.trim()).filter(p => p);
        funcStartLine = idx;
        braceDepth = (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
      } else if (inFunction) {
        braceDepth += (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
        if (braceDepth <= 0) {
          functionDefs[funcName] = {
            params: funcParams,
            body: lines.slice(funcStartLine, idx + 1).join("\n"),
            startLine: funcStartLine,
            endLine: idx,
          };
          inFunction = false;
        }
      }
    });
    
    executionRef.current = {
      code,
      lines,
      scope: {},
      previousScope: {},
      lineIndex: 0,
      loopStack: [],
      functionDefs,
      callStack: ["global"],
      output: [],
      skipUntilLine: -1,
    };
    
    setState({
      variables: [],
      currentLine: 0,
      callStack: ["global"],
      output: [],
      isComplete: false,
      error: null,
    });
  }, []);

  const executeLine = useCallback((line: string, lineNumber: number): boolean => {
    const exec = executionRef.current;
    const trimmed = line.trim();
    
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("/*")) {
      return true;
    }
    
    // Skip closing braces and return statements (simplified)
    if (trimmed === "}" || trimmed === "};") {
      // Check if we're ending a loop
      if (exec.loopStack.length > 0) {
        const loop = exec.loopStack[exec.loopStack.length - 1];
        
        if (loop.type === "for") {
          // Execute increment
          if (loop.increment) {
            const incMatch = loop.increment.match(/(\w+)(\+\+|--|\+=|\-=)(.+)?/);
            if (incMatch) {
              const varName = incMatch[1];
              const op = incMatch[2];
              if (op === "++") exec.scope[varName]++;
              else if (op === "--") exec.scope[varName]--;
              else if (op === "+=" && incMatch[3]) {
                exec.scope[varName] += parseValue(incMatch[3].trim(), exec.scope);
              }
              else if (op === "-=" && incMatch[3]) {
                exec.scope[varName] -= parseValue(incMatch[3].trim(), exec.scope);
              }
            }
          }
          
          // Check condition
          const condResult = parseValue(loop.condition, exec.scope);
          if (condResult) {
            exec.lineIndex = loop.start;
            return true;
          } else {
            exec.loopStack.pop();
          }
        } else if (loop.type === "while") {
          const condResult = parseValue(loop.condition, exec.scope);
          if (condResult) {
            exec.lineIndex = loop.start;
            return true;
          } else {
            exec.loopStack.pop();
          }
        }
      }
      return true;
    }
    
    // Skip function definitions (already parsed)
    if (trimmed.startsWith("function ")) {
      // Find the function in our defs and skip to end
      for (const [, def] of Object.entries(exec.functionDefs)) {
        if (def.startLine === lineNumber) {
          exec.skipUntilLine = def.endLine;
          return true;
        }
      }
    }
    
    // Handle return statements
    if (trimmed.startsWith("return ")) {
      const expr = trimmed.slice(7).replace(";", "").trim();
      const value = parseValue(expr, exec.scope);
      exec.scope["__return__"] = value;
      return true;
    }
    
    // Handle variable declarations
    const varDeclMatch = trimmed.match(/^(let|const|var)\s+(\w+)\s*=\s*(.+?);?$/);
    if (varDeclMatch) {
      const varName = varDeclMatch[2];
      let expr = varDeclMatch[3];
      if (expr.endsWith(";")) expr = expr.slice(0, -1);
      
      exec.scope[varName] = parseValue(expr, exec.scope);
      return true;
    }
    
    // Handle destructuring assignment (basic array)
    const destructMatch = trimmed.match(/^\[([^\]]+)\]\s*=\s*\[([^\]]+)\];?$/);
    if (destructMatch) {
      const vars = destructMatch[1].split(",").map(v => v.trim());
      const values = destructMatch[2].split(",").map(v => parseValue(v.trim(), exec.scope));
      vars.forEach((v, i) => {
        if (v && exec.scope.hasOwnProperty(v)) {
          exec.scope[v] = values[i];
        }
      });
      return true;
    }
    
    // Handle array swap pattern [a, b] = [b, a]
    const swapMatch = trimmed.match(/^\[(\w+)\[(\w+)\],\s*(\w+)\[(\w+)\]\]\s*=\s*\[(\w+)\[(\w+)\],\s*(\w+)\[(\w+)\]\];?$/);
    if (swapMatch) {
      const arr1 = exec.scope[swapMatch[1]];
      const idx1 = parseValue(swapMatch[2], exec.scope);
      const arr2 = exec.scope[swapMatch[3]];
      const idx2 = parseValue(swapMatch[4], exec.scope);
      
      if (Array.isArray(arr1) && Array.isArray(arr2)) {
        const temp = arr1[idx1];
        arr1[idx1] = arr2[idx2];
        arr2[idx2] = temp;
      }
      return true;
    }
    
    // Handle assignment
    const assignMatch = trimmed.match(/^(\w+)\s*=\s*(.+?);?$/);
    if (assignMatch && !trimmed.includes("==")) {
      const varName = assignMatch[1];
      let expr = assignMatch[2];
      if (expr.endsWith(";")) expr = expr.slice(0, -1);
      
      exec.scope[varName] = parseValue(expr, exec.scope);
      return true;
    }
    
    // Handle array element assignment
    const arrAssignMatch = trimmed.match(/^(\w+)\[(.+)\]\s*=\s*(.+?);?$/);
    if (arrAssignMatch) {
      const arrName = arrAssignMatch[1];
      const indexExpr = arrAssignMatch[2];
      let valueExpr = arrAssignMatch[3];
      if (valueExpr.endsWith(";")) valueExpr = valueExpr.slice(0, -1);
      
      const arr = exec.scope[arrName];
      const index = parseValue(indexExpr, exec.scope);
      const value = parseValue(valueExpr, exec.scope);
      
      if (Array.isArray(arr) && typeof index === "number") {
        arr[index] = value;
      }
      return true;
    }
    
    // Handle increment/decrement
    const incDecMatch = trimmed.match(/^(\w+)(\+\+|--);?$/);
    if (incDecMatch) {
      const varName = incDecMatch[1];
      if (incDecMatch[2] === "++") exec.scope[varName]++;
      else exec.scope[varName]--;
      return true;
    }
    
    // Handle compound assignment
    const compoundMatch = trimmed.match(/^(\w+)\s*(\+=|-=|\*=|\/=|%=)\s*(.+?);?$/);
    if (compoundMatch) {
      const varName = compoundMatch[1];
      const op = compoundMatch[2];
      let expr = compoundMatch[3];
      if (expr.endsWith(";")) expr = expr.slice(0, -1);
      const value = parseValue(expr, exec.scope);
      
      switch (op) {
        case "+=": exec.scope[varName] += value; break;
        case "-=": exec.scope[varName] -= value; break;
        case "*=": exec.scope[varName] *= value; break;
        case "/=": exec.scope[varName] /= value; break;
        case "%=": exec.scope[varName] %= value; break;
      }
      return true;
    }
    
    // Handle for loop
    const forMatch = trimmed.match(/^for\s*\((.+?);(.+?);(.+?)\)\s*\{?$/);
    if (forMatch) {
      // Execute initialization
      const init = forMatch[1].trim();
      const initVarMatch = init.match(/(let|const|var)\s+(\w+)\s*=\s*(.+)/);
      if (initVarMatch) {
        exec.scope[initVarMatch[2]] = parseValue(initVarMatch[3], exec.scope);
      }
      
      const condition = forMatch[2].trim();
      const increment = forMatch[3].trim();
      
      // Check condition
      const condResult = parseValue(condition, exec.scope);
      if (condResult) {
        exec.loopStack.push({
          start: lineNumber,
          condition,
          increment,
          type: "for",
        });
      } else {
        // Skip to end of loop
        let depth = 1;
        for (let i = lineNumber + 1; i < exec.lines.length; i++) {
          if (exec.lines[i].includes("{")) depth++;
          if (exec.lines[i].includes("}")) depth--;
          if (depth === 0) {
            exec.skipUntilLine = i;
            break;
          }
        }
      }
      return true;
    }
    
    // Handle while loop
    const whileMatch = trimmed.match(/^while\s*\((.+?)\)\s*\{?$/);
    if (whileMatch) {
      const condition = whileMatch[1].trim();
      const condResult = parseValue(condition, exec.scope);
      
      if (condResult) {
        exec.loopStack.push({
          start: lineNumber,
          condition,
          type: "while",
        });
      } else {
        // Skip to end of loop
        let depth = 1;
        for (let i = lineNumber + 1; i < exec.lines.length; i++) {
          if (exec.lines[i].includes("{")) depth++;
          if (exec.lines[i].includes("}")) depth--;
          if (depth === 0) {
            exec.skipUntilLine = i;
            break;
          }
        }
      }
      return true;
    }
    
    // Handle if statement
    const ifMatch = trimmed.match(/^if\s*\((.+?)\)\s*\{?$/);
    if (ifMatch) {
      const condition = ifMatch[1].trim();
      const condResult = parseValue(condition, exec.scope);
      
      if (!condResult) {
        // Skip to else or end of if block
        let depth = 1;
        for (let i = lineNumber + 1; i < exec.lines.length; i++) {
          const l = exec.lines[i].trim();
          if (l.includes("{")) depth++;
          if (l.includes("}")) depth--;
          if (depth === 0) {
            if (l.includes("else")) {
              // Continue to else block
            } else {
              exec.skipUntilLine = i;
            }
            break;
          }
        }
      }
      return true;
    }
    
    // Handle else
    if (trimmed === "} else {" || trimmed === "else {" || trimmed === "} else if") {
      // Skip else block if we came from a true if condition
      // This is simplified - full implementation would track if condition result
      return true;
    }
    
    // Handle function call
    const funcCallMatch = trimmed.match(/^(\w+(?:\.\w+)*)\((.*)?\);?$/);
    if (funcCallMatch) {
      const funcPath = funcCallMatch[1];
      const argsStr = funcCallMatch[2] || "";
      evaluateFunctionCall(funcPath, argsStr, exec.scope, exec);
      return true;
    }
    
    return true;
  }, []);

  const step = useCallback((): boolean => {
    const exec = executionRef.current;
    
    if (exec.lineIndex >= exec.lines.length) {
      setState(prev => ({ ...prev, isComplete: true }));
      return false;
    }
    
    // Skip lines if needed (e.g., inside function definition)
    if (exec.skipUntilLine >= 0 && exec.lineIndex < exec.skipUntilLine) {
      exec.lineIndex++;
      return step();
    }
    exec.skipUntilLine = -1;
    
    const line = exec.lines[exec.lineIndex];
    const lineNumber = exec.lineIndex;
    
    // Store previous scope for change detection
    exec.previousScope = JSON.parse(JSON.stringify(exec.scope));
    
    try {
      executeLine(line, lineNumber);
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: {
          name: error.name || "Error",
          message: error.message || "Unknown error",
          line: lineNumber + 1,
        },
        currentLine: lineNumber + 1,
      }));
      return false;
    }
    
    exec.lineIndex++;
    
    const variables = extractVariables(exec.scope, exec.previousScope);
    
    setState({
      variables,
      currentLine: exec.lineIndex,
      callStack: exec.callStack,
      output: [...exec.output],
      isComplete: exec.lineIndex >= exec.lines.length,
      error: null,
    });
    
    return exec.lineIndex < exec.lines.length;
  }, [executeLine]);

  const stepBack = useCallback(() => {
    // Re-initialize and step to previous line
    const exec = executionRef.current;
    const targetLine = Math.max(0, exec.lineIndex - 1);
    
    initializeCode(exec.code);
    
    for (let i = 0; i < targetLine; i++) {
      step();
    }
  }, [initializeCode, step]);

  const runToEnd = useCallback(() => {
    let steps = 0;
    const maxSteps = 10000; // Prevent infinite loops
    
    while (step() && steps < maxSteps) {
      steps++;
    }
    
    if (steps >= maxSteps) {
      setState(prev => ({
        ...prev,
        error: {
          name: "Timeout",
          message: "Execution exceeded maximum steps (possible infinite loop)",
          line: executionRef.current.lineIndex + 1,
        },
      }));
    }
  }, [step]);

  const reset = useCallback(() => {
    const code = executionRef.current.code;
    initializeCode(code);
  }, [initializeCode]);

  return {
    state,
    initializeCode,
    step,
    stepBack,
    runToEnd,
    reset,
    currentLine: executionRef.current.lineIndex,
  };
};
