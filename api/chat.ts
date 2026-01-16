import Anthropic from "@anthropic-ai/sdk";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// =============================================================================
// TYPES
// =============================================================================

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatContext {
  formData: {
    q1_artist_name?: string;
    q2_legal_name?: string;
    q3_time_releasing?: string;
    q4_catalog_size?: string;
    q5_distributor?: string;
    q6_monthly_income?: string;
    q7_pro?: string;
    q8_soundexchange?: string;
    q9_mlc?: string;
    q10_publishing_admin?: string;
    q11_previous_admin?: string;
    q12_has_cowriters?: string;
    q13_changed_names?: string;
    q14_songs_by_others?: string;
    q15_managing_for?: string;
    q16_disputes?: string;
  };
  followUpData: Record<string, string | string[]>;
  reportData: {
    artistName: string;
    score: number;
    scoreLabel: string;
    estimateLow: string;
    estimateHigh: string;
    monthlyGap: string;
    complexity: string;
    recommendation: string;
    registrationsHave: Array<{ name: string; description: string }>;
    registrationsMissing: Array<{ name: string; whatItCollects: string }>;
    warnings: Array<{ icon: string; title: string; description: string; consequence: string; action: string }>;
    actionsPriority1: Array<{ number: number; title: string; why: string; instructions: string; linkText?: string; linkUrl?: string; timeEstimate: string }>;
    actionsPriority2: Array<{ number: number; title: string; why: string; instructions: string }>;
    actionsPriority3: Array<{ number: number; title: string; why: string; instructions: string }>;
    distributor: string;
    monthlyIncome: string;
    isCritical: boolean;
    criticalMessage?: string;
  };
}

interface ChatRequestBody {
  message: string;
  context: ChatContext;
  chatHistory: ChatMessage[];
}

// =============================================================================
// SYSTEM PROMPT BUILDER
// =============================================================================

function formatRegistrations(
  have: Array<{ name: string; description: string }>,
  missing: Array<{ name: string; whatItCollects: string }>
): string {
  let result = '';

  if (have.length > 0) {
    result += '**Currently Have:**\n';
    have.forEach(r => {
      result += `- ${r.name}: ${r.description}\n`;
    });
  }

  if (missing.length > 0) {
    result += '\n**Missing:**\n';
    missing.forEach(r => {
      result += `- ${r.name}: ${r.whatItCollects}\n`;
    });
  }

  return result;
}

function formatWarnings(
  warnings: Array<{ icon: string; title: string; description: string; consequence: string; action: string }>
): string {
  if (warnings.length === 0) return 'No critical warnings.';
  return warnings.map(w => `${w.icon} **${w.title}**: ${w.description}`).join('\n');
}

function formatActionItems(
  actions: Array<{ number: number; title: string; why: string; instructions: string; timeEstimate?: string }>
): string {
  if (actions.length === 0) return 'No action items.';
  return actions.map(a => `${a.number}. **${a.title}** (${a.timeEstimate || 'varies'})\n   ${a.why}`).join('\n');
}

