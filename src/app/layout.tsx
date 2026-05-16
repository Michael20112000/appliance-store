import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: {
    default: "Техніка б/у Львів",
    template: "%s | Техніка б/у Львів",
  },
  description:
    "Б/у побутова техніка у Львові — переглядайте категорії та оформлюйте замовлення.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" className={cn("h-full", GeistSans.className, "font-sans", geist.variable)}>
      <body className="min-h-dvh bg-background text-base text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
