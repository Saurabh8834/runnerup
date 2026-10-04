import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { requestTraceMiddleware } from "./middleware/request-trace.js";
import { adminRouter } from "./routes/admin.routes.js";
import { certificateRouter } from "./routes/certificate.routes.js";
import { adminContentRouter, contentRouter } from "./routes/content.routes.js";
import { dashboardRouter } from "./routes/dashboard.routes.js";
import { eventRouter } from "./routes/event.routes.js";
import { paymentRouter } from "./routes/payment.routes.js";
import { prizeRouter } from "./routes/prize.routes.js";
import { referralRouter } from "./routes/referral.routes.js";
import { registrationRouter } from "./routes/registration.routes.js";
import { subscriberRouter } from "./routes/subscriber.routes.js";
import { uploadRouter } from "./routes/upload.routes.js";
import { userRouter } from "./routes/user.routes.js";
import { ApiError } from "./utils/api-error.js";
import { logger } from "./utils/logger.js";

export const app = express();
const allowedOrigins = new Set(env.allowedOrigins);

function isAllowedOrigin(origin: string | undefined) {
  if (!origin) {
    return true;
  }

  const normalized = origin.replace(/\/$/, "");
  if (allowedOrigins.has(normalized)) {
    return true;
  }

  if (env.nodeEnv !== "production") {
    try {
      const url = new URL(normalized);
      return url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname);
    } catch {
      return false;
    }
  }

  return false;
}

app.use(requestTraceMiddleware);
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(null, false);
  },
  credentials: true,
}));
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));
// 2mb: proof screenshots as data URLs before Cloudinary (prefer Cloudinary in prod)
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_request, response) => {
  response.json({ status: "ok", service: "runnerup-api" });
});

app.get("/", (_request, response) => {
  response.json({
    service: "runnerup-api",
    status: "ok",
    health: "/health",
    docs: "API routes are under /api/*",
  });
});

app.use("/api/admin", adminRouter);
app.use("/api/admin/content", adminContentRouter);
app.use("/api/content", contentRouter);
app.use("/api/events", eventRouter);
app.use("/api/users", userRouter);
app.use("/api/registrations", registrationRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/certificates", certificateRouter);
app.use("/api/uploads", uploadRouter);
app.use("/api/prizes", prizeRouter);
app.use("/api/referrals", referralRouter);
app.use("/api/subscribers", subscriberRouter);

app.use((_request, _response, next) => {
  next(new ApiError(404, "Route not found"));
});

app.use((error: Error, request: Request, response: Response, _next: NextFunction) => {
  void _next;
  const statusCode = error instanceof ApiError ? error.statusCode : 500;
  if (statusCode === 500) {
    logger.error("[Unhandled Server Error]", error, { path: request.path, method: request.method });
  } else {
    logger.warn(`API Error (${statusCode}): ${error.message}`, { statusCode, path: request.path, method: request.method });
  }

  response.status(statusCode).json({
    error: {
      message: statusCode === 500 ? "Internal server error" : error.message,
    },
  });
});
