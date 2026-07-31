import type { Invoice, InvoiceStatus } from '../data/types';

/**
 * Cents to "$5,000.00". Every dollar amount in the UI goes through here, so there
 * is exactly one place where money formatting can be wrong.
 */
export function formatMoney(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

/**
 * "Mar 14, 2026". Dates arrive as ISO strings.
 *
 * Parsed as UTC noon rather than handed straight to Date. A bare "2026-03-14" is
 * parsed as UTC midnight, which renders as March 13 for anyone west of Greenwich,
 * and an invoice due date that is off by a day is a real problem.
 */
export function formatDate(iso: string | null): string {
  if (!iso) return '';
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(iso);
  const d = new Date(dateOnly ? `${iso}T12:00:00Z` : iso);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: dateOnly ? 'UTC' : undefined,
  }).format(d);
}

/** Whole days from today until the date. Negative means it has passed. */
export function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(iso);
  const d = new Date(dateOnly ? `${iso}T12:00:00Z` : iso);
  if (Number.isNaN(d.getTime())) return null;
  const msPerDay = 86_400_000;
  return Math.ceil((d.getTime() - Date.now()) / msPerDay);
}

/**
 * The status a sponsor should actually see, which is not always the stored one.
 * "Overdue" is not a column: it is an issued invoice whose due date has passed,
 * derived at read time so it can never go stale in the database.
 */
export function displayStatus(invoice: Invoice): InvoiceStatus | 'overdue' {
  if (invoice.status === 'issued') {
    const days = daysUntil(invoice.dueAt);
    if (days !== null && days < 0) return 'overdue';
  }
  return invoice.status;
}

const STATUS_LABELS: Record<InvoiceStatus | 'overdue', string> = {
  draft: 'Draft',
  issued: 'Awaiting payment',
  processing: 'Payment processing',
  paid: 'Paid',
  overdue: 'Overdue',
  void: 'Void',
};

export function statusLabel(status: InvoiceStatus | 'overdue'): string {
  return STATUS_LABELS[status];
}

/** Maps a status to its .pill-* modifier class. */
export function statusPillClass(status: InvoiceStatus | 'overdue'): string {
  return `pill pill-${status}`;
}
