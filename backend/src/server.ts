import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";
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

// Background reconciliation is available on-demand via the Admin Dashboard (/api/admin/payments/sync).
// Periodic polling is disabled to allow Neon Postgres compute to auto-suspend during idle periods,
// preventing compute allowance exhaustion and ensuring 24/7 database availability.

async function shutdown(signal: string) {
  logger.info(`Received ${signal}, shutting down gracefully...`);
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

