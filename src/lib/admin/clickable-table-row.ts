export const adminClickableRowClassName =
  "cursor-pointer transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none";

type AdminClickableRowOptions = {
  href: string;
  onNavigate: (href: string) => void;
};

/**
 * Props for admin list rows that navigate on click or Enter/Space.
 * Interactive children (Select, Button, Link) MUST call `stopPropagation` on
 * pointer events so row navigation does not fire — see product-list-status-select.
 */
export function getAdminClickableRowProps({
  href,
  onNavigate,
}: AdminClickableRowOptions) {
  return {
    role: "link" as const,
    tabIndex: 0,
    onClick: () => onNavigate(href),
    onKeyDown: (event: { key: string; preventDefault: () => void }) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onNavigate(href);
      }
    },
  };
}
