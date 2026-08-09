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
  tierId: string;
  /** Snapshot at issue time. Zeffy owns the authoritative amount on the invoice
      itself; this copy exists so the dashboard renders without an API round-trip. */
  amountCents: number;
  status: InvoiceStatus;
  issuedAt: string | null;
  dueAt: string | null;
  paidAt: string | null;
  paymentMethod: PaymentMethod | null;
  /** UUID of the Zeffy invoice, set at link time. Null while status is 'draft'.
      URL is derived: `https://www.zeffy.com/en-US/invoice/<uuid>`. */
  zeffyInvoiceId: string | null;
  /** Free-form title we chose at issue time, e.g. "Signature Partner sponsorship
      2026-2027." Shown on our dashboard cards; Zeffy has its own description. */
  title: string;
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
