import Link from "next/link";
import { adminCallbacksUrl, type AdminCallbackView } from "@/lib/admin/callbacks-url";
import { cn } from "@/lib/utils";

type CallbackListFiltersProps = {
  active: AdminCallbackView;
  counts: { active: number; archive: number };
};

export function CallbackListFilters({ active, counts }: CallbackListFiltersProps) {
  const tabs: Array<{ key: AdminCallbackView; label: string; count: number }> =
    [
      { key: "active", label: "Активні", count: counts.active },
      { key: "archive", label: "Архів", count: counts.archive },
    ];

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={adminCallbacksUrl({ view: tab.key })}
          className={cn(
            "rounded-md border px-3 py-1.5 text-sm transition-colors",
            active === tab.key
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background text-muted-foreground hover:text-foreground",
          )}
        >
          {tab.label} ({tab.count})
        </Link>
      ))}
    </div>
  );
}
