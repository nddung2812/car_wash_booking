type JsonLdData = Record<string, unknown> | Record<string, unknown>[];

export default function JsonLd({ data, id }: { data: JsonLdData; id?: string }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      id={id}
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
