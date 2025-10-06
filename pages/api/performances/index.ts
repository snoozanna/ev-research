// pages/api/performances/index.ts
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const performances = await prisma.performance.findMany({
        include: {
          dates: true,
        },
      });
      res.status(200).json(performances);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error fetching performances" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
