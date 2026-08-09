import { Link, useParams } from 'react-router-dom';
import StatusPill from '../components/StatusPill';
import { MOCK_SPONSOR, findInvoice, findTier } from '../data/mock';
import { displayStatus, formatDate, formatMoney, daysUntil, zeffyInvoiceUrl } from '../lib/format';

/**
 * Thin summary page. Zeffy owns the actual invoice document (numbering, billed-to,
 * line items, printable layout, receipt) at a public URL like
 * `zeffy.com/en-US/invoice/<uuid>`. Our detail page shows the metadata we care
 * about internally (tier, amount, dates, tier benefits) and hands the sponsor over
 * to Zeffy for the payment itself.
 *
 * Deliberately no letterhead, no line items, no "how to pay" copy. Duplicating
 * Zeffy's invoice on our side means two documents to keep in sync, and Zeffy's is
 * the one that matters. We link and get out of the way.
 */
export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const invoice = id ? findInvoice(id) : undefined;

  if (!invoice) {
    return (
      <div className="page">
        <div className="wrap-narrow" style={{ textAlign: 'center' }}>
          <h1>Invoice not found</h1>
          <p className="muted" style={{ fontSize: 14, marginTop: 8 }}>
            We could not find an invoice with that id.
          </p>
          <Link to="/invoices" className="btn btn-secondary" style={{ marginTop: 20 }}>Back to invoices</Link>
        </div>
      </div>
    );
  }

  const tier = findTier(invoice.tierId);
  const status = displayStatus(invoice);
  const payable = status === 'issued' || status === 'overdue';
  const days = daysUntil(invoice.dueAt);
  const late = payable && days !== null && days < 0;

  return (
    <div className="page">
      <div className="wrap">
        <Link to="/invoices" className="link" style={{ fontSize: 13.5 }}>&larr; All invoices</Link>

        {/* Header: title, status, and the primary action */}
        <div
          style={{
            marginTop: 12,
            marginBottom: 20,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h1 style={{ marginBottom: 8 }}>{invoice.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <StatusPill status={status} />
              {invoice.dueAt && payable && (
                <span
                  className="num"
                  style={{ fontSize: 13, color: late ? 'var(--bad)' : 'var(--ink-muted)' }}
                >
                  {late ? 'Was due' : 'Due'} {formatDate(invoice.dueAt)}
                  {!late && days !== null && days <= 30 && ` (${days} days)`}
                </span>
              )}
              {invoice.paidAt && (
                <span className="num" style={{ fontSize: 13, color: 'var(--ink-muted)' }}>
                  Paid {formatDate(invoice.paidAt)}
                </span>
              )}
            </div>
          </div>

          {payable && invoice.zeffyInvoiceId && (
            <a
              href={zeffyInvoiceUrl(invoice.zeffyInvoiceId)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              View &amp; pay on Zeffy &#x2197;
            </a>
          )}
        </div>

        {/* Summary card: the numbers */}
        <div className="card">
          <div className="summary-grid">
            <div>
              <p className="label" style={{ marginBottom: 4 }}>Amount</p>
              <p className="num" style={{ margin: 0, fontSize: 26, fontWeight: 600 }}>
                {formatMoney(invoice.amountCents)}
              </p>
            </div>
            <div>
              <p className="label" style={{ marginBottom: 4 }}>Tier</p>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>{tier?.name ?? '-'}</p>
            </div>
            <div>
              <p className="label" style={{ marginBottom: 4 }}>Billed to</p>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>{MOCK_SPONSOR.name}</p>
            </div>
            <div>
              <p className="label" style={{ marginBottom: 4 }}>Issued</p>
              <p className="num" style={{ margin: 0, fontSize: 15 }}>
                {formatDate(invoice.issuedAt) || 'Not issued'}
              </p>
            </div>
          </div>

          {invoice.notes && (
            <p className="muted" style={{ marginTop: 16, marginBottom: 0, fontSize: 13.5 }}>
              {invoice.notes}
            </p>
          )}
        </div>

        {/* Tier benefits: helps the sponsor remember what they're getting */}
        {tier && (
          <div className="card" style={{ marginTop: 16 }}>
            <p className="card-title" style={{ marginBottom: 10 }}>
              What's included at {tier.name}
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {tier.benefits.map((b) => (
                <li
                  key={b}
                  style={{ display: 'flex', gap: 8, padding: '6px 0', fontSize: 14, color: 'var(--ink-muted)' }}
                >
                  <span aria-hidden="true" style={{ color: 'var(--brand)' }}>&#8226;</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Payment details, only once settled */}
        {status === 'paid' && (
          <div className="card" style={{ marginTop: 16 }}>
            <p className="card-title" style={{ marginBottom: 10 }}>Payment</p>
            <p style={{ margin: 0, fontSize: 14 }}>
              Paid in full on {formatDate(invoice.paidAt)}
              {invoice.paymentMethod ? ` by ${methodLabel(invoice.paymentMethod)}` : ''}.
              {invoice.zeffyInvoiceId && (
                <>
                  {' '}
                  <a
                    className="link"
                    href={zeffyInvoiceUrl(invoice.zeffyInvoiceId)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View receipt on Zeffy &#x2197;
                  </a>
                </>
              )}
            </p>
          </div>
        )}

        {status === 'processing' && (
          <div className="note note-info" style={{ marginTop: 16 }}>
            Your bank transfer is clearing. Bank payments take 3 to 5 business days to settle, and
            we'll email a receipt as soon as it lands. Nothing further is needed from you.
          </div>
        )}

        {status === 'void' && (
          <div className="note" style={{ marginTop: 16 }}>
            This invoice has been voided and is not payable.
          </div>
        )}

        <p className="note-preview" style={{ marginTop: 20 }}>
          Sample data. Not wired to the API or Zeffy yet.
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
