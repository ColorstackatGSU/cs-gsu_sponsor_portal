import { Link } from 'react-router-dom';
import StatusPill from '../components/StatusPill';
import { MOCK_INVOICES, findTier } from '../data/mock';
import { displayStatus, formatDate, formatMoney } from '../lib/format';

/**
 * Shell only: reads from src/data/mock.ts.
 *
 * Rendered twice, a table above 700px and a row list below it, with exactly one
 * shown. A table forced onto a phone either scrolls sideways or crushes the amount
 * column, and the amount is the column that matters.
 */
export default function Invoices() {
  return (
    <div className="page">
      <div className="wrap">
        <h1>Invoices</h1>
        <p className="muted" style={{ fontSize: 14, marginTop: 2, marginBottom: 20 }}>
          Every invoice we have issued you, newest first.
        </p>

        <div className="card">
          {MOCK_INVOICES.length === 0 ? (
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
                  {MOCK_INVOICES.map((inv) => (
                    <tr key={inv.id}>
                      <td>
                        <Link to={`/invoices/${inv.invoiceNumber}`} className="link num" style={{ fontWeight: 500 }}>
                          {inv.invoiceNumber}
                        </Link>
                      </td>
                      <td className="muted">{findTier(inv.tierId)?.name ?? '-'}</td>
                      <td className="muted num">{formatDate(inv.issuedAt)}</td>
                      <td className="muted num">{formatDate(inv.dueAt)}</td>
                      <td><StatusPill status={displayStatus(inv)} /></td>
                      <td className="num" style={{ fontWeight: 500 }}>{formatMoney(inv.amountCents)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="only-narrow rows">
                {MOCK_INVOICES.map((inv) => (
                  <Link key={inv.id} to={`/invoices/${inv.invoiceNumber}`} className="row">
                    <span>
                      <span className="num" style={{ fontSize: 14, fontWeight: 500 }}>{inv.invoiceNumber}</span>
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

        <p className="note-preview" style={{ marginTop: 20 }}>Sample data. Not wired to the API yet.</p>
      </div>
    </div>
  );
}
