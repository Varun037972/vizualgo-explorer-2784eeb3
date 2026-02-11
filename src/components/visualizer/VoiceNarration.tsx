import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Volume2, VolumeX, Settings2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface VoiceNarrationProps {
  text?: string;
  autoNarrate?: boolean;
}

export const VoiceNarration = ({ text, autoNarrate = false }: VoiceNarrationProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [rate, setRate] = useState(0.9);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((narrationText?: string) => {
    const finalText = narrationText || text;
    if (!finalText) return;

    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(finalText);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  }, [text, rate, pitch, volume]);

  const stop = useCallback(() => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const toggle = useCallback(() => {
    if (isSpeaking) stop();
    else speak();
  }, [isSpeaking, speak, stop]);

  useEffect(() => {
    if (autoNarrate && text) speak();
  }, [text, autoNarrate]);

  useEffect(() => () => { speechSynthesis.cancel(); }, []);

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={toggle} className="gap-2 text-xs">
        {isSpeaking ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
        {isSpeaking ? "Stop" : "Narrate"}
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings2 className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 space-y-4">
          <h4 className="text-sm font-semibold">Voice Settings</h4>
          <div>
            <label className="text-xs text-muted-foreground">Speed: {rate.toFixed(1)}x</label>
            <Slider value={[rate]} onValueChange={([v]) => setRate(v)} min={0.5} max={2} step={0.1} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Pitch: {pitch.toFixed(1)}</label>
            <Slider value={[pitch]} onValueChange={([v]) => setPitch(v)} min={0.5} max={2} step={0.1} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Volume: {Math.round(volume * 100)}%</label>
            <Slider value={[volume]} onValueChange={([v]) => setVolume(v)} min={0} max={1} step={0.1} />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

// Utility hook for narrating algorithm steps
export const useVoiceNarration = () => {
  const [enabled, setEnabled] = useState(false);
  const rateRef = useRef(0.9);

  const narrate = useCallback((text: string) => {
    if (!enabled) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rateRef.current;
    speechSynthesis.speak(u);
  }, [enabled]);

  const narrateStep = useCallback((step: string, index: number, total: number) => {
    narrate(`Step ${index + 1} of ${total}: ${step}`);
  }, [narrate]);

  useEffect(() => () => { speechSynthesis.cancel(); }, []);

  return { enabled, setEnabled, narrate, narrateStep, setRate: (r: number) => { rateRef.current = r; } };
};
