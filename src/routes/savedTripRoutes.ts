import { Router } from "express";
import { create, listByUser, remove } from "../controllers/savedTripController";
import { requireAuth } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", requireAuth, create);
router.get("/user", requireAuth, listByUser);
router.delete("/:destinationId", requireAuth, remove);

export default router;
