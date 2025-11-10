// components/ReflectionsOnMyWork.tsx
import React from "react";
import CollapsedPostIt from "./CollapsedPostIt";
import { PostProps } from "./Post";

interface ReflectionsOnMyWorkProps {
  posts: PostProps[];
  role: "ADMIN" | "ARTIST";
}

const ReflectionsOnMyWork: React.FC<ReflectionsOnMyWorkProps> = ({ posts, role }) => {
  const title =
    role === "ADMIN"
      ? "Reflections on Artists' Work"
      : "Reflections About My Work";

  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      {posts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
          {posts.map((post) => (
            <CollapsedPostIt key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No shared reflections available.</p>
      )}
    </section>
  );
};

export default ReflectionsOnMyWork;
