import { Router } from "express";
import { travelSuggestion, travelSuggestionStream } from "../controllers/aiController";
import { requireAuth } from "../middlewares/authMiddleware";
import { aiLimiter } from "../middlewares/rateLimit";

const router = Router();

router.post("/travel-suggestion", requireAuth, aiLimiter, travelSuggestion);
router.post("/travel-suggestion/stream", requireAuth, aiLimiter, travelSuggestionStream);

export default router;
