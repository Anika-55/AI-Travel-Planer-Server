import { prisma } from "../config/prisma";

export async function listDestinations() {
  return prisma.destination.findMany({
    include: { category: true }
  });
}

export async function getDestinationById(id: string) {
  return prisma.destination.findUnique({
    where: { id },
    include: { category: true }
  });
}

export async function createDestination(data: {
  title: string;
  description?: string;
  location: string;
  price: number;
  rating?: number;
  image?: string;
  categoryId: string;
}) {
  return prisma.destination.create({ data });
}

export async function updateDestination(id: string, data: {
  title?: string;
  description?: string;
  location?: string;
  price?: number;
  rating?: number;
  image?: string;
  categoryId?: string;
}) {
  return prisma.destination.update({ where: { id }, data });
}

export async function deleteDestination(id: string) {
  return prisma.destination.delete({ where: { id } });
}
