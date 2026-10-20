import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger.js";

const basePrisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});

function isTransientDbError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const msg = String((error as { message?: string }).message || "");
  const code = String((error as { code?: string }).code || "");

  return (
    msg.includes("Engine is not yet connected") ||
    msg.includes("Server has closed the connection") ||
    msg.includes("Timed out fetching a new connection") ||
    msg.includes("connection pool") ||
    msg.includes("Connection reset") ||
    msg.includes("Connection refused") ||
    msg.includes("socket has been closed") ||
    msg.includes("terminating connection due to administrator command") ||
    code === "P1001" ||
    code === "P1002" ||
    code === "P1008" ||
    code === "P1017"
  );
}

export const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        try {
          return await query(args);
        } catch (error) {
          if (isTransientDbError(error)) {
            logger.warn(
              `[Prisma] Transient connection issue on ${model}.${operation}, reconnecting engine and retrying...`,
            );
            try {
              await basePrisma.$connect().catch(() => {});
              await new Promise((r) => setTimeout(r, 200));
            } catch (reconnectErr) {
              logger.error("[Prisma] Reconnect attempt failed", reconnectErr);
            }
            // Retry the operation once with fresh connection
            return await query(args);
          }
          throw error;
        }
      },
    },
  },
});
