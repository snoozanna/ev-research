/*
  Warnings:

  - You are about to drop the column `prompts` on the `Performance` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Performance" DROP COLUMN "prompts";

-- AlterTable
ALTER TABLE "public"."Post" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "public"."Prompt" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "performanceId" TEXT NOT NULL,

    CONSTRAINT "Prompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PromptAnswer" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,

    CONSTRAINT "PromptAnswer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Prompt" ADD CONSTRAINT "Prompt_performanceId_fkey" FOREIGN KEY ("performanceId") REFERENCES "public"."Performance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PromptAnswer" ADD CONSTRAINT "PromptAnswer_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PromptAnswer" ADD CONSTRAINT "PromptAnswer_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "public"."Prompt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
