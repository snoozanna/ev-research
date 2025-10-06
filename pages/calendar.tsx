import React from 'react';
import { GetServerSideProps } from 'next';
import { useSession, getSession } from 'next-auth/react';
import Router from 'next/router';
import Layout from '../components/Layout';
import Post, { PostProps } from '../components/Post';
import prisma from '../lib/prisma';
import Calendar from "../components/Calendar";

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getSession({ req });
  if (!session) {
    res.statusCode = 403;
    return { props: { myPosts: [] } };
  }

  const myPosts = await prisma.post.findMany({
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

  return { props: { myPosts } };
};

type Props = {
  myPosts: PostProps[];
};


const CalendarPage: React.FC<Props> = ({ myPosts }) => {
  const { data: session } = useSession();
// console.log("myPosts", myPosts)
  if (!session) {
    return (
      <Layout>
        <h1>My Calendar</h1>
        <div>You need to be authenticated to view this page.</div>
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
