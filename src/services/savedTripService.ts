import { prisma } from "../config/prisma";

export async function saveTrip(data: { userId: string; destinationId: string }) {
  return prisma.savedTrip.create({ data });
}

export async function listSavedTripsByUser(userId: string) {
  return prisma.savedTrip.findMany({
    where: { userId },
    include: { destination: true },
    orderBy: { createdAt: "desc" }
  });
}

export async function unsaveTrip(userId: string, destinationId: string) {
  return prisma.savedTrip.delete({
    where: { userId_destinationId: { userId, destinationId } }
  });
}
