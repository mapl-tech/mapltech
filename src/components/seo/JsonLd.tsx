import type { Graph, Thing } from 'schema-dts';
import { graph, serializeJsonLd } from '@/lib/schema';

interface JsonLdProps {
  /** A finished @graph (from graph()/pageGraph()/siteGraph()) or the nodes to wrap into one. */
  data: Graph | readonly Thing[];
  /** Optional DOM id, useful when a page renders more than one block. */
  id?: string;
}

function isGraph(value: Graph | readonly Thing[]): value is Graph {
  return !Array.isArray(value) && '@graph' in value;
}

/**
 * Server component: renders one `<script type="application/ld+json">`.
 * `<`, `>` and `&` are escaped as <, >, & by serializeJsonLd,
 * so no string in the graph can terminate the script element.
 */
export default function JsonLd({ data, id }: JsonLdProps) {
  const payload = isGraph(data) ? data : graph(data);
  return (
    <script
      type="application/ld+json"
      id={id}
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(payload) }}
    />
  );
}
