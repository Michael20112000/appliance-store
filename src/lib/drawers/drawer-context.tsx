"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type DrawerContextValue = {
  cartOpen: boolean;
  wishlistOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  openWishlist: () => void;
  closeWishlist: () => void;
};

const DrawerContext = createContext<DrawerContextValue | null>(null);

export function DrawerProvider({ children }: { children: ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);

  const value = useMemo<DrawerContextValue>(
    () => ({
      cartOpen,
      wishlistOpen,
      openCart: () => setCartOpen(true),
      closeCart: () => setCartOpen(false),
      openWishlist: () => setWishlistOpen(true),
      closeWishlist: () => setWishlistOpen(false),
    }),
    [cartOpen, wishlistOpen],
  );

  return (
    <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>
  );
}

export function useDrawers(): DrawerContextValue {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error("useDrawers must be used within DrawerProvider");
  }
  return context;
}
