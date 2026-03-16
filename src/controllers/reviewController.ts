import { Request, Response } from "express";
import { createReview, listReviewsByDestination } from "../services/reviewService";
import { prisma } from "../config/prisma";

function clampRating(value: number) {
  if (value < 1) return 1;
  if (value > 5) return 5;
  return value;
}

export async function create(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { destinationId, rating, comment } = req.body as {
    destinationId?: string;
    rating?: number;
    comment?: string;
  };

  if (!destinationId || rating === undefined) {
    return res.status(400).json({ message: "destinationId and rating are required" });
  }

  const numericRating = clampRating(Number(rating));

  const destination = await prisma.destination.findUnique({ where: { id: destinationId } });
  if (!destination) {
    return res.status(404).json({ message: "Destination not found" });
  }

  const review = await createReview({
    userId: req.user.id,
    destinationId,
    rating: numericRating,
    comment
  });

  return res.status(201).json(review);
}

export async function listByDestination(req: Request, res: Response) {
  const { destinationId } = req.params;
  const reviews = await listReviewsByDestination(destinationId);
  return res.json(reviews);
}
