/*
  Warnings:

  - Added the required column `userId` to the `Word` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Word" ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL,
    "wordIds" INTEGER[],
    "settingsId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" SERIAL NOT NULL,
    "playerQueueSize" INTEGER NOT NULL DEFAULT 5,
    "lastPlayedRemindersSize" INTEGER NOT NULL DEFAULT 3,
    "delayPlayerSourceToTarget" INTEGER NOT NULL DEFAULT 1000,
    "delayPlayerWordToWord" INTEGER NOT NULL DEFAULT 2000,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- AddForeignKey
ALTER TABLE "Word" ADD CONSTRAINT "Word_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "Settings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
