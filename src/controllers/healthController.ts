import { Request, Response } from "express";
import { getHealthStatus } from "../services/healthService";

export function healthCheck(req: Request, res: Response) {
  res.json(getHealthStatus());
}
