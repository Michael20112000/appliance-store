import type React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  count: number;
  href?: string;
  className?: string;
  icon?: React.ElementType;
};

export function StatCard({ label, count, href, className, icon: Icon }: StatCardProps) {
  const content = (
    <div className="relative">
      {Icon && (
        <Icon className="absolute top-0 right-0 size-5 text-muted-foreground" aria-hidden />
      )}
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums">{count}</p>
    </div>
  );

  const cardClass = cn(
    "rounded-lg border border-border bg-card p-4 shadow-sm transition-colors",
    href && "hover:border-primary/30 hover:bg-card/80",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={cardClass}>
        {content}
      </Link>
    );
  }

  return (
    <div className={cardClass}>
      {content}
    </div>
  );
}
