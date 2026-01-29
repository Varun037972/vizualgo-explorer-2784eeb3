import { useCallback, useRef, useEffect, useState } from "react";

interface AudioFeedbackSettings {
  enabled: boolean;
  volume: number;
  compareFreq: number;
  swapFreq: number;
  completeFreq: number;
}

const DEFAULT_SETTINGS: AudioFeedbackSettings = {
  enabled: false,
  volume: 0.3,
  compareFreq: 440,
  swapFreq: 880,
  completeFreq: 523.25,
};

export const useAudioFeedback = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [settings, setSettings] = useState<AudioFeedbackSettings>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("audioFeedbackSettings");
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    }
    return DEFAULT_SETTINGS;
  });

  // Initialize AudioContext lazily
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Persist settings
  useEffect(() => {
    localStorage.setItem("audioFeedbackSettings", JSON.stringify(settings));
  }, [settings]);

  // Play a tone with given frequency and duration
  const playTone = useCallback(
    (frequency: number, duration: number = 0.1, type: OscillatorType = "sine") => {
      if (!settings.enabled) return;

      try {
        const ctx = getAudioContext();
        
        // Resume if suspended (required for some browsers)
        if (ctx.state === "suspended") {
          ctx.resume();
        }

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

        gainNode.gain.setValueAtTime(settings.volume, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
      } catch (error) {
        console.warn("Audio feedback error:", error);
      }
    },
    [settings.enabled, settings.volume, getAudioContext]
  );

  // Play comparison sound (lower pitch)
  const playCompareSound = useCallback(() => {
    playTone(settings.compareFreq, 0.05, "sine");
  }, [playTone, settings.compareFreq]);

  // Play swap sound (higher pitch)
  const playSwapSound = useCallback(() => {
    playTone(settings.swapFreq, 0.08, "triangle");
  }, [playTone, settings.swapFreq]);

  // Play completion sound (chord)
  const playCompleteSound = useCallback(() => {
    if (!settings.enabled) return;

    try {
      const ctx = getAudioContext();
      
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Play a happy chord (C major: C4, E4, G4)
      const frequencies = [settings.completeFreq, settings.completeFreq * 1.25, settings.completeFreq * 1.5];
      
      frequencies.forEach((freq, index) => {
        setTimeout(() => {
          const oscillator = ctx.createOscillator();
          const gainNode = ctx.createGain();

          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(freq, ctx.currentTime);

          gainNode.gain.setValueAtTime(settings.volume * 0.5, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

          oscillator.connect(gainNode);
          gainNode.connect(ctx.destination);

          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.5);
        }, index * 100);
      });
    } catch (error) {
      console.warn("Audio feedback error:", error);
    }
  }, [settings.enabled, settings.volume, settings.completeFreq, getAudioContext]);

  // Play a pitch based on array value (for data sonification)
  const playValueTone = useCallback(
    (value: number, maxValue: number = 100) => {
      if (!settings.enabled) return;
      
      // Map value to frequency range (220Hz - 880Hz)
      const minFreq = 220;
      const maxFreq = 880;
      const frequency = minFreq + (value / maxValue) * (maxFreq - minFreq);
      
      playTone(frequency, 0.08, "sine");
    },
    [settings.enabled, playTone]
  );

  // Test sound function
  const testSound = useCallback(() => {
    const originalEnabled = settings.enabled;
    
    // Temporarily enable for testing
    if (!originalEnabled) {
      setSettings((prev) => ({ ...prev, enabled: true }));
    }

    try {
      const ctx = getAudioContext();
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Play test sequence
      setTimeout(() => playTone(settings.compareFreq, 0.15, "sine"), 0);
      setTimeout(() => playTone(settings.swapFreq, 0.15, "triangle"), 200);
      setTimeout(() => {
        const freq = settings.completeFreq;
        playTone(freq, 0.2, "sine");
        setTimeout(() => playTone(freq * 1.25, 0.2, "sine"), 100);
        setTimeout(() => playTone(freq * 1.5, 0.3, "sine"), 200);
      }, 400);
    } catch (error) {
      console.warn("Test sound error:", error);
    }

    // Restore original state
    if (!originalEnabled) {
      setTimeout(() => {
        setSettings((prev) => ({ ...prev, enabled: false }));
      }, 1000);
    }
  }, [settings, playTone, getAudioContext]);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<AudioFeedbackSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  // Reset to defaults
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    settings,
    updateSettings,
    resetSettings,
    playCompareSound,
    playSwapSound,
    playCompleteSound,
    playValueTone,
    testSound,
  };
};
