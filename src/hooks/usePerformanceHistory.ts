import { useState, useCallback, useEffect } from "react";

export interface PerformanceRun {
  id: string;
  algorithm: string;
  arraySize: number;
  comparisons: number;
  swaps: number;
  elapsedTime: number; // in seconds
  timestamp: number;
  inputArray: number[];
}

interface PerformanceStats {
  avgComparisons: number;
  avgSwaps: number;
  avgTime: number;
  minComparisons: number;
  maxComparisons: number;
  minSwaps: number;
  maxSwaps: number;
  minTime: number;
  maxTime: number;
  totalRuns: number;
}

const MAX_HISTORY_SIZE = 50;

export const usePerformanceHistory = () => {
  const [history, setHistory] = useState<PerformanceRun[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("performanceHistory");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Persist history
  useEffect(() => {
    localStorage.setItem("performanceHistory", JSON.stringify(history));
  }, [history]);

  // Add a new performance run
  const addRun = useCallback(
    (
      algorithm: string,
      arraySize: number,
      comparisons: number,
      swaps: number,
      elapsedTime: number,
      inputArray: number[]
    ): PerformanceRun => {
      const newRun: PerformanceRun = {
        id: `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        algorithm,
        arraySize,
        comparisons,
        swaps,
        elapsedTime,
        timestamp: Date.now(),
        inputArray: inputArray.slice(0, 20), // Store only first 20 elements to save space
      };

      setHistory((prev) => {
        const updated = [newRun, ...prev];
        // Limit history size
        return updated.slice(0, MAX_HISTORY_SIZE);
      });

      return newRun;
    },
    []
  );

  // Remove a run by ID
  const removeRun = useCallback((runId: string) => {
    setHistory((prev) => prev.filter((r) => r.id !== runId));
  }, []);

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  // Get runs for a specific algorithm
  const getRunsByAlgorithm = useCallback(
    (algorithm: string): PerformanceRun[] => {
      return history.filter((r) => r.algorithm === algorithm);
    },
    [history]
  );

  // Get statistics for a specific algorithm
  const getStatsByAlgorithm = useCallback(
    (algorithm: string): PerformanceStats | null => {
      const runs = history.filter((r) => r.algorithm === algorithm);
      if (runs.length === 0) return null;

      const comparisons = runs.map((r) => r.comparisons);
      const swaps = runs.map((r) => r.swaps);
      const times = runs.map((r) => r.elapsedTime);

      return {
        avgComparisons: comparisons.reduce((a, b) => a + b, 0) / runs.length,
        avgSwaps: swaps.reduce((a, b) => a + b, 0) / runs.length,
        avgTime: times.reduce((a, b) => a + b, 0) / runs.length,
        minComparisons: Math.min(...comparisons),
        maxComparisons: Math.max(...comparisons),
        minSwaps: Math.min(...swaps),
        maxSwaps: Math.max(...swaps),
        minTime: Math.min(...times),
        maxTime: Math.max(...times),
        totalRuns: runs.length,
      };
    },
    [history]
  );

  // Get overall statistics
  const getOverallStats = useCallback((): PerformanceStats | null => {
    if (history.length === 0) return null;

    const comparisons = history.map((r) => r.comparisons);
    const swaps = history.map((r) => r.swaps);
    const times = history.map((r) => r.elapsedTime);

    return {
      avgComparisons: comparisons.reduce((a, b) => a + b, 0) / history.length,
      avgSwaps: swaps.reduce((a, b) => a + b, 0) / history.length,
      avgTime: times.reduce((a, b) => a + b, 0) / history.length,
      minComparisons: Math.min(...comparisons),
      maxComparisons: Math.max(...comparisons),
      minSwaps: Math.min(...swaps),
      maxSwaps: Math.max(...swaps),
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      totalRuns: history.length,
    };
  }, [history]);

  // Get chart data for comparisons over time
  const getComparisonChartData = useCallback(
    (algorithm?: string) => {
      const runs = algorithm
        ? history.filter((r) => r.algorithm === algorithm)
        : history;

      return runs
        .slice()
        .reverse()
        .map((run, index) => ({
          name: `Run ${index + 1}`,
          comparisons: run.comparisons,
          swaps: run.swaps,
          time: run.elapsedTime,
          algorithm: run.algorithm,
          arraySize: run.arraySize,
        }));
    },
    [history]
  );

  // Get algorithm comparison data
  const getAlgorithmComparisonData = useCallback(() => {
    const algorithmGroups: Record<string, PerformanceRun[]> = {};

    history.forEach((run) => {
      if (!algorithmGroups[run.algorithm]) {
        algorithmGroups[run.algorithm] = [];
      }
      algorithmGroups[run.algorithm].push(run);
    });

    return Object.entries(algorithmGroups).map(([algorithm, runs]) => {
      const avgComparisons = runs.reduce((a, b) => a + b.comparisons, 0) / runs.length;
      const avgSwaps = runs.reduce((a, b) => a + b.swaps, 0) / runs.length;
      const avgTime = runs.reduce((a, b) => a + b.elapsedTime, 0) / runs.length;

      return {
        algorithm,
        avgComparisons: Math.round(avgComparisons),
        avgSwaps: Math.round(avgSwaps),
        avgTime: avgTime.toFixed(2),
        runs: runs.length,
      };
    });
  }, [history]);

  return {
    history,
    addRun,
    removeRun,
    clearHistory,
    getRunsByAlgorithm,
    getStatsByAlgorithm,
    getOverallStats,
    getComparisonChartData,
    getAlgorithmComparisonData,
  };
};
