import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CodeAnalysisRequest {
  language: string;
  filename?: string;
  description?: string;
  user_code: string;
}

interface CodeError {
  id: string;
  type: "syntax" | "runtime" | "logic" | "security";
  message: string;
  lines: [number, number];
  severity: "low" | "medium" | "high" | "critical";
  probable_cause: string;
  confidence: "low" | "medium" | "high";
}

interface CodeExplanation {
  id: string;
  short: string;
  detailed: string;
  fix: string;
  learning_tip: string;
}

interface ApplyableEdit {
  line: number;
  old: string;
  new: string;
}

interface CodeAnalysisResponse {
  corrected_code: string;
  patch: string;
  errors: CodeError[];
  explanations: CodeExplanation[];
  minimal_test: { input: string; expected_output: string } | null;
  suggested_visualizer_changes: string[];
  applyable_edits: ApplyableEdit[];
  overall_confidence: "low" | "medium" | "high";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { language, filename, description, user_code }: CodeAnalysisRequest = await req.json();

    if (!user_code || !language) {
      throw new Error("Missing required fields: language and user_code");
    }

    const systemPrompt = `You are an expert code analyzer for an Algorithm Visualizer educational platform.

ANALYSIS STEPS (do these conceptually; do NOT run the code):
1. Parse the code with language-aware reasoning (AST-level thinking).
2. Detect:
   - Syntax errors (missing tokens, wrong indentation)
   - Runtime errors that are clearly provable statically (out-of-bounds, undefined vars)
   - API misuse vs Visualizer (e.g., wrong viz API calls)
   - Common algorithmic mistakes (off-by-one, wrong comparator, wrong init)
   - Dangerous patterns (fs, network, eval) — refuse runnable fix and explain.
3. For each problem, score severity (syntax/runtime/logic/security) and confidence.

OUTPUT (return **only valid JSON** exactly matching the schema below):
{
  "corrected_code": "full corrected source (string; preserve style/indent)",
  "patch": "unified diff string (git-style)",
  "errors": [{"id": "err1", "type": "syntax|runtime|logic|security", "message": "...", "lines": [start, end], "severity": "low|medium|high|critical", "probable_cause": "...", "confidence": "low|medium|high"}],
  "explanations": [{"id": "err1", "short": "1 sentence", "detailed": "2-4 sentences", "fix": "...", "learning_tip": "..."}],
  "minimal_test": {"input": "...", "expected_output": "..."} or null,
  "suggested_visualizer_changes": ["..."],
  "applyable_edits": [{"line": 1, "old": "...", "new": "..."}],
  "overall_confidence": "low|medium|high"
}

RULES:
- Never execute user code. If a runtime-only issue cannot be resolved without running, mark confidence "low" and provide safe test steps.
- If code attempts dangerous I/O or network actions, refuse to produce runnable code—provide static suggestions only.
- Keep human explanations concise: short (1 sentence) + optional detailed (2–4 sentences).
- When multiple reasonable fixes exist, return all as separate suggestions, with recommended one flagged.
- If the code is correct and has no issues, return empty arrays for errors and explanations, and set corrected_code to the original code.`;

    const userPrompt = `Analyze the following ${language} code:
${filename ? `Filename: ${filename}` : ""}
${description ? `Expected behavior: ${description}` : ""}

\`\`\`${language}
${user_code}
\`\`\`

Provide your analysis in the exact JSON format specified.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Extract JSON from the response (handle markdown code blocks)
    let jsonContent = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1].trim();
    }

    let analysis: CodeAnalysisResponse;
    try {
      analysis = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Return a default response if parsing fails
      analysis = {
        corrected_code: user_code,
        patch: "",
        errors: [],
        explanations: [],
        minimal_test: null,
        suggested_visualizer_changes: [],
        applyable_edits: [],
        overall_confidence: "low",
      };
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-code function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
