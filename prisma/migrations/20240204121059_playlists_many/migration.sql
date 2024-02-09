/*
  Warnings:

  - You are about to drop the column `playlistId` on the `Word` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Word" DROP CONSTRAINT "Word_playlistId_fkey";

-- AlterTable
ALTER TABLE "Word" DROP COLUMN "playlistId";

-- CreateTable
CREATE TABLE "_PlaylistToWord" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PlaylistToWord_AB_unique" ON "_PlaylistToWord"("A", "B");

-- CreateIndex
CREATE INDEX "_PlaylistToWord_B_index" ON "_PlaylistToWord"("B");

-- AddForeignKey
ALTER TABLE "_PlaylistToWord" ADD CONSTRAINT "_PlaylistToWord_A_fkey" FOREIGN KEY ("A") REFERENCES "Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlaylistToWord" ADD CONSTRAINT "_PlaylistToWord_B_fkey" FOREIGN KEY ("B") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;
