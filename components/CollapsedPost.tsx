import React from "react";
import { format, formatDistance, formatRelative, subDays } from 'date-fns'
import { PostProps, colourClasses, colourEmojis } from "./Post";
import Link from "next/link";
import Image from 'next/image'
import { FaAlignJustify, FaRegComments, FaVoicemail } from "react-icons/fa";

const CollapsedPost: React.FC<{ post: PostProps }> = ({ post }) => {
  const createdAtDate = new Date(post.createdAt);
  const formattedPerfDate = post.performanceDate
  ? format(new Date(post.performanceDate.dateTime), "EEE dd MMM yyyy")
  : null;
  const daysAgo = formatDistance(subDays(new Date(post.createdAt), 3), new Date(), { addSuffix: true })
console.log("post", post)
  return (
    <Link
    href={`/p/${post.id}`}
      className={`p-2  shadow-md flex flex-row gap-1 bg-(--post-color) `}
    >
      <div className="flex w-full gap-2">
      <div className="w-1/4">
        <Image  
             src={post.performance.imageUrl}
             width={500}
             height={500}
             alt={post.performance.name}
           />
     
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
      
      <div className="flex flex-col gap-3 w-1/2 items-center justify-center text-(--greyblack) text-lg">
      {post.content && (
                <div
                  className="rounded-full bg-(--pink) p-2"
                  title="Reflection"
                ><FaAlignJustify/></div>
              )}
              {post.voiceNoteUrl && (
                <div
                  className="rounded-full bg-(--pink) p-2"
                  title="Voice Note"
                >
                  <FaVoicemail />
      
                </div>
              )}
              {post.promptAnswers && post.promptAnswers.length > 0 && (
                <div
                  className="rounded-full bg-(--pink) p-2"
                  title="Prompt Answers"
                >
                  <FaRegComments />
      
                </div>
              )}
      </div>
      <div className="flex items-center justify-center w-1/2 ">
        {post.colourRating &&  (
             <div className="mt-2 text-3xl">
               {colourEmojis[Number(post.colourRating) as keyof typeof colourEmojis]}
             </div>
          )}
      </div>
  </div>
  <div className="text-xs flex text-right flex-col"><span>Created</span> <span>{daysAgo}</span></div>
  
 </div>
  </div>

    </Link>
  );
};

export default CollapsedPost;
