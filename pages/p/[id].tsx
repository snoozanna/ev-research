import React, { useState } from "react";
import { GetServerSideProps } from "next";
import { getAuth } from "@clerk/nextjs/server";
import Layout from "../../components/Layout";
import Post, { PostProps } from "../../components/Post";
import prisma from "../../lib/prisma";
import { useRouter } from "next/router";
import ModifyPost from "../../components/ModifyPost";
import AnnoymousPost from "../../components/AnnoymousPost";
import { Role } from "@prisma/client";
import Header from "../../components/Header";

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

  // 1️⃣ Get the logged-in user (with role + db id)
  const currentUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, clerkId: true, role: true, email: true },
  });

  if (!currentUser) {
    return { notFound: true };
  }

  const postId = String(params?.id);

  // 2️⃣ Build visibility logic
  const post = await prisma.post.findFirst({
    where: {
      id: postId,
      OR: [
        // a. You created the post
        { author: { clerkId: userId } },

        // b. Artist – post is shared and it's your show
        {
          AND: [
            { shareWithArtist: true },
            { performance: { artistId: currentUser.id } },
          ],
        },

        // c. Admin – shared reflections
        currentUser.role === "ADMIN"
          ? { shareWithArtist: true }
          : undefined,
      ].filter(Boolean), // remove undefined if not admin
    },
    include: {
      author: { select: { firstName: true, email: true, clerkId: true } },
      performance: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
          location: true,
          artistId: true,
        },
      },
      performanceDate: { select: { id: true, dateTime: true } },
      promptAnswers: {
        include: { prompt: { select: { id: true, text: true } } },
      },
    },
  });

  if (!post) {
    return { notFound: true };
  }

  const serializedPost = {
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
  };

  return {
    props: {
      post: serializedPost,
      currentUserId: currentUser.clerkId,
      role: currentUser.role,
      userPr: currentUser
    },
  };
};

type UserPr = {
  id: string;
  role: Role;
};

type Props = {
  post: PostProps;
  userPr: UserPr;
};

const ReflectionPage: React.FC<Props> = ({ post, userPr }) => {
  const router = useRouter();
  const [colour, setColour] = useState<number>(Number(post.colourRating) || 3);
  const role = userPr?.role;


  const isUserAlsoAuthor = userPr.id === post.author?.clerkId;
  return (
    <Layout>
      <Header userRole={role}/>
      <div className="max-w-3xl mx-auto p-6 space-y-6 bg-(--peach)">
        {/* Reflection content */}

        {isUserAlsoAuthor ? 
       ( <>
       <Post post={post} colour={colour} />
        <ModifyPost post={post} colour={colour} setColour={setColour}/>
        </>)
        : 
        <AnnoymousPost post={post} colour={colour} />}
      
      </div>

      <button
        type="button"
        className="p-2 mb-2 flex flex-row gap-1"
        onClick={() => router.back()}
      >
        Back
      </button>
    </Layout>
  );
};

export default ReflectionPage;
