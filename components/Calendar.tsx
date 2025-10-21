import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useRouter } from 'next/router';
import { isSameDay, format } from 'date-fns';
import { PostProps, colourClasses } from '../components/Post';

type Props = {
  posts: PostProps[];
};

const PerformanceCalendar: React.FC<Props> = ({ posts }) => {
  const [value, setValue] = useState<Date | null>(new Date());
  const router = useRouter();

  const handleDateClick = (date: Date) => {
    const formatted = format(date, 'yyyy-MM-dd');
    router.push(`/day/${formatted}`);
  };

  const tileClassName = ({ date }: { date: Date }) => {
    const matchingPost = posts.find(
      (post) =>
        post.performanceDate &&
        isSameDay(new Date(post.performanceDate.dateTime), date)
    );
    console.log("matchingPost", matchingPost)
    if (!matchingPost) return '';
   
    // Return a class like `colour-1` etc., based on your mapping
    return `highlight color-${matchingPost.colourRating || 3}`;
  };

  return (
    <div>
      <h2>Performance Calendar</h2>
      <Calendar
        onChange={(val) => {
          if (val instanceof Date) setValue(val);
        }}
        value={value}
        tileClassName={tileClassName}
        onClickDay={handleDateClick}
        className="text-black"
      />

      <style jsx global>{`
        .react-calendar{
        background:none;
        border:solid 1px var(--green);
        }

        .react-calendar__tile {
   
        }

        .react-calendar button{
        border: solid 1px var(--green);
        }

        /* Highlighted tile base */
        .highlight {
          color: black !important;
        }

        /* Example colours (match your colourClasses mapping) */
        .color-1 {
          background-color: var(--color1) !important;
        }
        .color-2 {
          background-color: var(--color2) !important;
        }
        .color-3 {
          background-color: var(--color3) !important;
        }
        .color-4 {
          background-color: var(--color4) !important;
        }
        .color-5 {
          background-color: var(--color5) !important;
        }
      `}</style>
    </div>
  );
};

export default PerformanceCalendar;
