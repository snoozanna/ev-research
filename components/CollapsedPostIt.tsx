import React from "react";
import { format, formatDistance } from 'date-fns'
import { PostProps, colourEmojis } from "./Post";
import Link from "next/link";
import Image from 'next/image'
import { FaVoicemail, FaRegComments, FaAlignJustify } from "react-icons/fa";



const CollapsedPostIt: React.FC<{ post: PostProps }> = ({ post }) => {
  const createdAtDate = new Date(post.createdAt);
  const formattedPerfDate = post.performanceDate
  ? format(new Date(post.performanceDate.dateTime), "EEE dd MMM yyyy")
  : null;
  const daysAgo = formatDistance(new Date(createdAtDate), new Date(), { addSuffix: true })
  const rotations = ['-2deg', '1deg', '-3deg', '2deg'];
const rotate = rotations[Math.floor(Math.random() * rotations.length)];

  return (
    <Link
    href={`/p/${post.id}`}
      className={`p-2  flex flex-row gap-1 bg-(--post-color) size-fit
 rounded-md shadow-[4px_6px_0px_rgba(0,0,0,0.15)] rotate-[2deg] hover:rotate-0 hover:shadow-[2px_3px_0px_rgba(0,0,0,0.2)] transition-all duration-200`}
      style={{ transform: `rotate(${rotate})` }}
    >
      <div className="flex w-full gap-2 flex-col">
      <div className="flex w-full gap-2">
        <div className="w-1/2">
          <Image  
      src={post.performance.imageUrl}
      width={500}
      height={500}
      alt={post.performance.name}
    />
        </div>
        <div className="flex flex-col justify-between w-1/2 gap-1">
        <div className="w-full text-xs flex text-right  flex-col text-(--greyblack)"><span>Created</span> <span>{daysAgo}</span></div>
    
    
  

  </div>
 </div>
 </div>

 {/* Performance Info */}
 {post.performance?.name && (
          <h2 className="text-xl font-bold uppercase">
            {post.performance.name}
          </h2>
        )}
       
       <div className="w-full">{formattedPerfDate && <p className="text-xs text-(--orange)">{formattedPerfDate}</p>}
     </div>
     <div className="flex gap-2 justify-between w-full items-center">
    {/* Type Indicators */}
      
      <div className="flex gap-3 items-start justify-center text-(--greyblack) text-2xl">
        {post.content && (
          <div
            className=""
            title="Reflection"
          ><FaAlignJustify/></div>
        )}
        {post.voiceNoteUrl && (
          <div
            className=""
            title="Voice Note"
          >
            <FaVoicemail />

          </div>
        )}
        {post.promptAnswers && post.promptAnswers.length > 0 && (
          <div
            className=""
            title="Prompt Answers"
          >
            <FaRegComments />

          </div>
        )}
      </div>
      <div className="flex items-center justify-center ">
          {post.colourRating && (
        <div className=" text-3xl">
          {colourEmojis[Number(post.colourRating) as keyof typeof colourEmojis]}
        </div>
      )}
      </div>
      </div>

       
      
     


    </Link>
  );
};

export default CollapsedPostIt;
