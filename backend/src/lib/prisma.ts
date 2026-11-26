import net from "net";
import dns from "dns";
import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger.js";

let dbUrl = process.env.DATABASE_URL;

// On Windows or environments where the local router DNS fails for Neon AWS endpoints,
// transparently resolve via 8.8.8.8 and create a localhost forwarding tunnel
if (process.platform === "win32" && dbUrl && dbUrl.includes("neon.tech")) {
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
    const targetHost = "ep-mute-resonance-b3vonmzt-pooler.c-4.ap-southeast-1.aws.neon.tech";
    const ips = await new Promise<string[]>((res) => {
      dns.resolve4(targetHost, (err, addrs) => {
        if (!err && addrs && addrs.length > 0) res(addrs);
        else res([]);
      });
    });

    if (ips.length > 0) {
      const server = net.createServer((clientSocket) => {
        const remoteSocket = net.connect(5432, ips[0], () => {
          clientSocket.pipe(remoteSocket);
          remoteSocket.pipe(clientSocket);
        });
        remoteSocket.on("error", () => clientSocket.destroy());
        clientSocket.on("error", () => remoteSocket.destroy());
      });

      await new Promise<void>((res) => {
        server.listen(5433, "127.0.0.1", () => res());
        server.on("error", (e: any) => {
          if (e.code === "EADDRINUSE") {
            server.listen(0, "127.0.0.1", () => res());
          } else {
            res();
          }
        });
      });

      const addr = server.address();
      const localPort = typeof addr === "object" && addr ? addr.port : 5433;
      dbUrl = `postgresql://neondb_owner:npg_qVKsEQkSf3O8@127.0.0.1:${localPort}/neondb?sslmode=require&options=endpoint%3Dep-mute-resonance-b3vonmzt`;
      logger.info(`[Prisma] DNS resilient proxy active on 127.0.0.1:${localPort} -> ${ips[0]}`);
    }
  } catch (err: any) {
    logger.warn(`[Prisma] Could not start local DNS resilient proxy: ${err?.message || err}`);
  }
}

const basePrisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  ...(dbUrl ? { datasources: { db: { url: dbUrl } } } : {}),
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
            const isPoolTimeout =
              error &&
              typeof error === "object" &&
              (String((error as any).message || "").includes("Timed out fetching a new connection") ||
                (error as any).code === "P2024");

            // Avoid compounding pool queue delays by limiting pool timeout retries to 1 attempt
            const maxAttempts = isPoolTimeout ? 1 : delays.length;

            if (isTransientDbError(error) && attempt < maxAttempts) {
              const delay = delays[attempt];
              attempt++;
              logger.warn(
                `[Prisma] Transient DB issue on ${model}.${operation} (attempt ${attempt}/${maxAttempts}). Reconnecting in ${delay}ms...`,
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
