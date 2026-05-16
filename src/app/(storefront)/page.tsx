import type { Metadata } from "next";
import { CategoryGrid } from "@/components/home/category-grid";
import { HeroSection } from "@/components/home/hero-section";
import { HowToBuy } from "@/components/home/how-to-buy";

export const metadata: Metadata = {
  title: "Головна",
  description:
    "Б/у побутова техніка у Львові — пральні машини, холодильники, телевізори та інше.",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoryGrid />
      <HowToBuy />
    </>
  );
}
