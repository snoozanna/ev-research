import React from "react";
import { format, formatDistance, formatRelative, subDays } from 'date-fns'
import { PostProps, colourClasses } from "./Post";
import Link from "next/link";

const CollapsedPost: React.FC<{ post: PostProps }> = ({ post }) => {
  const createdAtDate = new Date(post.createdAt);
  const formattedPerfDate = post.performanceDate
  ? format(new Date(post.performanceDate.dateTime), "EEE dd MMM yyyy")
  : null;
  const daysAgo = formatDistance(subDays(new Date(post.createdAt), 3), new Date(), { addSuffix: true })

  return (
    <Link
    href={`/p/${post.id}`}
      className={`p-2  shadow-md flex flex-row gap-1 bg-(--post-color) `}
    >
      <div className="flex w-full gap-2">
      <div className="w-1/4">
        <img src="https://media.houseandgarden.co.uk/photos/6533f30248dabdf8da5de601/1:1/w_1080,h_1080,c_limit/Untitled%20design%20(55).png" alt="catcus"/>
     
      </div>
    
     <div className="flex flex-col w-[50%]">
        {/* Performance Info */}
        {post.performance?.name && (
          <h2 className="text-xl font-bold uppercase">
            {post.performance.name}
          </h2>
        )}
       
        {formattedPerfDate && <p className="text-sm text-gray-600">{formattedPerfDate}</p>}
     </div>
      
      {/* Type Indicators */}
      <div className="flex flex-col justify-between">
     <div className="flex  gap-2 w-full">
      
      <div className="flex flex-col gap-3 w-1/2 items-center justify-center">
        {post.content && (
          <div
            className="w-5 h-5 bg-indigo-500 rounded-sm"
            title="Reflection"
          />
        )}
        {post.voiceNoteUrl && (
          <div
            className="w-5 h-5 bg-pink-500 rounded-full"
            title="Voice Note"
          />
        )}
        {post.promptAnswers && post.promptAnswers.length > 0 && (
          <div
            className="w-8 h-4 bg-teal-500 rounded-md"
            title="Prompt Answers"
          />
        )}
      </div>
      <div className="flex items-center justify-center w-1/2 ">
        {post.colourRating &&  (
            <div
              className={`w-8 h-8 rounded-full ${colourClasses[post.colourRating || 3]}`}
              title="Colour rating"
            />
          )}
      </div>
  </div>
  <div className="text-xs flex text-right flex flex-col"><span>Created</span> <span>{daysAgo}</span></div>
 </div>
  </div>

    </Link>
  );
};

export default CollapsedPost;
