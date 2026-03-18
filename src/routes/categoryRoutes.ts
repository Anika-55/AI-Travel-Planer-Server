import { Router } from "express";
import { list, create, update, remove } from "../controllers/categoryController";
import { requireAuth, requireRole } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", list);
router.post("/", requireAuth, requireRole("ADMIN"), create);
router.put("/:id", requireAuth, requireRole("ADMIN"), update);
router.delete("/:id", requireAuth, requireRole("ADMIN"), remove);

export default router;
