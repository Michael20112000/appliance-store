"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  adminClickableRowClassName,
  getAdminClickableRowProps,
} from "@/lib/admin/clickable-table-row";
import { adminProductsUrl } from "@/lib/admin/products-url";
import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";
import { toast } from "sonner";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { CategoryTableDeleteButton } from "@/components/admin/category-table-delete-button";
import { reorderCategoriesAction } from "@/server/actions/admin/category.actions";

export type AdminCategoryRow = {
  id: string;
  name: string;
  sortOrder: number;
  productCount: number;
};

type AdminCategoriesTableProps = {
  categories: AdminCategoryRow[];
};

function SortableRow({
  category,
  rowNumber,
  stopRowNav,
  onNavigate,
  onCategoryDeleted,
}: {
  category: AdminCategoryRow;
  rowNumber: number;
  stopRowNav: (event: React.SyntheticEvent) => void;
  onNavigate: (href: string) => void;
  onCategoryDeleted: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const href = `/admin/kategorii/${category.id}`;
  const rowProps = getAdminClickableRowProps({ href, onNavigate });

  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...rowProps}
      className={cn("border-b border-border last:border-0", adminClickableRowClassName)}
    >
      <td className="px-4 py-2 tabular-nums text-muted-foreground">{rowNumber}</td>
      <td className="px-2 py-2 w-8 touch-none cursor-grab">
        <GripVertical
          className="size-4 text-muted-foreground"
          {...listeners}
        />
      </td>
      <td className="px-4 py-2">{category.name}</td>
      <td className="px-4 py-2">
        <Link
          href={adminProductsUrl({ categoryId: category.id })}
          onClick={stopRowNav}
          onPointerDown={stopRowNav}
          className="font-medium text-primary hover:underline underline-offset-4"
        >
          Переглянути
          <span className="text-muted-foreground"> ({category.productCount})</span>
        </Link>
      </td>
      <td className="px-4 py-2">
        <div
          data-admin-row-interactive
          className="flex flex-wrap gap-2"
        >
          <Button variant="outline" size="sm" asChild>
            <Link
              href={`/admin/tovary/novyi?categoryId=${category.id}`}
              onClick={stopRowNav}
              onPointerDown={stopRowNav}
            >
              Додати товар
            </Link>
          </Button>
          <CategoryTableDeleteButton
            categoryId={category.id}
            onDeleted={() => onCategoryDeleted(category.id)}
          />
        </div>
      </td>
    </tr>
  );
}

export function AdminCategoriesTable({ categories }: AdminCategoriesTableProps) {
  const router = useRouter();
  const [localCategories, setLocalCategories] = useState(categories);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const stopRowNav = (event: React.SyntheticEvent) => event.stopPropagation();

  function handleCategoryDeleted(id: string) {
    setLocalCategories((prev) => prev.filter((c) => c.id !== id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = localCategories.findIndex((c) => c.id === active.id);
    const newIndex = localCategories.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(localCategories, oldIndex, newIndex);
    const snapshot = localCategories;

    setLocalCategories(reordered);

    startTransition(async () => {
      const result = await reorderCategoriesAction(reordered.map((c) => c.id));
      if (!result.ok) {
        setLocalCategories(snapshot);
        toast.error("Помилка збереження порядку");
      }
    });
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-background">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-muted-foreground">
              <th className="px-4 py-2 font-medium w-12">№</th>
              <th className="px-2 py-2 w-8">
                <span className="sr-only">Перетягнути</span>
              </th>
              <th className="px-4 py-2 font-medium">Назва</th>
              <th className="px-4 py-2 font-medium">Товари</th>
              <th className="px-4 py-2 font-medium">Дії</th>
            </tr>
          </thead>
          <SortableContext
            items={localCategories.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <tbody>
              {localCategories.map((category, index) => (
                <SortableRow
                  key={category.id}
                  category={category}
                  rowNumber={index + 1}
                  stopRowNav={stopRowNav}
                  onNavigate={(target) => router.push(target)}
                  onCategoryDeleted={handleCategoryDeleted}
                />
              ))}
            </tbody>
          </SortableContext>
        </table>
      </DndContext>
    </div>
  );
}
