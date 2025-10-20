import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useRouter } from 'next/router';
import { isSameDay, format } from 'date-fns';
import { PostProps } from '../components/Post';




type Props = {
  posts: PostProps[];
};

const PerformanceCalendar: React.FC<Props> = ({ posts }) => {
    
  const [value, setValue] = useState<Date>(new Date());
  const router = useRouter();

  // Collect all performance dates
const performanceDates = posts.map(post => 
    new Date(post.performanceDate.dateTime).toDateString()
  );
  // console.log("posts in performanceDates", performanceDates)
  const tileClassName = ({ date }: { date: Date }) =>
    performanceDates.some(perfDate => isSameDay(perfDate, date)) ? 'highlight' : null;

  const handleDateClick = (date: Date) => {
    const formatted = format(date, 'yyyy-MM-dd');
    router.push(`/day/${formatted}`);
  };

  return (
    <div>
      <h2>Performance Calendar</h2>

     <Calendar
        onChange={setValue}
        value={value}
        tileClassName={tileClassName}
        onClickDay={handleDateClick}
        className="text-black"
      />

      <style jsx global>{`
        .highlight {
          background: #ffdf80 !important;
          border-radius: 50%;
          color: black !important;
        }
      `}</style>
    </div>
  );
};

export default PerformanceCalendar;
