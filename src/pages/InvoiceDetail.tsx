import { Link, useParams } from 'react-router-dom';
import StatusPill from '../components/StatusPill';
import { MOCK_SPONSOR, MOCK_CONTACT, findInvoice, findTier } from '../data/mock';
import { ORG, REMITTANCE, REMITTANCE_READY } from '../data/org';
import { displayStatus, formatDate, formatMoney } from '../lib/format';

/**
 * Shell only: reads from src/data/mock.ts.
 *
 * This page IS the invoice, not a preview of one. The sponsor's AP department prints
 * it to PDF and files it, and the @media print block in index.css strips the app
 * chrome around it. There is deliberately no second PDF renderer that could drift out
 * of sync with what is shown on screen.
 */
export default function InvoiceDetail() {
  const { invoiceNumber } = useParams<{ invoiceNumber: string }>();
  const invoice = invoiceNumber ? findInvoice(invoiceNumber) : undefined;

  if (!invoice) {
    return (
      <div className="page">
        <div className="wrap-narrow" style={{ textAlign: 'center' }}>
          <h1>Invoice not found</h1>
          <p className="muted" style={{ fontSize: 14, marginTop: 8 }}>
            We could not find an invoice numbered {invoiceNumber}.
          </p>
          <Link to="/invoices" className="btn btn-secondary" style={{ marginTop: 20 }}>Back to invoices</Link>
        </div>
      </div>
    );
  }

  const tier = findTier(invoice.tierId);
  const status = displayStatus(invoice);
  const payable = status === 'issued' || status === 'overdue';

  return (
    <div className="page">
      <div className="wrap">
        {/* ===== APP CHROME (hidden when printed) ===== */}
        <div className="no-print">
          <Link to="/invoices" className="link" style={{ fontSize: 13.5 }}>&larr; All invoices</Link>

          <div
            style={{
              marginTop: 12,
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <h1 className="num">{invoice.invoiceNumber}</h1>
              <StatusPill status={status} />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => window.print()}>
                Print or save PDF
              </button>
              {payable && <button type="button" className="btn btn-primary btn-sm" disabled>Pay now</button>}
            </div>
          </div>
        </div>

        {/* ===== THE DOCUMENT ===== */}
        <article className="card">
          <header className="doc-head">
            <div>
              <img src="/images/colorstack-gsu-logo.png" alt="" width={36} height={36} style={{ borderRadius: '50%', display: 'block' }} />
              <p style={{ margin: '10px 0 0', fontWeight: 600 }}>{ORG.legalName}</p>
              {ORG.addressLines.map((line) => (
                <p key={line} className="muted" style={{ margin: '2px 0 0', fontSize: 13.5 }}>{line}</p>
              ))}
              <p className="muted" style={{ margin: '2px 0 0', fontSize: 13.5 }}>{ORG.billingEmail}</p>
              {ORG.ein && <p className="muted" style={{ margin: '2px 0 0', fontSize: 13.5 }}>EIN {ORG.ein}</p>}
            </div>

            <div className="doc-meta">
              <p className="muted" style={{ margin: 0, fontSize: 13 }}>Invoice</p>
              <p className="num" style={{ margin: '2px 0 0', fontSize: 17, fontWeight: 600 }}>{invoice.invoiceNumber}</p>
              <dl className="doc-dates">
                <dt>Issued</dt>
                <dd className="num">{formatDate(invoice.issuedAt) || 'Not yet issued'}</dd>
                <dt>Due</dt>
                <dd className="num">{formatDate(invoice.dueAt) || '-'}</dd>
                {invoice.paidAt && (
                  <>
                    <dt>Paid</dt>
                    <dd className="num">{formatDate(invoice.paidAt)}</dd>
                  </>
                )}
              </dl>
            </div>
          </header>

          <div className="doc-parties">
            <p className="muted" style={{ margin: 0, fontSize: 13 }}>Billed to</p>
            <p style={{ margin: '4px 0 0', fontWeight: 600 }}>{MOCK_SPONSOR.name}</p>
            <p className="muted" style={{ margin: '2px 0 0', fontSize: 13.5 }}>{MOCK_CONTACT.fullName}</p>
            <p className="muted" style={{ margin: '2px 0 0', fontSize: 13.5 }}>{MOCK_CONTACT.email}</p>
          </div>

          <table className="table doc-lines">
            <thead>
              <tr>
                <th scope="col">Description</th>
                <th scope="col">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <p style={{ margin: 0, fontWeight: 500 }}>{tier?.name ?? 'Sponsorship'} sponsorship</p>
                  <p className="muted" style={{ margin: '2px 0 0', fontSize: 13.5 }}>
                    Annual partnership with {ORG.displayName}
                  </p>
                </td>
                <td className="num" style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>
                  {formatMoney(invoice.amountCents)}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td style={{ fontWeight: 600 }}>Total due</td>
                <td className="num" style={{ fontSize: 19, fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {formatMoney(invoice.amountCents)}
                </td>
              </tr>
            </tfoot>
          </table>

          <div className="doc-remit">
            <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>How to pay</p>

            {payable ? (
              <>
                <p className="muted" style={{ margin: '6px 0 0', fontSize: 13.5 }}>
                  Pay by card or bank transfer from this page, or send a wire or check using the
                  details below. Reference <strong className="num">{invoice.invoiceNumber}</strong> on any
                  transfer so we can match it to your account.
                </p>

                {REMITTANCE_READY ? (
                  <dl className="remit">
                    <dt>Bank</dt><dd>{REMITTANCE.bankName}</dd>
                    <dt>Account name</dt><dd>{REMITTANCE.accountName}</dd>
                    <dt>Routing (ABA)</dt><dd className="num">{REMITTANCE.routingNumber}</dd>
                    <dt>Account number</dt><dd className="num">{REMITTANCE.accountNumber}</dd>
                    {REMITTANCE.swift && (<><dt>SWIFT</dt><dd className="num">{REMITTANCE.swift}</dd></>)}
                    <dt>Checks payable to</dt><dd>{REMITTANCE.checkPayableTo}</dd>
                  </dl>
                ) : (
                  // Never print a placeholder account number. A sponsor might try to
                  // pay against it.
                  <div className="note note-warn" style={{ marginTop: 12 }}>
                    Bank details are not configured yet. Email{' '}
                    <a className="link" href={`mailto:${ORG.billingEmail}`}>{ORG.billingEmail}</a>{' '}
                    for wire or check instructions.
                  </div>
                )}
              </>
            ) : status === 'processing' ? (
              <p className="muted" style={{ margin: '6px 0 0', fontSize: 13.5 }}>
                Your bank transfer is clearing. Bank payments take 3 to 5 business days to settle,
                and we'll email a receipt as soon as it lands. Nothing further is needed from you.
              </p>
            ) : status === 'paid' ? (
              <p className="muted" style={{ margin: '6px 0 0', fontSize: 13.5 }}>
                Paid in full on {formatDate(invoice.paidAt)}
                {invoice.paymentMethod ? ` by ${methodLabel(invoice.paymentMethod)}` : ''}. Thank you for
                supporting our chapter.
              </p>
            ) : (
              <p className="muted" style={{ margin: '6px 0 0', fontSize: 13.5 }}>
                This invoice has been voided and is not payable.
              </p>
            )}

            {invoice.notes && <p className="faint" style={{ margin: '12px 0 0', fontSize: 13 }}>{invoice.notes}</p>}
          </div>

          <footer className="doc-foot">Questions about this invoice? Email {ORG.billingEmail}</footer>
        </article>

        <p className="note-preview no-print" style={{ marginTop: 20 }}>
          Sample data. Not wired to the API or Stripe yet.
        </p>
      </div>
    </div>
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
