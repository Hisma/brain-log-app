/*
  Warnings:

  - You are about to drop the column `mainTrigger` on the `DailyLog` table. All the data in the column will be lost.
  - You are about to drop the column `responseMethod` on the `DailyLog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DailyLog" DROP COLUMN "mainTrigger",
DROP COLUMN "responseMethod",
ADD COLUMN     "copingStrategies" TEXT,
ADD COLUMN     "emotionalEvent" TEXT,
ADD COLUMN     "hadEmotionalEvent" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Insight" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "dailyLogId" INTEGER NOT NULL,
    "insightText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Insight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Insight_userId_idx" ON "Insight"("userId");

-- CreateIndex
CREATE INDEX "Insight_dailyLogId_idx" ON "Insight"("dailyLogId");

-- CreateIndex
CREATE UNIQUE INDEX "Insight_userId_dailyLogId_key" ON "Insight"("userId", "dailyLogId");

-- AddForeignKey
ALTER TABLE "Insight" ADD CONSTRAINT "Insight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Insight" ADD CONSTRAINT "Insight_dailyLogId_fkey" FOREIGN KEY ("dailyLogId") REFERENCES "DailyLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
