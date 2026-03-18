import { z } from "zod";
import { env } from "../config/env";
import { appendMemory, getMemory } from "./aiMemory";
import { recordAiMetric, AiUsage } from "./aiMetrics";

const timeBlockSchema = z.object({
  startTime: z.string(),
  endTime: z.string(),
  activity: z.string(),
  location: z.string().optional(),
  transport: z.string().optional(),
  costEstimate: z.number().optional()
});

const daySchema = z.object({
  day: z.number().int(),
  theme: z.string(),
  timeBlocks: z.array(timeBlockSchema),
  meals: z.array(z.string()).optional(),
  lodging: z.string().optional(),
  transportSummary: z.array(z.string()).optional(),
  dayCostEstimate: z.number().optional()
});

const itinerarySchema = z.object({
  title: z.string(),
  destination: z.string(),
  durationDays: z.number().int(),
  days: z.array(daySchema),
  tips: z.array(z.string()),
  estimatedBudget: z.object({
    currency: z.string(),
    total: z.number(),
    breakdown: z.object({
      lodging: z.number(),
      food: z.number(),
      transport: z.number(),
      activities: z.number(),
      misc: z.number()
    })
  })
});

export type TravelItinerary = z.infer<typeof itinerarySchema>;

export type TravelPreferences = {
  budget?: string;
  interests?: string[];
  travelStyle?: string;
  pace?: string;
  withKids?: boolean;
  currency?: string;
};

const itinerarySchemaJson = {
  type: "object",
  properties: {
    title: { type: "string" },
    destination: { type: "string" },
    durationDays: { type: "integer" },
    days: {
      type: "array",
      items: {
        type: "object",
        properties: {
          day: { type: "integer" },
          theme: { type: "string" },
          timeBlocks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                startTime: { type: "string" },
                endTime: { type: "string" },
                activity: { type: "string" },
                location: { type: "string" },
                transport: { type: "string" },
                costEstimate: { type: "number" }
              },
              required: ["startTime", "endTime", "activity"]
            }
          },
          meals: { type: "array", items: { type: "string" } },
          lodging: { type: "string" },
          transportSummary: { type: "array", items: { type: "string" } },
          dayCostEstimate: { type: "number" }
        },
        required: ["day", "theme", "timeBlocks"]
      }
    },
    tips: { type: "array", items: { type: "string" } },
    estimatedBudget: {
      type: "object",
      properties: {
        currency: { type: "string" },
        total: { type: "number" },
        breakdown: {
          type: "object",
          properties: {
            lodging: { type: "number" },
            food: { type: "number" },
            transport: { type: "number" },
            activities: { type: "number" },
            misc: { type: "number" }
          },
          required: ["lodging", "food", "transport", "activities", "misc"]
        }
      },
      required: ["currency", "total", "breakdown"]
    }
  },
  required: ["title", "destination", "durationDays", "days", "tips", "estimatedBudget"]
};

type CacheEntry = {
  expiresAt: number;
  data: TravelItinerary;
};

const CACHE_TTL_MS = 30 * 60 * 1000;
const cache = new Map<string, CacheEntry>();

function stableStringify(value: unknown) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  const entries = keys.map((k) => `"${k}":${stableStringify(obj[k])}`);
  return `{${entries.join(",")}}`;
}

function normalizePreferences(prefs?: TravelPreferences) {
  if (!prefs) return undefined;
  const interests = prefs.interests?.map((i) => i.trim()).filter(Boolean);
  return {
    ...prefs,
    interests: interests && interests.length > 0 ? interests.sort() : undefined
  } as TravelPreferences;
}

function getCacheKey(prompt: string, prefs?: TravelPreferences) {
  const normalized = normalizePreferences(prefs);
  return stableStringify({ prompt, prefs: normalized ?? null });
}

function getFromCache(key: string) {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt < Date.now()) {
    cache.delete(key);
    return undefined;
  }
  return entry.data;
}

function setCache(key: string, data: TravelItinerary) {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

function buildMemoryPrompt(userId?: string) {
  if (!userId) return "";
  const memory = getMemory(userId);
  if (memory.length === 0) return "";

  const lines = memory.map((m, i) => `(${i + 1}) ${m.prompt}`).join("\n");
  return `Previous user requests (most recent last):\n${lines}\n\n`;
}

function buildPreferencesPrompt(prefs?: TravelPreferences) {
  if (!prefs) return "";
  const lines: string[] = [];
  if (prefs.budget) lines.push(`Budget: ${prefs.budget}`);
  if (prefs.interests && prefs.interests.length > 0)
    lines.push(`Interests: ${prefs.interests.join(", ")}`);
  if (prefs.travelStyle) lines.push(`Travel style: ${prefs.travelStyle}`);
  if (prefs.pace) lines.push(`Pace: ${prefs.pace}`);
  if (prefs.withKids !== undefined) lines.push(`With kids: ${prefs.withKids ? "yes" : "no"}`);
  if (prefs.currency) lines.push(`Preferred currency: ${prefs.currency}`);

  if (lines.length === 0) return "";
  return `User preferences:\n${lines.join("\n")}\n\n`;
}

type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
};

