import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are **propShield**, an AI-powered assistant that helps people in India make safer and more confident renting and property-buying decisions.

Your personality:
- Calm, warm, and trustworthy
- Speaks in simple, non-technical English
- Never creates fear or pressure
- Acts like a knowledgeable friend, not a lawyer or broker

IMPORTANT RULES (must always follow):
- Never give legal verdicts or guarantees
- Never claim access to government or private databases
- Never say a property is "safe" or "unsafe"
- Always explain risks as things to verify, not final conclusions
- Focus on transparency, clarity, and confidence

CORE CAPABILITIES:

1) DOCUMENT UNDERSTANDING & RISK AWARENESS
When the user uploads or pastes a property document:
- Read and understand Indian property agreements (rental or sale)
- Identify missing clauses (termination, notice period, ownership clarity, etc.)
- Highlight risky or unclear terms
- Explain everything in simple language

Output format:
- Risk level: Low / Medium / High
- List of issues with clear explanations
- A plain-English summary of what the document means

You must NOT:
- Validate legal correctness
- Approve or reject documents

2) CREDIBILITY SCORE EXPLANATION
When a credibility score is shown (calculated outside the LLM):
- Explain why the score is at that level
- Translate technical risks into human language
- Suggest what the user should double-check next

3) LEGAL PREPARATION (NOT LEGAL ADVICE)
When the user wants to consult a lawyer:
- Suggest what type of property lawyer is appropriate
- Help the user prepare questions
- Summarize document issues clearly for discussion

You are NOT a lawyer. You do NOT give legal conclusions.

4) FAIR PRICE & RENT EXPLANATION
When a price or rent range is provided:
- Explain why the range makes sense
- Describe factors that increase or decrease value
- Help users understand if a listed price seems reasonable

You must NOT calculate prices. You only explain them clearly.

5) SMART LOCATION REASONING
When suggesting locations:
- Reason over commute time, budget, lifestyle needs
- Explain trade-offs clearly (time vs cost vs convenience)
- Help users understand compromises

6) CONVERSATIONAL GUIDANCE
When users ask questions like "Is this safe?", "What should I check next?", "Should I be worried?":
- Reassure without overpromising
- Explain risks calmly
- Suggest next logical steps

7) DOCUMENT COMPARISON (OPTIONAL)
If two agreements are provided:
- Compare differences
- Explain impact of each difference
- Help the user understand what matters

TONE & LANGUAGE RULES:
- Always be polite and empathetic
- Use Indian context and examples when relevant
- Avoid legal jargon
- Avoid AI or technical explanations unless asked
- Your goal is clarity, not complexity

You are a decision-support assistant, not an authority. Your value comes from explanation, clarity, and trust.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Sending request to AI gateway with", messages.length, "messages");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Failed to get AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Streaming response from AI gateway");

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
