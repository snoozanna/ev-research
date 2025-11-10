"use client";

import React, { useState, useMemo } from "react";
import CollapsedPostIt from "./CollapsedPostIt";
import FilterBar from "./FilterBar";
import { PostProps } from "./Post";

interface MyReflectionsProps {
  posts: PostProps[];
}

const MyReflections: React.FC<MyReflectionsProps> = ({ posts }) => {
  const [draftPosts, setDraftPosts] = useState(posts);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [selectedPerformance, setSelectedPerformance] = useState<string>("all");
  const [sharedFilter, setSharedFilter] = useState<"all" | "shared" | "not_shared">("all");
  const [colourFilter, setColourFilter] = useState<number | "all">("all");
  const [reflectionType, setReflectionType] = useState<"all" | "text" | "voice" | "prompt">("all");

  // Get unique performances for dropdown
  const performances = useMemo(() => {
    const unique = new Map<string, string>();
    posts.forEach((p) => {
      if (p.performance?.id && p.performance?.name) {
        unique.set(p.performance.id, p.performance.name);
      }
    });
    return Array.from(unique.entries()).map(([id, name]) => ({ id, name }));
  }, [posts]);

  // Filter logic
  const filteredPosts = useMemo(() => {
    return draftPosts.filter((post) => {
      const matchesPerformance =
        selectedPerformance === "all" || post.performance?.id === selectedPerformance;

      const matchesShared =
        sharedFilter === "all" ||
        (sharedFilter === "shared" && post.shareWithArtist) ||
        (sharedFilter === "not_shared" && !post.shareWithArtist);

      const matchesColour =
        colourFilter === "all" || post.colourRating?.toString() === colourFilter.toString();

      const matchesReflectionType =
        reflectionType === "all" ||
        (reflectionType === "text" && !!post.content) ||
        (reflectionType === "voice" && !!post.voiceNoteUrl) ||
        (reflectionType === "prompt" && post.promptAnswers?.length > 0);

      return matchesPerformance && matchesShared && matchesColour && matchesReflectionType;
    });
  }, [draftPosts, selectedPerformance, sharedFilter, colourFilter, reflectionType]);

  return (
    <section className="mb-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">My Reflections</h2>
        <button
          onClick={() => setShowFilters((prev) => !prev)}
          className="px-3 py-1 text-sm border rounded-md text-gray-700 hover:bg-gray-100"
        >
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      {showFilters && (
        <FilterBar
          selectedPerformance={selectedPerformance}
          setSelectedPerformance={setSelectedPerformance}
          performances={performances}
          sharedFilter={sharedFilter}
          setSharedFilter={setSharedFilter}
          setColourFilter={setColourFilter}
          colourFilter={colourFilter}
          reflectionType={reflectionType}
          setReflectionType={setReflectionType}
        />
      )}

      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-2 gap-6">
          {filteredPosts.map((post) => (
            <CollapsedPostIt key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No reflections found.</p>
      )}
    </section>
  );
};

export default MyReflections;
