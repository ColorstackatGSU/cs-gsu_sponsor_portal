import { Link } from 'react-router-dom';
import StatusPill from '../components/StatusPill';
import { useInvoices } from '../hooks/useInvoices';
import { displayStatus, formatDate, formatMoney } from '../lib/format';

/**
 * Real invoices from /invoices. Rendered twice, a table above 760px and a row
 * list below it, with exactly one shown. A table forced onto a phone either
 * scrolls sideways or crushes the amount column, and the amount is the column
 * that matters.
 *
 * The card runs flush so the table's ink header bar and the row hover fills
 * reach the frame on both sides.
 *
 * The "Invoice" column shows the title we chose at issue time; Zeffy owns the
 * formal invoice number and shows it on the payment page.
 */
export default function Invoices() {
  const state = useInvoices();
  const count = state.status === 'ready' ? state.invoices.length : null;

  return (
    <div className="page">
      <div className="wrap">
        <header className="page-head">
          <span className="eyebrow eyebrow-sky">Billing history</span>
          <h1>Invoices</h1>
          <p className="page-sub">
            Every invoice we have issued you, newest first.
            {count !== null && count > 0 && ` ${count} in total.`}
          </p>
        </header>

        <section className="card card-flush">
          {state.status === 'loading' ? (
            <div className="card-pad"><p className="page-sub" style={{ marginTop: 0 }}>Loading…</p></div>
          ) : state.status === 'error' ? (
            <div className="card-pad">
              <div className="note note-error">Couldn't load invoices: {state.message}</div>
            </div>
          ) : state.invoices.length === 0 ? (
            <div className="empty">
              <p className="empty-title">Nothing to show yet</p>
              <p className="empty-body">
                Once we issue your first invoice it will land here, and you'll get an
                email with a Zeffy payment link.
              </p>
            </div>
          ) : (
            <>
              <table className="table only-wide">
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
                  {state.invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td>
                        <Link to={`/invoices/${inv.id}`} className="link">
                          {inv.title}
                        </Link>
                      </td>
                      <td className="muted">{inv.tierName ?? '-'}</td>
                      <td className="muted num">{formatDate(inv.issuedAt)}</td>
                      <td className="muted num">{formatDate(inv.dueAt)}</td>
                      <td><StatusPill status={displayStatus(inv)} /></td>
                      <td className="num" style={{ fontWeight: 700 }}>{formatMoney(inv.amountCents)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="only-narrow rows">
                {state.invoices.map((inv) => (
                  <Link key={inv.id} to={`/invoices/${inv.id}`} className="row">
                    <span>
                      <span className="row-title">{inv.title}</span>
                      <span className="row-meta num">Due {formatDate(inv.dueAt)}</span>
                    </span>
                    <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                      <span className="row-amount num">{formatMoney(inv.amountCents)}</span>
                      <StatusPill status={displayStatus(inv)} />
                    </span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
