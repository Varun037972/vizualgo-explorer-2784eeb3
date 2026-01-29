import { useState, useCallback, useEffect } from "react";

export interface Bookmark {
  id: string;
  stepIndex: number;
  label: string;
  description: string;
  createdAt: number;
}

interface UseStepBookmarksOptions {
  sessionId?: string; // Optional session identifier for persistence
}

export const useStepBookmarks = (options: UseStepBookmarksOptions = {}) => {
  const { sessionId = "default" } = options;
  const storageKey = `stepBookmarks_${sessionId}`;

  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Persist bookmarks
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(bookmarks));
  }, [bookmarks, storageKey]);

  // Add a new bookmark
  const addBookmark = useCallback(
    (stepIndex: number, label?: string, description?: string): Bookmark => {
      const newBookmark: Bookmark = {
        id: `bm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        stepIndex,
        label: label || `Step ${stepIndex + 1}`,
        description: description || "",
        createdAt: Date.now(),
      };

      setBookmarks((prev) => {
        // Check if bookmark already exists at this step
        const existingIndex = prev.findIndex((b) => b.stepIndex === stepIndex);
        if (existingIndex >= 0) {
          // Update existing bookmark
          const updated = [...prev];
          updated[existingIndex] = newBookmark;
          return updated;
        }
        // Add new bookmark and sort by step index
        return [...prev, newBookmark].sort((a, b) => a.stepIndex - b.stepIndex);
      });

      return newBookmark;
    },
    []
  );

  // Remove a bookmark by ID
  const removeBookmark = useCallback((bookmarkId: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
  }, []);

  // Remove bookmark at a specific step
  const removeBookmarkAtStep = useCallback((stepIndex: number) => {
    setBookmarks((prev) => prev.filter((b) => b.stepIndex !== stepIndex));
  }, []);

  // Update a bookmark
  const updateBookmark = useCallback(
    (bookmarkId: string, updates: Partial<Pick<Bookmark, "label" | "description">>) => {
      setBookmarks((prev) =>
        prev.map((b) => (b.id === bookmarkId ? { ...b, ...updates } : b))
      );
    },
    []
  );

  // Check if a step has a bookmark
  const hasBookmarkAtStep = useCallback(
    (stepIndex: number): boolean => {
      return bookmarks.some((b) => b.stepIndex === stepIndex);
    },
    [bookmarks]
  );

  // Get bookmark at a specific step
  const getBookmarkAtStep = useCallback(
    (stepIndex: number): Bookmark | undefined => {
      return bookmarks.find((b) => b.stepIndex === stepIndex);
    },
    [bookmarks]
  );

  // Get the next bookmark after current step
  const getNextBookmark = useCallback(
    (currentStep: number): Bookmark | undefined => {
      return bookmarks.find((b) => b.stepIndex > currentStep);
    },
    [bookmarks]
  );

  // Get the previous bookmark before current step
  const getPreviousBookmark = useCallback(
    (currentStep: number): Bookmark | undefined => {
      const previousBookmarks = bookmarks.filter((b) => b.stepIndex < currentStep);
      return previousBookmarks[previousBookmarks.length - 1];
    },
    [bookmarks]
  );

  // Clear all bookmarks
  const clearBookmarks = useCallback(() => {
    setBookmarks([]);
  }, []);

  // Toggle bookmark at step
  const toggleBookmark = useCallback(
    (stepIndex: number, label?: string, description?: string): boolean => {
      if (hasBookmarkAtStep(stepIndex)) {
        removeBookmarkAtStep(stepIndex);
        return false;
      } else {
        addBookmark(stepIndex, label, description);
        return true;
      }
    },
    [hasBookmarkAtStep, removeBookmarkAtStep, addBookmark]
  );

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    removeBookmarkAtStep,
    updateBookmark,
    hasBookmarkAtStep,
    getBookmarkAtStep,
    getNextBookmark,
    getPreviousBookmark,
    clearBookmarks,
    toggleBookmark,
  };
};
