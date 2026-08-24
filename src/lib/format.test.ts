import { describe, expect, it } from 'vitest';
import {
  daysUntil,
  displayStatus,
  formatDate,
  formatMoney,
  statusLabel,
  zeffyInvoiceUrl,
} from './format';

describe('formatMoney', () => {
  it('renders whole dollars with grouping and two-decimal precision', () => {
    expect(formatMoney(150_000)).toBe('$1,500.00');
    expect(formatMoney(50_000)).toBe('$500.00');
    expect(formatMoney(250_000)).toBe('$2,500.00');
  });

  it('renders fractional cents exactly', () => {
    expect(formatMoney(4237)).toBe('$42.37');
  });

  it('renders zero as $0.00 (never returns "$0" or "free")', () => {
    // Amount cents is >0 by DB constraint, but the formatter is used from
    // wherever, and a callsite deriving to 0 should still produce currency.
    expect(formatMoney(0)).toBe('$0.00');
  });
});

describe('formatDate', () => {
  it('parses a bare YYYY-MM-DD as calendar noon UTC to avoid the off-by-one', () => {
    // 2026-03-14 rendered west of UTC should still say Mar 14, not Mar 13 —
    // that bug lost a real invoice's due date and is the reason the parser
    // uses T12:00:00Z when the string has no time component.
    expect(formatDate('2026-03-14')).toBe('Mar 14, 2026');
  });

  it('returns empty string for null or garbage input', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate('not a date')).toBe('');
  });
});

describe('daysUntil', () => {
  it('returns positive for a date in the future', () => {
    const in10 = new Date(Date.now() + 10 * 86_400_000).toISOString().slice(0, 10);
    // Ceil-based; tolerate 9 or 10 depending on when the day rolled over.
    const d = daysUntil(in10);
    expect(d).not.toBeNull();
    expect(d!).toBeGreaterThanOrEqual(9);
    expect(d!).toBeLessThanOrEqual(11);
  });

  it('returns negative for a date in the past', () => {
    const past = new Date(Date.now() - 10 * 86_400_000).toISOString().slice(0, 10);
    const d = daysUntil(past);
    expect(d).not.toBeNull();
    expect(d!).toBeLessThan(0);
  });

  it('returns null on missing input', () => {
    expect(daysUntil(null)).toBeNull();
  });
});

describe('displayStatus', () => {
  it('flips issued to overdue when the due date has passed', () => {
    expect(displayStatus({ status: 'issued', dueAt: '2020-01-01' })).toBe('overdue');
  });

  it('leaves issued alone when the due date is future or absent', () => {
    expect(displayStatus({ status: 'issued', dueAt: null })).toBe('issued');
    const future = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);
    expect(displayStatus({ status: 'issued', dueAt: future })).toBe('issued');
  });

  it('passes through all non-issued statuses', () => {
    expect(displayStatus({ status: 'paid', dueAt: '2020-01-01' })).toBe('paid');
    expect(displayStatus({ status: 'void', dueAt: '2020-01-01' })).toBe('void');
    expect(displayStatus({ status: 'processing', dueAt: '2020-01-01' })).toBe('processing');
    expect(displayStatus({ status: 'draft', dueAt: null })).toBe('draft');
  });
});

describe('statusLabel', () => {
  it('never returns undefined for a known status', () => {
    for (const s of ['draft', 'issued', 'processing', 'paid', 'overdue', 'void'] as const) {
      expect(statusLabel(s)).toBeTruthy();
    }
  });
});

describe('zeffyInvoiceUrl', () => {
  it('builds the public URL from the UUID', () => {
    expect(zeffyInvoiceUrl('abc123')).toBe('https://www.zeffy.com/en-US/invoice/abc123');
  });
});
