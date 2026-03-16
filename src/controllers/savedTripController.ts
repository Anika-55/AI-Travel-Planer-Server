import { Request, Response } from "express";
import { saveTrip, listSavedTripsByUser, unsaveTrip } from "../services/savedTripService";
import { prisma } from "../config/prisma";

export async function create(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { destinationId } = req.body as { destinationId?: string };
  if (!destinationId) {
    return res.status(400).json({ message: "destinationId is required" });
  }

  const destination = await prisma.destination.findUnique({ where: { id: destinationId } });
  if (!destination) {
    return res.status(404).json({ message: "Destination not found" });
  }

  try {
    const saved = await saveTrip({ userId: req.user.id, destinationId });
    return res.status(201).json(saved);
  } catch {
    return res.status(409).json({ message: "Destination already saved" });
  }
}

export async function listByUser(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const items = await listSavedTripsByUser(req.user.id);
  return res.json(items);
}

export async function remove(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { destinationId } = req.params;

  try {
    await unsaveTrip(req.user.id, destinationId);
    return res.status(204).send();
  } catch {
    return res.status(404).json({ message: "Saved trip not found" });
  }
}
