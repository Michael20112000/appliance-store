import type { ProductCondition } from "@/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { conditionLabelUa } from "@/lib/catalog/format";

type ConditionBadgeProps = {
  condition: ProductCondition;
  className?: string;
};

export function ConditionBadge({ condition, className }: ConditionBadgeProps) {
  const variant =
    condition === "FAIR" ? ("outline" as const) : ("secondary" as const);

  return (
    <Badge variant={variant} className={className}>
      {conditionLabelUa(condition)}
    </Badge>
  );
}