async function callGemini(prompt: string, userId?: string, prefs?: TravelPreferences, modelOverride?: string) {
  const model = modelOverride ?? env.geminiModel;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const memoryText = buildMemoryPrompt(userId);
  const preferenceText = buildPreferencesPrompt(prefs);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": env.geminiApiKey
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text:
                "You are a travel planner. Return a structured itinerary JSON that matches the schema. " +
                "Use realistic time blocks with start and end times, include transport hints and costs. " +
                "Provide an overall budget breakdown.\n\n" +
                memoryText +
                preferenceText +
                "User request: " +
                prompt
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseJsonSchema: itinerarySchemaJson
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as GeminiResponse;

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini API returned no content");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Gemini API returned invalid JSON");
  }

  const result = itinerarySchema.safeParse(parsed);
  if (!result.success) {
    throw new Error("Gemini API returned JSON that does not match the schema");
  }

  const usage: AiUsage | undefined = data.usageMetadata
    ? {
        promptTokens: data.usageMetadata.promptTokenCount,
        outputTokens: data.usageMetadata.candidatesTokenCount,
        totalTokens: data.usageMetadata.totalTokenCount
      }
    : undefined;

  return { itinerary: result.data, usage, model };
}

function createSafeFallback(prompt: string): TravelItinerary {
  const title = "Travel Itinerary";
  const destination = prompt.split("to").slice(1).join("to").trim() || "Destination";
  const durationDays = 3;

  return {
    title,
    destination,
    durationDays,
    days: [
      {
        day: 1,
        theme: "Arrival and orientation",
        timeBlocks: [
          { startTime: "09:00", endTime: "11:00", activity: "Arrival and check-in" },
          { startTime: "12:00", endTime: "15:00", activity: "City walk and local highlights" },
          { startTime: "18:00", endTime: "20:00", activity: "Dinner at a local restaurant" }
        ],
        meals: ["Local lunch", "Dinner"],
        lodging: "Central hotel",
        transportSummary: ["Taxi or rideshare"],
        dayCostEstimate: 120
      },
      {
        day: 2,
        theme: "Core attractions",
        timeBlocks: [
          { startTime: "09:00", endTime: "12:00", activity: "Main attraction visit" },
          { startTime: "13:00", endTime: "16:00", activity: "Museum or cultural site" },
          { startTime: "18:00", endTime: "20:00", activity: "Evening food tour" }
        ],
        meals: ["Cafe breakfast", "Lunch", "Dinner"],
        lodging: "Central hotel",
        transportSummary: ["Public transit"],
        dayCostEstimate: 150
      },
      {
        day: 3,
        theme: "Leisure and departure",
        timeBlocks: [
          { startTime: "09:00", endTime: "11:00", activity: "Leisure time" },
          { startTime: "12:00", endTime: "14:00", activity: "Souvenirs and checkout" },
          { startTime: "16:00", endTime: "18:00", activity: "Departure" }
        ],
        meals: ["Brunch"],
        lodging: "Central hotel",
        transportSummary: ["Taxi or airport shuttle"],
        dayCostEstimate: 100
      }
    ],
    tips: ["Carry cash for small vendors", "Check local weather", "Book tickets in advance"],
    estimatedBudget: {
      currency: "USD",
      total: 370,
      breakdown: {
        lodging: 150,
        food: 90,
        transport: 60,
        activities: 50,
        misc: 20
      }
    }
  };
}

export async function generateTravelSuggestion(
  prompt: string,
  userId?: string,
  prefs?: TravelPreferences
): Promise<TravelItinerary> {
  const start = Date.now();
  const promptLength = prompt.length;

  const cacheKey = getCacheKey(prompt, prefs);
  const cached = getFromCache(cacheKey);
  if (cached) {
    if (userId) {
      appendMemory(userId, prompt);
    }

    await recordAiMetric({
      timestamp: Date.now(),
      promptLength,
      latencyMs: Date.now() - start,
      model: "cache",
      cacheHit: true,
      fallbackUsed: false,
      userId
    });

    return cached;
  }

  let result: TravelItinerary | undefined;
  let usage: AiUsage | undefined;
  let modelUsed = env.geminiModel;
  let fallbackUsed = false;

  try {
    const primary = await callGemini(prompt, userId, prefs);
    result = primary.itinerary;
    usage = primary.usage;
    modelUsed = primary.model;
  } catch {
    fallbackUsed = true;
  }

  if (!result) {
    try {
      const secondary = await callGemini(prompt, userId, prefs, env.geminiFallbackModel);
      result = secondary.itinerary;
      usage = secondary.usage;
      modelUsed = secondary.model;
    } catch {
      fallbackUsed = true;
    }
  }

  if (!result) {
    result = createSafeFallback(prompt);
    modelUsed = "fallback-template";
  }

  setCache(cacheKey, result);

  if (userId) {
    appendMemory(userId, prompt);
  }

  await recordAiMetric({
    timestamp: Date.now(),
    promptLength,
    latencyMs: Date.now() - start,
    model: modelUsed,
    cacheHit: false,
    fallbackUsed,
    userId,
    usage
  });

  return result;
}