function buildChatSystemPrompt(context: ChatContext): string {
  const { formData, reportData } = context;
  const artistName = reportData.artistName || formData.q1_artist_name || 'Artist';

  return `You are a knowledgeable, friendly royalty consultant assistant helping ${artistName} understand their personalized Royalty Health Report.

## About ${artistName}'s Situation

**Profile:**
- Artist Name: ${artistName}
- Legal Name: ${formData.q2_legal_name || 'Not provided'}
- Monthly Streaming Income: ${reportData.monthlyIncome}
- Distributor: ${reportData.distributor}
- Catalog Size: ${formData.q4_catalog_size?.replace(/_/g, '-') || 'Unknown'}
- Time Releasing Music: ${formData.q3_time_releasing?.replace(/_/g, ' ') || 'Unknown'}

**Royalty Health Score:** ${reportData.score}/10 (${reportData.scoreLabel})

**Estimated Unclaimed Royalties:** ${reportData.estimateLow} - ${reportData.estimateHigh}
**Monthly Gap:** ~${reportData.monthlyGap}/month

**Situation Complexity:** ${reportData.complexity}
**Recommended Path:** ${reportData.recommendation}

## Their Current Registrations

${formatRegistrations(reportData.registrationsHave, reportData.registrationsMissing)}

## Warnings & Issues

${formatWarnings(reportData.warnings)}

${reportData.isCritical ? `\n**CRITICAL:** ${reportData.criticalMessage}\n` : ''}

## Their Action Plan

**Priority 1 (Critical):**
${formatActionItems(reportData.actionsPriority1)}

**Priority 2 (Important):**
${formatActionItems(reportData.actionsPriority2)}

**Priority 3 (Recommended):**
${formatActionItems(reportData.actionsPriority3)}

## Your Role

1. **Answer questions about THEIR specific situation** - reference their actual numbers, registrations, and recommendations
2. **Explain concepts simply** - many artists don't understand royalty terminology
3. **Be encouraging but honest** - don't sugarcoat issues, but don't scare them either
4. **Reference their report** - when they ask "what should I do first?" point to their Priority 1 actions
5. **Clarify confusion** - if they misunderstand something in their report, gently correct them

## Key Knowledge to Reference

**PRO (Performing Rights Organization):**
- Collects performance royalties when songs are played on radio, TV, streaming, venues
- ASCAP and BMI are the main options (pick one, not both)
- Performance royalties split 50/50 between Writer and Publisher
- If no publishing admin, artist should create their own publishing entity to collect both halves

**The MLC (Mechanical Licensing Collective):**
- Collects mechanical royalties from US streaming services
- ONLY collects US royalties - does NOT collect international
- Free to join and register songs
- Unclaimed royalties may be redistributed after 3 years

**SoundExchange:**
- Collects digital radio royalties (Pandora, SiriusXM, internet radio)
- TWO separate registrations needed: Rights Owner (50%) and Featured Artist (45%)
- Many artists only register once and miss half their money
- SiriusXM pays ~$35 per spin at 100% ownership

**Publishing Administrators (Songtrust, TuneCore Publishing, etc.):**
- Collect royalties on your behalf for a commission (10-20%)
- Key benefit: They collect INTERNATIONAL mechanical royalties
- The MLC only does US - if significant international audience, need a pub admin
- Songtrust recommended for artists with 30%+ international streams

**DistroKid:**
- Is NOT a publishing administrator
- Only handles distribution to streaming platforms + YouTube Content ID
- Does NOT collect PRO, MLC, or SoundExchange royalties

## Guidelines

- Keep responses concise but complete
- Use their artist name when referring to them
- If they ask about something not in their report, help but note it may not apply to their situation
- Never make up specific numbers or requirements - be honest if you're not certain
- If they seem overwhelmed, remind them to focus on Priority 1 actions first
- Be conversational and supportive, not robotic`;
}

// =============================================================================
// API HANDLER
// =============================================================================

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { message, context, chatHistory } = req.body as ChatRequestBody;

    if (!message || !context) {
      return res.status(400).json({ error: "Missing message or context" });
    }

    // Initialize Anthropic client
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Build system prompt with user's context
    const systemPrompt = buildChatSystemPrompt(context);

    // Build messages array
    const messages: Array<{ role: "user" | "assistant"; content: string }> = [
      ...(chatHistory || []),
      { role: "user", content: message },
    ];

    // Call Claude API
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages,
    });

    // Extract text response
    const textContent = response.content.find((c) => c.type === "text");
    const responseText = textContent?.type === "text" ? textContent.text : "I apologize, but I couldn't generate a response. Please try again.";

    return res.status(200).json({
      response: responseText,
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);

    if (error instanceof Anthropic.APIError) {
      return res.status(error.status || 500).json({
        error: "API error",
        message: error.message,
      });
    }

    return res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
