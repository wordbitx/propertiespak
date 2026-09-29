export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Structured data is generated server-side from trusted objects only.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
