-- CreateTable
CREATE TABLE "AiMetric" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "promptLength" INTEGER NOT NULL,
    "latencyMs" INTEGER NOT NULL,
    "model" TEXT NOT NULL,
    "cacheHit" BOOLEAN NOT NULL,
    "fallbackUsed" BOOLEAN NOT NULL,
    "promptTokens" INTEGER,
    "outputTokens" INTEGER,
    "totalTokens" INTEGER,
    "userId" TEXT,

    CONSTRAINT "AiMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiMetric_createdAt_idx" ON "AiMetric"("createdAt");

-- CreateIndex
CREATE INDEX "AiMetric_userId_idx" ON "AiMetric"("userId");
