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
    msg.includes("Endpoint is suspended") ||
    msg.includes("compute is suspended") ||
    msg.includes("57P01") ||
    msg.includes("57P03") ||
    msg.includes("ETIMEDOUT") ||
    msg.includes("ECONNRESET") ||
    code === "P1001" ||
    code === "P1002" ||
    code === "P1008" ||
    code === "P1017" ||
    code === "P2024"
  );
}

export const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const delays = [300, 800, 1500];
        let attempt = 0;

        while (true) {
          try {
            return await query(args);
          } catch (error) {
            if (isTransientDbError(error) && attempt < delays.length) {
              const delay = delays[attempt];
              attempt++;
              logger.warn(
                `[Prisma] Transient DB issue on ${model}.${operation} (attempt ${attempt}/${delays.length}). Reconnecting in ${delay}ms...`,
              );
              try {
                await basePrisma.$connect().catch(() => {});
              } catch {
                // ignore connect error during wake-up
              }
              await new Promise((r) => setTimeout(r, delay));
              continue;
            }
            throw error;
          }
        }
      },
    },
  },
});
