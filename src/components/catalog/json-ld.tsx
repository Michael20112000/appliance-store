import type { Thing, WithContext } from "schema-dts";

function escapeJsonLd(json: string): string {
  return json.replace(/</g, "\\u003c");
}

export function JsonLd({ data }: { data: WithContext<Thing> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: escapeJsonLd(JSON.stringify(data)),
      }}
    />
  );
}
