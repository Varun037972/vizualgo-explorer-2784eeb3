import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

export interface ShareableVisualizationState {
  algorithm: string;
  array: number[];
  speed: number;
  showExplanation: boolean;
}

export const useShareableState = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse state from URL
  const parseStateFromURL = useCallback((): Partial<ShareableVisualizationState> | null => {
    const encoded = searchParams.get("state");
    if (!encoded) return null;

    try {
      const decoded = atob(encoded);
      const state = JSON.parse(decoded) as ShareableVisualizationState;
      
      // Validate the parsed state
      if (
        state.algorithm &&
        Array.isArray(state.array) &&
        state.array.length > 0 &&
        state.array.every((n) => typeof n === "number" && n > 0 && n <= 100)
      ) {
        return state;
      }
      return null;
    } catch {
      return null;
    }
  }, [searchParams]);

  // Generate shareable URL
  const generateShareableURL = useCallback(
    (state: ShareableVisualizationState): string => {
      const stateString = JSON.stringify(state);
      const encoded = btoa(stateString);
      
      const url = new URL(window.location.href);
      url.searchParams.set("state", encoded);
      
      return url.toString();
    },
    []
  );

  // Copy shareable URL to clipboard
  const copyShareableURL = useCallback(
    async (state: ShareableVisualizationState): Promise<boolean> => {
      try {
        const url = generateShareableURL(state);
        await navigator.clipboard.writeText(url);
        toast.success("Share link copied to clipboard!");
        return true;
      } catch (error) {
        toast.error("Failed to copy link");
        return false;
      }
    },
    [generateShareableURL]
  );

  // Clear state from URL
  const clearStateFromURL = useCallback(() => {
    searchParams.delete("state");
    setSearchParams(searchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  // Check if URL has shared state
  const hasSharedState = searchParams.has("state");

  return {
    parseStateFromURL,
    generateShareableURL,
    copyShareableURL,
    clearStateFromURL,
    hasSharedState,
  };
};
