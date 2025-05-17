-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLogin" TIMESTAMP(3),
    "theme" TEXT NOT NULL DEFAULT 'system',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "sleepHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sleepQuality" INTEGER NOT NULL DEFAULT 0,
    "dreams" TEXT,
    "morningMood" INTEGER NOT NULL DEFAULT 0,
    "physicalStatus" TEXT,
    "breakfast" TEXT,
    "morningCompleted" BOOLEAN NOT NULL DEFAULT false,
    "medicationTaken" BOOLEAN NOT NULL DEFAULT false,
    "medicationTakenAt" TIMESTAMP(3),
    "medicationDose" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ateWithinHour" BOOLEAN NOT NULL DEFAULT false,
    "firstHourFeeling" TEXT,
    "reasonForSkipping" TEXT,
    "medicationCompleted" BOOLEAN NOT NULL DEFAULT false,
    "lunch" TEXT,
    "focusLevel" INTEGER NOT NULL DEFAULT 0,
    "energyLevel" INTEGER NOT NULL DEFAULT 0,
    "ruminationLevel" INTEGER NOT NULL DEFAULT 0,
    "currentActivity" TEXT,
    "distractions" TEXT,
    "cravings" TEXT,
    "mainTrigger" TEXT,
    "responseMethod" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "middayCompleted" BOOLEAN NOT NULL DEFAULT false,
    "afternoonSnack" TEXT,
    "isCrashing" BOOLEAN NOT NULL DEFAULT false,
    "crashSymptoms" TEXT,
    "anxietyLevel" INTEGER,
    "isFeeling" TEXT,
    "hadTriggeringInteraction" BOOLEAN NOT NULL DEFAULT false,
    "interactionDetails" TEXT,
    "selfWorthTiedToPerformance" TEXT,
    "overextended" TEXT,
    "afternoonCompleted" BOOLEAN NOT NULL DEFAULT false,
    "dinner" TEXT,
    "overallMood" INTEGER NOT NULL DEFAULT 0,
    "sleepiness" INTEGER,
    "medicationEffectiveness" TEXT,
    "helpfulFactors" TEXT,
    "distractingFactors" TEXT,
    "thoughtForTomorrow" TEXT,
    "eveningCompleted" BOOLEAN NOT NULL DEFAULT false,
    "dayRating" INTEGER,
    "accomplishments" TEXT,
    "challenges" TEXT,
    "gratitude" TEXT,
    "improvements" TEXT,
    "isComplete" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DailyLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyReflection" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "weekStartDate" TIMESTAMP(3) NOT NULL,
    "weekEndDate" TIMESTAMP(3) NOT NULL,
    "averageRuminationScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stableDaysCount" INTEGER NOT NULL DEFAULT 0,
    "medicationEffectiveDays" INTEGER NOT NULL DEFAULT 0,
    "questionedLeavingJob" BOOLEAN NOT NULL DEFAULT false,
    "weeklyInsight" TEXT,
    "weekRating" INTEGER,
    "mentalState" TEXT,
    "physicalState" TEXT,
    "weekHighlights" TEXT,
    "weekChallenges" TEXT,
    "lessonsLearned" TEXT,
    "nextWeekFocus" TEXT,

    CONSTRAINT "WeeklyReflection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "DailyLog_userId_idx" ON "DailyLog"("userId");

-- CreateIndex
CREATE INDEX "DailyLog_date_idx" ON "DailyLog"("date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyLog_userId_date_key" ON "DailyLog"("userId", "date");

-- CreateIndex
CREATE INDEX "WeeklyReflection_userId_idx" ON "WeeklyReflection"("userId");

-- CreateIndex
CREATE INDEX "WeeklyReflection_weekStartDate_idx" ON "WeeklyReflection"("weekStartDate");

-- CreateIndex
CREATE INDEX "WeeklyReflection_weekEndDate_idx" ON "WeeklyReflection"("weekEndDate");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyReflection_userId_weekStartDate_weekEndDate_key" ON "WeeklyReflection"("userId", "weekStartDate", "weekEndDate");

-- AddForeignKey
ALTER TABLE "DailyLog" ADD CONSTRAINT "DailyLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyReflection" ADD CONSTRAINT "WeeklyReflection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
