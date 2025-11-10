import React from 'react';
import { GetServerSideProps } from 'next';
import Layout from '../components/Layout';
import { PostProps } from '../components/Post';
import prisma from '../lib/prisma';
import Calendar from "../components/Calendar";
import { getAuth } from '@clerk/nextjs/server';

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
   const { userId } = getAuth(req);
  
    if (!userId) {
      res.statusCode = 403;
      return { 
        props: { myPosts: [], isAuthenticated: false } 
      };
    }


  return { props: { isAuthenticated: true  } };
};

type Props = {
  isAuthenticated: boolean;
};


const CalendarPage: React.FC<Props> = ({isAuthenticated }) => {
if (!isAuthenticated) {
  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">About</h1>
      <div className="text-gray-700">You need to be authenticated to view this page.</div>
    </Layout>
  );
}


  return (
    <Layout>
      <div className="page">

        <main>
      
<section className='mb-6'>
  <h2 className='text-2xl font-bold mb-6'>About</h2>
  <p className='mb-2'>We came up with the idea for <span className='text-(--teal)'>Performance Journal</span> because we thought it would be useful from two different perspectives. As artists, we were curious about how to <span className='text-(--teal)'>gather honest, thoughtful feedback</span> from audiences. As audience members, we wanted a way to <span className='text-(--teal)'>record and reflect on our experiences</span> of live performance.</p>
  
  <p className='mb-2'>Although this is an early prototype, we want it to grow into something which offers audience members a meaningful, opt-in journaling practice: a way to build a personal record of art experiences that accumulates over time, similar to platforms like Goodreads but for performance.</p>
    
    <p className='mb-2'> And if artists get to receive genuine feedback from their audiences, shared thoughtfully and on the audience’s own schedule - all the better!</p>
</section>
<section className='mb-6'>

          <h2 className='text-2xl font-bold mb-6 '>How to</h2>
        <p className='mb-2'>  You can choose to record your reflection in <span className='text-(--teal)'>written form</span>, as a <span className='text-(--teal)'>voice note</span>, or by responding to <span className='text-(--teal)'>prompts</span> - some created by the artist, others more general.</p>
  <p className='mb-2'>You’ll receive nudges at timed intervals after seeing a show by email, encouraging you to reflect again once you’ve had a bit more time to digest. </p>
  <p className='mb-2'>You can make as many entries per show as you like. </p>
  <p className='mb-2'>You’ll notice a “Share with Artist” Button within each reflection. This will add that reflection to a pool of anonymised entries that the Artist can access. </p>
      </section>
        </main>
      </div>

     
    </Layout>
  );
};

export default CalendarPage;
