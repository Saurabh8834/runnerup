import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/api-error.js";
import { validateBody } from "../utils/validate.js";

const subscribeSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().optional(),
  phone: z.string().optional(),
});

const unsubscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function subscribe(request: Request, response: Response) {
  const { email, name, phone } = validateBody(subscribeSchema, request);
  const cleanEmail = email.trim().toLowerCase();

  const existing = await prisma.subscriber.findUnique({ where: { email: cleanEmail } });
  if (existing) {
    if (!existing.subscribed) {
      await prisma.subscriber.update({ where: { id: existing.id }, data: { subscribed: true } });
    }
  } else {
    await prisma.subscriber.create({ data: { email: cleanEmail } });
  }

  // Also store in User model as an Early Access VIP User for admin dashboard (/admin/users)
  try {
    const cleanPhone = phone ? phone.replace(/\D/g, "") : null;
    const displayName = name?.trim() ? `${name.trim()} (Early Access)` : "Early Access User";

    const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existingUser) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          ...(name?.trim() ? { name: displayName } : {}),
          ...(cleanPhone ? { phone: cleanPhone } : {}),
        },
      });
    } else {
      await prisma.user.create({
        data: {
          name: displayName,
          email: cleanEmail,
          phone: cleanPhone || null,
          role: "RUNNER",
        },
      });
    }
  } catch (err) {
    // Non-blocking fallback if database user constraint or offline
  }

  response.status(201).json({
    data: { message: "You're subscribed! Early access VIP unlocked." },
  });
}

export async function unsubscribe(request: Request, response: Response) {
  const { email } = validateBody(unsubscribeSchema, request);

  const existing = await prisma.subscriber.findUnique({ where: { email } });
  if (!existing) {
    response.json({ data: { message: "You're not in our list. Nothing to do." } });
    return;
  }

  if (!existing.subscribed) {
    response.json({ data: { message: "You were already unsubscribed." } });
    return;
  }

  await prisma.subscriber.update({
    where: { id: existing.id },
    data: { subscribed: false },
  });

  response.json({ data: { message: "You've been unsubscribed. We're sorry to see you go." } });
}
