import React from "react";
import Layout from "../components/Layout";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import Header from "../components/Header";
import { GetServerSideProps } from "next";
import { getAuth } from '@clerk/nextjs/server';
import prisma from '../lib/prisma';
import type { Role } from "@prisma/client";


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



return {
  props: {
    isAuthenticated: true,
    userPr: userPr
  },
};
};

type UserPr = {
  id: string;
  role: Role;
};

type Props = {
  isAuthenticated: boolean;
  userPr: UserPr;
};

const Blog: React.FC<Props> = ({ isAuthenticated, userPr}) => {
  const { isSignedIn } = useUser();
  const role = userPr?.role;
  console.log("role", role)
  if (!isSignedIn) {
    return (
      <Layout>
        <Header userRole={role} />
        <div className="text-gray-700">You need to sign in to view this page.</div>
      </Layout>
    );
  }
  return (


    <Layout>
         <Header userRole={role} />
      <div className="container mx-auto px-4 py-8">
      <main className="flex flex-wrap gap-12 justify-center p-2">

  {role !== "ARTIST" &&  
  <Link href="/create" className="w-full sm:w-1/2 md:w-1/3">
    <button
      type="button"
      className="bg-(--darkpink) text-white text-xl uppercase font-bold w-full p-8 rounded-md shadow-[4px_6px_0px_rgba(0,0,0,0.15)] rotate-[-2deg] hover:rotate-0 hover:shadow-[2px_3px_0px_rgba(0,0,0,0.2)] transition-all duration-200"
    >
      Record a reflection
    </button>
  </Link>
}
<div className="flex w-full gap-4">
  
    <Link href="/reflections" className="w-full sm:w-1/2 md:w-1/3">
      <button
        type="button"
        className="bg-(--lavender) text-white text-xl uppercase font-bold w-full p-4 rounded-md shadow-[4px_6px_0px_rgba(0,0,0,0.15)] rotate-[2deg] hover:rotate-0 hover:shadow-[2px_3px_0px_rgba(0,0,0,0.2)] transition-all duration-200"
      >
        My reflections
      </button>
    </Link>
  
    <Link href="/about" className="w-full sm:w-1/2 md:w-1/3">
      <button
        type="button"
        className="bg-(--peach) text-white text-xl uppercase font-bold w-full p-4 rounded-md shadow-[4px_6px_0px_rgba(0,0,0,0.15)] rotate-[-3deg] hover:rotate-0 hover:shadow-[2px_3px_0px_rgba(0,0,0,0.2)] transition-all duration-200"
      >
        About
      </button>
    </Link>
</div>
</main>

      </div>
    </Layout>
  );
};

export default Blog;
