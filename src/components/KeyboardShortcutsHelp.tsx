import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Keyboard, Play, Pause, SkipForward, SkipBack, RotateCcw, Code2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Shortcut {
  keys: string[];
  description: string;
  icon: React.ReactNode;
  category: "playback" | "navigation" | "editor" | "general";
}

const shortcuts: Shortcut[] = [
  {
    keys: ["Space"],
    description: "Play/Start visualization",
    icon: <Play className="h-4 w-4" />,
    category: "playback",
  },
  {
    keys: ["P"],
    description: "Pause visualization",
    icon: <Pause className="h-4 w-4" />,
    category: "playback",
  },
  {
    keys: ["→"],
    description: "Step forward",
    icon: <SkipForward className="h-4 w-4" />,
    category: "navigation",
  },
  {
    keys: ["←"],
    description: "Step backward",
    icon: <SkipBack className="h-4 w-4" />,
    category: "navigation",
  },
  {
    keys: ["R"],
    description: "Reset / Generate new array",
    icon: <RotateCcw className="h-4 w-4" />,
    category: "general",
  },
  {
    keys: ["Ctrl", "K"],
    description: "Toggle code snippets panel",
    icon: <Code2 className="h-4 w-4" />,
    category: "editor",
  },
  {
    keys: ["Ctrl", "F"],
    description: "Find in code editor",
    icon: <Code2 className="h-4 w-4" />,
    category: "editor",
  },
  {
    keys: ["Ctrl", "H"],
    description: "Find and replace",
    icon: <Code2 className="h-4 w-4" />,
    category: "editor",
  },
  {
    keys: ["Ctrl", "Z"],
    description: "Undo in code editor",
    icon: <Code2 className="h-4 w-4" />,
    category: "editor",
  },
  {
    keys: ["Ctrl", "Shift", "Z"],
    description: "Redo in code editor",
    icon: <Code2 className="h-4 w-4" />,
    category: "editor",
  },
  {
    keys: ["Alt", "Click"],
    description: "Add cursor (multi-cursor editing)",
    icon: <Code2 className="h-4 w-4" />,
    category: "editor",
  },
  {
    keys: ["⌘", "D"],
    description: "Select next occurrence",
    icon: <Code2 className="h-4 w-4" />,
    category: "editor",
  },
];

const categoryLabels = {
  playback: "Playback",
  navigation: "Navigation",
  editor: "Code Editor",
  general: "General",
};

const categoryColors = {
  playback: "bg-blue-500/20 text-blue-500",
  navigation: "bg-green-500/20 text-green-500",
  editor: "bg-purple-500/20 text-purple-500",
  general: "bg-amber-500/20 text-amber-500",
};

interface KeyboardShortcutsHelpProps {
  triggerClassName?: string;
}

export const KeyboardShortcutsHelp = ({ triggerClassName }: KeyboardShortcutsHelpProps) => {
  const [open, setOpen] = useState(false);

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={triggerClassName}>
          <Keyboard className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Shortcuts</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-primary" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {(Object.keys(groupedShortcuts) as Array<keyof typeof categoryLabels>).map((category) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={categoryColors[category]}>
                  {categoryLabels[category]}
                </Badge>
              </div>
              <div className="space-y-2">
                {groupedShortcuts[category].map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        {shortcut.icon}
                      </div>
                      <span className="text-sm">{shortcut.description}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <span key={keyIndex} className="flex items-center gap-1">
                          <kbd className="px-2 py-1 text-xs font-mono bg-background border border-border rounded shadow-sm">
                            {key}
                          </kbd>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="text-muted-foreground text-xs">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Tip: On Mac, use ⌘ instead of Ctrl
        </div>
      </DialogContent>
    </Dialog>
  );
};
