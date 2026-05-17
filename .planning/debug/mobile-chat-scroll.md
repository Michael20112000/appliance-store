# DEBUG: Mobile chat scroll

**Symptom:** На мобільному повноекранний чат (Sheet bottom 85dvh) не скролиться — не можна прогортати історію повідомлень.

**UAT test:** 6 — Чат (віджет)

## Hypothesis

1. Flex chain: `SheetContent` → children з `PanelBody` (fragment) → `MessageList` з `flex-1 min-h-0` — без `min-h-0` на проміжному flex-контейнері висота не обмежується.
2. `ScrollArea` (base-ui) на iOS/Android touch інколи не скролить без явного `overflow-y-auto` на viewport.
3. Close: є `PanelHeader` X + default `SheetClose` absolute — можливо візуально неочевидно, але primary bug = scroll.

## Fix direction

- `chat-panel.tsx`: `PanelBody` → `<motion.div className="flex min-h-0 flex-1 flex-col overflow-hidden">`
- `message-list.tsx`: prop `preferNativeScroll` або media query — на mobile `div` з `flex-1 min-h-0 overflow-y-auto` замість ScrollArea
- Manual verify: DevTools mobile, 10+ messages, scroll up/down, close via X
