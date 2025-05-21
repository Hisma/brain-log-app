/*
  Warnings:

  - You are about to drop the column `averageRuminationScore` on the `WeeklyReflection` table. All the data in the column will be lost.
  - You are about to drop the column `medicationEffectiveDays` on the `WeeklyReflection` table. All the data in the column will be lost.
  - You are about to drop the column `physicalState` on the `WeeklyReflection` table. All the data in the column will be lost.
  - You are about to drop the column `stableDaysCount` on the `WeeklyReflection` table. All the data in the column will be lost.
  - You are about to drop the column `weeklyInsight` on the `WeeklyReflection` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DailyLog" ADD COLUMN     "excessivelyIsolated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "metDietaryGoals" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "metPhysicalActivityGoals" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "WeeklyReflection" DROP COLUMN "averageRuminationScore",
DROP COLUMN "medicationEffectiveDays",
DROP COLUMN "physicalState",
DROP COLUMN "stableDaysCount",
DROP COLUMN "weeklyInsight",
ADD COLUMN     "dietRating" INTEGER,
ADD COLUMN     "gymDaysCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "memorableFamilyActivities" TEXT;

-- CreateTable
CREATE TABLE "WeeklyInsight" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "weeklyReflectionId" INTEGER NOT NULL,
    "insightText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeeklyInsight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WeeklyInsight_userId_idx" ON "WeeklyInsight"("userId");

-- CreateIndex
CREATE INDEX "WeeklyInsight_weeklyReflectionId_idx" ON "WeeklyInsight"("weeklyReflectionId");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyInsight_userId_weeklyReflectionId_key" ON "WeeklyInsight"("userId", "weeklyReflectionId");

-- AddForeignKey
ALTER TABLE "WeeklyInsight" ADD CONSTRAINT "WeeklyInsight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyInsight" ADD CONSTRAINT "WeeklyInsight_weeklyReflectionId_fkey" FOREIGN KEY ("weeklyReflectionId") REFERENCES "WeeklyReflection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
