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
        <h1 className='text-2xl font-bold mb-6 text-(--teal)'>About</h1>
    <p className='mb-2'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean eleifend lorem sed diam efficitur, eget feugiat urna fringilla. Vestibulum posuere aliquet nibh ac pharetra. </p>
   <p className='mb-2'>Aliquam gravida, urna eu volutpat maximus, justo leo lobortis sem, vel blandit nunc massa et turpis. Sed vehicula lectus ut risus suscipit ornare. Proin egestas quis dui non viverra.</p> 
   <p className='mb-2'>Maecenas in sollicitudin urna. Pellentesque vehicula risus lorem, sit amet facilisis turpis accumsan et. Duis facilisis metus ac nisi dignissim, eget condimentum ipsum tempus.</p>
        </main>
      </div>

     
    </Layout>
  );
};

export default CalendarPage;
