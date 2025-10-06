import React from 'react';
import { GetServerSideProps } from 'next';
import Router from 'next/router';
import Layout from '../../components/Layout';
import Post, { PostProps } from "../../components/Post";
import { useSession } from 'next-auth/react';
import prisma from '../../lib/prisma';

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const post = await prisma.post.findUnique({
    where: {
      id: String(params?.id),
    },
    include: {
      author: { select: { name: true, email: true } },
      performance: { select: { id: true, name: true } },
      performanceDate: { select: { id: true, dateTime: true } },
      promptAnswers: {
        include: {
          prompt: { select: { id: true, text: true } },
        },
      },
    },
  });

  return {
    props: { post },
  };
};

type Props = {
  post: PostProps;
};

async function publishPost(id: string): Promise<void> {
  await fetch(`/api/publish/${id}`, { method: 'PUT' });
  await Router.push('/');
}

async function deletePost(id: string): Promise<void> {
  await fetch(`/api/post/${id}`, { method: 'DELETE' });
  Router.push('/');
}

const PostPage: React.FC<Props> = ({ post }) => {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Authenticating ...</div>;
  }

  const userHasValidSession = Boolean(session);
  const postBelongsToUser = session?.user?.email === post.author?.email;
console.log("post in id", post)
  return (
    <Layout>
      <Post post={post} />

      <div className="actions">
        {!post.published && userHasValidSession && postBelongsToUser && (
          <button onClick={() => publishPost(post.id)}>Publish</button>
        )}
        {userHasValidSession && postBelongsToUser && (
          <button onClick={() => deletePost(post.id)}>Delete</button>
        )}
      </div>

      <style jsx>{`
        .actions {
          margin-top: 2rem;
        }
        button {
          background: #ececec;
          border: 0;
          border-radius: 0.125rem;
          padding: 1rem 2rem;
        }
        button + button {
          margin-left: 1rem;
        }
      `}</style>
    </Layout>
  );
};

export default PostPage;
