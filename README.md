# Fullstack Authentication Example with Next.js and NextAuth.js

This is the starter project for the fullstack tutorial with Next.js and Prisma. You can find the final version of this project in the [`final`](https://github.com/prisma/blogr-nextjs-prisma/tree/final) branch of this repo.

## start prisma

npx prisma studio

## update model

npx prisma migrate dev --name add-performance-models
prisma generate

Check Prisma Client version and migration state
Make sure your database matches your schema.

Run:

npx prisma db pull
npx prisma generate

## testing webhooks

ngrok http 3000