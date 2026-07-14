-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "League" AS ENUM ('GREEN', 'BLUE');

-- CreateEnum
CREATE TYPE "TrackDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "CompletionResult" AS ENUM ('FIRST_TRY', 'RETRY');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "league" "League" NOT NULL DEFAULT 'GREEN',
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracks" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" "TrackDifficulty" NOT NULL,
    "points" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tracks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "track_completions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "result" "CompletionResult" NOT NULL,
    "awardedPoints" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "track_completions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "track_ratings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "track_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "league_changes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fromLeague" "League" NOT NULL,
    "toLeague" "League" NOT NULL,
    "rank" INTEGER NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "league_changes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_nickname_key" ON "users"("nickname");

-- CreateIndex
CREATE INDEX "users_league_points_idx" ON "users"("league", "points");

-- CreateIndex
CREATE UNIQUE INDEX "tracks_slug_key" ON "tracks"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tracks_order_key" ON "tracks"("order");

-- CreateIndex
CREATE INDEX "track_completions_userId_completedAt_idx" ON "track_completions"("userId", "completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "track_completions_userId_trackId_key" ON "track_completions"("userId", "trackId");

-- CreateIndex
CREATE UNIQUE INDEX "track_ratings_userId_trackId_key" ON "track_ratings"("userId", "trackId");

-- CreateIndex
CREATE INDEX "league_changes_userId_changedAt_idx" ON "league_changes"("userId", "changedAt");

-- AddForeignKey
ALTER TABLE "track_completions" ADD CONSTRAINT "track_completions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_completions" ADD CONSTRAINT "track_completions_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "tracks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_ratings" ADD CONSTRAINT "track_ratings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_ratings" ADD CONSTRAINT "track_ratings_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "tracks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "league_changes" ADD CONSTRAINT "league_changes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
