import { prisma } from "../config/prisma";

export async function createReview(data: {
  userId: string;
  destinationId: string;
  rating: number;
  comment?: string;
}) {
  return prisma.review.create({ data });
}

export async function listReviewsByDestination(destinationId: string) {
  return prisma.review.findMany({
    where: { destinationId },
    include: { user: { select: { id: true, name: true, avatar: true } } },
    orderBy: { createdAt: "desc" }
  });
}
