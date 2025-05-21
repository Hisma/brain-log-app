/*
  Warnings:

  - You are about to drop the column `excessivelyIsolated` on the `DailyLog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DailyLog" DROP COLUMN "excessivelyIsolated",
ADD COLUMN     "neverFeltIsolated" BOOLEAN NOT NULL DEFAULT false;
