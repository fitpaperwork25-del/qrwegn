export function printBrotherLabels(opts: {
  businessId: string;
  businessName?: string;
  tables: { id: string; name: string; label: string | null }[];
}): Promise<void>;
