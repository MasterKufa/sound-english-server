-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "repeatSourceDelay" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "repeatTargetDelay" INTEGER NOT NULL DEFAULT 0;
