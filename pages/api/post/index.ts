import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method === "POST") {
    const { title, content } = req.body;

    try {
      const result = await prisma.post.create({
        data: {
          title,
          content,
          author: {
            connect: { email: session.user.email }, // ✅ session.user.email is defined
          },
        },
      });
      res.status(200).json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Something went wrong" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
