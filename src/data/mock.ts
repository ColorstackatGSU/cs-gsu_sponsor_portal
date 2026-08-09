import type { Invoice, Sponsor, SponsorContact, Task, Tier } from './types';

/**
 * Placeholder data so the pages can be designed and clicked through before the
 * backend is wired. Every value here is replaced by a real API call at step 5.
 *
 * The four tiers here MUST match what is configured on Zeffy. When a tier changes
 * here it has to change there too, or a sponsor at Community or Signature will not
 * have a matching Zeffy product to pay through.
 */

export const MOCK_TIERS: Tier[] = [
  {
    id: 'tier-supporting',
    name: 'Supporting Partner',
    amountCents: 50_000,
    benefits: [
      'One dedicated event touchpoint (info session, workshop, or panel)',
      'Your logo on event slides, flyers, and signage',
    ],
    sortOrder: 1,
  },
  {
    id: 'tier-community',
    name: 'Community Partner',
    amountCents: 100_000,
    benefits: [
      'Everything in Supporting Partner',
      'Access to our member resume book',
      'Your logo featured on our social media',
      'Jobs, events, and opportunities in our monthly newsletter',
    ],
    sortOrder: 2,
  },
  {
    id: 'tier-signature',
    name: 'Signature Partner',
    amountCents: 150_000,
    benefits: [
      'Everything in Community Partner',
      'Host a private workshop or event for our members (company covers food)',
      'Priority booking for workshops and lunch and learns in Fall recruiting',
      'Featured company event coverage on our social media',
    ],
    sortOrder: 3,
  },
  {
    id: 'tier-founding',
    name: 'Founding Partner',
    amountCents: 250_000,
    benefits: [
      'Everything in Signature Partner',
      'Event naming rights (Presented by [Company])',
      'First look at our member resume book before other tiers',
      'Reserved speaking slot at a flagship event',
      'Reserved for our earliest partners',
    ],
    sortOrder: 4,
  },
];

export const MOCK_SPONSOR: Sponsor = {
  id: 'sponsor-1',
  name: 'John Doe Corporations',
  slug: 'john-doe',
  logoUrl: null,
  brandHex: '#059669',
  tierId: 'tier-signature',
  websiteUrl: 'https://johndoe.example',
};

export const MOCK_CONTACT: SponsorContact = {
  id: 'contact-1',
  sponsorId: 'sponsor-1',
  email: 'jane.doe@johndoe.example',
  fullName: 'Jane Doe',
  title: 'Chief Recruiting Officer',
  role: 'primary',
};

/** The one real Zeffy invoice the chapter has created so far. Wired to the mock
    "issued" invoice below so clicking Pay in dev actually opens a real Zeffy page
    (do not pay it in dev unless you want to test refunds). The two paid invoices
    below use placeholder UUIDs since they never had real Zeffy counterparts. */
const REAL_ZEFFY_INVOICE = '2bd0f46e-9afe-48c3-8cb4-5054fc134349';

export const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv-3',
    sponsorId: 'sponsor-1',
    tierId: 'tier-signature',
    amountCents: 150_000,
    title: 'Signature Partner sponsorship, 2026-2027',
    status: 'issued',
    issuedAt: '2026-07-15',
    dueAt: '2026-08-14',
    paidAt: null,
    paymentMethod: null,
    zeffyInvoiceId: REAL_ZEFFY_INVOICE,
    notes: null,
  },
  {
    id: 'inv-2',
    sponsorId: 'sponsor-1',
    tierId: 'tier-community',
    amountCents: 100_000,
    title: 'Community Partner sponsorship, 2025-2026',
    status: 'paid',
    issuedAt: '2025-08-02',
    dueAt: '2025-09-01',
    paidAt: '2025-08-19',
    paymentMethod: 'ach',
    zeffyInvoiceId: '00000000-1111-2222-3333-000000000002',
    notes: null,
  },
  {
    id: 'inv-1',
    sponsorId: 'sponsor-1',
    tierId: 'tier-supporting',
    amountCents: 50_000,
    title: 'Supporting Partner sponsorship, 2024-2025',
    status: 'paid',
    issuedAt: '2025-01-20',
    dueAt: '2025-02-19',
    paidAt: '2025-02-03',
    paymentMethod: 'wire',
    zeffyInvoiceId: '00000000-1111-2222-3333-000000000001',
    notes: 'Wire received, confirmed by treasurer. Zeffy invoice marked paid manually.',
  },
];

export const MOCK_TASKS: Task[] = [
  {
    id: 'task-1',
    sponsorId: 'sponsor-1',
    title: 'Pay the fall sponsorship invoice',
    description: 'Your Signature Partner invoice is due August 14.',
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
    title: 'Schedule your private workshop',
    description: 'Signature Partner includes one hosted event per year. Send a couple of dates that work for your team.',
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

export function findInvoice(id: string): Invoice | undefined {
  return MOCK_INVOICES.find((i) => i.id === id);
}
