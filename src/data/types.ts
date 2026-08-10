/**
 * Small enums shared between the API response types (in each hook) and the
 * formatting helpers. The full row shapes live in the hooks that fetch them
 * (see hooks/useInvoices.ts, hooks/useTasks.ts, hooks/useMe.ts) rather than
 * here, so each callsite imports only what it uses.
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
