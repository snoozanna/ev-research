import React, { useState, useMemo } from 'react';
import { GetServerSideProps } from 'next';
import { useSession, getSession } from 'next-auth/react';
import Layout from '../components/Layout';
import Post, { PostProps } from '../components/Post';
import prisma from '../lib/prisma';
import { FaRegTrashAlt } from 'react-icons/fa';
import { ShareToggle } from '../components/ShareToggle';

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

const Reflections: React.FC<Props> = ({ drafts }) => {
  const { data: session } = useSession();
  const [draftPosts, setDraftPosts] = useState(drafts);

  // Filter states
  const [selectedPerformance, setSelectedPerformance] = useState<string>('all');
  const [sharedFilter, setSharedFilter] = useState<'all' | 'shared' | 'not_shared'>('all');

  // Get unique performances for dropdown
  const performances = useMemo(() => {
    const unique = new Map<string, string>();
    drafts.forEach((d) => {
      if (d.performance?.id && d.performance?.name) {
        unique.set(d.performance.id, d.performance.name);
      }
    });
    return Array.from(unique.entries()).map(([id, name]) => ({ id, name }));
  }, [drafts]);

  // Filtered posts
  const filteredPosts = useMemo(() => {
    return draftPosts.filter((post) => {
      const matchesPerformance =
        selectedPerformance === 'all' ||
        post.performance?.id === selectedPerformance;

      const matchesShared =
        sharedFilter === 'all' ||
        (sharedFilter === 'shared' && post.shareWithArtist) ||
        (sharedFilter === 'not_shared' && !post.shareWithArtist);

      return matchesPerformance && matchesShared;
    });
  }, [draftPosts, selectedPerformance, sharedFilter]);

  const deletePost = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this post?");
    if (!confirmed) return;
    const res = await fetch(`/api/post/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setDraftPosts((prev) => prev.filter((p) => p.id !== id));
    } else {
      alert("Failed to delete post");
    }
  };


  if (!session) {
    return (
      <Layout>
        <h1 className="text-2xl font-bold mb-4">My Reflections</h1>
        <div className="text-gray-700">You need to be authenticated to view this page.</div>
      </Layout>
    );
  }


  

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">My Reflections</h1>

        {/* FILTER BAR */}
        <div className="flex flex-wrap gap-4 mb-6 items-center">
          {/* Performance filter */}
          <select
            value={selectedPerformance}
            onChange={(e) => setSelectedPerformance(e.target.value)}
            className="p-2 border rounded-md"
          >
            <option value="all">All Performances</option>
            {performances.map((perf) => (
              <option key={perf.id} value={perf.id}>
                {perf.name}
              </option>
            ))}
          </select>

          {/* Shared filter */}
          <select
            value={sharedFilter}
            onChange={(e) => setSharedFilter(e.target.value as 'all' | 'shared' | 'not_shared')}
            className="p-2 border rounded-md"
          >
            <option value="all">All</option>
            <option value="shared">Shared with artist</option>
            <option value="not_shared">Not shared</option>
          </select>
        </div>

        {/* POSTS */}
        <main className="space-y-6">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white shadow-sm rounded-lg p-4 hover:shadow-md transition-shadow duration-150"
            >
              <Post post={post} />

              <div className="mt-4 flex flex-wrap gap-4 items-center justify-between">
                <ShareToggle postId={post.id} initialState={post.shareWithArtist ?? false} />
                <button
                  onClick={() => deletePost(post.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white focus:outline-none focus:ring focus:ring-red-200"
                >
                  <FaRegTrashAlt />
                </button>
              </div>
            </div>
          ))}
          {filteredPosts.length === 0 && <p className="text-gray-500">No reflections found.</p>}
        </main>
      </div>
    </Layout>
  );
};

export default Reflections;
