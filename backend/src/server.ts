import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";
import { reconcilePaymentsWithRazorpay } from "./services/payment-reconciliation.service.js";
import { logger } from "./utils/logger.js";

const server = app.listen(env.port, "0.0.0.0", () => {
  logger.info(`RunnerUp API listening on port ${env.port}`, {
    port: env.port,
    env: env.nodeEnv,
  });
});

// Automated background reconciliation: keeps DB and Razorpay in permanent sync
// Runs every 5 minutes without blocking or interrupting live user requests
const SYNC_INTERVAL_MS = 5 * 60 * 1000;
let syncTimer: NodeJS.Timeout | null = null;
let initialTimer: NodeJS.Timeout | null = null;

initialTimer = setTimeout(() => {
  void reconcilePaymentsWithRazorpay()
    .then((res) => {
      if (res.syncedCount > 0) {
        logger.info(`[Startup Reconcile] Synced ${res.syncedCount} missing payments`);
      }
    })
    .catch((err) => {
      logger.warn("[Startup Reconcile] Background reconciliation check failed", {
        error: err instanceof Error ? err.message : String(err),
      });
    });

  syncTimer = setInterval(() => {
    void reconcilePaymentsWithRazorpay()
      .then((res) => {
        if (res.syncedCount > 0) {
          logger.info(`[Periodic Reconcile] Synced ${res.syncedCount} missing payments`);
        }
      })
      .catch((err) => {
        logger.warn("[Periodic Reconcile] Background reconciliation check failed", {
          error: err instanceof Error ? err.message : String(err),
        });
      });
  }, SYNC_INTERVAL_MS);
}, 15000);

async function shutdown(signal: string) {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  if (initialTimer) clearTimeout(initialTimer);
  if (syncTimer) clearInterval(syncTimer);

  server.close(async () => {
    await prisma.$disconnect();
    logger.info("Prisma disconnected, process exiting.");
    process.exit(0);
  });
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});
// Cloudflare tunnel active

