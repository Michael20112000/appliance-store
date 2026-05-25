-- DropIndex
DROP INDEX "Conversation_userId_key";

-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "guestToken" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_guestToken_key" ON "Conversation"("guestToken");

-- CreateIndex
CREATE INDEX "Conversation_userId_isActive_idx" ON "Conversation"("userId", "isActive");
