export function ArchivedChatBanner() {
  return (
    <div
      role="status"
      className="border-b border-border bg-muted px-4 py-3"
    >
      <p className="text-sm font-semibold text-foreground">
        Діалог закрито магазином
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Ви можете переглядати історію, але нові повідомлення надіслати не можна.
      </p>
    </div>
  );
}
