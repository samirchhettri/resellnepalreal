import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { CATEGORIES, CONDITIONS } from "./constants.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_HELP = `You are the reSell Nepal assistant — a friendly helper for a Nepali second-hand marketplace PWA.

Help users with:
- How to create a listing (title, photos, price, category, condition, location)
- How to search, filter, save items
- How to chat with sellers safely
- Safety tips: meet in public, inspect items, never share OTPs, report/block suspicious users
- Categories: ${CATEGORIES.map((c) => c.label).join(", ")}

Rules:
- Keep replies SHORT (2–4 sentences max), friendly, plain language.
- Use markdown bullets when listing steps.
- Prices are in NPR (Nepali Rupees).
- If asked about something outside the app, briefly redirect.`;

const SYSTEM_SUGGEST = `You help sellers improve listings on reSell Nepal (Nepal, prices in NPR).
Given a rough title/description and optional category, return:
- A clear catchy title (max 60 chars)
- A polished description (60–180 words, plain language, key specs, condition, what's included, reason for selling if relevant)
- A fair NPR price suggestion (integer)
- The best matching category slug from: ${CATEGORIES.map((c) => c.slug).join(", ")}
- The best condition value from: ${CONDITIONS.map((c) => c.value).join(", ")}

Be realistic with NPR pricing for the Nepali second-hand market.`;

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    return new Response(JSON.stringify({ error: "AI not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Require authenticated user — this endpoint costs money and must not be open to the public.
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const authHeader = req.headers.get("Authorization") ?? "";
  const jwt = authHeader.replace(/^Bearer\s+/i, "");
  if (!jwt) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });
  const { data: userData, error: userErr } = await supabaseAuth.auth.getUser(jwt);
  if (userErr || !userData?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const mode = body.mode as "chat" | "suggest";

    if (mode === "chat") {
      const messages = Array.isArray(body.messages) ? body.messages : [];
      const safe = messages
        .filter((m: any) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
        .slice(-20)
        .map((m: any) => ({ role: m.role, content: m.content.slice(0, 2000) }));

      const aiRes = await fetch(GATEWAY_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [{ role: "system", content: SYSTEM_HELP }, ...safe],
          stream: true,
        }),
      });

      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests, please wait a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in Lovable workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!aiRes.ok) {
        const t = await aiRes.text();
        console.error("AI gateway error", aiRes.status, t);
        return new Response(JSON.stringify({ error: "AI gateway error" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(aiRes.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    if (mode === "suggest") {
      const title = String(body.title ?? "").slice(0, 200);
      const description = String(body.description ?? "").slice(0, 2000);
      const category = String(body.category ?? "");

      if (!title.trim() && !description.trim()) {
        return new Response(JSON.stringify({ error: "Provide at least a title or description." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const userPrompt = `Title: ${title || "(none)"}\nDescription: ${description || "(none)"}\nCategory hint: ${category || "(none)"}\n\nImprove this listing.`;

      const aiRes = await fetch(GATEWAY_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_SUGGEST },
            { role: "user", content: userPrompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "suggest_listing",
                description: "Return improved listing fields.",
                parameters: {
                  type: "object",
                  properties: {
                    title: { type: "string", description: "Catchy title, max 60 chars" },
                    description: { type: "string", description: "Polished description 60-180 words" },
                    price_npr: { type: "integer", description: "Suggested fair price in NPR" },
                    category: {
                      type: "string",
                      enum: CATEGORIES.map((c) => c.slug),
                    },
                    condition: {
                      type: "string",
                      enum: CONDITIONS.map((c) => c.value),
                    },
                    notes: { type: "string", description: "1-line tip for the seller" },
                  },
                  required: ["title", "description", "price_npr", "category", "condition"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "suggest_listing" } },
        }),
      });

      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests, please wait a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!aiRes.ok) {
        const t = await aiRes.text();
        console.error("AI suggest error", aiRes.status, t);
        return new Response(JSON.stringify({ error: "AI gateway error" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const data = await aiRes.json();
      const call = data.choices?.[0]?.message?.tool_calls?.[0];
      if (!call?.function?.arguments) {
        return new Response(JSON.stringify({ error: "No suggestion returned." }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let parsed: Record<string, unknown> = {};
      try {
        parsed = JSON.parse(call.function.arguments);
      } catch {
        return new Response(JSON.stringify({ error: "Invalid AI response." }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ suggestion: parsed }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown mode" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
