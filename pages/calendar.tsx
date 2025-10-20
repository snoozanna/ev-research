import React from 'react';
import { GetServerSideProps } from 'next';
import Layout from '../components/Layout';
import { PostProps } from '../components/Post';
import prisma from '../lib/prisma';
// import Calendar from "../components/Calendar";
import { getAuth } from '@clerk/nextjs/server';

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
   const { userId } = getAuth(req);
  
    if (!userId) {
      res.statusCode = 403;
      return { 
        props: { myPosts: [], isAuthenticated: false } 
      };
    }

  const myPosts = await prisma.post.findMany({
    where: { author: { clerkId: userId } },
    include: {
      author: { select: { firstName: true, email: true } },
      performance: { select: { id: true, name: true } },
      performanceDate: { select: { id: true, dateTime: true } },
      promptAnswers: {
        include: {
          prompt: { select: { id: true, text: true } },
        },
      },
    },
  });

  return { props: { myPosts,  isAuthenticated: true  } };
};

type Props = {
  myPosts: PostProps[];
  isAuthenticated: boolean;
};


const CalendarPage: React.FC<Props> = ({ myPosts, isAuthenticated }) => {
if (!isAuthenticated) {
  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">My Calendar</h1>
      <div className="text-gray-700">You need to be authenticated to view this page.</div>
    </Layout>
  );
}


  return (
    <Layout>
      <div className="page">
        <h1>My Calendar</h1>
        <main>
           {/* <Calendar posts={myPosts}/>  */}
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

export default CalendarPage;
