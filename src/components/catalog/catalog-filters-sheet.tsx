"use client";

import { useState } from "react";
import { SlidersHorizontalIcon } from "lucide-react";
import {
  CatalogFiltersPanel,
  type CatalogFiltersPanelProps,
} from "@/components/catalog/catalog-filters";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function CatalogFiltersSheet(props: CatalogFiltersPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-4 lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button variant="outline" className="w-full sm:w-auto">
              <SlidersHorizontalIcon />
              Фільтри
            </Button>
          }
        />
        <SheetContent side="left" className="flex w-full flex-col sm:max-w-sm">
          <SheetHeader>
            <SheetTitle>Фільтри</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <CatalogFiltersPanel {...props} />
          </div>
          <SheetFooter>
            <SheetClose render={<Button className="w-full">Показати результати</Button>} />
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
