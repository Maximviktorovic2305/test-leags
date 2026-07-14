ALTER TABLE "users"
ADD COLUMN "avatarData" BYTEA,
ADD COLUMN "avatarMimeType" TEXT,
ADD COLUMN "avatarUpdatedAt" TIMESTAMP(3);
