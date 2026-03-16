import { Router } from "express";
import { healthCheck } from "../controllers/healthController";
import { requireAuth, requireRole } from "../middlewares/authMiddleware";
import authRoutes from "./authRoutes";
import destinationRoutes from "./destinationRoutes";

const router = Router();

router.get("/health", healthCheck);
router.use("/auth", authRoutes);
router.use("/destinations", destinationRoutes);

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

router.get("/admin", requireAuth, requireRole("ADMIN"), (_req, res) => {
  res.json({ message: "Admin access granted" });
});

export default router;
