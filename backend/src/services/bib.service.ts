import { prisma } from "../lib/prisma.js";

/**
 * Generate sequential 4-digit bib number (1001, 1002, 1003...)
 */
export async function createBibNumber(eventSlug?: string): Promise<string> {
  try {
    const regs = await prisma.registration.findMany({
      select: { bibNumber: true },
    });

    let maxNum = 1000;
    for (const r of regs) {
      const num = parseInt(r.bibNumber, 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
    return String(maxNum + 1);
  } catch (err) {
    console.error("Error creating sequential bib number:", err);
    return String(1001 + Math.floor(Math.random() * 8999));
  }
}
