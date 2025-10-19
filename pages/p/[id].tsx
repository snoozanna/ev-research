import React from "react";
import { GetServerSideProps } from "next";
import Router from "next/router";
import Layout from "../../components/Layout";
import Post, { PostProps } from "../../components/Post";
import { useUser } from "@clerk/nextjs";
import prisma from "../../lib/prisma";

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const post = await prisma.post.findUnique({
    where: { id: String(params?.id) },
    include: {
      author: { select: { firstName: true, email: true } },
      performance: { select: { id: true, name: true } },
      performanceDate: { select: { id: true, dateTime: true } },
      promptAnswers: {
        include: {
          prompt: { select: { id: true, text: true } },
        },
      },
    },
  });

  return {
    props: { post },
  };
};

type Props = {
  post: PostProps;
};

async function publishPost(id: string): Promise<void> {
  await fetch(`/api/publish/${id}`, { method: "PUT" });
  await Router.push("/");
}

async function deletePost(id: string): Promise<void> {
  await fetch(`/api/post/${id}`, { method: "DELETE" });
  Router.push("/");
}

const PostPage: React.FC<Props> = ({ post }) => {
  const { user, isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return (
      <Layout>
        <div className="p-6 text-gray-600">Authenticating...</div>
      </Layout>
    );
  }

  if (!isSignedIn) {
    return (
      <Layout>
        <div className="p-6 text-red-600 font-semibold">
          You must be signed in to view this post.
        </div>
      </Layout>
    );
  }

  const postBelongsToUser = user.primaryEmailAddress?.emailAddress === post.author?.email;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md space-y-6">
        <Post post={post} />

        <div className="flex items-center gap-4 pt-6">
          {!post.published && postBelongsToUser && (
            <button
              onClick={() => publishPost(post.id)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
            >
              Publish
            </button>
          )}

          {postBelongsToUser && (
            <button
              onClick={() => deletePost(post.id)}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PostPage;
