import { Router } from "express";
import {
  createRegistration,
  getLeaderboard,
  reviewProof,
  submitProof,
} from "../controllers/registration.controller.js";
import { requireAdmin, requireClerkAuth, optionalClerkAuth } from "../middleware/clerk-auth.js";
import { asyncHandler } from "../utils/async-handler.js";

export const registrationRouter = Router();

registrationRouter.post("/", optionalClerkAuth, asyncHandler(createRegistration));
registrationRouter.post("/:id/proof", requireClerkAuth, asyncHandler(submitProof));
registrationRouter.post(
  "/:id/review",
  requireClerkAuth,
  requireAdmin,
  asyncHandler(reviewProof),
);
registrationRouter.get("/leaderboard/:eventId", asyncHandler(getLeaderboard));
