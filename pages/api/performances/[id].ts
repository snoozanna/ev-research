import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  const { id } = req.query;
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Unauthorized" });
  }

  if (req.method === "PUT") {
    const { name, location, dates, prompts } = req.body;

    // Delete old dates/prompts and replace
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

    return res.json(updated);
  }

  if (req.method === "DELETE") {
    await prisma.performance.delete({ where: { id } });
    return res.status(204).end();
  }

  res.status(405).end();
}
