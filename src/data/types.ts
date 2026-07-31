/**
 * Shapes shared by the mock data and, later, the Supabase rows. Kept in one place
 * so swapping the mock layer for real queries is a change of source, not of types.
 *
 * Money is always integer cents. Never a float, never a formatted string. Anything
 * that reads a dollar amount goes through formatMoney.
 */

export type InvoiceStatus = 'draft' | 'issued' | 'processing' | 'paid' | 'void';

export type PaymentMethod = 'card' | 'ach' | 'wire' | 'check';

export type TaskStatus = 'todo' | 'done';

export interface Tier {
  id: string;
  name: string;
  amountCents: number;
  benefits: string[];
  sortOrder: number;
}

export interface Sponsor {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  /** Extracted from the logo or set by an admin. Null means fall back to GSU blue. */
  brandHex: string | null;
  tierId: string | null;
  websiteUrl: string | null;
}

export interface SponsorContact {
  id: string;
  sponsorId: string;
  email: string;
  fullName: string;
  title: string | null;
  role: 'primary' | 'billing' | 'viewer';
}

export interface Invoice {
  id: string;
  sponsorId: string;
  /** CSGSU-2026-0001. Allocated server-side, never generated in the browser. */
  invoiceNumber: string;
  tierId: string;
  amountCents: number;
  status: InvoiceStatus;
  issuedAt: string | null;
  dueAt: string | null;
  paidAt: string | null;
  paymentMethod: PaymentMethod | null;
  notes: string | null;
}

export interface Task {
  id: string;
  sponsorId: string | null;
  title: string;
  description: string | null;
  dueAt: string | null;
  status: TaskStatus;
}
