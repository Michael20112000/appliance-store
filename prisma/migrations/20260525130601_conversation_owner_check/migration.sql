-- AddCheck
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_owner_required"
  CHECK ("userId" IS NOT NULL OR "guestToken" IS NOT NULL);
