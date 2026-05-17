import type { Metadata } from "next";
import { JsonLd } from "@/components/catalog/json-ld";
import { CategoryGrid } from "@/components/home/category-grid";
import { getStoreNap } from "@/lib/catalog/store-nap";
import { HeroSection } from "@/components/home/hero-section";
import { HowToBuy } from "@/components/home/how-to-buy";

export const metadata: Metadata = {
  title: "Головна",
  description:
    "Б/у побутова техніка у Львові — пральні машини, холодильники, телевізори та інше.",
};

export default function HomePage() {
  const store = getStoreNap();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: store.name,
          address: {
            "@type": "PostalAddress",
            addressLocality: "Львів",
            addressCountry: "UA",
            streetAddress: store.address,
          },
          areaServed: { "@type": "City", name: "Львів" },
          ...(store.phone ? { telephone: store.phone } : {}),
        }}
      />
      <HeroSection />
      <CategoryGrid />
      <HowToBuy />
    </>
  );
}
