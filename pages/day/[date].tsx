import { GetServerSideProps } from 'next';
import { parseISO, startOfDay, endOfDay } from 'date-fns';
import Layout from '../../components/Layout';
import Post, { PostProps } from '../../components/Post';
import prisma from '../../lib/prisma';
import CollapsedPost from '../../components/CollapsedPost';

type Props = { posts: PostProps[]; date: string };

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const dateStr = params?.date as string;
  const day = parseISO(dateStr);

  const posts = await prisma.post.findMany({
    where: {
      performanceDate: {
        dateTime: {
          gte: startOfDay(day),
          lte: endOfDay(day),
        },
      },
    },
    include: {
      author: { select: { firstName: true, email: true } },
      performance: { select: { id: true, name: true, imageUrl: true } },
      performanceDate: { select: { id: true, dateTime: true } },
    },
    orderBy: {
      performance: { name: 'asc' }, // group/order by performance
    },
  });

  return { props: { posts, date: dateStr } };
};

const DayPage: React.FC<Props> = ({ posts, date }) => {
  // Group posts by performance
  const grouped = posts.reduce((acc, post) => {
    const perfName = post.performance?.name ?? 'Unknown Performance';
    if (!acc[perfName]) acc[perfName] = [];
    acc[perfName].push(post);
    return acc;
  }, {} as Record<string, PostProps[]>);

  return (
    <Layout>
      <h1>Posts for {date}</h1>
      {Object.entries(grouped).map(([performance, posts]) => (
        <div key={performance} className="flex flex-col gap-3">
          <h2>{performance}</h2>
          {posts.map((p) => (
            <CollapsedPost key={p.id} post={p} />
          ))}
        </div>
      ))}
    </Layout>
  );
};

export default DayPage;
