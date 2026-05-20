import Link from "next/link";
import { cn } from "@/lib/utils";

type PeriodSelectorProps = { active: 7 | 30 | 90 };

const periods = [7, 30, 90] as const;

export function PeriodSelector({ active }: PeriodSelectorProps) {
  return (
    <div className="flex gap-2">
      {periods.map((p) => (
        <Link
          key={p}
          href={`?days=${p}`}
          className={cn(
            "rounded-md border px-3 py-1.5 text-sm transition-colors",
            active === p
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background text-muted-foreground hover:text-foreground",
          )}
        >
          {p} днів
        </Link>
      ))}
    </div>
  );
}
