import { Link } from 'react-router-dom';
import StatusPill from '../components/StatusPill';
import { MOCK_INVOICES, findTier } from '../data/mock';
import { displayStatus, formatDate, formatMoney } from '../lib/format';

/**
 * Shell only: reads from src/data/mock.ts.
 *
 * Rendered twice: a table above 720px and stacked cards below it. A table forced
 * onto a phone either scrolls sideways or crushes the amount column, and the amount
 * is the column that matters. The card list is aria-hidden on desktop and the table
 * is aria-hidden on mobile, so a screen reader only ever meets one of them.
 */
export default function Invoices() {
  return (
    <section className="portal-pad">
      <div className="portal-col">
        <div className="fade-in-up">
          <p className="section-eyebrow" style={{ marginBottom: 14 }}>
            Billing
          </p>
          <h1 style={{ fontSize: 'clamp(30px, 4vw, 42px)', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
            Invoices
          </h1>
          <p style={{ marginTop: 8, fontSize: 15, color: 'rgba(255,255,255,0.6)' }}>
            Every invoice we have issued you, newest first. Click one to view, print, or pay it.
          </p>
        </div>

        <div className="panel fade-in-up fade-delay-1" style={{ marginTop: 28 }}>
          {MOCK_INVOICES.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, margin: 0 }}>
              No invoices yet.
            </p>
          ) : (
            <>
              {/* Desktop */}
              <table className="data-table only-wide">
                <thead>
                  <tr>
                    <th scope="col">Invoice</th>
                    <th scope="col">Tier</th>
                    <th scope="col">Issued</th>
                    <th scope="col">Due</th>
                    <th scope="col">Status</th>
                    <th scope="col">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_INVOICES.map((invoice) => (
                    <tr key={invoice.id}>
                      <td>
                        <Link
                          to={`/invoices/${invoice.invoiceNumber}`}
                          className="tabular"
                          style={{ fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3 }}
                        >
                          {invoice.invoiceNumber}
                        </Link>
                      </td>
                      <td style={{ color: 'rgba(255,255,255,0.7)' }}>{findTier(invoice.tierId)?.name ?? '-'}</td>
                      <td className="tabular" style={{ color: 'rgba(255,255,255,0.7)' }}>
                        {formatDate(invoice.issuedAt)}
                      </td>
                      <td className="tabular" style={{ color: 'rgba(255,255,255,0.7)' }}>
                        {formatDate(invoice.dueAt)}
                      </td>
                      <td>
                        <StatusPill status={displayStatus(invoice)} />
                      </td>
                      <td className="tabular" style={{ fontWeight: 600 }}>
                        {formatMoney(invoice.amountCents)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile */}
              <div className="only-narrow">
                {MOCK_INVOICES.map((invoice) => (
                  <Link key={invoice.id} to={`/invoices/${invoice.invoiceNumber}`} className="row-card">
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        marginBottom: 10,
                      }}
                    >
                      <span className="tabular" style={{ fontSize: 14, fontWeight: 600 }}>
                        {invoice.invoiceNumber}
                      </span>
                      <StatusPill status={displayStatus(invoice)} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
                      <span className="tabular" style={{ fontSize: 20, fontWeight: 700 }}>
                        {formatMoney(invoice.amountCents)}
                      </span>
                      <span className="tabular" style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.45)' }}>
                        Due {formatDate(invoice.dueAt)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        <p className="notice-preview" style={{ marginTop: 28, textAlign: 'center' }}>
          Preview with sample data. Not wired to Supabase yet.
        </p>
      </div>
    </section>
  );
}
