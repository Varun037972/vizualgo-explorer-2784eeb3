import { useState, useRef, useEffect, useCallback, KeyboardEvent, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Sparkles, Loader2, ChevronRight, ChevronDown, Undo2, Redo2, Search, Replace, X, CaseSensitive, Regex, WholeWord } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";

interface Suggestion {
  label: string;
  detail?: string;
  insertText: string;
  kind: "keyword" | "function" | "variable" | "method" | "property" | "snippet" | "ai";
  isAI?: boolean;
}

const JAVASCRIPT_SUGGESTIONS: Suggestion[] = [
  { label: "let", detail: "Variable declaration", insertText: "let ", kind: "keyword" },
  { label: "const", detail: "Constant declaration", insertText: "const ", kind: "keyword" },
  { label: "var", detail: "Variable declaration", insertText: "var ", kind: "keyword" },
  { label: "function", detail: "Function declaration", insertText: "function ", kind: "keyword" },
  { label: "return", detail: "Return statement", insertText: "return ", kind: "keyword" },
  { label: "if", detail: "Conditional statement", insertText: "if (", kind: "keyword" },
  { label: "else", detail: "Else clause", insertText: "else ", kind: "keyword" },
  { label: "for", detail: "For loop", insertText: "for (", kind: "keyword" },
  { label: "while", detail: "While loop", insertText: "while (", kind: "keyword" },
  { label: "switch", detail: "Switch statement", insertText: "switch (", kind: "keyword" },
  { label: "case", detail: "Case clause", insertText: "case ", kind: "keyword" },
  { label: "break", detail: "Break statement", insertText: "break;", kind: "keyword" },
  { label: "continue", detail: "Continue statement", insertText: "continue;", kind: "keyword" },
  { label: "true", detail: "Boolean true", insertText: "true", kind: "keyword" },
  { label: "false", detail: "Boolean false", insertText: "false", kind: "keyword" },
  { label: "null", detail: "Null value", insertText: "null", kind: "keyword" },
  { label: "undefined", detail: "Undefined value", insertText: "undefined", kind: "keyword" },
  { label: "console.log", detail: "Log to console", insertText: "console.log()", kind: "function" },
  { label: "console.error", detail: "Log error", insertText: "console.error()", kind: "function" },
  { label: "console.warn", detail: "Log warning", insertText: "console.warn()", kind: "function" },
  { label: ".push", detail: "Add to end of array", insertText: ".push()", kind: "method" },
  { label: ".pop", detail: "Remove from end", insertText: ".pop()", kind: "method" },
  { label: ".map", detail: "Transform array", insertText: ".map((item) => )", kind: "method" },
  { label: ".filter", detail: "Filter array", insertText: ".filter((item) => )", kind: "method" },
  { label: ".reduce", detail: "Reduce array", insertText: ".reduce((acc, item) => , )", kind: "method" },
  { label: ".forEach", detail: "Iterate array", insertText: ".forEach((item) => )", kind: "method" },
  { label: ".find", detail: "Find element", insertText: ".find((item) => )", kind: "method" },
  { label: ".includes", detail: "Check if includes", insertText: ".includes()", kind: "method" },
  { label: ".sort", detail: "Sort array", insertText: ".sort((a, b) => a - b)", kind: "method" },
  { label: ".length", detail: "Array/string length", insertText: ".length", kind: "property" },
  { label: "Math.floor", detail: "Round down", insertText: "Math.floor()", kind: "function" },
  { label: "Math.ceil", detail: "Round up", insertText: "Math.ceil()", kind: "function" },
  { label: "Math.random", detail: "Random number", insertText: "Math.random()", kind: "function" },
  { label: "for-loop", detail: "For loop snippet", insertText: "for (let i = 0; i < arr.length; i++) {\n  \n}", kind: "snippet" },
  { label: "if-else", detail: "If-else block", insertText: "if (condition) {\n  \n} else {\n  \n}", kind: "snippet" },
  { label: "function-arrow", detail: "Arrow function", insertText: "const func = () => {\n  \n};", kind: "snippet" },
  { label: "try-catch", detail: "Try-catch block", insertText: "try {\n  \n} catch (error) {\n  console.error(error);\n}", kind: "snippet" },
];

const kindIcons: Record<string, string> = {
  keyword: "🔑", function: "ƒ", variable: "𝑥", method: "◦", property: "●", snippet: "⧉", ai: "✨",
};

const kindColors: Record<string, string> = {
  keyword: "text-purple-400", function: "text-yellow-400", variable: "text-blue-400",
  method: "text-green-400", property: "text-cyan-400", snippet: "text-orange-400", ai: "text-pink-400",
};

const BRACKET_PAIRS: Record<string, string> = { "(": ")", "[": "]", "{": "}", '"': '"', "'": "'", "`": "`" };
const CLOSING_BRACKETS = new Set(Object.values(BRACKET_PAIRS));

type TokenType = "keyword" | "string" | "number" | "comment" | "function" | "operator" | "variable" | "property" | "bracket" | "default";

interface Token { type: TokenType; value: string; }

interface FoldableRegion { startLine: number; endLine: number; type: "function" | "block" | "object"; }

interface HistoryEntry { value: string; cursorPositions: number[]; }

interface CursorState { pos: number; id: number; }

