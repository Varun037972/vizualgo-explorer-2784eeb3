import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, currentAlgorithm, userCode, performance, question } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "suggest") {
      systemPrompt = `You are an AI learning tutor for an algorithm visualization platform. Based on the user's current progress and performance, suggest 3-5 topics they should study next. Consider their weak areas and build a logical learning path.

Return a JSON object with:
{
  "suggestions": [{ "topic": "...", "reason": "...", "difficulty": "beginner|intermediate|advanced" }],
  "feedback": "A brief personalized learning assessment (2-3 sentences)"
}`;

      userPrompt = `Current algorithm: ${currentAlgorithm || "None"}
Performance: ${JSON.stringify(performance || { accuracy: 0, weakTopics: [] })}
${userCode ? `Current code:\n${userCode.slice(0, 500)}` : "No code submitted yet"}`;
    } else if (type === "question") {
      systemPrompt = `You are an expert algorithm tutor. Answer the student's question clearly and concisely. Use examples when helpful. Keep answers focused and educational. If the question is about code, reference specific lines or patterns.

Return a JSON object with:
{ "answer": "Your detailed answer here" }`;

      userPrompt = `Question: ${question}
${currentAlgorithm ? `Context: Currently studying ${currentAlgorithm}` : ""}
${userCode ? `Their code:\n${userCode.slice(0, 500)}` : ""}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    let parsed;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[1].trim() : content);
    } catch {
      parsed = { feedback: content, suggestions: [] };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AI tutor error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
