import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";
import { syncUserAndPaymentData } from "./services/data-sync.service.js";
import { logger } from "./utils/logger.js";

const server = app.listen(env.port, "0.0.0.0", () => {
  logger.info(`RunnerUp API listening on port ${env.port}`, {
    port: env.port,
    env: env.nodeEnv,
  });

  // Warm up and verify Prisma database connection on launch
  void prisma.$connect()
    .then(() => logger.info("[Prisma] Database connection established successfully"))
    .catch((err) => logger.error("[Prisma] Initial database connection error", err));
});

// Automated background reconciliation: periodic safety check
// Runs once an hour asynchronously to preserve API rate limits and avoid server exhaustion
const SYNC_INTERVAL_MS = 60 * 60 * 1000;
let syncTimer: NodeJS.Timeout | null = null;
let initialTimer: NodeJS.Timeout | null = null;

initialTimer = setTimeout(() => {
  void syncUserAndPaymentData()
    .then((res) => {
      logger.info(`[Startup Sync] User and payment data in sync: ${res.totalPaidPayments} paid, ${res.totalUsers} users`);
    })
    .catch((err) => {
      logger.warn("[Startup Sync] Background data sync check failed", {
        error: err instanceof Error ? err.message : String(err),
      });
    });

  syncTimer = setInterval(() => {
    void syncUserAndPaymentData()
      .then((res) => {
        if (res.paymentsSynced > 0 || res.clerkUsersSynced > 0 || res.fixedRegistrations > 0 || res.phonesSynced > 0) {
          logger.info(`[Periodic Sync] Synced: ${res.paymentsSynced} payments, ${res.clerkUsersSynced} users, ${res.fixedRegistrations} regs, ${res.phonesSynced} phones`);
        }
      })
      .catch((err) => {
        logger.warn("[Periodic Sync] Background sync check failed", {
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

