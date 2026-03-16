import { Request, Response } from "express";
import { loginUser, registerUser } from "../services/authService";

export async function register(req: Request, res: Response) {
  const { name, email, password, avatar } = req.body as {
    name?: string;
    email?: string;
    password?: string;
    avatar?: string;
  };

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const result = await registerUser({ name, email, password, avatar });

  if ("error" in result) {
    return res.status(409).json({ message: result.error });
  }

  return res.status(201).json(result);
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const result = await loginUser({ email, password });

  if ("error" in result) {
    return res.status(401).json({ message: result.error });
  }

  return res.json(result);
}
