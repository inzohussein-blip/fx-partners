// Client-safe resource types & labels (no server imports), so client
// components can use them without pulling the server Supabase client.

export type TradingResource = {
  id: string;
  title: string;
  description: string | null;
  kind: string; // indicator | template | ebook | tool
  file_url: string;
  downloads: number;
  brokerName: string | null;
  brokerHref: string | null;
};

export const RESOURCE_KINDS: Record<string, { label: string; emoji: string }> = {
  indicator: { label: "مؤشر", emoji: "📈" },
  template: { label: "قالب", emoji: "🎛️" },
  ebook: { label: "كتاب", emoji: "📘" },
  tool: { label: "أداة", emoji: "🧰" },
};
