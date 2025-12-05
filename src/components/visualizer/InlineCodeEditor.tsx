import { useState, useRef, useEffect, useCallback, KeyboardEvent, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Suggestion {
  label: string;
  detail?: string;
  insertText: string;
  kind: "keyword" | "function" | "variable" | "method" | "property" | "snippet" | "ai";
  isAI?: boolean;
}

const JAVASCRIPT_SUGGESTIONS: Suggestion[] = [
  // Keywords
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
  
  // Console methods
  { label: "console.log", detail: "Log to console", insertText: "console.log()", kind: "function" },
  { label: "console.error", detail: "Log error", insertText: "console.error()", kind: "function" },
  { label: "console.warn", detail: "Log warning", insertText: "console.warn()", kind: "function" },
  
  // Array methods
  { label: ".push", detail: "Add to end of array", insertText: ".push()", kind: "method" },
  { label: ".pop", detail: "Remove from end", insertText: ".pop()", kind: "method" },
  { label: ".shift", detail: "Remove from start", insertText: ".shift()", kind: "method" },
  { label: ".unshift", detail: "Add to start", insertText: ".unshift()", kind: "method" },
  { label: ".map", detail: "Transform array", insertText: ".map((item) => )", kind: "method" },
  { label: ".filter", detail: "Filter array", insertText: ".filter((item) => )", kind: "method" },
  { label: ".reduce", detail: "Reduce array", insertText: ".reduce((acc, item) => , )", kind: "method" },
  { label: ".forEach", detail: "Iterate array", insertText: ".forEach((item) => )", kind: "method" },
  { label: ".find", detail: "Find element", insertText: ".find((item) => )", kind: "method" },
  { label: ".indexOf", detail: "Find index", insertText: ".indexOf()", kind: "method" },
  { label: ".includes", detail: "Check if includes", insertText: ".includes()", kind: "method" },
  { label: ".slice", detail: "Extract portion", insertText: ".slice()", kind: "method" },
  { label: ".splice", detail: "Modify array", insertText: ".splice()", kind: "method" },
  { label: ".sort", detail: "Sort array", insertText: ".sort((a, b) => a - b)", kind: "method" },
  { label: ".reverse", detail: "Reverse array", insertText: ".reverse()", kind: "method" },
  { label: ".join", detail: "Join to string", insertText: ".join()", kind: "method" },
  { label: ".length", detail: "Array/string length", insertText: ".length", kind: "property" },
  
  // String methods
  { label: ".toLowerCase", detail: "Convert to lowercase", insertText: ".toLowerCase()", kind: "method" },
  { label: ".toUpperCase", detail: "Convert to uppercase", insertText: ".toUpperCase()", kind: "method" },
  { label: ".split", detail: "Split string", insertText: ".split()", kind: "method" },
  { label: ".trim", detail: "Trim whitespace", insertText: ".trim()", kind: "method" },
  { label: ".charAt", detail: "Get character at", insertText: ".charAt()", kind: "method" },
  { label: ".substring", detail: "Get substring", insertText: ".substring()", kind: "method" },
  { label: ".replace", detail: "Replace text", insertText: ".replace()", kind: "method" },
  
  // Math functions
  { label: "Math.floor", detail: "Round down", insertText: "Math.floor()", kind: "function" },
  { label: "Math.ceil", detail: "Round up", insertText: "Math.ceil()", kind: "function" },
  { label: "Math.round", detail: "Round to nearest", insertText: "Math.round()", kind: "function" },
  { label: "Math.abs", detail: "Absolute value", insertText: "Math.abs()", kind: "function" },
  { label: "Math.sqrt", detail: "Square root", insertText: "Math.sqrt()", kind: "function" },
  { label: "Math.pow", detail: "Power", insertText: "Math.pow()", kind: "function" },
  { label: "Math.min", detail: "Minimum value", insertText: "Math.min()", kind: "function" },
  { label: "Math.max", detail: "Maximum value", insertText: "Math.max()", kind: "function" },
  { label: "Math.random", detail: "Random number", insertText: "Math.random()", kind: "function" },
  
  // Common snippets
  { label: "for-loop", detail: "For loop snippet", insertText: "for (let i = 0; i < arr.length; i++) {\n  \n}", kind: "snippet" },
  { label: "for-of", detail: "For...of loop", insertText: "for (const item of arr) {\n  \n}", kind: "snippet" },
  { label: "if-else", detail: "If-else block", insertText: "if (condition) {\n  \n} else {\n  \n}", kind: "snippet" },
  { label: "function-arrow", detail: "Arrow function", insertText: "const func = () => {\n  \n};", kind: "snippet" },
  { label: "try-catch", detail: "Try-catch block", insertText: "try {\n  \n} catch (error) {\n  console.error(error);\n}", kind: "snippet" },
  { label: "array-init", detail: "Array initialization", insertText: "const arr = [];", kind: "snippet" },
  { label: "swap", detail: "Swap two elements", insertText: "let temp = arr[i];\narr[i] = arr[j];\narr[j] = temp;", kind: "snippet" },
];

const kindIcons: Record<string, string> = {
  keyword: "🔑",
  function: "ƒ",
  variable: "𝑥",
  method: "◦",
  property: "●",
  snippet: "⧉",
  ai: "✨",
};

const kindColors: Record<string, string> = {
  keyword: "text-purple-400",
  function: "text-yellow-400",
  variable: "text-blue-400",
  method: "text-green-400",
  property: "text-cyan-400",
  snippet: "text-orange-400",
  ai: "text-pink-400",
};

// Bracket pairs for auto-closing
const BRACKET_PAIRS: Record<string, string> = {
  "(": ")",
  "[": "]",
  "{": "}",
  '"': '"',
  "'": "'",
  "`": "`",
};

const CLOSING_BRACKETS = new Set(Object.values(BRACKET_PAIRS));

// Syntax highlighting token types
type TokenType = "keyword" | "string" | "number" | "comment" | "function" | "operator" | "variable" | "property" | "bracket" | "default";

interface Token {
  type: TokenType;
  value: string;
}

// JavaScript keywords for highlighting
const JS_KEYWORDS = new Set([
  "let", "const", "var", "function", "return", "if", "else", "for", "while",
  "switch", "case", "break", "continue", "true", "false", "null", "undefined",
  "new", "this", "class", "extends", "import", "export", "default", "try",
  "catch", "finally", "throw", "async", "await", "typeof", "instanceof", "in", "of"
]);

// Built-in objects/functions
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const aiDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Tokenize code for syntax highlighting
  const tokenize = useCallback((code: string): Token[] => {
    const tokens: Token[] = [];
    let i = 0;

    while (i < code.length) {
      // Comments
      if (code.slice(i, i + 2) === "//") {
        let end = i;
        while (end < code.length && code[end] !== "\n") end++;
        tokens.push({ type: "comment", value: code.slice(i, end) });
        i = end;
        continue;
      }

      // Multi-line comments
      if (code.slice(i, i + 2) === "/*") {
        let end = code.indexOf("*/", i + 2);
        if (end === -1) end = code.length;
        else end += 2;
        tokens.push({ type: "comment", value: code.slice(i, end) });
        i = end;
        continue;
      }

      // Strings
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

      // Numbers
      if (/\d/.test(code[i]) || (code[i] === "." && /\d/.test(code[i + 1]))) {
        let end = i;
        while (end < code.length && /[\d.eE+-]/.test(code[end])) end++;
        tokens.push({ type: "number", value: code.slice(i, end) });
        i = end;
        continue;
      }

      // Identifiers and keywords
      if (/[a-zA-Z_$]/.test(code[i])) {
        let end = i;
        while (end < code.length && /[\w$]/.test(code[end])) end++;
        const word = code.slice(i, end);
        
        let type: TokenType = "default";
        if (JS_KEYWORDS.has(word)) {
          type = "keyword";
        } else if (JS_BUILTINS.has(word)) {
          type = "function";
        } else if (code[end] === "(") {
          type = "function";
        } else if (i > 0 && code[i - 1] === ".") {
          type = "property";
        } else {
          type = "variable";
        }
        
        tokens.push({ type, value: word });
        i = end;
        continue;
      }

      // Operators
      if (/[+\-*/%=<>!&|^~?:]/.test(code[i])) {
        let end = i;
        while (end < code.length && /[+\-*/%=<>!&|^~?:]/.test(code[end])) end++;
        tokens.push({ type: "operator", value: code.slice(i, end) });
        i = end;
        continue;
      }

      // Brackets
      if (/[()[\]{}]/.test(code[i])) {
        tokens.push({ type: "bracket", value: code[i] });
        i++;
        continue;
      }

      // Default (whitespace, punctuation, etc.)
      tokens.push({ type: "default", value: code[i] });
      i++;
    }

    return tokens;
  }, []);

  // Generate highlighted HTML from tokens
  const highlightedCode = useMemo(() => {
    const tokens = tokenize(value);
    return tokens.map((token, i) => {
      const colorClass = {
        keyword: "text-purple-400",
        string: "text-green-400",
        number: "text-orange-400",
        comment: "text-muted-foreground italic",
        function: "text-yellow-400",
        operator: "text-cyan-400",
        variable: "text-blue-300",
        property: "text-cyan-300",
        bracket: "text-foreground",
        default: "text-foreground",
      }[token.type];
      
      // Escape HTML
      const escaped = token.value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/ /g, "&nbsp;")
        .replace(/\n/g, "<br/>");
      
      return `<span class="${colorClass}">${escaped}</span>`;
    }).join("");
  }, [value, tokenize]);

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

  // Update bracket matching on cursor change
  const updateBracketMatching = useCallback(() => {
    if (!textareaRef.current) return;
    const pos = textareaRef.current.selectionStart;
    const match = findMatchingBracket(value, pos) || findMatchingBracket(value, pos - 1);
    setMatchedBracket(match);
  }, [value, findMatchingBracket]);

  // Extract variables from current code
  const extractVariables = useCallback((code: string): Suggestion[] => {
    const varMatches = code.matchAll(/(?:let|const|var)\s+(\w+)/g);
    const vars: Suggestion[] = [];
    for (const match of varMatches) {
      if (!vars.find(v => v.label === match[1])) {
        vars.push({
          label: match[1],
          detail: "Local variable",
          insertText: match[1],
          kind: "variable",
        });
      }
    }
    return vars;
  }, []);

  // Get current word being typed
  const getCurrentWord = useCallback((text: string, cursorPos: number): { word: string; startIndex: number } => {
    let startIndex = cursorPos;
    while (startIndex > 0 && /[\w.]/.test(text[startIndex - 1])) {
      startIndex--;
    }
    return {
      word: text.slice(startIndex, cursorPos),
      startIndex,
    };
  }, []);

  // Get current line for AI context
  const getCurrentLine = useCallback((text: string, cursorPos: number): string => {
    let lineStart = cursorPos;
    while (lineStart > 0 && text[lineStart - 1] !== "\n") lineStart--;
    let lineEnd = cursorPos;
    while (lineEnd < text.length && text[lineEnd] !== "\n") lineEnd++;
    return text.slice(lineStart, lineEnd);
  }, []);

  // Fetch AI suggestions
  const fetchAISuggestions = useCallback(async (code: string, currentLine: string): Promise<Suggestion[]> => {
    try {
      const response = await supabase.functions.invoke("analyze-code", {
        body: {
          language: "javascript",
          user_code: code,
          suggest_completions: true,
          current_line: currentLine,
        },
      });

      if (response.error) return [];
      
      const suggestions = response.data?.suggestions || [];
      return suggestions.slice(0, 3).map((s: { label: string; detail: string; insertText: string }) => ({
        label: s.label || "AI suggestion",
        detail: s.detail || "AI-powered completion",
        insertText: s.insertText || s.label,
        kind: "ai" as const,
        isAI: true,
      }));
    } catch {
      return [];
    }
  }, []);

  // Filter suggestions based on current input
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

  // Calculate cursor position for suggestion popup
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
      left: Math.min(spanRect.left - mirrorRect.left, rect.width - 250),
    });
  }, []);

  // Handle auto-closing brackets
  const handleAutoClose = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return false;

    const { selectionStart, selectionEnd } = textarea;
    const char = e.key;

    // Auto-close opening brackets
    if (BRACKET_PAIRS[char]) {
      e.preventDefault();
      const closeChar = BRACKET_PAIRS[char];
      const selectedText = value.slice(selectionStart, selectionEnd);
      
      if (selectedText) {
        // Wrap selection
        const newValue = value.slice(0, selectionStart) + char + selectedText + closeChar + value.slice(selectionEnd);
        onChange(newValue);
        setTimeout(() => {
          textarea.selectionStart = selectionStart + 1;
          textarea.selectionEnd = selectionEnd + 1;
        }, 0);
      } else {
        // Insert pair
        const newValue = value.slice(0, selectionStart) + char + closeChar + value.slice(selectionEnd);
        onChange(newValue);
        setTimeout(() => {
          textarea.selectionStart = selectionStart + 1;
          textarea.selectionEnd = selectionStart + 1;
        }, 0);
      }
      return true;
    }

    // Skip over closing brackets if already there
    if (CLOSING_BRACKETS.has(char) && value[selectionStart] === char) {
      e.preventDefault();
      setTimeout(() => {
        textarea.selectionStart = selectionStart + 1;
        textarea.selectionEnd = selectionStart + 1;
      }, 0);
      return true;
    }

    // Handle backspace to delete bracket pairs
    if (e.key === "Backspace" && selectionStart === selectionEnd && selectionStart > 0) {
      const prevChar = value[selectionStart - 1];
      const nextChar = value[selectionStart];
      if (BRACKET_PAIRS[prevChar] === nextChar) {
        e.preventDefault();
        const newValue = value.slice(0, selectionStart - 1) + value.slice(selectionStart + 1);
        onChange(newValue);
        setTimeout(() => {
          textarea.selectionStart = selectionStart - 1;
          textarea.selectionEnd = selectionStart - 1;
        }, 0);
        return true;
      }
    }

    return false;
  }, [value, onChange]);

  // Handle input changes
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    onChange(newValue);
    
    const { word } = getCurrentWord(newValue, cursorPos);
    const filtered = filterSuggestions(word, newValue);
    
    setSuggestions(filtered);
    setSelectedIndex(0);
    setShowSuggestions(filtered.length > 0);
    
    setTimeout(updateCursorPosition, 0);
    setTimeout(updateBracketMatching, 0);

    // Debounced AI suggestions
    if (aiDebounceRef.current) {
      clearTimeout(aiDebounceRef.current);
    }
    
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
  }, [onChange, getCurrentWord, filterSuggestions, updateCursorPosition, updateBracketMatching, getCurrentLine, fetchAISuggestions]);

  // Apply selected suggestion
  const applySuggestion = useCallback((suggestion: Suggestion) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart;
    const { startIndex } = getCurrentWord(value, cursorPos);
    
    let insertText = suggestion.insertText;
    
    const newValue = value.slice(0, startIndex) + insertText + value.slice(cursorPos);
    onChange(newValue);
    
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
  }, [value, onChange, getCurrentWord]);

  // Handle keyboard events
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle auto-closing first
    if (handleAutoClose(e)) return;

    // Handle suggestion navigation
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
        case "Escape":
          e.preventDefault();
          setShowSuggestions(false);
          return;
      }
    }

    // Update bracket matching on arrow keys
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
      setTimeout(updateBracketMatching, 0);
    }
  }, [showSuggestions, suggestions, selectedIndex, applySuggestion, handleAutoClose, updateBracketMatching]);

  // Sync scroll between textarea and highlight overlay
  const handleScroll = useCallback(() => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(e.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll selected suggestion into view
  useEffect(() => {
    if (suggestionsRef.current && showSuggestions) {
      const selectedElement = suggestionsRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      selectedElement?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex, showSuggestions]);

  // Cleanup AI debounce on unmount
  useEffect(() => {
    return () => {
      if (aiDebounceRef.current) {
        clearTimeout(aiDebounceRef.current);
      }
    };
  }, []);

  return (
    <div className={cn("relative", className)}>
      {/* Hidden mirror div for cursor position calculation */}
      <div
        ref={mirrorRef}
        className="absolute opacity-0 pointer-events-none font-mono text-sm whitespace-pre-wrap break-words"
        style={{ 
          width: textareaRef.current?.clientWidth,
          padding: "0.5rem 0.75rem",
          lineHeight: "1.5",
        }}
        aria-hidden="true"
      />
      
      {/* Syntax highlighting overlay */}
      <div
        ref={highlightRef}
        className="absolute inset-0 p-3 font-mono text-sm whitespace-pre-wrap break-words overflow-hidden pointer-events-none z-0"
        style={{ lineHeight: "1.5" }}
        dangerouslySetInnerHTML={{ __html: highlightedCode || `<span class="text-muted-foreground">${placeholder || ""}</span>` }}
      />
      
      {/* Textarea (transparent text, visible caret) */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onScroll={handleScroll}
        onClick={updateBracketMatching}
        placeholder=""
        className="w-full min-h-[200px] md:min-h-[300px] p-3 font-mono text-sm bg-transparent border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-y relative z-10"
        style={{ 
          caretColor: "hsl(var(--foreground))",
          color: "transparent",
          lineHeight: "1.5",
        }}
        spellCheck={false}
      />

      {/* Bracket matching indicator */}
      {matchedBracket && (
        <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-muted/80 px-2 py-1 rounded">
          Brackets matched: {value[matchedBracket.open]} ... {value[matchedBracket.close]}
        </div>
      )}
      
      {/* Suggestions popup */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 bg-popover border border-border rounded-lg shadow-xl overflow-hidden"
          style={{
            top: cursorPosition.top,
            left: cursorPosition.left,
            minWidth: "280px",
            maxWidth: "360px",
          }}
        >
          <ScrollArea className="max-h-[240px]">
            <div className="py-1">
              {/* AI suggestions section */}
              {suggestions.some(s => s.isAI) && (
                <div className="px-3 py-1 text-xs text-muted-foreground flex items-center gap-1 border-b border-border mb-1">
                  <Sparkles className="h-3 w-3 text-pink-400" />
                  AI Suggestions
                </div>
              )}
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.label}-${index}`}
                  data-index={index}
                  onClick={() => applySuggestion(suggestion)}
                  className={cn(
                    "w-full px-3 py-1.5 text-left flex items-center gap-2 text-sm transition-colors",
                    index === selectedIndex
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50",
                    suggestion.isAI && "bg-pink-500/5"
                  )}
                >
                  <span className={cn("w-5 text-center", kindColors[suggestion.kind])}>
                    {kindIcons[suggestion.kind]}
                  </span>
                  <span className="font-mono flex-1 truncate">{suggestion.label}</span>
                  {suggestion.detail && (
                    <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                      {suggestion.detail}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
          <div className="px-3 py-1.5 border-t border-border bg-muted/50 text-xs text-muted-foreground flex items-center gap-2">
            {isLoadingAI && (
              <span className="flex items-center gap-1 text-pink-400">
                <Loader2 className="h-3 w-3 animate-spin" />
                AI thinking...
              </span>
            )}
            <span className="flex items-center gap-1">
              <kbd className="px-1 bg-background rounded text-[10px]">↑↓</kbd> navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 bg-background rounded text-[10px]">Tab</kbd> accept
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 bg-background rounded text-[10px]">Esc</kbd> dismiss
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
