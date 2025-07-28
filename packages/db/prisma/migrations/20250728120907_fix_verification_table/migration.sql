/*
  Warnings:

  - You are about to drop the `verification_tokens` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "verification_tokens";

-- CreateTable
CREATE TABLE "verification" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "verification_token_key" ON "verification"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_identifier_token_key" ON "verification"("identifier", "token");
