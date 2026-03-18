import { prisma } from "../config/prisma";

export type AiUsage = {
  promptTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
};

export type AiMetric = {
  timestamp: number;
  promptLength: number;
  latencyMs: number;
  model: string;
  cacheHit: boolean;
  fallbackUsed: boolean;
  userId?: string;
  usage?: AiUsage;
};

export async function recordAiMetric(entry: AiMetric) {
  await prisma.aiMetric.create({
    data: {
      createdAt: new Date(entry.timestamp),
      promptLength: entry.promptLength,
      latencyMs: entry.latencyMs,
      model: entry.model,
      cacheHit: entry.cacheHit,
      fallbackUsed: entry.fallbackUsed,
      promptTokens: entry.usage?.promptTokens ?? null,
      outputTokens: entry.usage?.outputTokens ?? null,
      totalTokens: entry.usage?.totalTokens ?? null,
      userId: entry.userId ?? null
    }
  });
}

export async function getRecentAiMetrics(limit = 100) {
  return prisma.aiMetric.findMany({
    orderBy: { createdAt: "desc" },
    take: limit
  });
}
