import React from "react";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";

export type PostProps = {
  id: string;
  title: string;
  createdAt: string;
  performance?: {
    id: string;
    name: string;
  } | null;
  performanceDate?: {
    id: string;
    dateTime: string;
  } | null;
  author: {
    name: string;
    email: string;
  } | null;
  content: string;
  voiceNoteUrl?: string | null;
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

const Post: React.FC<{ post: PostProps }> = ({ post }) => {
  const authorName = post.author?.name || "Unknown author";

  const createdAtDate = new Date(post.createdAt);
  const formattedDate = format(createdAtDate, "PPpp");

  const formattedPerfDate = post.performanceDate
    ? format(new Date(post.performanceDate.dateTime), "PPpp")
    : null;

  return (
    <div className="bg-(--post-color) p-6 rounded-lg shadow-md ">
      {/* Performance Name */}
      {post.performance?.name && (
        <h2 className="text-2xl font-bold text-(--fluorescent-cyan)">{post.performance.name}</h2>
      )}
        {/* Performance Date */}
        {formattedPerfDate && (
        <span>
        On {formattedPerfDate}
        </span>
      )}

     

    

    

      {/* Free Reflection */}
      {post.content && (
        <div className="mt-4">
          <h3 className="text-xl font-semibold mb-2">Reflection</h3>
          <ReactMarkdown className="prose prose-sm max-w-full" >
            {post.content}
          </ReactMarkdown>
        </div>
      )}

      {/* Voice Note */}
      {post.voiceNoteUrl && (
        <div
          className="mt-4"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-xl font-semibold mb-2">Voice Note</h3>
          <audio
            controls
            preload="none"
            className="w-full max-w-md rounded-lg"
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
              className="border-l-4 border-(--fluorescent-cyan) pl-4 py-2"
            >
              {answer.prompt?.text && (
                <p className="font-semibold">{answer.prompt.text}</p>
              )}
              <p>{answer.text}</p>
            </div>
          ))}
        </div>
        
      )}
       {/* Created At */}
       <div className="w-full flex flex-col justify-end items-end"><p className="text-sm">{formattedDate}</p>
       <span className="text-sm">By {authorName}</span></div>
         {/* Author */}
     
    </div>
  );
};

export default Post;
