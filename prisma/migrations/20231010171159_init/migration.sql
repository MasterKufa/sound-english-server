-- CreateTable
CREATE TABLE "WordUnit" (
    "id" SERIAL NOT NULL,
    "lang" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "wordId" INTEGER NOT NULL,

    CONSTRAINT "WordUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Word" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generatedSoundHash" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Word_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL,
    "settingsId" INTEGER NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" SERIAL NOT NULL,
    "isCustomAudioPreferable" BOOLEAN NOT NULL DEFAULT true,
    "playerQueueSize" INTEGER NOT NULL DEFAULT 5,
    "lastPlayedRemindersSize" INTEGER NOT NULL DEFAULT 3,
    "delayPlayerSourceToTarget" INTEGER NOT NULL DEFAULT 1000,
    "delayPlayerWordToWord" INTEGER NOT NULL DEFAULT 2000,
    "sourceVoice" TEXT NOT NULL DEFAULT 'larynx:northern_english_male-glow_tts',
    "targetVoice" TEXT NOT NULL DEFAULT 'glow-speak:ru_nikolaev',
    "repeatSourceCount" INTEGER NOT NULL DEFAULT 1,
    "repeatTargetCount" INTEGER NOT NULL DEFAULT 1,
    "repeatWordCount" INTEGER NOT NULL DEFAULT 1,
    "repeatSourceDelay" INTEGER NOT NULL DEFAULT 0,
    "repeatTargetDelay" INTEGER NOT NULL DEFAULT 0,
    "queueStrategy" TEXT NOT NULL DEFAULT 'sequence',
    "sourceLang" TEXT NOT NULL DEFAULT 'en',
    "targetLang" TEXT NOT NULL DEFAULT 'ru',

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WordUnit" ADD CONSTRAINT "WordUnit_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Word" ADD CONSTRAINT "Word_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "Settings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
