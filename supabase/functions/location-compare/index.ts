import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a helpful assistant that provides location comparison data for Indian cities and neighborhoods.

When comparing locations, you must respond with ONLY a valid JSON array containing location data. No other text, explanations, or markdown.

Each location object must have this exact structure:
{
  "name": "Location Name",
  "rentRange": { "min": number, "max": number },
  "commuteScore": "Easy" | "Moderate" | "Challenging",
  "lifestyleScore": "Basic" | "Moderate" | "Vibrant",
  "highlights": ["string", "string"],
  "tradeoffs": ["string", "string"]
}

Guidelines:
- rentRange values should be in INR for average 1-2 BHK apartments
- Be realistic with current 2024-2025 Indian rental market rates
- Consider actual infrastructure, metro connectivity, traffic conditions
- Highlights should mention genuine positives (parks, malls, hospitals, safety)
- Tradeoffs should be honest (traffic, noise, distance from center, limited options)
- Keep highlights and tradeoffs to 2-3 items each, be concise`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, locations, budgetLevel } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Comparing locations:", locations, "Budget:", budgetLevel);

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
          { role: "user", content: prompt },
        ],
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

    const responseText = await response.text();
    console.log("Raw AI gateway response:", responseText.substring(0, 500));
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseErr) {
      console.error("Failed to parse AI gateway response as JSON:", parseErr);
      console.error("Response text:", responseText.substring(0, 1000));
      return new Response(
        JSON.stringify({ error: "Failed to parse AI gateway response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const content = data.choices?.[0]?.message?.content || "";

    console.log("AI Response:", content);

    // Parse the JSON response
    let parsedLocations;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        parsedLocations = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON array found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      return new Response(
        JSON.stringify({ error: "Failed to parse location data" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ locations: parsedLocations }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Location compare function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
