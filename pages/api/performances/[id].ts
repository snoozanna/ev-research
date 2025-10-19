import { getAuth } from "@clerk/nextjs/server";
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  const { id } = req.query;
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  // Fetch user role from Prisma (DB = source of truth)
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });

  if (!user || user.role !== "ADMIN") {
    return res.status(403).json({ error: "Unauthorized" });
  }

  if (req.method === "PUT") {
    const { name, location, dates, prompts } = req.body;

    try {
      // Delete old related records and replace with new ones
      await prisma.performanceDate.deleteMany({ where: { performanceId: id } });
      await prisma.prompt.deleteMany({ where: { performanceId: id } });

      const updated = await prisma.performance.update({
        where: { id },
        data: {
          name,
          location,
          dates: { create: dates.map((d) => ({ dateTime: new Date(d) })) },
          prompts: { create: prompts.map((t) => ({ text: t })) },
        },
        include: { dates: true, prompts: true },
      });

      return res.status(200).json(updated);
    } catch (error) {
      console.error("Error updating performance:", error);
      return res.status(500).json({ error: "Failed to update performance" });
    }
  }

  if (req.method === "DELETE") {
    try {
      await prisma.performance.delete({ where: { id } });
      return res.status(204).end();
    } catch (error) {
      console.error("Error deleting performance:", error);
      return res.status(500).json({ error: "Failed to delete performance" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
