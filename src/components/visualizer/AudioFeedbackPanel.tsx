import { Volume2, VolumeX, Volume1, Play, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface AudioFeedbackSettings {
  enabled: boolean;
  volume: number;
  compareFreq: number;
  swapFreq: number;
  completeFreq: number;
}

interface AudioFeedbackPanelProps {
  settings: AudioFeedbackSettings;
  onUpdateSettings: (settings: Partial<AudioFeedbackSettings>) => void;
  onReset: () => void;
  onTest: () => void;
}

export const AudioFeedbackPanel = ({
  settings,
  onUpdateSettings,
  onReset,
  onTest,
}: AudioFeedbackPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const VolumeIcon = settings.volume === 0 
    ? VolumeX 
    : settings.volume < 0.5 
      ? Volume1 
      : Volume2;

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <VolumeIcon className="h-4 w-4 text-primary" />
            Audio Feedback
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="audio-enabled"
              checked={settings.enabled}
              onCheckedChange={(enabled) => onUpdateSettings({ enabled })}
            />
          </div>
        </CardTitle>
      </CardHeader>
      
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full flex items-center justify-center gap-1 py-1 h-8 text-xs text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            {isExpanded ? "Hide Settings" : "Show Settings"}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Volume */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Volume</Label>
                <span className="text-xs text-muted-foreground">
                  {Math.round(settings.volume * 100)}%
                </span>
              </div>
              <Slider
                value={[settings.volume]}
                onValueChange={([value]) => onUpdateSettings({ volume: value })}
                min={0}
                max={1}
                step={0.05}
                disabled={!settings.enabled}
              />
            </div>

            {/* Compare Frequency */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Compare Pitch</Label>
                <span className="text-xs text-muted-foreground">
                  {settings.compareFreq}Hz
                </span>
              </div>
              <Slider
                value={[settings.compareFreq]}
                onValueChange={([value]) => onUpdateSettings({ compareFreq: value })}
                min={220}
                max={880}
                step={10}
                disabled={!settings.enabled}
              />
            </div>

            {/* Swap Frequency */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Swap Pitch</Label>
                <span className="text-xs text-muted-foreground">
                  {settings.swapFreq}Hz
                </span>
              </div>
              <Slider
                value={[settings.swapFreq]}
                onValueChange={([value]) => onUpdateSettings({ swapFreq: value })}
                min={440}
                max={1760}
                step={20}
                disabled={!settings.enabled}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onTest}
                className="flex-1 text-xs"
              >
                <Play className="h-3 w-3 mr-1" />
                Test
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                className="flex-1 text-xs"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
