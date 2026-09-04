export type BrokerStatus = "partnered" | "not_partnered";

export type BrokerLink = {
  id: string;
  label: string | null;
  referral_url: string;
  agent_commission: string | null;
  client_benefits: string | null;
};

export type Broker = {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  status: BrokerStatus;
  deposit_bonus: string | null;
  welcome_bonus: string | null;
  description: string | null;
  rating: number;
  reviews_count: number;
  broker_links?: BrokerLink[];
};

export type BrokerReview = {
  id: string;
  user_name: string | null;
  comment: string;
  stars: number;
  is_admin_reply: boolean;
  created_at: string;
};

export function statusLabel(status: BrokerStatus): string {
  return status === "partnered" ? "شريك معتمد" : "غير متعاقد";
}
