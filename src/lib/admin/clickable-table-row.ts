export const adminClickableRowClassName =
  "cursor-pointer transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none";

const ADMIN_ROW_INTERACTIVE_SELECTOR = [
  "[data-admin-row-interactive]",
  '[data-slot="select-trigger"]',
  '[data-slot="select-content"]',
  '[data-slot="select-item"]',
  "button",
  "a",
  "input",
  "textarea",
  '[role="combobox"]',
].join(",");

let suppressRowNavigationUntil = 0;

/** Blocks the next row `onClick` after Select/Dialog closes (portal ghost-click). */
export function suppressAdminRowNavigation(durationMs = 400) {
  suppressRowNavigationUntil = Date.now() + durationMs;
}

type AdminClickableRowOptions = {
  href: string;
  onNavigate: (href: string) => void;
};

/**
 * Props for admin list rows that navigate on click or Enter/Space.
 * Interactive children (Select, Button, Link) MUST use `data-admin-row-interactive`
 * and/or call `suppressAdminRowNavigation` when the popup closes.
 */
export function getAdminClickableRowProps({
  href,
  onNavigate,
}: AdminClickableRowOptions) {
  return {
    role: "link" as const,
    tabIndex: 0,
    onClick: (event: { target: EventTarget | null }) => {
      if (Date.now() < suppressRowNavigationUntil) return;
      const target = event.target;
      if (
        target &&
        typeof target === "object" &&
        "closest" in target &&
        typeof target.closest === "function" &&
        target.closest(ADMIN_ROW_INTERACTIVE_SELECTOR)
      ) {
        return;
      }
      onNavigate(href);
    },
    onKeyDown: (event: { key: string; preventDefault: () => void }) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onNavigate(href);
      }
    },
  };
}
