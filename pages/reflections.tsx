import React, { useState, useMemo } from 'react';
import { GetServerSideProps } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import Layout from '../components/Layout';
import { PostProps, colourClasses } from '../components/Post';
import CollapsedPost from '../components/CollapsedPost';
import prisma from '../lib/prisma';



export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const { userId } = getAuth(req);

  if (!userId) {
    res.statusCode = 403;
    return { 
      props: { drafts: [], isAuthenticated: false } 
    };
  }

  const drafts = await prisma.post.findMany({
    where: { author: { clerkId: userId } },
    include: {
      author: { select: { firstName: true, email: true } },
      performance: { select: { id: true, name: true } },
      performanceDate: { select: { id: true, dateTime: true } },
      promptAnswers: { include: { prompt: { select: { id: true, text: true } } } },
    },
  });

  return { 
    props: { 
      drafts,
      isAuthenticated: true 
    } 
  };
};

type Props = { drafts: PostProps[];
  isAuthenticated: boolean;
 };

const Reflections: React.FC<Props> = ({ drafts, isAuthenticated }) => {

  const [draftPosts, setDraftPosts] = useState(drafts);

  // Filter states
  const [selectedPerformance, setSelectedPerformance] = useState<string>('all');
  const [sharedFilter, setSharedFilter] = useState<'all' | 'shared' | 'not_shared'>('all');
  const [colourFilter, setColourFilter] = useState<number | 'all'>('all');

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
  
        const matchesColour =
        colourFilter === 'all' || post.colourRating.toString() === colourFilter.toString();
         console.log("colourFilter", post)
       
      return matchesPerformance && matchesShared && matchesColour;
    });
   
  }, [draftPosts, selectedPerformance, sharedFilter, colourFilter]);

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


  if (!isAuthenticated) {
    return (
      <Layout>
        <h1 className="text-2xl font-bold mb-4">My Reflections</h1>
        <div className="text-gray-700">You need to be authenticated to view this page.</div>
      </Layout>
    );
  }


  

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
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
        {/* Colour filter */}
        <div className="flex items-center gap-3">
  {[1, 2, 3, 4, 5].map((num) => (
    <button
      key={num}
      onClick={() => setColourFilter(num)}
      className={`w-8 h-8 rounded-full border-2 transition-transform transform hover:scale-110 ${
        colourFilter === num
          ? "border-white"
          : "border-transparent"
      } ${colourClasses[num]}`}
      title={`Colour ${num}`}
    />
  ))}

  {/* Clear filter button */}
  <button
    onClick={() => setColourFilter('all')}
    className="ml-2 px-3 py-1 border rounded-md text-sm text-gray-700 hover:bg-gray-100"
  >
    Clear
  </button>
</div>
        </div>


        {/* POSTS */}
        <main className="space-y-6">
          {filteredPosts.map((post) => (
              <CollapsedPost post={post} />
        ))}
          {filteredPosts.length === 0 && <p className="text-gray-500">No reflections found.</p>}
        </main>
      </div>
    </Layout>
  );
};

export default Reflections;
