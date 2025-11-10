import React from "react";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import { useUser } from "@clerk/nextjs";

export type PostProps = {
  id: string;
  createdAt: string;
  performance?: {
    id: string;
    name: string;
    location: string;
    imageUrl?: string;
  } | null;
  performanceDate?: {
    id: string;
    dateTime: string;
  } | null;
  performanceId: string;
  author: {
    firstName: string;
    email: string;
  } | null;
  content: string;
  voiceNoteUrl?: string | null;
  colourRating?: string | null;
  promptAnswers?: {
    id: string;
    text: string;
    prompt?: {
      id: string;
      text: string;
    } | null;
  }[];
  published: boolean;
  shareWithArtist: boolean;
};

export const colourClasses = {
  1: "bg-(--color1)",
  2: "bg-(--color2)",
  3: "bg-(--color3)",
  4: "bg-(--color4)",
  5: "bg-(--color5)",
} as const;

export const colourEmojis = {
  1: "🥶",  
  2: "🌶️",  
  3: "🌱", 
  4: "🫨",  
  5: "🐌",
  6: "💡",
  7: "🔥",
  8: "🧀", 
  9: "🚀", 
  10: "❌"  
} as const;

const Post: React.FC<{ post: PostProps; colour: number }> = ({ post, colour }) => {

  const authorName = post.author?.firstName || "Unknown author";
  const createdAtDate = new Date(post.createdAt);
  const formattedDate = format(createdAtDate, "PPpp");

  const formattedPerfDate = post.performanceDate
   ? format(new Date(post.performanceDate.dateTime), "EEE dd MMM yyyy")
   : null;
   console.log("post", post)
  return (
    <div className="">
     <div className="w-full flex justify-between items-end">
        <div>
          <span className="w-full text-center italic">Performance</span>
                  <h1 className="text-2xl font-bold uppercase text-(--teal)  mb-2">
                    {post.performance?.name}
                  </h1>
                  <h3 className="text-l font-bold ">
                    {post.performance?.location}
                  </h3>
            {/* Performance Date */}
            {formattedPerfDate && (
            <span>
            On {formattedPerfDate}
            </span>
          )}
        </div>
  
       {colour ?  <div className="text-5xl transition-transform transform opacity-100 flex items-end w-fit justify-end">{colourEmojis[colour]}</div> : ""}
     </div>

    

    

      {/* Free Reflection */}
      {post.content && (
        <div className="mt-4">
          <h3 className="text-xl font-semibold mb-2 text-(--teal)">Written Reflection</h3>
          <div className="bg-(--lavender) p-4 text-(--greyblack) mb-4">
            <ReactMarkdown className="prose prose-sm max-w-full" >
              {post.content}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Voice Note */}
      {post.voiceNoteUrl && (
        <div
          className="mt-4"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-xl font-semibold mb-4 text-(--teal)">Voice Note</h3>
          <audio
            controls
            preload="none"
            className="w-full max-w-md rounded-lg mb-6"
          >
            <source src={post.voiceNoteUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      {/* Prompt Answers */}
      {post.promptAnswers && post.promptAnswers.length > 0 && (
        <div className="mt-4 space-y-4">
          <h3 className="text-xl font-semibold mb-2">Prompt Responses</h3>
          {post.promptAnswers.map((answer) => (
            <div
              key={answer.id}
              className="border-l-4 border-(--teal) pl-4 py-2"
            >
              {answer.prompt?.text && (
                <p className="font-semibol text-(--teal)">{answer.prompt.text}</p>
              )}
              <p>{answer.text}</p>
            </div>
          ))}
        </div>
        
      )}
       {/* Created At */}
       <div className="w-full flex flex-col justify-end items-end"><p className="text-sm">{formattedDate}</p>
       {authorName &&( <span className="text-sm">By {authorName}</span>)}
       </div>
     
    </div>
  );
};

export default Post;
