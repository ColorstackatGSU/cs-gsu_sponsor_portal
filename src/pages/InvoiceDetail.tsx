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
 * The four summary cells sit in one frame divided by ink gaps rather than in
 * four separate cards: they are one record, not four facts.
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
          <p className="page-sub" style={{ marginTop: 0 }}>Loading…</p>
        </div>
      </div>
    );
  }

  if (state.status === 'not-found') {
    return (
      <div className="page">
        <div className="wrap-narrow" style={{ textAlign: 'center', paddingTop: 32 }}>
          <h1>Invoice not found</h1>
          <p className="page-sub" style={{ margin: '14px auto 22px' }}>
            We could not find that invoice, or it does not belong to your account.
          </p>
          <Link to="/invoices" className="btn btn-secondary">Back to invoices</Link>
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
        <Link to="/invoices" className="backlink">&larr; All invoices</Link>

        <header className="detail-head">
          <div>
            <h1>{invoice.title}</h1>
            <div className="detail-meta">
              <StatusPill status={status} />
              {invoice.dueAt && payable && (
                <span className={late ? 'detail-date detail-date-late' : 'detail-date'}>
                  {late ? 'Was due' : 'Due'} {formatDate(invoice.dueAt)}
                  {!late && days !== null && days <= 30 && ` (${days} days)`}
                </span>
              )}
              {invoice.paidAt && (
                <span className="detail-date">Paid {formatDate(invoice.paidAt)}</span>
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
        </header>

        <section className="card card-flush">
          <div className="summary-grid">
            <div>
              <p className="summary-key">Amount</p>
              <p className="summary-val summary-val-big">{formatMoney(invoice.amountCents)}</p>
            </div>
            <div>
              <p className="summary-key">Tier</p>
              <p className="summary-val">{invoice.tierName ?? '-'}</p>
            </div>
            <div>
              <p className="summary-key">Billed to</p>
              <p className="summary-val">{sponsorName || '-'}</p>
            </div>
            <div>
              <p className="summary-key">Issued</p>
              <p className="summary-val num" style={{ fontSize: 17 }}>
                {formatDate(invoice.issuedAt) || 'Not issued'}
              </p>
            </div>
          </div>
        </section>

        {invoice.notes && (
          <div className="note" style={{ marginTop: 22 }}>{invoice.notes}</div>
        )}

        {tier && (
          <section className="card card-flush card-yellow" style={{ marginTop: 22 }}>
            <div className="card-head">
              <span className="card-title">What's included at {tier.name}</span>
            </div>
            <div className="card-pad">
              <ul className="benefits">
                {tier.benefits.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {status === 'paid' && (
          <section className="card card-flush card-lime" style={{ marginTop: 22 }}>
            <div className="card-head">
              <span className="card-title">Payment</span>
            </div>
            <div className="card-pad">
              <p style={{ margin: 0, fontSize: 14.5, fontWeight: 500 }}>
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
          </section>
        )}

        {status === 'processing' && (
          <div className="note note-info" style={{ marginTop: 22 }}>
            Your bank transfer is clearing. Bank payments take 3 to 5 business days to settle, and
            we'll email a receipt as soon as it lands. Nothing further is needed from you.
          </div>
        )}

        {status === 'void' && (
          <div className="note" style={{ marginTop: 22 }}>
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
