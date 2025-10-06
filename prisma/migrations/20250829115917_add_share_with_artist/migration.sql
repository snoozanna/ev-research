-- AlterEnum
ALTER TYPE "public"."Role" ADD VALUE 'ADMIN';

-- AlterTable
ALTER TABLE "public"."Post" ADD COLUMN     "shareWithArtist" BOOLEAN NOT NULL DEFAULT false;
