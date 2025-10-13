import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import { useSession, getSession } from 'next-auth/react';
import Router from 'next/router';
import Layout from '../components/Layout';
import Post, { PostProps } from '../components/Post';
import prisma from '../lib/prisma';
import { FaPen, FaShareAlt } from 'react-icons/fa';

const ShareToggle = ({ postId, initialState }: { postId: string; initialState: boolean }) => {
  const [enabled, setEnabled] = useState(initialState);

  const toggle = async () => {
    try {
      const res = await fetch(`/api/shareWithArtist/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareWithArtist: !enabled }),
      });
      if (res.ok) setEnabled(!enabled);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <FaShareAlt className="text-gray-600" />
      <button
        onClick={toggle}
        role="switch"
        aria-checked={enabled}
        className={`relative inline-flex items-center h-6 w-12 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
          enabled ? 'bg-indigo-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block w-5 h-5 transform bg-white rounded-full shadow-md transition-transform duration-200 ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      <span className="text-gray-700 select-none">{enabled ? 'Shared with artist' : 'Not shared with artist'}</span>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getSession({ req });
  if (!session) {
    res.statusCode = 403;
    return { props: { drafts: [] } };
  }

  const drafts = await prisma.post.findMany({
    where: { author: { email: session.user.email } },
    include: {
      author: { select: { name: true, email: true } },
      performance: { select: { id: true, name: true } },
      performanceDate: { select: { id: true, dateTime: true } },
      promptAnswers: { include: { prompt: { select: { id: true, text: true } } } },
    },
  });

  return { props: { drafts } };
};

type Props = { drafts: PostProps[] };

const Drafts: React.FC<Props> = ({ drafts }) => {
  const { data: session } = useSession();
  const [draftPosts, setDraftPosts] = useState(drafts);

  if (!session) {
    return (
      <Layout>
        <h1 className="text-2xl font-bold mb-4">My Drafts</h1>
        <div className="text-gray-700">You need to be authenticated to view this page.</div>
      </Layout>
    );
  }

  const publishPost = async (id: string) => {
    const res = await fetch(`/api/publish/${id}`, { method: 'PUT' });
    if (res.ok) {
      setDraftPosts((prev) => prev.map(p => p.id === id ? { ...p, published: true } : p));
    }
  };

  const deletePost = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this post?");
    if (!confirmed) return;

    const res = await fetch(`/api/post/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setDraftPosts((prev) => prev.filter(p => p.id !== id));
    } else {
      alert("Failed to delete post");
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">My Personal Feed</h1>
        <main className="space-y-6">
          {draftPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white shadow-sm rounded-lg p-4 hover:shadow-md transition-shadow duration-150"
            >
              <Post post={post} />

              <div className="mt-4 flex flex-wrap gap-4 items-center">
                {/* Share Toggle */}
                <ShareToggle postId={post.id} initialState={post.shareWithArtist ?? false} />

                {/* Edit Post */}
                {/* <button
                  onClick={() => Router.push(`/p/${post.id}`)}
                  className="flex items-center gap-2 px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-600 text-white focus:outline-none focus:ring focus:ring-yellow-200"
                >
                  <FaPen />
                  Edit Post
                </button> */}

                {/* Delete Post */}
                <button
                  onClick={() => deletePost(post.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white focus:outline-none focus:ring focus:ring-red-200"
                >
                  🗑️ Delete Post
                </button>

                {/* Publish Post */}
                {/* {!post.published && (
                  <button
                    onClick={() => publishPost(post.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-white focus:outline-none focus:ring focus:ring-green-200"
                  >
                    ✅ Publish
                  </button>
                )} */}
              </div>
            </div>
          ))}
          {draftPosts.length === 0 && <p className="text-gray-500">No drafts available.</p>}
        </main>
      </div>
    </Layout>
  );
};

export default Drafts;
