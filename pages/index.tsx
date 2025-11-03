import React from "react";
import Layout from "../components/Layout";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";



const Blog: React.FC = () => {
  const { isSignedIn, user, isLoaded } = useUser();
  console.log("user", user)
  if (!isSignedIn) {
    return (
      <Layout>
        <div className="text-gray-700">You need to sign in to view this page.</div>
      </Layout>
    );
  }
  return (

    
    
    <Layout>
      <div className="container mx-auto px-4 py-8">
        

      <main className="flex flex-wrap gap-12 justify-center p-2">
     
  <Link href="/create" className="w-full sm:w-1/2 md:w-1/3">
    <button
      type="button"
      className="bg-(--darkpink) text-white text-xl uppercase font-bold w-full p-8 rounded-md shadow-[4px_6px_0px_rgba(0,0,0,0.15)] rotate-[-2deg] hover:rotate-0 hover:shadow-[2px_3px_0px_rgba(0,0,0,0.2)] transition-all duration-200"
    >
      Record a reflection
    </button>
  </Link>
<div className="flex w-full gap-4">
  
    <Link href="/reflections" className="w-full sm:w-1/2 md:w-1/3">
      <button
        type="button"
        className="bg-(--lavender) text-white text-xl uppercase font-bold w-full p-6 rounded-md shadow-[4px_6px_0px_rgba(0,0,0,0.15)] rotate-[2deg] hover:rotate-0 hover:shadow-[2px_3px_0px_rgba(0,0,0,0.2)] transition-all duration-200"
      >
        My reflections
      </button>
    </Link>
  
    <Link href="/about" className="w-full sm:w-1/2 md:w-1/3">
      <button
        type="button"
        className="bg-(--peach) text-white text-xl uppercase font-bold w-full p-6 rounded-md shadow-[4px_6px_0px_rgba(0,0,0,0.15)] rotate-[-3deg] hover:rotate-0 hover:shadow-[2px_3px_0px_rgba(0,0,0,0.2)] transition-all duration-200"
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
