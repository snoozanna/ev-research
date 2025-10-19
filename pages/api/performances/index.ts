// pages/api/performance/index.ts
import { getAuth } from "@clerk/nextjs/server";
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const performances = await prisma.performance.findMany({
        include: { dates: true, prompts: true },
      });
      return res.status(200).json(performances);
    } catch (error) {
      console.error("Error fetching performances:", error);
      return res.status(500).json({ error: "Failed to fetch performances" });
    }
  }

  if (req.method === "POST") {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Fetch user role from Prisma
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { name, location, dates, prompts } = req.body;

    try {
      const performance = await prisma.performance.create({
        data: {
          name,
          location,
          dates: {
            create: dates.map((d: string) => ({ dateTime: new Date(d) })),
          },
          prompts: {
            create: prompts.map((t: string) => ({ text: t })),
          },
        },
        include: { dates: true, prompts: true },
      });

      return res.status(201).json(performance);
    } catch (error) {
      console.error("Error creating performance:", error);
      return res.status(500).json({ error: "Failed to create performance" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
