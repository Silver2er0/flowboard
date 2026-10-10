import "server-only";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { db } from "./db";
import type { Status } from "./status";

const DAY = 86_400_000;

const SAMPLE: [Status, string, string, string, number][] = [
  ["WISHLIST", "Stripe", "Backend Engineer", "Remote", 0],
  ["WISHLIST", "Linear", "Full-Stack Engineer", "Remote", 1],
  ["APPLIED", "Vercel", "Frontend Engineer", "Remote", 3],
  ["APPLIED", "Shopify", "Senior Developer", "Toronto", 6],
  ["APPLIED", "Notion", "Product Engineer", "San Francisco", 9],
  ["INTERVIEW", "Spotify", "Backend Engineer", "Stockholm", 14],
  ["INTERVIEW", "Figma", "Software Engineer", "London", 17],
  ["OFFER", "GitLab", "Full-Stack Engineer", "Remote", 25],
  ["REJECTED", "Meta", "Software Engineer", "Dubai", 31],
  ["REJECTED", "Uber", "Backend Engineer", "Amsterdam", 38],
];

/** Creates a throwaway user pre-filled with sample applications. */
export async function createDemoUser() {
  const id = randomBytes(4).toString("hex");
  return db.user.create({
    data: {
      email: `demo-${id}@flowboard.demo`,
      name: "Demo User",
      passwordHash: await bcrypt.hash(randomBytes(16).toString("hex"), 8),
      applications: {
        create: SAMPLE.map(([status, company, role, location, daysAgo], i) => ({
          status,
          company,
          role,
          location,
          position: (i + 1) * 1024,
          appliedAt: new Date(Date.now() - daysAgo * DAY),
        })),
      },
    },
  });
}
