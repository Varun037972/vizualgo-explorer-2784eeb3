import { useEffect } from "react";

interface KeyboardShortcutHandlers {
  onPlay?: () => void;
  onPause?: () => void;
  onStepForward?: () => void;
  onStepBackward?: () => void;
  onReset?: () => void;
}

export const useKeyboardShortcuts = (handlers: KeyboardShortcutHandlers) => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key) {
        case " ":
          event.preventDefault();
          handlers.onPlay?.();
          break;
        case "ArrowRight":
          event.preventDefault();
          handlers.onStepForward?.();
          break;
        case "ArrowLeft":
          event.preventDefault();
          handlers.onStepBackward?.();
          break;
        case "r":
        case "R":
          if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            handlers.onReset?.();
          }
          break;
        case "p":
        case "P":
          if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            handlers.onPause?.();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handlers]);
};
