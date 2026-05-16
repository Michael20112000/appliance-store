export function StoreFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:px-6">
        <p className="font-medium text-foreground">м. Львів</p>
        <p>Телефон і email — незабаром</p>
        <p>© {year} Техніка б/у Львів</p>
      </div>
    </footer>
  );
}
