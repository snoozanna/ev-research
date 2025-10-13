import prisma from '../../../lib/prisma';

// DELETE /api/post/:id
export default async function handle(req, res) {
  const postId = req.query.id;
  if (req.method === 'DELETE') {
    try {
      // Delete all PromptAnswers associated with this post
      await prisma.promptAnswer.deleteMany({
        where: { postId },
      });

      // Then delete the post itself
      const post = await prisma.post.delete({
        where: { id: postId },
      });

      res.status(200).json(post);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to delete post" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
