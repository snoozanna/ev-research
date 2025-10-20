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
  // 👇 Use the correct type for react-calendar
  const [value, setValue] = useState<Date | null>(new Date());
  const router = useRouter();

  const performanceDates = posts.map(post =>
    new Date(post.performanceDate.dateTime)
  );

  const tileClassName = ({ date }: { date: Date }) =>
    performanceDates.some(perfDate => isSameDay(perfDate, date))
      ? 'highlight'
      : null;

  const handleDateClick = (date: Date) => {
    const formatted = format(date, 'yyyy-MM-dd');
    router.push(`/day/${formatted}`);
  };

  return (
    <div>
      <h2>Performance Calendar</h2>

      <Calendar
        onChange={(val) => {
          // val can be Date or [Date, Date] or null
          if (val instanceof Date) setValue(val);
        }}
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
