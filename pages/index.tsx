import React from "react";
import { GetStaticProps } from "next";
import Layout from "../components/Layout";
import Post, { PostProps } from "../components/Post";
import prisma from "../lib/prisma";
import Link from "next/link";



const Blog: React.FC = () => {
 
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Home page</h1>

        <main className="space-y-8">
         <p> What goes here?</p>
          <Link href="/reflections"
              className={`flex items-center font-bold`}
            >
              <h2>Go to my reflections</h2>
            </Link>
        </main>
      </div>
    </Layout>
  );
};

export default Blog;
