# Phase 46: Schema Foundation + Guest Chat - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-25
**Phase:** 46-Schema Foundation + Guest Chat
**Areas discussed:** Guest conversation init timing, Guest display name, Pusher channel for guests

---

## Guest Conversation Init Timing

| Option | Description | Selected |
|--------|-------------|----------|
| Lazy — on first message | Conversation created in DB only when guest presses Send | ✓ |
| Eager — on widget open | Conversation created immediately when widget opens | |

**User's choice:** Lazy — при першому повідомленні
**Notes:** Avoids polluting DB with conversations from guests who never send a message.

---

## Guest Display Name in Admin

| Option | Description | Selected |
|--------|-------------|----------|
| "Гість" (always) | Fixed label, no identifier suffix | ✓ |
| "Гість #abc12" (with token prefix) | Admin can distinguish between multiple guests | |

**User's choice:** "Гість" (завжди однаково)
**Notes:** Single admin shop — at most a few concurrent guests; no need for disambiguation.

---

## Pusher Channel Pattern for Guests

| Option | Description | Selected |
|--------|-------------|----------|
| Same private-conversation-{id} | Extend auth endpoint to accept guestToken | ✓ |
| public-guest-{id} (no auth) | No auth endpoint needed, but anyone can subscribe | |

**User's choice:** Той самий private-conversation-{id}
**Notes:** Keeps channel naming consistent; auth endpoint extended with guestToken DB lookup.

---

## Claude's Discretion

- Rate limiting implementation detail for guests (guestToken vs IP as senderId) — planner decides
- Whether to add a "Зареєструйтесь, щоб зберегти історію" hint in the widget — noted as deferred

## Deferred Ideas

- Registration nudge in guest widget — noted but not required for Phase 46
