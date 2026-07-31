import { Link, useParams } from 'react-router-dom';
import StatusPill from '../components/StatusPill';
import { MOCK_SPONSOR, MOCK_CONTACT, findInvoice, findTier } from '../data/mock';
import { ORG, REMITTANCE, REMITTANCE_READY } from '../data/org';
import { displayStatus, formatDate, formatMoney } from '../lib/format';

/**
 * Shell only: reads from src/data/mock.ts.
 *
 * This page is the invoice, not a preview of one. The sponsor's AP department will
 * print it to PDF and file it, so the document itself is plain semantic markup and
 * the print stylesheet in index.css strips the app chrome around it. There is no
 * separate PDF renderer to drift out of sync with what is shown on screen.
 */
export default function InvoiceDetail() {
  const { invoiceNumber } = useParams<{ invoiceNumber: string }>();
  const invoice = invoiceNumber ? findInvoice(invoiceNumber) : undefined;

  if (!invoice) {
    return (
      <section className="portal-pad">
        <div className="portal-col-narrow" style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
            Invoice not found
          </h1>
          <p style={{ marginTop: 14, color: 'rgba(255,255,255,0.6)' }}>
            We could not find an invoice numbered {invoiceNumber}.
          </p>
          <Link to="/invoices" className="btn-secondary" style={{ marginTop: 28 }}>
            Back to invoices
          </Link>
        </div>
      </section>
    );
  }

  const tier = findTier(invoice.tierId);
  const status = displayStatus(invoice);
  const payable = status === 'issued' || status === 'overdue';

  return (
    <section className="portal-pad">
      <div className="portal-col">
        {/* ===== APP CHROME (hidden when printed) ===== */}
        <div className="no-print fade-in-up">
          <Link
            to="/invoices"
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--gsu-sky)',
            }}
          >
            &larr; All invoices
          </Link>

          <div
            style={{
              marginTop: 18,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 20,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <h1
                className="tabular"
                style={{ fontSize: 'clamp(26px, 3.4vw, 36px)', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}
              >
                {invoice.invoiceNumber}
              </h1>
              <div style={{ marginTop: 12 }}>
                <StatusPill status={status} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button type="button" className="btn-secondary btn-sm" onClick={() => window.print()}>
                Print or save PDF
              </button>
              {payable && (
                <button type="button" className="btn-primary btn-sm" disabled>
                  Pay now
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ===== THE DOCUMENT ===== */}
        <article className="invoice-doc panel fade-in-up fade-delay-1" style={{ marginTop: 24 }}>
          <header className="invoice-head">
            <div>
              <img
                src="/images/colorstack-gsu-logo.png"
                alt=""
                width={44}
                height={44}
                style={{ borderRadius: '50%', display: 'block' }}
              />
              <p style={{ margin: '14px 0 0', fontSize: 16, fontWeight: 700 }}>{ORG.legalName}</p>
              {ORG.addressLines.map((line) => (
                <p key={line} style={{ margin: '3px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                  {line}
                </p>
              ))}
              <p style={{ margin: '3px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{ORG.billingEmail}</p>
              {ORG.ein && (
                <p style={{ margin: '3px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>EIN {ORG.ein}</p>
              )}
            </div>

            <div className="invoice-meta">
              <p
                style={{
                  margin: 0,
                  fontFamily: 'var(--mono)',
                  fontSize: 11,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.45)',
                }}
              >
                Invoice
              </p>
              <p className="tabular" style={{ margin: '6px 0 0', fontSize: 20, fontWeight: 700 }}>
                {invoice.invoiceNumber}
              </p>
              <dl className="invoice-dates">
                <dt>Issued</dt>
                <dd className="tabular">{formatDate(invoice.issuedAt) || 'Not yet issued'}</dd>
                <dt>Due</dt>
                <dd className="tabular">{formatDate(invoice.dueAt) || '-'}</dd>
                {invoice.paidAt && (
                  <>
                    <dt>Paid</dt>
                    <dd className="tabular">{formatDate(invoice.paidAt)}</dd>
                  </>
                )}
              </dl>
            </div>
          </header>

          <div className="invoice-parties">
            <div>
              <p className="field-label">Billed to</p>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{MOCK_SPONSOR.name}</p>
              <p style={{ margin: '4px 0 0', fontSize: 13.5, color: 'rgba(255,255,255,0.6)' }}>
                {MOCK_CONTACT.fullName}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: 13.5, color: 'rgba(255,255,255,0.6)' }}>
                {MOCK_CONTACT.email}
              </p>
            </div>
          </div>

          <table className="data-table invoice-lines">
            <thead>
              <tr>
                <th scope="col">Description</th>
                <th scope="col">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <p style={{ margin: 0, fontWeight: 600 }}>{tier?.name ?? 'Sponsorship'} sponsorship</p>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>
                    Annual partnership with {ORG.displayName}
                  </p>
                </td>
                <td className="tabular" style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {formatMoney(invoice.amountCents)}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 12,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  Total due
                </td>
                <td className="tabular" style={{ fontSize: 22, fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {formatMoney(invoice.amountCents)}
                </td>
              </tr>
            </tfoot>
          </table>

          <div className="invoice-remit">
            <p className="field-label">How to pay</p>

            {payable ? (
              <>
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: 'rgba(255,255,255,0.7)' }}>
                  Pay by card or bank transfer from this page, or send a wire or check using the
                  details below. Reference <strong className="tabular">{invoice.invoiceNumber}</strong> on
                  any transfer so we can match it to your account.
                </p>

                {REMITTANCE_READY ? (
                  <dl className="remit-grid">
                    <dt>Bank</dt>
                    <dd>{REMITTANCE.bankName}</dd>
                    <dt>Account name</dt>
                    <dd>{REMITTANCE.accountName}</dd>
                    <dt>Routing (ABA)</dt>
                    <dd className="tabular">{REMITTANCE.routingNumber}</dd>
                    <dt>Account number</dt>
                    <dd className="tabular">{REMITTANCE.accountNumber}</dd>
                    {REMITTANCE.swift && (
                      <>
                        <dt>SWIFT</dt>
                        <dd className="tabular">{REMITTANCE.swift}</dd>
                      </>
                    )}
                    <dt>Checks payable to</dt>
                    <dd>{REMITTANCE.checkPayableTo}</dd>
                  </dl>
                ) : (
                  // Never print a placeholder account number. A sponsor might try to
                  // pay against it.
                  <p className="notice-warn" style={{ marginTop: 16 }}>
                    Bank details are not configured yet. Email{' '}
                    <a href={`mailto:${ORG.billingEmail}`} style={{ textDecoration: 'underline' }}>
                      {ORG.billingEmail}
                    </a>{' '}
                    for wire or check instructions.
                  </p>
                )}
              </>
            ) : status === 'processing' ? (
              <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: 'rgba(255,255,255,0.7)' }}>
                Your bank transfer is clearing. Bank payments take 3 to 5 business days to settle,
                and we'll email a receipt as soon as it lands. Nothing further is needed from you.
              </p>
            ) : status === 'paid' ? (
              <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: 'rgba(255,255,255,0.7)' }}>
                Paid in full on {formatDate(invoice.paidAt)}
                {invoice.paymentMethod ? ` by ${methodLabel(invoice.paymentMethod)}` : ''}. Thank you
                for supporting our chapter.
              </p>
            ) : (
              <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: 'rgba(255,255,255,0.7)' }}>
                This invoice has been voided and is not payable.
              </p>
            )}

            {invoice.notes && (
              <p style={{ margin: '16px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{invoice.notes}</p>
            )}
          </div>

          <footer className="invoice-foot">
            Questions about this invoice? Email {ORG.billingEmail}
          </footer>
        </article>

        <p className="notice-preview no-print" style={{ marginTop: 28, textAlign: 'center' }}>
          Preview with sample data. Not wired to Supabase or Stripe yet.
        </p>
      </div>
    </section>
  );
}

function methodLabel(method: string): string {
  const labels: Record<string, string> = {
    card: 'credit card',
    ach: 'bank transfer',
    wire: 'wire',
    check: 'check',
  };
  return labels[method] ?? method;
}
