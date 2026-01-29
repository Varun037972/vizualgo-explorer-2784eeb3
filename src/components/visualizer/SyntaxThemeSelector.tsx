import { Palette } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export type SyntaxTheme = "monokai" | "github-dark" | "dracula" | "one-dark-pro" | "nord";

interface SyntaxThemeSelectorProps {
  value: SyntaxTheme;
  onChange: (theme: SyntaxTheme) => void;
}

export const syntaxThemes: Record<
  SyntaxTheme,
  {
    name: string;
    background: string;
    foreground: string;
    keyword: string;
    string: string;
    number: string;
    comment: string;
    function: string;
    operator: string;
    variable: string;
    property: string;
    bracket: string;
    lineNumber: string;
    lineNumberActive: string;
    selection: string;
  }
> = {
  monokai: {
    name: "Monokai",
    background: "#272822",
    foreground: "#f8f8f2",
    keyword: "#f92672",
    string: "#e6db74",
    number: "#ae81ff",
    comment: "#75715e",
    function: "#a6e22e",
    operator: "#f92672",
    variable: "#f8f8f2",
    property: "#66d9ef",
    bracket: "#f8f8f2",
    lineNumber: "#75715e",
    lineNumberActive: "#f8f8f2",
    selection: "#49483e",
  },
  "github-dark": {
    name: "GitHub Dark",
    background: "#0d1117",
    foreground: "#c9d1d9",
    keyword: "#ff7b72",
    string: "#a5d6ff",
    number: "#79c0ff",
    comment: "#8b949e",
    function: "#d2a8ff",
    operator: "#ff7b72",
    variable: "#ffa657",
    property: "#79c0ff",
    bracket: "#c9d1d9",
    lineNumber: "#484f58",
    lineNumberActive: "#c9d1d9",
    selection: "#264f78",
  },
  dracula: {
    name: "Dracula",
    background: "#282a36",
    foreground: "#f8f8f2",
    keyword: "#ff79c6",
    string: "#f1fa8c",
    number: "#bd93f9",
    comment: "#6272a4",
    function: "#50fa7b",
    operator: "#ff79c6",
    variable: "#f8f8f2",
    property: "#8be9fd",
    bracket: "#f8f8f2",
    lineNumber: "#6272a4",
    lineNumberActive: "#f8f8f2",
    selection: "#44475a",
  },
  "one-dark-pro": {
    name: "One Dark Pro",
    background: "#282c34",
    foreground: "#abb2bf",
    keyword: "#c678dd",
    string: "#98c379",
    number: "#d19a66",
    comment: "#5c6370",
    function: "#61afef",
    operator: "#56b6c2",
    variable: "#e06c75",
    property: "#e5c07b",
    bracket: "#abb2bf",
    lineNumber: "#4b5263",
    lineNumberActive: "#abb2bf",
    selection: "#3e4451",
  },
  nord: {
    name: "Nord",
    background: "#2e3440",
    foreground: "#d8dee9",
    keyword: "#81a1c1",
    string: "#a3be8c",
    number: "#b48ead",
    comment: "#616e88",
    function: "#88c0d0",
    operator: "#81a1c1",
    variable: "#d8dee9",
    property: "#8fbcbb",
    bracket: "#d8dee9",
    lineNumber: "#4c566a",
    lineNumberActive: "#d8dee9",
    selection: "#434c5e",
  },
};

export const SyntaxThemeSelector = ({ value, onChange }: SyntaxThemeSelectorProps) => {
  return (
    <div className="flex items-center gap-2">
      <Palette className="h-4 w-4 text-muted-foreground" />
      <Label className="text-xs whitespace-nowrap">Theme:</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-7 text-xs w-[130px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(syntaxThemes).map(([key, theme]) => (
            <SelectItem key={key} value={key} className="text-xs">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm border border-border"
                  style={{ backgroundColor: theme.background }}
                />
                {theme.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

// CSS variables generator for themes
export const getThemeCSSVariables = (theme: SyntaxTheme): Record<string, string> => {
  const t = syntaxThemes[theme];
  return {
    "--syntax-bg": t.background,
    "--syntax-fg": t.foreground,
    "--syntax-keyword": t.keyword,
    "--syntax-string": t.string,
    "--syntax-number": t.number,
    "--syntax-comment": t.comment,
    "--syntax-function": t.function,
    "--syntax-operator": t.operator,
    "--syntax-variable": t.variable,
    "--syntax-property": t.property,
    "--syntax-bracket": t.bracket,
    "--syntax-line-number": t.lineNumber,
    "--syntax-line-number-active": t.lineNumberActive,
    "--syntax-selection": t.selection,
  };
};
