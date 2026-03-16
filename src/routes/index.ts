import { Router } from "express";
import { healthCheck } from "../controllers/healthController";
import { requireAuth, requireRole } from "../middlewares/authMiddleware";
import authRoutes from "./authRoutes";
import destinationRoutes from "./destinationRoutes";
import reviewRoutes from "./reviewRoutes";
import savedTripRoutes from "./savedTripRoutes";

const router = Router();

router.get("/health", healthCheck);
router.use("/auth", authRoutes);
router.use("/destinations", destinationRoutes);
router.use("/reviews", reviewRoutes);
router.use("/saved", savedTripRoutes);

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

router.get("/admin", requireAuth, requireRole("ADMIN"), (_req, res) => {
  res.json({ message: "Admin access granted" });
});

export default router;
