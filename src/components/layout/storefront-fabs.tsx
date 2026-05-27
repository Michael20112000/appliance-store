"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Phone, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CallbackRequestForm } from "@/components/layout/callback-request-form";
import { CART_CHANGED_EVENT } from "@/lib/cart/cart-events";
import { getPendingItemCount } from "@/lib/cart/pending-storage";
import { formatUaPhoneDisplay, uaPhoneTelHref } from "@/lib/phone/format-ua";
import type { PublicStorePhone } from "@/server/services/store-settings.service";
import { cn } from "@/lib/utils";
import { useChat } from "@/components/chat/chat-provider";
import { useDrawers } from "@/lib/drawers/drawer-context";

type StorefrontFabsProps = {
  phones: PublicStorePhone[];
  initialCartCount: number;
  hasSession: boolean;
};

export function StorefrontFabs({
  phones,
  initialCartCount,
  hasSession,
}: StorefrontFabsProps) {
  const [cartCount, setCartCount] = useState(initialCartCount);
  const [callbackOpen, setCallbackOpen] = useState(false);
  const { isOpen: chatIsOpen, openPanel, unreadCount } = useChat();
  const { openCart } = useDrawers();

  useEffect(() => {
    setCartCount(initialCartCount);
  }, [initialCartCount]);

  useEffect(() => {
    if (hasSession) return;

    const sync = () => setCartCount(getPendingItemCount());
    sync();
    window.addEventListener(CART_CHANGED_EVENT, sync);
    return () => window.removeEventListener(CART_CHANGED_EVENT, sync);
  }, [hasSession]);

  const badgeLabel = cartCount > 9 ? "9+" : String(cartCount);
  const chatBadgeLabel = unreadCount > 9 ? "9+" : String(unreadCount);

  return (
    <div
      className="fixed bottom-6 right-6 z-[49] flex flex-col items-center gap-3 pb-[max(0px,env(safe-area-inset-bottom))]"
    >
      {/* FAB-02: Callback FAB */}
      <button
        type="button"
        aria-label="Замовити дзвінок"
        onClick={() => setCallbackOpen(true)}
        className={cn(
          "flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        )}
      >
        <Phone className="size-6" aria-hidden />
      </button>

      {/* FAB-01: Cart FAB — always visible, no early return when count === 0 */}
      <button
        type="button"
        onClick={openCart}
        aria-label={cartCount > 0 ? `Кошик, ${cartCount} товарів` : "Кошик"}
        className={cn(
          "flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring relative",
        )}
      >
        <ShoppingCart className="size-6" aria-hidden />
        {cartCount > 0 && (
          <Badge
            className="absolute -right-0.5 -top-0.5 min-w-5 justify-center px-1 text-[10px]"
            aria-hidden
          >
            {badgeLabel}
          </Badge>
        )}
      </button>

      {/* FAB-04: Chat FAB — hidden when chat panel is open */}
      {!chatIsOpen && (
        <button
          type="button"
          onClick={() => openPanel()}
          className={cn(
            "flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring relative",
          )}
          aria-label={
            unreadCount > 0
              ? `Відкрити чат з магазином, ${unreadCount} непрочитаних`
              : "Відкрити чат з магазином"
          }
        >
          <MessageSquare className="size-6" aria-hidden />
          {unreadCount > 0 && (
            <Badge
              className="absolute -right-0.5 -top-0.5 min-w-5 justify-center px-1 text-[10px]"
              aria-hidden
            >
              {chatBadgeLabel}
            </Badge>
          )}
        </button>
      )}

      {/* FAB-02: Callback Dialog */}
      <Dialog open={callbackOpen} onOpenChange={setCallbackOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Зв&#39;яжіться з нами</DialogTitle>
          </DialogHeader>
          {phones.length > 0 && (
            <ul className="space-y-1 text-sm">
              {phones.map((phone) => (
                <li key={phone.id}>
                  <a href={uaPhoneTelHref(phone.digits)}>
                    {formatUaPhoneDisplay(phone.digits)}
                  </a>
                  {phone.label && (
                    <span className="ml-2 text-muted-foreground">
                      {phone.label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
          <CallbackRequestForm idPrefix="fab" compact />
        </DialogContent>
      </Dialog>
    </div>
  );
}
