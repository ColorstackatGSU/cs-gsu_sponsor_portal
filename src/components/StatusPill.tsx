import type { InvoiceStatus } from '../data/types';
import { statusLabel, statusPillClass } from '../lib/format';

/**
 * Invoice state, as a pill. The label is always spelled out, never carried by colour
 * alone, so this survives colour blindness and a greyscale print of the invoice.
 */
export default function StatusPill({ status }: { status: InvoiceStatus | 'overdue' }) {
  return <span className={statusPillClass(status)}>{statusLabel(status)}</span>;
}
