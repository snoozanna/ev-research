// components/MyReflections.tsx
import React from "react";
import CollapsedPostIt from "./CollapsedPostIt";
import { PostProps } from "./Post";

interface MyReflectionsProps {
  posts: PostProps[];
}

const MyReflections: React.FC<MyReflectionsProps> = ({ posts }) => {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-4">My Reflections</h2>
      {posts.length > 0 ? (
        <div className="grid grid-cols-2 gap-6">
          {posts.map((post) => (
            <CollapsedPostIt key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-gray-600">You haven't created any reflections yet.</p>
      )}
    </section>
  );
};

export default MyReflections;
