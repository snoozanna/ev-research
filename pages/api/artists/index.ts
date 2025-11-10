// pages/api/artists.ts
import prisma from "../../../lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

export default async function handler(req, res) {
  const { userId } = getAuth(req);

  if (!userId) return res.status(401).json({ message: "Not authenticated" });

  const currentUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (currentUser?.role !== "ADMIN") return res.status(403).json({ message: "Forbidden" });

  const artists = await prisma.user.findMany({
    where: { role: "ARTIST" },
    select: { id: true, firstName: true, lastName: true, email: true },
  });

  res.json(artists);
}
