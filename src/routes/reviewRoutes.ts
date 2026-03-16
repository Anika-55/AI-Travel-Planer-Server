import { Router } from "express";
import { create, listByDestination } from "../controllers/reviewController";
import { requireAuth } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", requireAuth, create);
router.get("/:destinationId", listByDestination);

export default router;
