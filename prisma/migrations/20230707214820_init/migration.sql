-- CreateTable
CREATE TABLE "WordUnit" (
    "id" SERIAL NOT NULL,
    "lang" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "customAudioId" TEXT,
    "audioId" TEXT,

    CONSTRAINT "WordUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Word" (
    "id" SERIAL NOT NULL,
    "sourceWordUnitId" INTEGER NOT NULL,
    "targetWordUnitId" INTEGER NOT NULL,

    CONSTRAINT "Word_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Word" ADD CONSTRAINT "Word_sourceWordUnitId_fkey" FOREIGN KEY ("sourceWordUnitId") REFERENCES "WordUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Word" ADD CONSTRAINT "Word_targetWordUnitId_fkey" FOREIGN KEY ("targetWordUnitId") REFERENCES "WordUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
