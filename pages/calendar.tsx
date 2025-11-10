import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import Layout from '../components/Layout';
import { PostProps } from '../components/Post';
import prisma from '../lib/prisma';
import Calendar from "../components/Calendar";
import { getAuth } from '@clerk/nextjs/server';
import { useUser } from "@clerk/nextjs";
import Header from '../components/Header';
import { Role } from "@prisma/client";

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

  // Get user role
const userPr = await prisma.user.findUnique({
  where: { clerkId: userId },
  select: { id: true, role: true },
});

if (!userPr) {
  return { redirect: { destination: '/sign-in', permanent: false } };
}


const myPosts = await prisma.post.findMany({
    where: { author: { clerkId: userId } },
    include: {
      author: { select: { firstName: true, email: true } },
      performance: { select: { id: true, name: true, imageUrl: true } },
      performanceDate: { select: { id: true, dateTime: true } },
      promptAnswers: {
        include: {
          prompt: { select: { id: true, text: true } },
        },
      },
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

  return { props: { myPosts: serializedPosts,  isAuthenticated: true, userPr:userPr  } };
};

type UserPr = {
  id: string;
  role: Role;
};

type Props = {
  myPosts: PostProps[];
  isAuthenticated: boolean;
  userPr: UserPr;
};


const CalendarPage: React.FC<Props> = ({ myPosts, isAuthenticated, userPr }) => {

  const [mode, setMode] = useState<"performance" | "reflection">("performance");
  const role = userPr?.role;
const { isSignedIn } = useUser();

const toggle = () => {
  if (mode === "performance"){
    setMode("reflection")
  }
  else {
    setMode("performance")
  }  
}

if (!isSignedIn) {
  return (
    <Layout>
      <Header userRole={role} />
      <h1 className="text-2xl font-bold mb-4">My Calendar</h1>
      <div className="text-gray-700">You need to be authenticated to view this page.</div>
    </Layout>
  );
}

 if (role === "ARTIST") {
      return (
        <Layout>
          <Header userRole={role} />
          <div className="text-gray-700">You don't have permission to view this page</div>
        </Layout>
      );
    }


  return (
    <Layout>
      <Header userRole={role} />
      <div className="page">
        <h1 className='text-2xl font-bold mb-6'>My Calendar</h1>
        <main>
    
        <div className="flex items-center gap-2 mb-4">
  <button
    onClick={toggle}
    role="switch"
    aria-checked={mode === "performance"}
    className={`relative inline-flex items-center h-7 w-14 rounded-full transition-colors duration-300 focus:outline-none p-0 ${
      mode === "performance"
        ? 'bg-(--darkpink)'
        : 'bg-(--lavender)'
    }`}
  >
    <span
      className={`inline-block w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-out ${
        mode === "performance" ? 'translate-x-7' : 'translate-x-1'
      }`}
    />
  </button>

  <span className="text-(--greyblack) text-sm font-medium select-none">
    {mode === "performance"
      ? 'Days I saw performances'
      : 'Days I made reflections'}
  </span>
</div>

           <Calendar posts={myPosts} mode={mode}/> 
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

          border: 0;
          border-radius: 0.25rem;
   
        }
        button + button {
          margin-left: 0.5rem;
        }
      `}</style>
    </Layout>
  );
};

export default CalendarPage;
