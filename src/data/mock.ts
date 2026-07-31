import type { Invoice, Sponsor, SponsorContact, Task, Tier } from './types';

/**
 * Placeholder data so the pages can be designed and clicked through before Supabase
 * exists. Every value here is replaced by a real query in step 4 onward.
 *
 * TIER NAMES AND AMOUNTS ARE PLACEHOLDERS. Swap in the chapter's real sponsorship
 * levels before this goes anywhere near a sponsor.
 */

export const MOCK_TIERS: Tier[] = [
  {
    id: 'tier-bronze',
    name: 'Bronze',
    amountCents: 100_000,
    benefits: ['Logo on the chapter site', 'Access to the resume book', 'Named in the semester recap'],
    sortOrder: 1,
  },
  {
    id: 'tier-silver',
    name: 'Silver',
    amountCents: 250_000,
    benefits: [
      'Everything in Bronze',
      'One tech talk or workshop per semester',
      'Logo on event materials',
    ],
    sortOrder: 2,
  },
  {
    id: 'tier-gold',
    name: 'Gold',
    amountCents: 500_000,
    benefits: [
      'Everything in Silver',
      'Dedicated recruiting session',
      'Priority placement at the career fair',
      'Quarterly chapter impact report',
    ],
    sortOrder: 3,
  },
  {
    id: 'tier-platinum',
    name: 'Platinum',
    amountCents: 1_000_000,
    benefits: [
      'Everything in Gold',
      'Named title sponsor for a flagship event',
      'Direct introductions to graduating members',
      'Custom partnership plan',
    ],
    sortOrder: 4,
  },
];

export const MOCK_SPONSOR: Sponsor = {
  id: 'sponsor-1',
  name: 'Northwind Technologies',
  slug: 'northwind',
  logoUrl: null,
  brandHex: null,
  tierId: 'tier-gold',
  websiteUrl: 'https://example.com',
};

export const MOCK_CONTACT: SponsorContact = {
  id: 'contact-1',
  sponsorId: 'sponsor-1',
  email: 'partnerships@example.com',
  fullName: 'Jordan Avery',
  title: 'University Recruiting Lead',
  role: 'primary',
};

export const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv-3',
    sponsorId: 'sponsor-1',
    invoiceNumber: 'CSGSU-2026-0042',
    tierId: 'tier-gold',
    amountCents: 500_000,
    status: 'issued',
    issuedAt: '2026-07-15',
    dueAt: '2026-08-14',
    paidAt: null,
    paymentMethod: null,
    notes: null,
  },
  {
    id: 'inv-2',
    sponsorId: 'sponsor-1',
    invoiceNumber: 'CSGSU-2025-0031',
    tierId: 'tier-silver',
    amountCents: 250_000,
    status: 'paid',
    issuedAt: '2025-08-02',
    dueAt: '2025-09-01',
    paidAt: '2025-08-19',
    paymentMethod: 'ach',
    notes: null,
  },
  {
    id: 'inv-1',
    sponsorId: 'sponsor-1',
    invoiceNumber: 'CSGSU-2025-0008',
    tierId: 'tier-bronze',
    amountCents: 100_000,
    status: 'paid',
    issuedAt: '2025-01-20',
    dueAt: '2025-02-19',
    paidAt: '2025-02-03',
    paymentMethod: 'wire',
    notes: 'Wire received, confirmed by treasurer.',
  },
];

export const MOCK_TASKS: Task[] = [
  {
    id: 'task-1',
    sponsorId: 'sponsor-1',
    title: 'Pay the fall sponsorship invoice',
    description: 'Invoice CSGSU-2026-0042 is due August 14.',
    dueAt: '2026-08-14',
    status: 'todo',
  },
  {
    id: 'task-2',
    sponsorId: 'sponsor-1',
    title: 'Send us a high-resolution logo',
    description: 'SVG or a PNG at least 1000px wide, so it stays sharp on event banners.',
    dueAt: '2026-08-20',
    status: 'todo',
  },
  {
    id: 'task-3',
    sponsorId: 'sponsor-1',
    title: 'Pick a date for the fall tech talk',
    description: 'Gold tier includes one recruiting session per semester.',
    dueAt: '2026-09-05',
    status: 'todo',
  },
  {
    id: 'task-4',
    sponsorId: 'sponsor-1',
    title: 'Confirm your billing contact',
    description: null,
    dueAt: null,
    status: 'done',
  },
];

export function findTier(tierId: string | null): Tier | undefined {
  return MOCK_TIERS.find((t) => t.id === tierId);
}

export function findInvoice(invoiceNumber: string): Invoice | undefined {
  return MOCK_INVOICES.find((i) => i.invoiceNumber === invoiceNumber);
}
