import { GetServerSideProps } from 'next';
import { format, parseISO, startOfDay, endOfDay } from 'date-fns';
import Layout from '../../components/Layout';
import { PostProps } from '../../components/Post';
import prisma from '../../lib/prisma';
import CollapsedPost from '../../components/CollapsedPost';
import { getAuth } from '@clerk/nextjs/server';
import { useRouter } from 'next/router'
import { Role } from "@prisma/client";
import Header from '../../components/Header';



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
  
  // Get user role
const userPr = await prisma.user.findUnique({
  where: { clerkId: userId },
  select: { id: true, role: true },
});

if (!userPr) {
  return { redirect: { destination: '/sign-in', permanent: false } };
}

  const dateStr = params?.date as string;
  const day = parseISO(dateStr);

  const posts = await prisma.post.findMany({
    where: {
      createdAt: {
        gte: startOfDay(day),
        lte: endOfDay(day),
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

  return { props: { posts: serializedPosts, date: dateStr,    userPr: userPr } };
};

type UserPr = {
  id: string;
  role: Role;
};

type Props = {
  userPr: UserPr;
  posts: PostProps[]; 
  date: string 
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
      <h1 className="text-2xl font-bold mb-6">Reflections I made on {formattedPerfDate}</h1>
      <div className='grid  md:grid-cols-2 lg:grid-cols-2 gap-6 mb-4"'>
      {Object.entries(grouped).map(([performance, posts]) => (
        <div key={performance} className="flex flex-col gap-3 mb-4">
         
          {posts.map((p) => (
            <CollapsedPost key={p.id} post={p} />
          ))}
        </div>
      ))}
    </div>
       <button type="button" className='`p-2  mb-2  flex flex-row gap-1' onClick={() => router.back()}>
     {"<-"} Back
    </button>
    </Layout>
  );
};

export default DayPage;
