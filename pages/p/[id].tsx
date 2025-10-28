import React from "react";
import { GetServerSideProps } from "next";
import { getAuth } from "@clerk/nextjs/server";
import Layout from "../../components/Layout";
import Post, { PostProps } from "../../components/Post";
import prisma from "../../lib/prisma";
import { ShareToggle } from "../../components/ShareToggle";
import { ColourSelector } from "../../components/ColourSelector";
import { FaRegTrashAlt } from "react-icons/fa";
import { useRouter } from "next/router";
import Link from "next/link";

export const getServerSideProps: GetServerSideProps = async ({ req, params }) => {

  const { userId } = getAuth(req);

  if (!userId) {
    return {
      redirect: {
        destination: "/sign-in",
        permanent: false,
      },
    };
  }

  const post = await prisma.post.findUnique({
    where: { id: String(params?.id) },
    include: {
      author: { select: { firstName: true, email: true } },
      performance: { select: { id: true, name: true, imageUrl: true } },
      performanceDate: { select: { id: true, dateTime: true } },
      promptAnswers: {
        include: { prompt: { select: { id: true, text: true } } },
      },
    },
  });

  // if (!post || post.author.clerkId !== userId) {
  //   return {
  //     notFound: true,
  //   };
  // }

  return {
    props: { post },
  };
};

type Props = {
  post: PostProps;
};

const ReflectionPage: React.FC<Props> = ({ post }) => {
  const router = useRouter();

  const deletePost = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this reflection?");
    if (!confirmed) return;

    const res = await fetch(`/api/post/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/reflections");
    } else {
      alert("Failed to delete reflection.");
    }
  };

  return (
    <Layout>

      
      <div className="max-w-3xl mx-auto p-6 space-y-6 bg-(--peach)">
      

        {/* Reflection content */}
        <Post post={post} />

        {/* Toggles section */}
        <div className="flex flex-wrap items-center justify-between gap-6 pt-4 border-t">
          <div className="flex flex-wrap items-center gap-4">
           
            <ColourSelector postId={post.id} initialColour={post.colourRating ?? 3} />
          </div>

          <div className="w-full flex justify-between">
          <ShareToggle postId={post.id} initialState={post.shareWithArtist ?? false} />
            <button
              onClick={() => deletePost(post.id)}
              className="flex items-center gap-2 px-4 py-2 rounded bg-(--deletered) text-white focus:outline-none focus:ring focus:ring-red-200"
            >
              <FaRegTrashAlt />
         
            </button>
          </div>
        </div>
      </div>
      <Link href={`/reflections`}
      className={`p-2  mb-2  flex flex-row gap-1 `}>Back</Link>
    </Layout>
  );
};

export default ReflectionPage;