const JS_KEYWORDS = new Set([
  "let", "const", "var", "function", "return", "if", "else", "for", "while",
  "switch", "case", "break", "continue", "true", "false", "null", "undefined",
  "new", "this", "class", "extends", "import", "export", "default", "try",
  "catch", "finally", "throw", "async", "await", "typeof", "instanceof", "in", "of"
]);

const JS_BUILTINS = new Set([
  "console", "Math", "Array", "Object", "String", "Number", "Boolean",
  "Date", "JSON", "Promise", "Map", "Set", "Symbol", "Error"
]);

interface InlineCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const InlineCodeEditor = ({ value, onChange, placeholder, className }: InlineCodeEditorProps) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ top: 0, left: 0 });
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [matchedBracket, setMatchedBracket] = useState<{ open: number; close: number } | null>(null);
  const [collapsedRegions, setCollapsedRegions] = useState<Set<number>>(new Set());
  const [history, setHistory] = useState<HistoryEntry[]>([{ value: "", cursorPositions: [0] }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  // Multi-cursor state
  const [cursors, setCursors] = useState<CursorState[]>([{ pos: 0, id: 0 }]);
  const [nextCursorId, setNextCursorId] = useState(1);
  
  // Find and replace state
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [useRegex, setUseRegex] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [findMatches, setFindMatches] = useState<{ start: number; end: number }[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  
  // Minimap state
  const [minimapScrollRatio, setMinimapScrollRatio] = useState(0);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const minimapRef = useRef<HTMLDivElement>(null);
  const aiDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const isUndoRedoRef = useRef(false);

  const lines = useMemo(() => value.split("\n"), [value]);

  // Detect foldable regions (functions, blocks with braces)
  const foldableRegions = useMemo((): FoldableRegion[] => {
    const regions: FoldableRegion[] = [];
    const stack: { line: number; char: string }[] = [];
    
    lines.forEach((line, lineIndex) => {
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === "{") {
          stack.push({ line: lineIndex, char });
        } else if (char === "}" && stack.length > 0) {
          const start = stack.pop()!;
          if (start.line < lineIndex) {
            const startLineContent = lines[start.line];
            const type = /function|if|else|for|while|switch|class|=>/.test(startLineContent) 
              ? (/function|class|=>/.test(startLineContent) ? "function" : "block")
              : "object";
            regions.push({ startLine: start.line, endLine: lineIndex, type });
          }
        }
      }
    });
    
    return regions.sort((a, b) => a.startLine - b.startLine);
  }, [lines]);

  // Get visible lines accounting for collapsed regions
  const visibleLines = useMemo(() => {
    const visible: { lineNumber: number; content: string; isCollapsed: boolean; canFold: boolean; foldEnd?: number }[] = [];
    let skipUntil = -1;
    
    lines.forEach((content, index) => {
      if (index <= skipUntil) return;
      
      const region = foldableRegions.find(r => r.startLine === index);
      const isCollapsed = region && collapsedRegions.has(region.startLine);
      
      if (isCollapsed && region) {
        visible.push({ 
          lineNumber: index + 1, 
          content: content + ` ... }`, 
          isCollapsed: true, 
          canFold: true,
          foldEnd: region.endLine 
        });
        skipUntil = region.endLine;
      } else {
        visible.push({ 
          lineNumber: index + 1, 
          content, 
          isCollapsed: false, 
          canFold: !!region 
        });
      }
    });
    
    return visible;
  }, [lines, foldableRegions, collapsedRegions]);

  // Find matches calculation
  useEffect(() => {
    if (!findText) {
      setFindMatches([]);
      return;
    }

    try {
      let pattern: RegExp;
      if (useRegex) {
        pattern = new RegExp(findText, caseSensitive ? "g" : "gi");
      } else {
        const escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const wordPattern = wholeWord ? `\\b${escaped}\\b` : escaped;
        pattern = new RegExp(wordPattern, caseSensitive ? "g" : "gi");
      }

      const matches: { start: number; end: number }[] = [];
      let match;
      while ((match = pattern.exec(value)) !== null) {
        matches.push({ start: match.index, end: match.index + match[0].length });
        if (match[0].length === 0) break;
      }
      setFindMatches(matches);
      if (matches.length > 0 && currentMatchIndex >= matches.length) {
        setCurrentMatchIndex(0);
      }
    } catch {
      setFindMatches([]);
    }
  }, [findText, value, useRegex, caseSensitive, wholeWord, currentMatchIndex]);

  // Toggle fold region
  const toggleFold = useCallback((startLine: number) => {
    setCollapsedRegions(prev => {
      const next = new Set(prev);
      if (next.has(startLine)) {
        next.delete(startLine);
      } else {
        next.add(startLine);
      }
      return next;
    });
  }, []);

  // Tokenize for syntax highlighting
  const tokenize = useCallback((code: string): Token[] => {
    const tokens: Token[] = [];
    let i = 0;

    while (i < code.length) {
      if (code.slice(i, i + 2) === "//") {
        let end = i;
        while (end < code.length && code[end] !== "\n") end++;
        tokens.push({ type: "comment", value: code.slice(i, end) });
        i = end;
        continue;
      }

      if (code.slice(i, i + 2) === "/*") {
        let end = code.indexOf("*/", i + 2);
        if (end === -1) end = code.length;
        else end += 2;
        tokens.push({ type: "comment", value: code.slice(i, end) });
        i = end;
        continue;
      }

      if (code[i] === '"' || code[i] === "'" || code[i] === "`") {
        const quote = code[i];
        let end = i + 1;
        while (end < code.length && code[end] !== quote) {
          if (code[end] === "\\") end++;
          end++;
        }
        tokens.push({ type: "string", value: code.slice(i, end + 1) });
        i = end + 1;
        continue;
      }

      if (/\d/.test(code[i]) || (code[i] === "." && /\d/.test(code[i + 1]))) {
        let end = i;
        while (end < code.length && /[\d.eE+-]/.test(code[end])) end++;
        tokens.push({ type: "number", value: code.slice(i, end) });
        i = end;
        continue;
      }

      if (/[a-zA-Z_$]/.test(code[i])) {
        let end = i;
        while (end < code.length && /[\w$]/.test(code[end])) end++;
        const word = code.slice(i, end);
        
        let type: TokenType = "default";
        if (JS_KEYWORDS.has(word)) type = "keyword";
        else if (JS_BUILTINS.has(word)) type = "function";
        else if (code[end] === "(") type = "function";
        else if (i > 0 && code[i - 1] === ".") type = "property";
        else type = "variable";
        
        tokens.push({ type, value: word });
        i = end;
        continue;
      }

      if (/[+\-*/%=<>!&|^~?:]/.test(code[i])) {
        let end = i;
        while (end < code.length && /[+\-*/%=<>!&|^~?:]/.test(code[end])) end++;
        tokens.push({ type: "operator", value: code.slice(i, end) });
        i = end;
        continue;
      }

      if (/[()[\]{}]/.test(code[i])) {
        tokens.push({ type: "bracket", value: code[i] });
        i++;
        continue;
      }

      tokens.push({ type: "default", value: code[i] });
      i++;
    }

    return tokens;
  }, []);

  // Generate highlighted HTML for a single line with match highlighting
  const highlightLine = useCallback((lineContent: string, lineStartIndex: number): string => {
    const tokens = tokenize(lineContent);
    let charIndex = lineStartIndex;
    
    return tokens.map((token) => {
      const tokenStart = charIndex;
      const tokenEnd = charIndex + token.value.length;
      charIndex = tokenEnd;
      
      // Check if this token overlaps with any find matches
      const isInMatch = findMatches.some(m => 
        (tokenStart >= m.start && tokenStart < m.end) ||
        (tokenEnd > m.start && tokenEnd <= m.end) ||
        (tokenStart <= m.start && tokenEnd >= m.end)
      );
      
      const colorClass = {
        keyword: "text-purple-400", string: "text-green-400", number: "text-orange-400",
        comment: "text-muted-foreground italic", function: "text-yellow-400",
        operator: "text-cyan-400", variable: "text-blue-300", property: "text-cyan-300",
        bracket: "text-foreground", default: "text-foreground",
      }[token.type];
      
      const escaped = token.value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/ /g, "&nbsp;");
      
      const matchClass = isInMatch ? " bg-yellow-400/30 rounded" : "";
      
      return `<span class="${colorClass}${matchClass}">${escaped}</span>`;
    }).join("");
  }, [tokenize, findMatches]);

  // Find matching bracket
  const findMatchingBracket = useCallback((code: string, pos: number): { open: number; close: number } | null => {
    const char = code[pos];
    const openBrackets = "([{";
    const closeBrackets = ")]}";
    
    if (openBrackets.includes(char)) {
      const closeChar = BRACKET_PAIRS[char];
      let depth = 1;
      let i = pos + 1;
      while (i < code.length && depth > 0) {
        if (code[i] === char) depth++;
        else if (code[i] === closeChar) depth--;
        i++;
      }
      if (depth === 0) return { open: pos, close: i - 1 };
    } else if (closeBrackets.includes(char)) {
      const openChar = Object.entries(BRACKET_PAIRS).find(([, v]) => v === char)?.[0];
      if (openChar) {
        let depth = 1;
        let i = pos - 1;
        while (i >= 0 && depth > 0) {
          if (code[i] === char) depth++;
          else if (code[i] === openChar) depth--;
          i--;
        }
        if (depth === 0) return { open: i + 1, close: pos };
      }
    }
    return null;
  }, []);

  const updateBracketMatching = useCallback(() => {
    if (!textareaRef.current) return;
    const pos = textareaRef.current.selectionStart;
    const match = findMatchingBracket(value, pos) || findMatchingBracket(value, pos - 1);
    setMatchedBracket(match);
  }, [value, findMatchingBracket]);

  // History management for undo/redo
  const pushToHistory = useCallback((newValue: string, cursorPositions: number[]) => {
    if (isUndoRedoRef.current) {
      isUndoRedoRef.current = false;
      return;
    }
    
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push({ value: newValue, cursorPositions });
      if (newHistory.length > 100) newHistory.shift();
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 99));
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      isUndoRedoRef.current = true;
      const newIndex = historyIndex - 1;
      const entry = history[newIndex];
      setHistoryIndex(newIndex);
      onChange(entry.value);
      setCursors(entry.cursorPositions.map((pos, i) => ({ pos, id: i })));
      setTimeout(() => {
        if (textareaRef.current && entry.cursorPositions.length > 0) {
          textareaRef.current.selectionStart = entry.cursorPositions[0];
          textareaRef.current.selectionEnd = entry.cursorPositions[0];
        }
      }, 0);
    }
  }, [historyIndex, history, onChange]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoRedoRef.current = true;
      const newIndex = historyIndex + 1;
      const entry = history[newIndex];
      setHistoryIndex(newIndex);
      onChange(entry.value);
      setCursors(entry.cursorPositions.map((pos, i) => ({ pos, id: i })));
      setTimeout(() => {
        if (textareaRef.current && entry.cursorPositions.length > 0) {
          textareaRef.current.selectionStart = entry.cursorPositions[0];
          textareaRef.current.selectionEnd = entry.cursorPositions[0];
        }
      }, 0);
    }
  }, [historyIndex, history, onChange]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Find navigation
  const findNext = useCallback(() => {
    if (findMatches.length === 0) return;
    const nextIndex = (currentMatchIndex + 1) % findMatches.length;
    setCurrentMatchIndex(nextIndex);
    
    if (textareaRef.current) {
      const match = findMatches[nextIndex];
      textareaRef.current.setSelectionRange(match.start, match.end);
      textareaRef.current.focus();
    }
  }, [findMatches, currentMatchIndex]);

  const findPrevious = useCallback(() => {
    if (findMatches.length === 0) return;
    const prevIndex = (currentMatchIndex - 1 + findMatches.length) % findMatches.length;
    setCurrentMatchIndex(prevIndex);
    
    if (textareaRef.current) {
      const match = findMatches[prevIndex];
      textareaRef.current.setSelectionRange(match.start, match.end);
      textareaRef.current.focus();
    }
  }, [findMatches, currentMatchIndex]);

  // Replace operations
  const replaceCurrentMatch = useCallback(() => {
    if (findMatches.length === 0 || currentMatchIndex >= findMatches.length) return;
    
    const match = findMatches[currentMatchIndex];
    const newValue = value.slice(0, match.start) + replaceText + value.slice(match.end);
    onChange(newValue);
    pushToHistory(newValue, [match.start + replaceText.length]);
  }, [findMatches, currentMatchIndex, replaceText, value, onChange, pushToHistory]);

  const replaceAllMatches = useCallback(() => {
    if (findMatches.length === 0) return;
    
    let newValue = value;
    let offset = 0;
    
    findMatches.forEach(match => {
      const adjustedStart = match.start + offset;
      const adjustedEnd = match.end + offset;
      newValue = newValue.slice(0, adjustedStart) + replaceText + newValue.slice(adjustedEnd);
      offset += replaceText.length - (match.end - match.start);
    });
    
    onChange(newValue);
    pushToHistory(newValue, [0]);
    setFindMatches([]);
  }, [findMatches, replaceText, value, onChange, pushToHistory]);

  // Multi-cursor: Add cursor
  const addCursor = useCallback((pos: number) => {
    const existing = cursors.find(c => c.pos === pos);
    if (!existing) {
      setCursors(prev => [...prev, { pos, id: nextCursorId }]);
      setNextCursorId(prev => prev + 1);
    }
  }, [cursors, nextCursorId]);

  // Multi-cursor: Add next occurrence of selection
  const addNextOccurrence = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    if (start !== end) {
      const selectedText = value.slice(start, end);
      const nextOccurrence = value.indexOf(selectedText, end);
      if (nextOccurrence !== -1) {
        addCursor(nextOccurrence + selectedText.length);
      }
    }
  }, [value, addCursor]);

  const extractVariables = useCallback((code: string): Suggestion[] => {
    const varMatches = code.matchAll(/(?:let|const|var)\s+(\w+)/g);
    const vars: Suggestion[] = [];
    for (const match of varMatches) {
      if (!vars.find(v => v.label === match[1])) {
        vars.push({ label: match[1], detail: "Local variable", insertText: match[1], kind: "variable" });
      }
    }
    return vars;
  }, []);

  const getCurrentWord = useCallback((text: string, cursorPos: number): { word: string; startIndex: number } => {
    let startIndex = cursorPos;
    while (startIndex > 0 && /[\w.]/.test(text[startIndex - 1])) startIndex--;
    return { word: text.slice(startIndex, cursorPos), startIndex };
  }, []);

  const getCurrentLine = useCallback((text: string, cursorPos: number): string => {
    let lineStart = cursorPos;
    while (lineStart > 0 && text[lineStart - 1] !== "\n") lineStart--;
    let lineEnd = cursorPos;
    while (lineEnd < text.length && text[lineEnd] !== "\n") lineEnd++;
    return text.slice(lineStart, lineEnd);
  }, []);

  const fetchAISuggestions = useCallback(async (code: string, currentLine: string): Promise<Suggestion[]> => {
    try {
      const response = await supabase.functions.invoke("analyze-code", {
        body: { language: "javascript", user_code: code, suggest_completions: true, current_line: currentLine },
      });
      if (response.error) return [];
      const suggestions = response.data?.suggestions || [];
      return suggestions.slice(0, 3).map((s: { label: string; detail: string; insertText: string }) => ({
        label: s.label || "AI suggestion", detail: s.detail || "AI-powered completion",
        insertText: s.insertText || s.label, kind: "ai" as const, isAI: true,
      }));
    } catch { return []; }
  }, []);

  const filterSuggestions = useCallback((word: string, code: string): Suggestion[] => {
    if (!word || word.length < 1) return [];
    const localVars = extractVariables(code);
    const allSuggestions = [...JAVASCRIPT_SUGGESTIONS, ...localVars];
    const lowerWord = word.toLowerCase();
    return allSuggestions
      .filter(s => s.label.toLowerCase().includes(lowerWord))
      .sort((a, b) => {
        const aStarts = a.label.toLowerCase().startsWith(lowerWord);
        const bStarts = b.label.toLowerCase().startsWith(lowerWord);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.label.localeCompare(b.label);
      })
      .slice(0, 10);
  }, [extractVariables]);

  const updateCursorPosition = useCallback(() => {
    if (!textareaRef.current || !mirrorRef.current) return;
    const textarea = textareaRef.current;
    const mirror = mirrorRef.current;
    const text = textarea.value.substring(0, textarea.selectionStart);
    
    mirror.textContent = text;
    const span = document.createElement("span");
    span.textContent = "|";
    mirror.appendChild(span);
    
    const rect = textarea.getBoundingClientRect();
    const spanRect = span.getBoundingClientRect();
    const mirrorRect = mirror.getBoundingClientRect();
    
    setCursorPosition({
      top: spanRect.top - mirrorRect.top + 24,
      left: Math.min(spanRect.left - mirrorRect.left + 48, rect.width - 250),
    });
  }, []);

  const handleAutoClose = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return false;

    const { selectionStart, selectionEnd } = textarea;
    const char = e.key;

    if (BRACKET_PAIRS[char]) {
      e.preventDefault();
      const closeChar = BRACKET_PAIRS[char];
      const selectedText = value.slice(selectionStart, selectionEnd);
      
      if (selectedText) {
        const newValue = value.slice(0, selectionStart) + char + selectedText + closeChar + value.slice(selectionEnd);
        onChange(newValue);
        pushToHistory(newValue, [selectionStart + 1]);
        setTimeout(() => { textarea.selectionStart = selectionStart + 1; textarea.selectionEnd = selectionEnd + 1; }, 0);
      } else {
        const newValue = value.slice(0, selectionStart) + char + closeChar + value.slice(selectionEnd);
        onChange(newValue);
        pushToHistory(newValue, [selectionStart + 1]);
        setTimeout(() => { textarea.selectionStart = selectionStart + 1; textarea.selectionEnd = selectionStart + 1; }, 0);
      }
      return true;
    }

    if (CLOSING_BRACKETS.has(char) && value[selectionStart] === char) {
      e.preventDefault();
      setTimeout(() => { textarea.selectionStart = selectionStart + 1; textarea.selectionEnd = selectionStart + 1; }, 0);
      return true;
    }

    if (e.key === "Backspace" && selectionStart === selectionEnd && selectionStart > 0) {
      const prevChar = value[selectionStart - 1];
      const nextChar = value[selectionStart];
      if (BRACKET_PAIRS[prevChar] === nextChar) {
        e.preventDefault();
        const newValue = value.slice(0, selectionStart - 1) + value.slice(selectionStart + 1);
        onChange(newValue);
        pushToHistory(newValue, [selectionStart - 1]);
        setTimeout(() => { textarea.selectionStart = selectionStart - 1; textarea.selectionEnd = selectionStart - 1; }, 0);
        return true;
      }
    }

    return false;
  }, [value, onChange, pushToHistory]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    onChange(newValue);
    pushToHistory(newValue, [cursorPos]);
    setCursors([{ pos: cursorPos, id: 0 }]);
    
    const { word } = getCurrentWord(newValue, cursorPos);
    const filtered = filterSuggestions(word, newValue);
    
    setSuggestions(filtered);
    setSelectedIndex(0);
    setShowSuggestions(filtered.length > 0);
    
    setTimeout(updateCursorPosition, 0);
    setTimeout(updateBracketMatching, 0);

    if (aiDebounceRef.current) clearTimeout(aiDebounceRef.current);
    
    if (word.length >= 2) {
      aiDebounceRef.current = setTimeout(async () => {
        setIsLoadingAI(true);
        const currentLine = getCurrentLine(newValue, cursorPos);
        const aiSuggestions = await fetchAISuggestions(newValue, currentLine);
        setIsLoadingAI(false);
        
        if (aiSuggestions.length > 0) {
          setSuggestions(prev => {
            const nonAI = prev.filter(s => !s.isAI);
            return [...aiSuggestions, ...nonAI].slice(0, 12);
          });
          setShowSuggestions(true);
        }
      }, 500);
    }
  }, [onChange, pushToHistory, getCurrentWord, filterSuggestions, updateCursorPosition, updateBracketMatching, getCurrentLine, fetchAISuggestions]);

  const applySuggestion = useCallback((suggestion: Suggestion) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart;
    const { startIndex } = getCurrentWord(value, cursorPos);
    
    const insertText = suggestion.insertText;
    const newValue = value.slice(0, startIndex) + insertText + value.slice(cursorPos);
    onChange(newValue);
    pushToHistory(newValue, [startIndex + insertText.length]);
    
    setShowSuggestions(false);
    setSuggestions([]);
    
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = startIndex + insertText.length;
        const parenIndex = insertText.indexOf("()");
        if (parenIndex !== -1) {
          textareaRef.current.selectionStart = startIndex + parenIndex + 1;
          textareaRef.current.selectionEnd = startIndex + parenIndex + 1;
        } else {
          textareaRef.current.selectionStart = newCursorPos;
          textareaRef.current.selectionEnd = newCursorPos;
        }
        textareaRef.current.focus();
      }
    }, 0);
  }, [value, onChange, getCurrentWord, pushToHistory]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Undo/Redo shortcuts
    if ((e.ctrlKey || e.metaKey) && e.key === "z") {
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "y") {
      e.preventDefault();
      redo();
      return;
    }
    
    // Find/Replace shortcuts
    if ((e.ctrlKey || e.metaKey) && e.key === "f") {
      e.preventDefault();
      setShowFindReplace(true);
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "h") {
      e.preventDefault();
      setShowFindReplace(true);
      return;
    }
    
    // Multi-cursor: Add next occurrence (Ctrl+D)
    if ((e.ctrlKey || e.metaKey) && e.key === "d") {
      e.preventDefault();
      addNextOccurrence();
      return;
    }
    
    // Escape to clear multi-cursors or close find/replace
    if (e.key === "Escape") {
      if (showSuggestions) {
        e.preventDefault();
        setShowSuggestions(false);
        return;
      }
      if (cursors.length > 1) {
        setCursors([cursors[0]]);
        return;
      }
      if (showFindReplace) {
        setShowFindReplace(false);
        return;
      }
    }

    if (handleAutoClose(e)) return;

    if (showSuggestions && suggestions.length > 0) {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % suggestions.length);
          return;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
          return;
        case "Tab":
        case "Enter":
          if (suggestions[selectedIndex]) {
            e.preventDefault();
            applySuggestion(suggestions[selectedIndex]);
          }
          return;
      }
    }

    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
      setTimeout(updateBracketMatching, 0);
    }
  }, [showSuggestions, suggestions, selectedIndex, applySuggestion, handleAutoClose, updateBracketMatching, undo, redo, addNextOccurrence, cursors, showFindReplace]);

  // Handle click for multi-cursor
  const handleClick = useCallback((e: React.MouseEvent<HTMLTextAreaElement>) => {
    if (e.altKey && textareaRef.current) {
      e.preventDefault();
      const cursorPos = textareaRef.current.selectionStart;
      addCursor(cursorPos);
    } else if (!e.shiftKey && textareaRef.current) {
      setCursors([{ pos: textareaRef.current.selectionStart, id: 0 }]);
    }
    updateBracketMatching();
  }, [addCursor, updateBracketMatching]);

  const handleScroll = useCallback(() => {
    if (textareaRef.current && containerRef.current) {
      const lineNumbers = containerRef.current.querySelector(".line-numbers") as HTMLElement;
      const highlightOverlay = containerRef.current.querySelector(".highlight-overlay") as HTMLElement;
      if (lineNumbers) lineNumbers.scrollTop = textareaRef.current.scrollTop;
      if (highlightOverlay) highlightOverlay.scrollTop = textareaRef.current.scrollTop;
      
      // Update minimap scroll indicator
      const { scrollTop, scrollHeight, clientHeight } = textareaRef.current;
      const ratio = scrollHeight > clientHeight ? scrollTop / (scrollHeight - clientHeight) : 0;
      setMinimapScrollRatio(ratio);
    }
  }, []);

  // Minimap click to scroll
  const handleMinimapClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!minimapRef.current || !textareaRef.current) return;
    
    const rect = minimapRef.current.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const ratio = clickY / rect.height;
    
    const { scrollHeight, clientHeight } = textareaRef.current;
    textareaRef.current.scrollTop = ratio * (scrollHeight - clientHeight);
  }, []);

  // Minimap content
  const minimapLines = useMemo(() => {
    return lines.map((line, i) => {
      const tokens = tokenize(line);
      return (
        <div key={i} className="flex h-[3px] mb-px">
          {tokens.map((token, j) => (
            <div
              key={j}
              className={cn(
                "h-full opacity-60",
                token.type === "keyword" && "bg-purple-400",
                token.type === "string" && "bg-green-400",
                token.type === "number" && "bg-orange-400",
                token.type === "comment" && "bg-muted-foreground",
                token.type === "function" && "bg-yellow-400",
                token.type === "variable" && "bg-blue-300",
                (token.type === "default" || token.type === "operator") && "bg-foreground/30"
              )}
              style={{ width: Math.max(token.value.length * 0.6, 1) }}
            />
          ))}
        </div>
      );
    });
  }, [lines, tokenize]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) &&
        textareaRef.current && !textareaRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (suggestionsRef.current && showSuggestions) {
      const selectedElement = suggestionsRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      selectedElement?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex, showSuggestions]);

  useEffect(() => {
    return () => { if (aiDebounceRef.current) clearTimeout(aiDebounceRef.current); };
  }, []);

  // Initialize history with initial value
  useEffect(() => {
    if (history.length === 1 && history[0].value === "" && value !== "") {
      setHistory([{ value, cursorPositions: [0] }]);
    }
  }, []);

  // Calculate line start indices for highlight matching
  const lineStartIndices = useMemo(() => {
    const indices: number[] = [0];
    let currentIndex = 0;
    for (const line of lines) {
      currentIndex += line.length + 1;
      indices.push(currentIndex);
    }
    return indices;
  }, [lines]);

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      {/* Toolbar with undo/redo and find */}
      <div className="flex items-center gap-1 mb-2 px-1 flex-wrap">
        <Button variant="ghost" size="sm" onClick={undo} disabled={!canUndo} className="h-7 px-2">
          <Undo2 className="h-3.5 w-3.5 mr-1" />
          <span className="text-xs hidden sm:inline">Undo</span>
          <kbd className="ml-1.5 text-[10px] text-muted-foreground hidden sm:inline">⌘Z</kbd>
        </Button>
        <Button variant="ghost" size="sm" onClick={redo} disabled={!canRedo} className="h-7 px-2">
          <Redo2 className="h-3.5 w-3.5 mr-1" />
          <span className="text-xs hidden sm:inline">Redo</span>
          <kbd className="ml-1.5 text-[10px] text-muted-foreground hidden sm:inline">⌘⇧Z</kbd>
        </Button>
        <div className="w-px h-4 bg-border mx-1" />
        <Button 
          variant={showFindReplace ? "secondary" : "ghost"} 
          size="sm" 
          onClick={() => setShowFindReplace(!showFindReplace)} 
          className="h-7 px-2"
        >
          <Search className="h-3.5 w-3.5 mr-1" />
          <span className="text-xs hidden sm:inline">Find</span>
          <kbd className="ml-1.5 text-[10px] text-muted-foreground hidden sm:inline">⌘F</kbd>
        </Button>
        <div className="flex-1" />
        {cursors.length > 1 && (
          <span className="text-xs text-muted-foreground">
            {cursors.length} cursors
          </span>
        )}
        {matchedBracket && (
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Brackets matched
          </span>
        )}
        <span className="text-[10px] text-muted-foreground hidden md:inline">
          Alt+Click: multi-cursor • ⌘D: add next
        </span>
      </div>

      {/* Find and Replace Panel */}
      {showFindReplace && (
        <div className="flex flex-col gap-2 mb-2 p-2 bg-muted/50 rounded-md border border-border">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[150px]">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
                placeholder="Find..."
                className="h-7 pl-7 text-xs"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.shiftKey ? findPrevious() : findNext();
                  }
                }}
              />
            </div>
            <Toggle
              pressed={useRegex}
              onPressedChange={setUseRegex}
              size="sm"
              className="h-7 w-7 p-0"
              title="Use Regex"
            >
              <Regex className="h-3 w-3" />
            </Toggle>
            <Toggle
              pressed={caseSensitive}
              onPressedChange={setCaseSensitive}
              size="sm"
              className="h-7 w-7 p-0"
              title="Case Sensitive"
            >
              <CaseSensitive className="h-3 w-3" />
            </Toggle>
            <Toggle
              pressed={wholeWord}
              onPressedChange={setWholeWord}
              size="sm"
              className="h-7 w-7 p-0"
              title="Whole Word"
            >
              <WholeWord className="h-3 w-3" />
            </Toggle>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {findMatches.length > 0 ? `${currentMatchIndex + 1}/${findMatches.length}` : "No results"}
            </span>
            <Button variant="ghost" size="sm" onClick={findPrevious} className="h-7 px-2" disabled={findMatches.length === 0}>
              ↑
            </Button>
            <Button variant="ghost" size="sm" onClick={findNext} className="h-7 px-2" disabled={findMatches.length === 0}>
              ↓
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowFindReplace(false)} className="h-7 w-7 p-0">
              <X className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[150px]">
              <Replace className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                placeholder="Replace..."
                className="h-7 pl-7 text-xs"
              />
            </div>
            <Button variant="outline" size="sm" onClick={replaceCurrentMatch} className="h-7 text-xs" disabled={findMatches.length === 0}>
              Replace
            </Button>
            <Button variant="outline" size="sm" onClick={replaceAllMatches} className="h-7 text-xs" disabled={findMatches.length === 0}>
              Replace All
            </Button>
          </div>
        </div>
      )}

      {/* Hidden mirror div for cursor position calculation */}
      <div
        ref={mirrorRef}
        className="absolute opacity-0 pointer-events-none font-mono text-sm whitespace-pre-wrap break-words"
        style={{ width: textareaRef.current?.clientWidth, padding: "0.5rem 0.75rem", paddingLeft: "3.5rem", lineHeight: "1.5" }}
        aria-hidden="true"
      />
      
      <div className="relative flex border border-input rounded-md overflow-hidden bg-background">
        {/* Line numbers with fold toggles */}
        <div 
          className="line-numbers flex-shrink-0 bg-muted/30 border-r border-border overflow-hidden select-none"
          style={{ width: "48px" }}
        >
          <div className="py-3 font-mono text-xs text-muted-foreground" style={{ lineHeight: "1.5" }}>
            {visibleLines.map((line) => {
              const region = foldableRegions.find(r => r.startLine === line.lineNumber - 1);
              const isFoldable = line.canFold && region;
              const isCollapsed = isFoldable && collapsedRegions.has(region!.startLine);
              
              return (
                <div 
                  key={line.lineNumber} 
                  className="flex items-center justify-end pr-1 h-[1.5em] group"
                >
                  {isFoldable ? (
                    <button
                      onClick={() => toggleFold(region!.startLine)}
                      className="w-4 h-4 flex items-center justify-center hover:bg-accent rounded mr-0.5 opacity-50 group-hover:opacity-100 transition-opacity"
                    >
                      {isCollapsed ? (
                        <ChevronRight className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </button>
                  ) : (
                    <span className="w-4 mr-0.5" />
                  )}
                  <span className="w-5 text-right">{line.lineNumber}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Code area */}
        <div className="flex-1 relative">
          {/* Syntax highlighting overlay */}
          <div
            className="highlight-overlay absolute inset-0 py-3 px-3 font-mono text-sm whitespace-pre overflow-hidden pointer-events-none"
            style={{ lineHeight: "1.5" }}
          >
            {visibleLines.map((line, index) => {
              const actualLineIndex = line.lineNumber - 1;
              const lineStartIndex = lineStartIndices[actualLineIndex] || 0;
              
              return (
                <div 
                  key={`${line.lineNumber}-${index}`} 
                  className={cn("h-[1.5em]", line.isCollapsed && "text-muted-foreground italic")}
                  dangerouslySetInnerHTML={{ __html: highlightLine(line.content, lineStartIndex) || "&nbsp;" }}
                />
              );
            })}
          </div>
          
          {/* Multi-cursor indicators */}
          {cursors.length > 1 && cursors.map((cursor) => {
            const textBefore = value.substring(0, cursor.pos);
            const linesB = textBefore.split("\n");
            const lineIndex = linesB.length - 1;
            const charIndex = linesB[linesB.length - 1].length;
            
            return (
              <div
                key={cursor.id}
                className="absolute w-0.5 h-[1.3em] bg-primary animate-pulse pointer-events-none z-20"
                style={{
                  top: `calc(0.75rem + ${lineIndex * 1.5}em)`,
                  left: `calc(0.75rem + ${charIndex * 0.6}em)`,
                }}
              />
            );
          })}
          
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            onClick={handleClick}
            placeholder={placeholder}
            className="w-full min-h-[200px] md:min-h-[300px] py-3 px-3 font-mono text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-ring resize-y relative z-10"
            style={{ caretColor: "hsl(var(--foreground))", color: "transparent", lineHeight: "1.5" }}
            spellCheck={false}
          />
        </div>

        {/* Minimap */}
        <div
          ref={minimapRef}
          className="hidden md:block w-16 flex-shrink-0 bg-muted/20 border-l border-border cursor-pointer overflow-hidden relative"
          onClick={handleMinimapClick}
        >
          <div className="p-1 overflow-hidden" style={{ maxHeight: "100%" }}>
            {minimapLines}
          </div>
          
          {/* Viewport indicator */}
          <div
            className="absolute left-0 right-0 bg-foreground/10 border border-foreground/20 rounded-sm pointer-events-none"
            style={{
              top: `${minimapScrollRatio * 80}%`,
              height: "20%",
              maxHeight: "40px",
              minHeight: "10px"
            }}
          />
        </div>
      </div>
      
      {/* Suggestions popup */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 bg-popover border border-border rounded-lg shadow-xl overflow-hidden"
          style={{ top: cursorPosition.top + 40, left: cursorPosition.left, minWidth: "280px", maxWidth: "360px" }}
        >
          <ScrollArea className="max-h-[240px]">
            <div className="py-1">
              {suggestions.some(s => s.isAI) && (
                <div className="px-3 py-1 text-xs text-muted-foreground flex items-center gap-1 border-b border-border mb-1">
                  <Sparkles className="h-3 w-3 text-pink-400" /> AI Suggestions
                </div>
              )}
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.label}-${index}`}
                  data-index={index}
                  onClick={() => applySuggestion(suggestion)}
                  className={cn(
                    "w-full px-3 py-1.5 text-left flex items-center gap-2 text-sm transition-colors",
                    index === selectedIndex ? "bg-accent text-accent-foreground" : "hover:bg-accent/50",
                    suggestion.isAI && "bg-pink-500/5"
                  )}
                >
                  <span className={cn("w-5 text-center", kindColors[suggestion.kind])}>{kindIcons[suggestion.kind]}</span>
                  <span className="font-mono flex-1 truncate">{suggestion.label}</span>
                  {suggestion.detail && <span className="text-xs text-muted-foreground truncate max-w-[120px]">{suggestion.detail}</span>}
                </button>
              ))}
            </div>
          </ScrollArea>
          <div className="px-3 py-1.5 border-t border-border bg-muted/50 text-xs text-muted-foreground flex items-center gap-2">
            {isLoadingAI && (
              <span className="flex items-center gap-1 text-pink-400">
                <Loader2 className="h-3 w-3 animate-spin" /> AI thinking...
              </span>
            )}
            <span className="flex items-center gap-1"><kbd className="px-1 bg-background rounded text-[10px]">↑↓</kbd> navigate</span>
            <span className="flex items-center gap-1"><kbd className="px-1 bg-background rounded text-[10px]">Tab</kbd> accept</span>
          </div>
        </div>
      )}
    </div>
  );
};
