import type { Inquiry } from "@/db/schema";

export const INQUIRY_TYPES = ["property", "visit", "contact", "list", "valuation", "newsletter", "advisory"] as const;
export const INQUIRY_STATUSES = ["new", "contacted", "closed"] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export const INQUIRY_LABELS: Record<string, string> = {
  property: "Property enquiry",
  visit: "Visit request",
  contact: "Contact enquiry",
  list: "Listing enquiry",
  valuation: "Valuation request",
  newsletter: "Newsletter signup",
  advisory: "Advisory enquiry",
};

export type InboxItem = Omit<Inquiry, "createdAt" | "reviewedAt"> & {
  createdAt: string;
  reviewedAt: string | null;
  propertyUrl: string | null;
  projectUrl: string | null;
};
export type InboxStats = { total: number; new: number; contacted: number; closed: number; visits: number };
export type InboxResponse = {
  ok: boolean;
  items: InboxItem[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
  stats: InboxStats;
  error?: string;
};

/** Pakistan local mobile numbers become valid international WhatsApp/tel targets. */
export function contactDigits(phone: string): string {
  const trimmed = phone.trim();
  let digits = trimmed.replace(/\D/g, "");
  if (trimmed.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("03") && digits.length === 11) return `92${digits.slice(1)}`;
  if (digits.startsWith("3") && digits.length === 10) return `92${digits}`;
  return digits;
}
