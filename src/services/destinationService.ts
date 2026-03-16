import { prisma } from "../config/prisma";

export type DestinationListQuery = {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  maxRating?: number;
  page?: number;
  limit?: number;
  sort?: "price" | "rating" | "newest";
};

export async function listDestinations(query: DestinationListQuery) {
  const page = query.page && query.page > 0 ? query.page : 1;
  const limit = query.limit && query.limit > 0 ? query.limit : 10;
  const skip = (page - 1) * limit;

  const where: {
    location?: { contains: string; mode: "insensitive" };
    price?: { gte?: number; lte?: number };
    rating?: { gte?: number; lte?: number };
  } = {};

  if (query.location) {
    where.location = { contains: query.location, mode: "insensitive" };
  }

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    where.price = {
      gte: query.minPrice,
      lte: query.maxPrice
    };
  }

  if (query.minRating !== undefined || query.maxRating !== undefined) {
    where.rating = {
      gte: query.minRating,
      lte: query.maxRating
    };
  }

  const orderBy =
    query.sort === "price"
      ? ({ price: "asc" } as const)
      : query.sort === "rating"
        ? ({ rating: "desc" } as const)
        : ({ createdAt: "desc" } as const);

  const [items, total] = await Promise.all([
    prisma.destination.findMany({
      where,
      include: { category: true },
      orderBy,
      skip,
      take: limit
    }),
    prisma.destination.count({ where })
  ]);

  return {
    items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  };
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

export async function updateDestination(
  id: string,
  data: {
    title?: string;
    description?: string;
    location?: string;
    price?: number;
    rating?: number;
    image?: string;
    categoryId?: string;
  }
) {
  return prisma.destination.update({ where: { id }, data });
}

export async function deleteDestination(id: string) {
  return prisma.destination.delete({ where: { id } });
}
