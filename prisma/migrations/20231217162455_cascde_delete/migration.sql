-- DropForeignKey
ALTER TABLE "WordUnit" DROP CONSTRAINT "WordUnit_wordId_fkey";

-- AddForeignKey
ALTER TABLE "WordUnit" ADD CONSTRAINT "WordUnit_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;
