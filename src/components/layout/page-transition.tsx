"use client";

import { usePathname } from "next/navigation";
import { useRef, useLayoutEffect } from "react";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Remove animationName to stop the animation, then restore to restart it.
    // void el.offsetHeight forces a synchronous reflow between the two writes
    // so the browser sees a genuine animation restart, not a no-op.
    el.style.animationName = "none";
    void el.offsetHeight;
    el.style.animationName = "";
  }, [pathname]);

  return (
    <div ref={ref} className="page-transition">
      {children}
    </div>
  );
}
