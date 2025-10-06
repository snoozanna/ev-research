import React from "react";
import Router from "next/router";
import ReactMarkdown from "react-markdown";
import { isSameDay, format } from 'date-fns';

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
  const createdAtDate = post.createdAt;
    const formattedDate = format(createdAtDate, 'PPpp');
    const perfDate = post.performanceDate.dateTime;
    const formattedPerfDate = format(perfDate, 'PPpp');   
  

  return (
    <div>
      {/* Performance */}
      {post.performance.name && <h2>{post.performance.name}</h2>}
    {/* Created at */}
    {formattedDate && <p>{formattedDate}</p>}
      {/* Author */}
      <small>By {authorName}</small>

   
      {/* Performance Date */}
      {post.performanceDate && (
        <p>
          <strong>Date of performance:</strong>{" "}
          {formattedPerfDate}
        </p>
      )}

      {/* Free Reflection */}
      {post.content && (
        <div className="reflection">
          <h3>Reflection</h3>
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      )}

      {/* Voice Note */}
      {post.voiceNoteUrl && (
        <div
          className="audio-wrapper"
          onClick={(e) => e.stopPropagation()}
        >
          <h3>Voice Note</h3>
          <audio controls preload="none">
            <source src={post.voiceNoteUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      {/* Prompt Answers */}
      {post.promptAnswers && post.promptAnswers.length > 0 && (
        <div className="prompt-answers">
          <h3>Prompt Responses</h3>
          {post.promptAnswers.map((answer) => (
            <div key={answer.id} className="prompt-answer">
              {answer.prompt?.text && (
                <p>
                  <strong>{answer.prompt.text}</strong>
                </p>
              )}
              <p>{answer.text}</p>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        div {
          color: inherit;
          padding: 2rem;
        }
        h2 {
          margin-top: 0;
        }
        .reflection {
          margin-top: 1rem;
        }
        .audio-wrapper {
          margin-top: 1rem;
        }
        audio {
          width: 100%;
          max-width: 400px;
          border-radius: 12px;
        }
        .prompt-answers {
          margin-top: 1rem;
        }
        .prompt-answer {
          margin-bottom: 1rem;
          padding: 0.5rem;
          border-left: 3px solid #ccc;
        }
      `}</style>
    </div>
  );
};

export default Post;
