import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const postId = req.query.id as string;

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { colourRating } = req.body;
    const post = await prisma.post.update({
      where: { id: postId },
      data: { colourRating },
    });

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: 'Post not found or update failed' });
  }
}
