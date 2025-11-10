// pages/api/performances/[id]/assign-artist.ts
import prisma from "../../../../lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

export default async function handler(req, res) {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ message: "Not authenticated" });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (user?.role !== "ADMIN") return res.status(403).json({ message: "Forbidden" });

  const { id } = req.query;
  const { artistId } = req.body;

  try {
    await prisma.performance.update({
      where: { id: id as string },
      data: { artistId },
    });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error assigning artist" });
  }
}
