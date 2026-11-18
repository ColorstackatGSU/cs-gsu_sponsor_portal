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
  billingEmail: 'official@colorstackatgsu.com',
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
