import { Request, Response } from "express";
import { generateTravelSuggestion, TravelPreferences } from "../services/aiService";

function writeEvent(res: Response, event: string, data: unknown) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

export async function travelSuggestion(req: Request, res: Response) {
  const { prompt, preferences } = req.body as {
    prompt?: string;
    preferences?: TravelPreferences;
  };

  if (!prompt) {
    return res.status(400).json({ message: "prompt is required" });
  }

  try {
    const itinerary = await generateTravelSuggestion(prompt, req.user?.id, preferences);
    return res.json(itinerary);
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI request failed";
    return res.status(502).json({ message });
  }
}

export async function travelSuggestionStream(req: Request, res: Response) {
  const { prompt, preferences } = req.body as {
    prompt?: string;
    preferences?: TravelPreferences;
  };

  if (!prompt) {
    return res.status(400).json({ message: "prompt is required" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const itinerary = await generateTravelSuggestion(prompt, req.user?.id, preferences);

    writeEvent(res, "meta", {
      title: itinerary.title,
      destination: itinerary.destination,
      durationDays: itinerary.durationDays
    });

    for (const day of itinerary.days) {
      writeEvent(res, "day", day);
    }

    writeEvent(res, "tips", itinerary.tips);
    writeEvent(res, "budget", itinerary.estimatedBudget);
    writeEvent(res, "done", { ok: true });

    res.end();
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI request failed";
    writeEvent(res, "error", { message });
    res.end();
  }
}
