import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

// PUT /api/publish/:id
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const postId = req.query.id as string;

  try {
    const post = await prisma.post.update({
      where: { id: postId },
      data: { published: true },
    });

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: 'Post not found or update failed' });
  }
}
