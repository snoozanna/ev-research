// pages/api/auth/[...nextauth].ts
import NextAuth from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GitHubProvider from "next-auth/providers/github";
import prisma from "../../../lib/prisma";

export const authOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user }) {
      // When user signs in for the first time or session refresh
      if (user) {
        // Fetch full user record from DB, since NextAuth user may not include 'role'
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          select: { role: true },
        });
        console.log("dbUser?.role ", dbUser?.role )
        token.role = dbUser?.role ?? "ADMIN";
      } else if (token?.email) {
        // For existing sessions, refresh role from DB
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { role: true },
        });
        token.role = dbUser?.role ?? "ADMIN";
      }

      return token;
    },

    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token?.role ?? "ADMIN";
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);


// pages/api/auth/[...nextauth].ts
// import NextAuth from "next-auth";
// import { PrismaAdapter } from "@next-auth/prisma-adapter";
// import GitHubProvider from "next-auth/providers/github";
// import prisma from "../../../lib/prisma";

// export const authOptions = {
//   providers: [
//     GitHubProvider({
//       clientId: process.env.GITHUB_ID!,
//       clientSecret: process.env.GITHUB_SECRET!,
//     }),
//   ],
//   adapter: PrismaAdapter(prisma),
//   secret: process.env.NEXTAUTH_SECRET,
// };

// export default NextAuth(authOptions);