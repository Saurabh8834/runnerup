import { prisma } from "../lib/prisma.js";

const defaultMedia = [
  {
    title: "Sunrise finish",
    imageUrl: "/images/sunrise-finish.svg",
    category: "Trail Run",
    location: "Lonavala",
    eventLabel: "Monsoon Mountain Miles",
    dateLabel: "2026",
    meta: "5 km finisher",
    sortOrder: 1,
    showInGallery: true,
    showOnHomeMoments: true,
  },
  {
    title: "Club leaderboard push",
    imageUrl: "/images/club-push.svg",
    category: "Community",
    location: "Pune",
    eventLabel: "Independence Endurance Run",
    dateLabel: "2026",
    meta: "10 km team effort",
    sortOrder: 2,
    showInGallery: true,
    showOnHomeMoments: true,
  },
  {
    title: "First medal day",
    imageUrl: "/images/first-medal.svg",
    category: "Awards",
    location: "Mumbai",
    eventLabel: "Spring Valley Dash",
    dateLabel: "2026",
    meta: "New runner story",
    sortOrder: 3,
    showInGallery: true,
    showOnHomeMoments: true,
  },
  {
    title: "Weekend long run",
    imageUrl: "/images/weekend-long-run.svg",
    category: "Training",
    location: "Bengaluru",
    eventLabel: "Club weekend",
    dateLabel: "2026",
    meta: "21 km verified",
    sortOrder: 4,
    showInGallery: true,
    showOnHomeMoments: true,
  },
  {
    title: "Mountain ridge effort",
    imageUrl: "/images/mountain-run-hero.svg",
    category: "Nature",
    location: "Nilgiris",
    eventLabel: "Himalayan Winter Sprint",
    dateLabel: "2026",
    meta: "Trail highlight",
    sortOrder: 5,
    showInGallery: true,
    showOnHomeMoments: false,
  },
];

const defaultTestimonials = [
  {
    name: "Aarav Sharma",
    role: "10 km finisher",
    city: "Pune",
    quote:
      "Registration was simple and the proof upload was clear. Getting my certificate the same week felt great.",
    rating: 5,
    sortOrder: 1,
  },
  {
    name: "Nisha Verma",
    role: "5 km beginner",
    city: "Mumbai",
    quote:
      "I ran in my own city but still felt part of a real event. The medal made it memorable.",
    rating: 5,
    sortOrder: 2,
  },
  {
    name: "Rohan Mehta",
    role: "21 km finisher",
    city: "Delhi",
    quote:
      "The leaderboard gave my long run a real target. Clean experience from payment to verification.",
    rating: 5,
    sortOrder: 3,
  },
];

/** Seed default CMS rows once so homepage/gallery work before admin edits. */
export async function ensureDefaultSiteContent() {
  const [mediaCount, testimonialCount] = await Promise.all([
    prisma.siteMedia.count(),
    prisma.siteTestimonial.count(),
  ]);

  if (mediaCount === 0) {
    await prisma.siteMedia.createMany({
      data: defaultMedia.map((row) => ({
        ...row,
        published: true,
      })),
    });
  } else {
    // Automatically migrate legacy .png paths to new crisp .svg assets
    const legacyPngs = await prisma.siteMedia.findMany({
      where: { imageUrl: { endsWith: ".png" } },
    });
    for (const item of legacyPngs) {
      await prisma.siteMedia.update({
        where: { id: item.id },
        data: { imageUrl: item.imageUrl.replace(/\.png$/, ".svg") },
      });
    }
  }

  if (testimonialCount === 0) {
    await prisma.siteTestimonial.createMany({
      data: defaultTestimonials.map((row) => ({
        ...row,
        published: true,
        showOnHome: true,
      })),
    });
  }
}
