/**
 * Chapter details that appear on invoices and in the footer. One place, because an
 * invoice with the wrong remittance details is worse than no invoice.
 *
 * TODO before the first real invoice goes out:
 *   - Confirm the legal entity name. Does the chapter bill under its own name or
 *     through the GSU foundation? This affects the sponsor's tax treatment.
 *   - Fill in the mailing address for check remittance.
 *   - Fill in the wire and ACH bank details.
 *   - Confirm the EIN, which corporate AP departments will ask for.
 */

export const ORG = {
  legalName: 'ColorStack at Georgia State University',
  displayName: 'ColorStack at GSU',
  addressLines: ['Georgia State University', 'Atlanta, GA'],
  email: 'official@colorstackatgsu.com',
  billingEmail: 'official@colorstackatgsu.com',
  site: 'https://colorstackatgsu.com',
  /** Empty string means "not confirmed yet". The invoice hides the row rather than
      printing a placeholder a sponsor might try to pay against. */
  ein: '',
} as const;

export const REMITTANCE = {
  bankName: '',
  accountName: '',
  routingNumber: '',
  accountNumber: '',
  swift: '',
  checkPayableTo: '',
} as const;

/** True once someone has actually filled the bank details in. */
export const REMITTANCE_READY = Boolean(REMITTANCE.bankName && REMITTANCE.routingNumber);

export const SOCIAL = {
  instagram: 'https://instagram.com/colorstackatgsu',
  linkedin: 'https://linkedin.com/company/colorstack-gsu',
} as const;
