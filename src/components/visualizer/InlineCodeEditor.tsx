import { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Suggestion {
  label: string;
  detail?: string;
  insertText: string;
  kind: "keyword" | "function" | "variable" | "method" | "property" | "snippet";
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
};

const kindColors: Record<string, string> = {
  keyword: "text-purple-400",
  function: "text-yellow-400",
  variable: "text-blue-400",
  method: "text-green-400",
  property: "text-cyan-400",
  snippet: "text-orange-400",
};

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);

  // Extract variables from current code for context-aware suggestions
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

  // Filter suggestions based on current input
  const filterSuggestions = useCallback((word: string, code: string): Suggestion[] => {
    if (!word || word.length < 1) return [];
    
    const localVars = extractVariables(code);
    const allSuggestions = [...JAVASCRIPT_SUGGESTIONS, ...localVars];
    
    const lowerWord = word.toLowerCase();
    return allSuggestions
      .filter(s => s.label.toLowerCase().includes(lowerWord))
      .sort((a, b) => {
        // Prioritize exact prefix matches
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
    
    // Create mirror content
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
  }, [onChange, getCurrentWord, filterSuggestions, updateCursorPosition]);

  // Apply selected suggestion
  const applySuggestion = useCallback((suggestion: Suggestion) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart;
    const { word, startIndex } = getCurrentWord(value, cursorPos);
    
    // Calculate what part of the suggestion to insert
    let insertText = suggestion.insertText;
    if (word.startsWith(".") && suggestion.insertText.startsWith(".")) {
      // Don't duplicate the dot
      insertText = suggestion.insertText;
    } else if (!word.startsWith(".") && suggestion.insertText.startsWith(".")) {
      // Adding method to existing variable
      insertText = suggestion.insertText;
    }
    
    const newValue = value.slice(0, startIndex) + insertText + value.slice(cursorPos);
    onChange(newValue);
    
    setShowSuggestions(false);
    setSuggestions([]);
    
    // Set cursor position after insertion
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = startIndex + insertText.length;
        // Position cursor inside parentheses if applicable
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

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;
    
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        break;
      case "Tab":
      case "Enter":
        if (showSuggestions && suggestions[selectedIndex]) {
          e.preventDefault();
          applySuggestion(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setShowSuggestions(false);
        break;
    }
  }, [showSuggestions, suggestions, selectedIndex, applySuggestion]);

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
      
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full min-h-[200px] md:min-h-[300px] p-3 font-mono text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-y"
        spellCheck={false}
      />
      
      {/* Suggestions popup */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 bg-popover border border-border rounded-lg shadow-xl overflow-hidden"
          style={{
            top: cursorPosition.top,
            left: cursorPosition.left,
            minWidth: "240px",
            maxWidth: "320px",
          }}
        >
          <ScrollArea className="max-h-[200px]">
            <div className="py-1">
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.label}-${index}`}
                  data-index={index}
                  onClick={() => applySuggestion(suggestion)}
                  className={cn(
                    "w-full px-3 py-1.5 text-left flex items-center gap-2 text-sm transition-colors",
                    index === selectedIndex
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50"
                  )}
                >
                  <span className={cn("w-5 text-center", kindColors[suggestion.kind])}>
                    {kindIcons[suggestion.kind]}
                  </span>
                  <span className="font-mono flex-1 truncate">{suggestion.label}</span>
                  {suggestion.detail && (
                    <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                      {suggestion.detail}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
          <div className="px-3 py-1.5 border-t border-border bg-muted/50 text-xs text-muted-foreground flex items-center gap-2">
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
