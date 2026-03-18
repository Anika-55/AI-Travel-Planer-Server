import { prisma } from "../config/prisma";

export async function listCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function createCategory(data: { name: string }) {
  return prisma.category.create({ data });
}

export async function updateCategory(id: string, data: { name?: string }) {
  return prisma.category.update({ where: { id }, data });
}

export async function deleteCategory(id: string) {
  return prisma.category.delete({ where: { id } });
}
