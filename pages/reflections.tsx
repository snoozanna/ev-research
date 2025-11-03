import React, { useState, useMemo } from 'react';
import { GetServerSideProps } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import Layout from '../components/Layout';
import { PostProps, colourEmojis } from '../components/Post';
import prisma from '../lib/prisma';
import CollapsedPostIt from '../components/CollapsedPostIt';
import FilterBar from '../components/FilterBar';



export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const { userId } = getAuth(req);

  if (!userId) {
    return {
      redirect: {
        destination: '/sign-in',
        permanent: false,
      },
    };
  }

  const myPosts = await prisma.post.findMany({
    where: { author: { clerkId: userId } },
    include: {
      author: { select: { firstName: true, email: true } },
      performance: { select: { id: true, name: true, imageUrl: true } },
      performanceDate: { select: { id: true, dateTime: true } },
      promptAnswers: { include: { prompt: { select: { id: true, text: true } } } },
    },
  });

  // Convert Date objects to ISO strings
  const serializedPosts = myPosts.map((post) => ({
    ...post,
    createdAt: post.createdAt?.toISOString?.() ?? null,
    performanceDate: post.performanceDate
      ? {
          ...post.performanceDate,
          dateTime: post.performanceDate.dateTime
            ? post.performanceDate.dateTime.toISOString()
            : null,
        }
      : null,
  }));
  

  return { 
    props: { 
      myPosts: serializedPosts,
      isAuthenticated: true 
    } 
  };
};

type Props = { myPosts: PostProps[];
  isAuthenticated: boolean;
 };

const Reflections: React.FC<Props> = ({ myPosts, isAuthenticated }) => {

  const [draftPosts, setDraftPosts] = useState(myPosts);

  // Filter states
  const [selectedPerformance, setSelectedPerformance] = useState<string>('all');
  const [sharedFilter, setSharedFilter] = useState<'all' | 'shared' | 'not_shared'>('all');
  const [colourFilter, setColourFilter] = useState<number | 'all'>('all');

  // Get unique performances for dropdown
  const performances = useMemo(() => {
    const unique = new Map<string, string>();
    myPosts.forEach((d) => {
      if (d.performance?.id && d.performance?.name) {
        unique.set(d.performance.id, d.performance.name);
      }
    });
    return Array.from(unique.entries()).map(([id, name]) => ({ id, name }));
  }, [myPosts]);

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

    <FilterBar selectedPerformance={selectedPerformance}  setSelectedPerformance = {setSelectedPerformance}  performances={performances}  sharedFilter={sharedFilter}  setSharedFilter={setSharedFilter}  setColourFilter={setColourFilter}  colourFilter={colourFilter}/>

        {/* POSTS */}
        <main className="space-y-6">
        <div className="grid grid-cols-2 grid-flow-row sm:grid-cols-2 gap-6">
            {filteredPosts.map((post) => (
                 <CollapsedPostIt key={post.id} post={post} />
          ))}
            {filteredPosts.length === 0 && <p className="text-(--greyblack)">No reflections found.</p>}
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default Reflections;
