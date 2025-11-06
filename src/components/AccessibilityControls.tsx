import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Maximize, Minimize, Palette } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const AccessibilityControls = () => {
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [largeText, setLargeText] = useState(false);

  const toggleHighContrast = (enabled: boolean) => {
    setHighContrast(enabled);
    if (enabled) {
      document.documentElement.style.setProperty('--primary', '210 100% 60%');
      document.documentElement.style.setProperty('--background', '0 0% 0%');
      document.documentElement.style.setProperty('--foreground', '0 0% 100%');
    } else {
      document.documentElement.style.setProperty('--primary', '193 100% 50%');
      document.documentElement.style.setProperty('--background', '230 35% 7%');
      document.documentElement.style.setProperty('--foreground', '210 40% 98%');
    }
  };

  const toggleReducedMotion = (enabled: boolean) => {
    setReducedMotion(enabled);
    if (enabled) {
      document.documentElement.style.setProperty('--transition-smooth', 'none');
    } else {
      document.documentElement.style.setProperty('--transition-smooth', 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)');
    }
  };

  const toggleLargeText = (enabled: boolean) => {
    setLargeText(enabled);
    if (enabled) {
      document.documentElement.style.fontSize = '120%';
    } else {
      document.documentElement.style.fontSize = '100%';
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Eye className="h-5 w-5 text-primary" />
          Accessibility
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="high-contrast" className="flex items-center gap-2 cursor-pointer">
            <Palette className="h-4 w-4" />
            High Contrast Mode
          </Label>
          <Switch
            id="high-contrast"
            checked={highContrast}
            onCheckedChange={toggleHighContrast}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="reduced-motion" className="flex items-center gap-2 cursor-pointer">
            <Minimize className="h-4 w-4" />
            Reduce Motion
          </Label>
          <Switch
            id="reduced-motion"
            checked={reducedMotion}
            onCheckedChange={toggleReducedMotion}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="large-text" className="flex items-center gap-2 cursor-pointer">
            <Maximize className="h-4 w-4" />
            Large Text
          </Label>
          <Switch
            id="large-text"
            checked={largeText}
            onCheckedChange={toggleLargeText}
          />
        </div>

        <p className="text-xs text-muted-foreground pt-2 border-t border-border">
          Keyboard shortcuts: Space (Play/Pause), Arrow Left/Right (Step), R (Reset)
        </p>
      </CardContent>
    </Card>
  );
};
