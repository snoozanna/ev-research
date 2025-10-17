// pages/admin/index.tsx
import { GetServerSideProps } from "next";
import { getAuth } from "@clerk/nextjs/server";
import prisma from "../../lib/prisma";
import Layout from "../../components/Layout";
import Link from "next/link";

type AdminPageProps = {
  role: string | null;
  error?: string | null;
};

export const getServerSideProps: GetServerSideProps<AdminPageProps> = async ({ req }) => {
  const { userId } = getAuth(req);

  if (!userId) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });

  if (!user || user.role !== "ADMIN") {
    return {
      props: {
        role: user?.role ?? null,
        error: "You need to be an ADMIN to view this page.",
      },
    };
  }

  return {
    props: {
      role: user.role,
      error: null,
    },
  };
};

export default function AdminPage({ role, error }: AdminPageProps) {
  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

        {error ? (
          <p className="text-lg">{error}</p>
        ) : (
          <>
            <p className="text-lg mb-4">User role: {role}</p>
            <Link
              href="/admin/performances"
              className="flex items-center font-bold text-blue-600 hover:underline"
            >
              Manage Performances
            </Link>
          </>
        )}
      </div>
    </Layout>
  );
}
