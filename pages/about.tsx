import React from 'react';
import { GetServerSideProps } from 'next';
import Layout from '../components/Layout';
import { getAuth } from '@clerk/nextjs/server';
import prisma from '../lib/prisma';
import Header from '../components/Header';
import Link from 'next/link';
import { Role } from "@prisma/client";

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
   const { userId } = getAuth(req);
  
    if (!userId) {
      res.statusCode = 403;
      return { 
        props: { isAuthenticated: false } 
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


  return { props: { isAuthenticated: true, 
    userPr: userPr
    } };
};

type UserPr = {
  id: string;
  role: Role;
};

type Props = {
  isAuthenticated: boolean;
  userPr: UserPr;
};

const CalendarPage: React.FC<Props> = ({isAuthenticated, userPr }) => {
  const role = userPr?.role;
if (!isAuthenticated) {
  return (
    <Layout>
        <Header userRole={role} />
      <h1 className="text-2xl font-bold mb-4">About</h1>
      <div className="text-gray-700">You need to be authenticated to view this page.</div>
    </Layout>
  );
}


  return (
    <Layout>
        <Header userRole={role} />
      <div className="page">

        <main>
      
<section className='mb-6'>
  <h2 className='text-2xl font-bold mb-6'>About</h2>
  <p className='mb-2'>We came up with the idea for <span className='text-(--teal)'>Performance Journal</span> because we thought it would be useful from two different perspectives. As artists, we were curious about how to <span className='text-(--teal)'>gather honest, thoughtful feedback</span> from audiences. As audience members, we wanted a way to <span className='text-(--teal)'>record and reflect on our experiences</span> of live performance.</p>
  
  <p className='mb-2'>Although this is an early prototype, we want it to grow into something which offers audience members a meaningful, opt-in journaling practice: a way to build a personal record of art experiences that accumulates over time, similar to platforms like Goodreads but for performance.</p>
    
    <p className='mb-2'> And if artists get to receive genuine feedback from their audiences, shared thoughtfully and on the audience’s own schedule - all the better!</p>
</section>


{role !== "ARTIST" &&
<>
<section className='mb-6'>
          <h2 className='text-2xl font-bold mb-6 '>How to</h2>
        <p className='mb-2'>  You can choose to record your reflection in <span className='text-(--teal)'>written form</span>, as a <span className='text-(--teal)'>voice note</span>, or by responding to <span className='text-(--teal)'>prompts</span> - some created by the artist, others more general.</p>
  <p className='mb-2'>You’ll receive nudges at timed intervals after seeing a show by email, encouraging you to reflect again once you’ve had a bit more time to digest. </p>
  <p className='mb-2'>You can make as many entries per show as you like. </p>
  <p className='mb-6'>You’ll notice a <span className='text-(--teal)'>“Share with Artist”</span> Button within each reflection. This will add that reflection to a pool of anonymised entries that the Artist can access. </p>
  <Link href="/create" className="w-full sm:w-1/2 md:w-1/3">
      <button
        type="button"
        className="bg-(--darkpink) text-white text-xl uppercase font-bold w-full p-2 shadow-[4px_6px_0px_rgba(0,0,0,0.15)] rotate-[-3deg] hover:rotate-0 hover:shadow-[2px_3px_0px_rgba(0,0,0,0.2)] transition-all duration-200"
      >
        Record a reflection
      </button>
    </Link>
      </section>
      </>}
        </main>
      </div>

     
    </Layout>
  );
};

export default CalendarPage;
