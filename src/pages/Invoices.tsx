import { Link } from 'react-router-dom';
import StatusPill from '../components/StatusPill';
import { useInvoices } from '../hooks/useInvoices';
import { displayStatus, formatDate, formatMoney } from '../lib/format';

/**
 * Real invoices from /invoices. Rendered twice, a table above 700px and a row
 * list below it, with exactly one shown. A table forced onto a phone either
 * scrolls sideways or crushes the amount column, and the amount is the column
 * that matters.
 *
 * The "Invoice" column shows the title we chose at issue time; Zeffy owns the
 * formal invoice number and shows it on the payment page.
 */
export default function Invoices() {
  const state = useInvoices();

  return (
    <div className="page">
      <div className="wrap">
        <h1>Invoices</h1>
        <p className="muted" style={{ fontSize: 14, marginTop: 2, marginBottom: 20 }}>
          Every invoice we have issued you, newest first.
        </p>

        <div className="card">
          {state.status === 'loading' ? (
            <p className="muted" style={{ fontSize: 14 }}>Loading…</p>
          ) : state.status === 'error' ? (
            <div className="note note-error">Couldn't load invoices: {state.message}</div>
          ) : state.invoices.length === 0 ? (
            <p className="muted" style={{ fontSize: 14 }}>No invoices yet.</p>
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
                        <Link to={`/invoices/${inv.id}`} className="link" style={{ fontWeight: 500 }}>
                          {inv.title}
                        </Link>
                      </td>
                      <td className="muted">{inv.tierName ?? '-'}</td>
                      <td className="muted num">{formatDate(inv.issuedAt)}</td>
                      <td className="muted num">{formatDate(inv.dueAt)}</td>
                      <td><StatusPill status={displayStatus(inv)} /></td>
                      <td className="num" style={{ fontWeight: 500 }}>{formatMoney(inv.amountCents)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="only-narrow rows">
                {state.invoices.map((inv) => (
                  <Link key={inv.id} to={`/invoices/${inv.id}`} className="row">
                    <span>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{inv.title}</span>
                      <span className="faint num" style={{ display: 'block', fontSize: 12.5 }}>
                        Due {formatDate(inv.dueAt)}
                      </span>
                    </span>
                    <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <span className="num" style={{ fontSize: 14, fontWeight: 500 }}>
                        {formatMoney(inv.amountCents)}
                      </span>
                      <StatusPill status={displayStatus(inv)} />
                    </span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
