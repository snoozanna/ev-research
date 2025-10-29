import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useRouter } from 'next/router';
import { isSameDay, format } from 'date-fns';
import { PostProps, colourClasses } from '../components/Post';

type Props = {
  posts: PostProps[];
  mode: string
};

const PerformanceCalendar: React.FC<Props> = ({ posts, mode }) => {
  const [value, setValue] = useState<Date | null>(new Date());
  const router = useRouter();

  const handleDateClick = (date: Date) => {
    const formatted = format(date, 'yyyy-MM-dd');
  
    if (mode === 'performance') {
      router.push(`/performances-day/${formatted}`);
    } else {
      router.push(`/day/${formatted}`);
    }
  };

  const tileClassName = ({ date }: { date: Date }) => {
    const matchingPost = posts.find((post) => {
      if (mode === "performance" && post.performanceDate?.dateTime) {
        return isSameDay(new Date(post.performanceDate.dateTime), date);
      }
      if (mode === "reflection" && post.createdAt) {
        return isSameDay(new Date(post.createdAt), date);
      }
      return false;
    });
  
    if (!matchingPost) return "";
  
    // Return mode-specific color class
    return mode === "performance"
      ? "highlight color-cal-perf"
      : "highlight color-cal-refl";
  };

  return (
    <div>
      <Calendar
        onChange={(val) => {
          if (val instanceof Date) setValue(val);
        }}
        value={value}
        tileClassName={tileClassName}
        onClickDay={handleDateClick}
        
      />

      <style jsx global>{`
        .react-calendar{
        background:none;
        border:solid 2px var(--green);
        font-family: inherit;
         color: var(--greyblack)
        }

        .react-calendar__tile {
   
        }
        .react-calendar__tile--active{
        background-color: var(--peach) !important;
        color: var(--greyblack)
        }

        .react-calendar button{
        border: solid 2px var(--green);
        }

        /* Highlighted tile base */
        .highlight {
          color: black !important;
        }

        .react-calendar__month-view__days__day--weekend{
        color: var(--darkpink);
        }

        abbr:where([title]){
        text-decoration: none
        }

        /* Example colours (match your colourClasses mapping) */
        .color-cal-perf {
          background-color: var(--darkpink) !important;
        }

         .color-cal-refl {
          background-color: var(--lavender) !important;
        }
        
      `}</style>
    </div>
  );
};

export default PerformanceCalendar;
