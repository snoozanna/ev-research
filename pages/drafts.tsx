import React from 'react';
import { GetServerSideProps } from 'next';
import { useSession, getSession } from 'next-auth/react';
import Router from 'next/router';
import Layout from '../components/Layout';
import Post, { PostProps } from '../components/Post';
import prisma from '../lib/prisma';

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getSession({ req });
  if (!session) {
    res.statusCode = 403;
    return { props: { drafts: [] } };
  }

  const drafts = await prisma.post.findMany({
    where: {
      author: { email: session.user.email },
      // published: false,
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

  return { props: { drafts } };
};

type Props = {
  drafts: PostProps[];
};

async function publishPost(id: string) {
  await fetch(`/api/publish/${id}`, { method: 'PUT' });
  Router.reload();
}

async function toggleShareWithArtist(id: string, current: boolean) {
  await fetch(`/api/shareWithArtist/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shareWithArtist: !current }),
  });
  Router.reload();
}

const Drafts: React.FC<Props> = ({ drafts }) => {
  const { data: session } = useSession();

  if (!session) {
    return (
      <Layout>
        <h1>My Drafts</h1>
        <div>You need to be authenticated to view this page.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page">
        <h1>My Personal Feed</h1>
        <main>
          {drafts.map((post) => (
            <div key={post.id} className="post">
              <Post post={post} />

              <div className="actions">
                <button onClick={() => publishPost(post.id)}>{post.published ? 'Published' : 'Publish publicly'}</button>

                <button onClick={() => toggleShareWithArtist(post.id, post.shareWithArtist ?? false)}>
                  {post.shareWithArtist ? 'Unshare with Artist' : 'Share with Artist'}
                </button>

                <button onClick={() => Router.push(`/p/${post.id}`)}>Edit Post</button>
              </div>
            </div>
          ))}
        </main>
      </div>

      <style jsx>{`
        .post {
          background: var(--geist-background);
          padding: 1rem;
          margin-bottom: 2rem;
          border-radius: 0.5rem;
          transition: box-shadow 0.1s ease-in;
        }
        .post:hover {
          box-shadow: 1px 1px 3px #aaa;
        }
        .actions {
          margin-top: 1rem;
        }
        button {
          background: #ececec;
          border: 0;
          border-radius: 0.25rem;
          padding: 0.5rem 1rem;
        }
        button + button {
          margin-left: 0.5rem;
        }
      `}</style>
    </Layout>
  );
};

export default Drafts;
