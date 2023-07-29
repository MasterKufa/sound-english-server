-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "repeatSourceCount" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "repeatTargetCount" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "repeatWordCount" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "sourceVoice" TEXT NOT NULL DEFAULT 'larynx:northern_english_male-glow_tts',
ADD COLUMN     "targetVoice" TEXT NOT NULL DEFAULT 'glow-speak:ru_nikolaev';
