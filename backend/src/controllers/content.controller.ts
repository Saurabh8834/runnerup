import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import type { AuthenticatedRequest } from "../middleware/clerk-auth.js";
import { writeAdminAudit } from "../services/admin-audit.service.js";
import { ensureDefaultSiteContent } from "../services/content.service.js";
import { isCloudinaryConfigured, uploadImageToCloudinary } from "../services/cloudinary.service.js";
import { ApiError } from "../utils/api-error.js";
import { routeParam } from "../utils/params.js";
import { validateBody } from "../utils/validate.js";
import {
  publicGallerySubmissionSchema,
  reviewMediaSchema,
  siteMediaSchema,
  siteMediaUpdateSchema,
  siteTestimonialSchema,
  siteTestimonialUpdateSchema,
} from "../validators/content.validator.js";

/** Public: homepage moments + reviews (+ note that events use /api/events). */
export async function getHomeContent(_request: Request, response: Response) {
  await ensureDefaultSiteContent();

  const [moments, testimonials] = await Promise.all([
    prisma.siteMedia.findMany({
      where: { published: true, showOnHomeMoments: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: 12,
    }),
    prisma.siteTestimonial.findMany({
      where: { published: true, showOnHome: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: 12,
    }),
  ]);

  response.json({
    data: {
      moments: moments.map((m) => ({
        id: m.id,
        title: m.title,
        meta: m.meta ?? m.eventLabel ?? m.category,
        image: m.imageUrl,
        category: m.category,
        location: m.location,
        event: m.eventLabel,
      })),
      testimonials: testimonials.map((t) => ({
        id: t.id,
        name: t.name,
        role: t.role,
        city: t.city,
        quote: t.quote,
        rating: t.rating,
      })),
    },
  });
}

/** Public: gallery grid items. */
export async function getGalleryContent(request: Request, response: Response) {
  await ensureDefaultSiteContent();
  const category =
    typeof request.query.category === "string" ? request.query.category.trim() : "";

  const items = await prisma.siteMedia.findMany({
    where: {
      published: true,
      showInGallery: true,
      ...(category && category !== "All" ? { category } : {}),
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  response.json({
    data: items.map((m) => ({
      id: m.id,
      title: m.title,
      event: m.eventLabel ?? "Mountain Run",
      location: m.location ?? "India",
      date: m.dateLabel ?? "",
      category: m.category,
      image: m.imageUrl,
      meta: m.meta,
    })),
  });
}

/** Public: submit a photo for the gallery (pending moderation). */
export async function submitGalleryPhoto(request: Request, response: Response) {
  const payload = validateBody(publicGallerySubmissionSchema, request);

  let imageUrl: string;
  if (isCloudinaryConfigured()) {
    const uploaded = await uploadImageToCloudinary(payload.file, "runnerup/gallery");
    imageUrl = uploaded.secure_url;
  } else {
    if (!payload.file.startsWith("https://")) {
      throw new ApiError(503, "Image upload requires Cloudinary to be configured");
    }
    imageUrl = payload.file;
  }

  const item = await prisma.siteMedia.create({
    data: {
      title: payload.title,
      imageUrl,
      category: "Community",
      eventLabel: payload.eventLabel ?? null,
      location: payload.location ?? null,
      submittedBy: payload.name,
      published: false,
      showInGallery: true,
      showOnHomeMoments: false,
    },
  });

  response.status(201).json({
    data: {
      id: item.id,
      message: "Thank you! Your photo has been submitted and is pending review.",
    },
  });
}

// ── Admin media ───────────────────────────────────────────────

export async function adminListMedia(_request: AuthenticatedRequest, response: Response) {
  await ensureDefaultSiteContent();
  const items = await prisma.siteMedia.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  response.json({ data: items });
}

export async function adminCreateMedia(request: AuthenticatedRequest, response: Response) {
  const payload = validateBody(siteMediaSchema, request);
  const item = await prisma.siteMedia.create({
    data: {
      title: payload.title,
      imageUrl: payload.imageUrl,
      category: payload.category ?? "Community",
      location: payload.location ?? null,
      eventLabel: payload.eventLabel ?? null,
      dateLabel: payload.dateLabel ?? null,
      meta: payload.meta ?? null,
      sortOrder: payload.sortOrder ?? 0,
      published: payload.published ?? true,
      showInGallery: payload.showInGallery ?? true,
      showOnHomeMoments: payload.showOnHomeMoments ?? false,
    },
  });

  await writeAdminAudit(request, {
    action: "content.media.create",
    entityType: "SiteMedia",
    entityId: item.id,
    summary: `Created media “${item.title}”`,
  });

  response.status(201).json({ data: item });
}

export async function adminUpdateMedia(request: AuthenticatedRequest, response: Response) {
  const id = routeParam(request, "id");
  const payload = validateBody(siteMediaUpdateSchema, request);
  const existing = await prisma.siteMedia.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, "Media not found");
  }

  const item = await prisma.siteMedia.update({
    where: { id },
    data: {
      ...payload,
      location: payload.location === undefined ? undefined : payload.location,
      eventLabel: payload.eventLabel === undefined ? undefined : payload.eventLabel,
      dateLabel: payload.dateLabel === undefined ? undefined : payload.dateLabel,
      meta: payload.meta === undefined ? undefined : payload.meta,
    },
  });

  await writeAdminAudit(request, {
    action: "content.media.update",
    entityType: "SiteMedia",
    entityId: id,
    summary: `Updated media “${item.title}”`,
  });

  response.json({ data: item });
}

export async function adminDeleteMedia(request: AuthenticatedRequest, response: Response) {
  const id = routeParam(request, "id");
  const existing = await prisma.siteMedia.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, "Media not found");
  }
  await prisma.siteMedia.delete({ where: { id } });
  await writeAdminAudit(request, {
    action: "content.media.delete",
    entityType: "SiteMedia",
    entityId: id,
    summary: `Deleted media “${existing.title}”`,
  });
  response.json({ data: { id, deleted: true } });
}

/** Admin: approve or reject a gallery photo submission. */
export async function adminReviewMediaSubmission(
  request: AuthenticatedRequest,
  response: Response,
) {
  const id = routeParam(request, "id");
  const payload = validateBody(reviewMediaSchema, request);

  const existing = await prisma.siteMedia.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, "Media not found");
  }

  const item = await prisma.siteMedia.update({
    where: { id },
    data: {
      published: payload.approved,
      meta: payload.approved ? null : (payload.note ?? existing.meta),
    },
  });

  await writeAdminAudit(request, {
    action: payload.approved ? "content.media.approve" : "content.media.reject",
    entityType: "SiteMedia",
    entityId: id,
    summary: payload.approved
      ? `Approved gallery submission "${item.title}"`
      : `Rejected gallery submission "${item.title}"${payload.note ? ": " + payload.note : ""}`,
  });

  response.json({
    data: item,
    meta: {
      message: payload.approved
        ? "Photo approved and now visible in the gallery."
        : "Photo rejected and will not appear in the gallery.",
    },
  });
}

