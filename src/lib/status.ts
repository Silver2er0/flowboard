export const STATUSES = ["WISHLIST", "APPLIED", "INTERVIEW", "OFFER", "REJECTED"] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_META: Record<Status, { label: string; dot: string }> = {
  WISHLIST: { label: "Wishlist", dot: "bg-slate-400" },
  APPLIED: { label: "Applied", dot: "bg-blue-500" },
  INTERVIEW: { label: "Interview", dot: "bg-amber-500" },
  OFFER: { label: "Offer", dot: "bg-emerald-500" },
  REJECTED: { label: "Rejected", dot: "bg-rose-500" },
};

export type Card = {
  id: string;
  company: string;
  role: string;
  location: string | null;
  url: string | null;
  salary: string | null;
  notes: string | null;
  status: Status;
  position: number;
  appliedAt: string;
};
