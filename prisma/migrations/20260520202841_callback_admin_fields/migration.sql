-- CreateEnum
CREATE TYPE "CallbackRequestStatus" AS ENUM ('PENDING', 'CONSULTED');

-- AlterTable
ALTER TABLE "CallbackRequest" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "note" TEXT,
ADD COLUMN     "status" "CallbackRequestStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "CallbackRequest_archivedAt_createdAt_idx" ON "CallbackRequest"("archivedAt", "createdAt");
