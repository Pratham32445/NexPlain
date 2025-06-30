-- CreateEnum
CREATE TYPE "VideoStatus" AS ENUM ('PENDING', 'GENERATED');

-- CreateTable
CREATE TABLE "Project" (
    "Id" TEXT NOT NULL,
    "title" TEXT,
    "desc" TEXT,
    "userId" TEXT NOT NULL,
    "userPrompt" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Video" (
    "Id" TEXT NOT NULL,
    "title" TEXT,
    "duration" INTEGER,
    "status" "VideoStatus" NOT NULL DEFAULT 'PENDING',
    "prompt" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("Id")
);

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;
