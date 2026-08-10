import type { Tier } from './types';

/**
 * Tier catalog for the UI. The API returns each sponsor's tierName; we look up
 * the tier by name here to render its benefits list. Prices and names MUST
 * match the backend seed (supabase/seed.sql) and the Zeffy campaign. Drops
 * entirely once /tiers ships on the API.
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
