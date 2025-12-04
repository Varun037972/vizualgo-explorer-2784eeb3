import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CodeError {
  id: string;
  type: "syntax" | "runtime" | "logic" | "security";
  message: string;
  lines: [number, number];
  severity: "low" | "medium" | "high" | "critical";
  probable_cause: string;
  confidence: "low" | "medium" | "high";
}

export interface CodeExplanation {
  id: string;
  short: string;
  detailed: string;
  fix: string;
  learning_tip: string;
}

export interface ApplyableEdit {
  line: number;
  old: string;
  new: string;
}

export interface CodeAnalysisResult {
  corrected_code: string;
  patch: string;
  errors: CodeError[];
  explanations: CodeExplanation[];
  minimal_test: { input: string; expected_output: string } | null;
  suggested_visualizer_changes: string[];
  applyable_edits: ApplyableEdit[];
  overall_confidence: "low" | "medium" | "high";
}

interface UseCodeAnalysisReturn {
  analyze: (code: string, language?: string, filename?: string, description?: string) => Promise<void>;
  result: CodeAnalysisResult | null;
  isAnalyzing: boolean;
  error: string | null;
  clearResult: () => void;
}

export const useCodeAnalysis = (): UseCodeAnalysisReturn => {
  const [result, setResult] = useState<CodeAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (
    code: string,
    language: string = "javascript",
    filename?: string,
    description?: string
  ) => {
    if (!code.trim()) {
      setError("No code provided");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("analyze-code", {
        body: {
          language,
          filename,
          description,
          user_code: code,
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Analysis failed";
      setError(message);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    analyze,
    result,
    isAnalyzing,
    error,
    clearResult,
  };
};
