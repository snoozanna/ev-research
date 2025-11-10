// pages/reflections.tsx
import React from "react";
import { GetServerSideProps } from "next";
import { getAuth } from "@clerk/nextjs/server";
import Layout from "../components/Layout";
import prisma from "../lib/prisma";
import MyReflections from "../components/MyReflections";
import ReflectionsOnMyWork from "../components/ReflectionsOnMyWork";
import { PostProps } from "../components/Post";
import Header from "../components/Header";

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const { userId } = getAuth(req);

  if (!userId) {
    return {
      redirect: {
        destination: "/sign-in",
        permanent: false,
      },
    };
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, role: true },
  });

  if (!user) {
    return { redirect: { destination: "/sign-in", permanent: false } };
  }

  const role = user.role;

  // 1️⃣ My own reflections
  const myPosts = await prisma.post.findMany({
    where: { author: { clerkId: userId } },
    include: {
      author: { select: { firstName: true, email: true } },
      performance: { select: { id: true, name: true, imageUrl: true } },
      performanceDate: { select: { id: true, dateTime: true } },
      promptAnswers: { include: { prompt: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // 2️⃣ Reflections on my work / shared reflections
  let reflectionsOnMyWork: any[] = [];

  if (role === "ADMIN") {
    reflectionsOnMyWork = await prisma.post.findMany({
      where: { shareWithArtist: true },
      include: {
        author: { select: { firstName: true, email: true } },
        performance: { select: { id: true, name: true, imageUrl: true } },
        performanceDate: { select: { id: true, dateTime: true } },
        promptAnswers: { include: { prompt: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } else if (role === "ARTIST") {
    reflectionsOnMyWork = await prisma.post.findMany({
      where: {
        shareWithArtist: true,
        performance: { artistId: user.id },
      },
      include: {
        author: { select: { firstName: true, email: true } },
        performance: { select: { id: true, name: true, imageUrl: true } },
        performanceDate: { select: { id: true, dateTime: true } },
        promptAnswers: { include: { prompt: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // 3️⃣ Serialize dates for hydration
  const serializePosts = (posts: any[]) =>
    posts.map((post) => ({
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
    }));

  return {
    props: {
      myPosts: serializePosts(myPosts),
      reflectionsOnMyWork: serializePosts(reflectionsOnMyWork),
      role,
    },
  };
};

type Props = {
  myPosts: PostProps[];
  reflectionsOnMyWork: PostProps[];
  role: "ADMIN" | "ARTIST" | "ATTENDEE";
};

const Reflections: React.FC<Props> = ({ myPosts, reflectionsOnMyWork, role }) => {
  return (
    <Layout>
      <Header userRole={role}/>
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Always show My Reflections */}
        {(role === "ADMIN" || role === "ATTENDEE") && (
          <MyReflections posts={myPosts} />
        )}
        

        {/* Show “Reflections on My Work” for artists/admins */}
        {(role === "ADMIN" || role === "ARTIST") && (
          <ReflectionsOnMyWork posts={reflectionsOnMyWork} role={role} />
        )}
      </div>
    </Layout>
  );
};

export default Reflections;
