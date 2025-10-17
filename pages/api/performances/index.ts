import prisma from "../../../lib/prisma";
// import { getServerSession } from "next-auth";
// import { authOptions } from "../auth/[...nextauth]";


export default async function handler(req, res) {
  if (req.method === "GET") {
    const performances = await prisma.performance.findMany({
      include: { dates: true, prompts: true },
    });
    // console.log("performances", performances)
    return res.json(performances);
  }

  // if (req.method === "POST") {
  //   const session = await getServerSession(req, res, authOptions);
  //   console.log("session", session)
  //   if (!session || session.user.role !== "ADMIN") return res.status(403).end();

  //   const { name, location, dates, prompts } = req.body;

  //   const performance = await prisma.performance.create({
  //     data: {
  //       name,
  //       location,
  //       dates: {
  //         create: dates.map((d) => ({ dateTime: new Date(d) })),
  //       },
  //       prompts: {
  //         create: prompts.map((t) => ({ text: t })),
  //       },
  //     },
  //   });

  //   return res.status(201).json(performance);
  // }

  res.status(405).end();
}
