import { Request, Response } from "express";
import {
  listDestinations,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination
} from "../services/destinationService";

export async function list(req: Request, res: Response) {
  const destinations = await listDestinations();
  res.json(destinations);
}

export async function getById(req: Request, res: Response) {
  const { id } = req.params;
  const destination = await getDestinationById(id);

  if (!destination) {
    return res.status(404).json({ message: "Destination not found" });
  }

  return res.json(destination);
}

export async function create(req: Request, res: Response) {
  const { title, description, location, price, rating, image, categoryId } = req.body as {
    title?: string;
    description?: string;
    location?: string;
    price?: number;
    rating?: number;
    image?: string;
    categoryId?: string;
  };

  if (!title || !location || price === undefined || !categoryId) {
    return res.status(400).json({ message: "title, location, price, categoryId are required" });
  }

  const destination = await createDestination({
    title,
    description,
    location,
    price: Number(price),
    rating,
    image,
    categoryId
  });

  return res.status(201).json(destination);
}

export async function update(req: Request, res: Response) {
  const { id } = req.params;
  const { title, description, location, price, rating, image, categoryId } = req.body as {
    title?: string;
    description?: string;
    location?: string;
    price?: number;
    rating?: number;
    image?: string;
    categoryId?: string;
  };

  try {
    const updated = await updateDestination(id, {
      title,
      description,
      location,
      price: price === undefined ? undefined : Number(price),
      rating,
      image,
      categoryId
    });

    return res.json(updated);
  } catch {
    return res.status(404).json({ message: "Destination not found" });
  }
}

export async function remove(req: Request, res: Response) {
  const { id } = req.params;
  try {
    await deleteDestination(id);
    return res.status(204).send();
  } catch {
    return res.status(404).json({ message: "Destination not found" });
  }
}
