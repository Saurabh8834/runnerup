import { Router } from "express";
import { uploadConfig, uploadProofImage } from "../controllers/upload.controller.js";
import { optionalClerkAuth } from "../middleware/clerk-auth.js";
import { asyncHandler } from "../utils/async-handler.js";

export const uploadRouter = Router();

uploadRouter.get("/config", optionalClerkAuth, asyncHandler(uploadConfig));
uploadRouter.post("/image", optionalClerkAuth, asyncHandler(uploadProofImage));
