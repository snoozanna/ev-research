import React from "react";
import Layout from "../components/Layout";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";



const Blog: React.FC = () => {
  const { isSignedIn, user, isLoaded } = useUser();
  console.log("user", user)
  return (
    
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Home page</h1>

        <main className="space-y-8">
        <div>Hello{isSignedIn && user.firstName + " "}!</div>
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