// ── Admin testimonials ────────────────────────────────────────

export async function adminListTestimonials(
  _request: AuthenticatedRequest,
  response: Response,
) {
  await ensureDefaultSiteContent();
  const items = await prisma.siteTestimonial.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  response.json({ data: items });
}

export async function adminCreateTestimonial(
  request: AuthenticatedRequest,
  response: Response,
) {
  const payload = validateBody(siteTestimonialSchema, request);
  const item = await prisma.siteTestimonial.create({
    data: {
      name: payload.name,
      role: payload.role,
      city: payload.city ?? null,
      quote: payload.quote,
      rating: payload.rating ?? 5,
      sortOrder: payload.sortOrder ?? 0,
      published: payload.published ?? true,
      showOnHome: payload.showOnHome ?? true,
    },
  });

  await writeAdminAudit(request, {
    action: "content.testimonial.create",
    entityType: "SiteTestimonial",
    entityId: item.id,
    summary: `Created testimonial from ${item.name}`,
  });

  response.status(201).json({ data: item });
}

export async function adminUpdateTestimonial(
  request: AuthenticatedRequest,
  response: Response,
) {
  const id = routeParam(request, "id");
  const payload = validateBody(siteTestimonialUpdateSchema, request);
  const existing = await prisma.siteTestimonial.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, "Testimonial not found");
  }

  const item = await prisma.siteTestimonial.update({
    where: { id },
    data: {
      ...payload,
      city: payload.city === undefined ? undefined : payload.city,
    },
  });

  await writeAdminAudit(request, {
    action: "content.testimonial.update",
    entityType: "SiteTestimonial",
    entityId: id,
    summary: `Updated testimonial ${item.name}`,
  });

  response.json({ data: item });
}

export async function adminDeleteTestimonial(
  request: AuthenticatedRequest,
  response: Response,
) {
  const id = routeParam(request, "id");
  const existing = await prisma.siteTestimonial.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, "Testimonial not found");
  }
  await prisma.siteTestimonial.delete({ where: { id } });
  await writeAdminAudit(request, {
    action: "content.testimonial.delete",
    entityType: "SiteTestimonial",
    entityId: id,
    summary: `Deleted testimonial ${existing.name}`,
  });
  response.json({ data: { id, deleted: true } });
}
