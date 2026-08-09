import { Link, useParams } from 'react-router-dom';
import StatusPill from '../components/StatusPill';
import { MOCK_TIERS } from '../data/mock';
import { useMe } from '../hooks/useMe';
import { useInvoice } from '../hooks/useInvoices';
import { displayStatus, formatDate, formatMoney, daysUntil, zeffyInvoiceUrl } from '../lib/format';

/**
 * Thin summary page. Zeffy owns the invoice document (numbering, billed-to,
 * printable layout, receipt) at a public URL. Our detail page shows the
 * metadata we know internally (tier, amount, dates, tier benefits) and hands
 * the sponsor over to Zeffy for the payment itself.
 *
 * Sponsor name still comes from /me because the invoice payload does not carry
 * the sponsor's display name (only the id). One request each, done in parallel
 * by the hooks.
 */
export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const state = useInvoice(id);
  const me = useMe();

  if (state.status === 'loading' || me.status === 'loading') {
    return (
      <div className="page">
        <div className="wrap">
          <p className="muted" style={{ fontSize: 14 }}>Loading…</p>
        </div>
      </div>
    );
  }

  if (state.status === 'not-found') {
    return (
      <div className="page">
        <div className="wrap-narrow" style={{ textAlign: 'center' }}>
          <h1>Invoice not found</h1>
          <p className="muted" style={{ fontSize: 14, marginTop: 8 }}>
            We could not find that invoice, or it does not belong to your account.
          </p>
          <Link to="/invoices" className="btn btn-secondary" style={{ marginTop: 20 }}>Back to invoices</Link>
        </div>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="page">
        <div className="wrap">
          <div className="note note-error">Couldn't load this invoice: {state.message}</div>
        </div>
      </div>
    );
  }

  const invoice = state.invoice;
  const status = displayStatus(invoice);
  const payable = status === 'issued' || status === 'overdue';
  const days = daysUntil(invoice.dueAt);
  const late = payable && days !== null && days < 0;
  const tier = invoice.tierName
    ? MOCK_TIERS.find((t) => t.name === invoice.tierName)
    : undefined;
  const sponsorName = me.status === 'ready' ? me.me.sponsor.name : '';

  return (
    <div className="page">
      <div className="wrap">
        <Link to="/invoices" className="link" style={{ fontSize: 13.5 }}>&larr; All invoices</Link>

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
              <p style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>{invoice.tierName ?? '-'}</p>
            </div>
            <div>
              <p className="label" style={{ marginBottom: 4 }}>Billed to</p>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>{sponsorName || '-'}</p>
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
