import { Router } from "express";
import {
  createPaymentOrder,
  getPaymentStatus,
  handleRazorpayWebhook,
  validateCoupon,
  verifyPayment,
} from "../controllers/payment.controller.js";
import { optionalClerkAuth } from "../middleware/clerk-auth.js";
import { asyncHandler } from "../utils/async-handler.js";

export const paymentRouter = Router();

paymentRouter.get("/status", optionalClerkAuth, asyncHandler(getPaymentStatus));
paymentRouter.post("/validate-coupon", optionalClerkAuth, asyncHandler(validateCoupon));
paymentRouter.post("/create-order", optionalClerkAuth, asyncHandler(createPaymentOrder));
paymentRouter.post("/verify", optionalClerkAuth, asyncHandler(verifyPayment));
paymentRouter.post("/webhook", asyncHandler(handleRazorpayWebhook));

