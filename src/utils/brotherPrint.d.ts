export function printBrotherLabels(opts: {
  businessSlug: string;
  tables: { id: string; name: string; label: string | null }[];
}): Promise<void>;
