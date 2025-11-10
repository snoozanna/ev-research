import { GetServerSideProps } from 'next';
import { format, parseISO, startOfDay, endOfDay } from 'date-fns';
import Layout from '../../components/Layout';
import Post, { PostProps } from '../../components/Post';
import prisma from '../../lib/prisma';
import CollapsedPost from '../../components/CollapsedPost';
import { getAuth } from '@clerk/nextjs/server';

import { useRouter } from 'next/router';
import { Role } from '@prisma/client';
import Header from '../../components/Header';

type UserPr = {
  id: string;
  role: Role;
};

type Props = { posts: PostProps[]; date: string,   userPr: UserPr; };

export const getServerSideProps: GetServerSideProps = async ({ req, res, params }) => {
  const { userId } = getAuth(req);
  
    if (!userId) {
      return {
        redirect: {
          destination: '/sign-in',
          permanent: false,
        },
      };
    }


  const dateStr = params?.date as string;
  const day = parseISO(dateStr);

    // Get user role
const userPr = await prisma.user.findUnique({
  where: { clerkId: userId },
  select: { id: true, role: true },
});

if (!userPr) {
  return { redirect: { destination: '/sign-in', permanent: false } };
}

  const posts = await prisma.post.findMany({
    where: {
      performanceDate: {
        dateTime: {
          gte: startOfDay(day),
          lte: endOfDay(day),
        },
      },
      author: { clerkId: userId }
    },
    include: {
      author: { select: { firstName: true, email: true } },
      performance: { select: { id: true, name: true, imageUrl: true } },
      performanceDate: { select: { id: true, dateTime: true } },
      promptAnswers: { include: { prompt: { select: { id: true, text: true } } } },
    },
    orderBy: {
      performance: { name: 'asc' }, // group/order by performance
    },
  });

  // Convert Date objects to ISO strings
  const serializedPosts = posts.map((post) => ({
    ...post,
    createdAt: post.createdAt?.toISOString?.() ?? null,
    performanceDate: post.performanceDate
      ? {
          ...post.performanceDate,
          dateTime: post.performanceDate.dateTime
            ? post.performanceDate.dateTime.toISOString()
            : null,
        }
      : null,
  }));

  return { props: { posts: serializedPosts, date: dateStr, userPr: userPr } };
};

const DayPage: React.FC<Props> = ({ posts, date, userPr }) => {
  const router = useRouter()
  const role = userPr?.role;
   const formattedPerfDate = date
    ? format(new Date(date), "EEE dd MMM yyyy")
    : null;
  // Group posts by performance
  const grouped = posts.reduce((acc, post) => {
    const perfName = post.performance?.name ?? 'Unknown Performance';
    if (!acc[perfName]) acc[perfName] = [];
    acc[perfName].push(post);
    return acc;
  }, {} as Record<string, PostProps[]>);

  return (
    <Layout>
       <Header userRole={role}/>
      <h1 className="text-2xl font-bold mb-6">Performances I saw on {formattedPerfDate}</h1>
      {Object.entries(grouped).map(([performance, posts]) => (
        <div key={performance} className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-4">
         
          {posts.map((p) => (
            <CollapsedPost key={p.id} post={p} />
          ))}
        </div>
      ))}

<button type="button" className='`p-2  mb-2  flex flex-row gap-1' onClick={() => router.back()}>
     {"<-"} Back
    </button>
    </Layout>
  );
};

export default DayPage;
