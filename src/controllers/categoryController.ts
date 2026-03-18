import { Request, Response } from "express";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from "../services/categoryService";

export async function list(req: Request, res: Response) {
  const categories = await listCategories();
  res.json(categories);
}

export async function create(req: Request, res: Response) {
  const { name } = req.body as { name?: string };
  if (!name) {
    return res.status(400).json({ message: "name is required" });
  }

  try {
    const category = await createCategory({ name });
    return res.status(201).json(category);
  } catch {
    return res.status(409).json({ message: "Category already exists" });
  }
}

export async function update(req: Request, res: Response) {
  const { id } = req.params;
  const { name } = req.body as { name?: string };

  if (!name) {
    return res.status(400).json({ message: "name is required" });
  }

  try {
    const updated = await updateCategory(id, { name });
    return res.json(updated);
  } catch {
    return res.status(404).json({ message: "Category not found" });
  }
}

export async function remove(req: Request, res: Response) {
  const { id } = req.params;

  try {
    await deleteCategory(id);
    return res.status(204).send();
  } catch {
    return res.status(404).json({ message: "Category not found" });
  }
}
