import { Link } from 'react-router-dom';
import StatusPill from '../components/StatusPill';
import { MOCK_CONTACT, MOCK_INVOICES, MOCK_SPONSOR, MOCK_TASKS, findTier } from '../data/mock';
import { displayStatus, formatDate, formatMoney, daysUntil } from '../lib/format';

/**
 * Shell only: everything here reads from src/data/mock.ts.
 *
 * The page answers three questions in the order a sponsor cares about them: do I owe
 * you anything, what am I getting, and what do you need from me.
 */
export default function Dashboard() {
  const sponsor = MOCK_SPONSOR;
  const tier = findTier(sponsor.tierId);
  const openInvoice = MOCK_INVOICES.find((i) => i.status === 'issued' || i.status === 'processing');
  const openTasks = MOCK_TASKS.filter((t) => t.status === 'todo');
  const recent = MOCK_INVOICES.slice(0, 3);

  return (
    <div className="page">
      <div className="wrap">
        <h1>{sponsor.name}</h1>
        <p className="muted" style={{ fontSize: 14, marginTop: 2 }}>
          Signed in as {MOCK_CONTACT.fullName}
          {MOCK_CONTACT.title ? `, ${MOCK_CONTACT.title}` : ''}
        </p>

        {openInvoice && (
          <Outstanding
            amountCents={openInvoice.amountCents}
            invoiceNumber={openInvoice.invoiceNumber}
            dueAt={openInvoice.dueAt}
            processing={openInvoice.status === 'processing'}
          />
        )}

        <div className="dash-grid">
          {/* ===== TIER ===== */}
          <div className="card">
            <div className="card-head">
              <span className="card-title">Your sponsorship</span>
              {tier && <button type="button" className="btn btn-secondary btn-sm" disabled>Change</button>}
            </div>

            {tier ? (
              <>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 20, fontWeight: 600 }}>{tier.name}</span>
                  <span className="num muted" style={{ fontSize: 14 }}>
                    {formatMoney(tier.amountCents)} per year
                  </span>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '14px 0 0' }}>
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
              </>
            ) : (
              <p className="muted" style={{ fontSize: 14 }}>No tier assigned yet. We'll set this up with you.</p>
            )}
          </div>

          {/* ===== TASKS ===== */}
          <div className="card">
            <div className="card-head">
              <span className="card-title">What we need from you</span>
              {openTasks.length > 0 && <span className="faint" style={{ fontSize: 13 }}>{openTasks.length} open</span>}
            </div>

            {openTasks.length === 0 ? (
              <p className="muted" style={{ fontSize: 14 }}>
                Nothing outstanding. We'll let you know when something comes up.
              </p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {openTasks.map((task, i) => {
                  const days = daysUntil(task.dueAt);
                  const late = days !== null && days < 0;
                  return (
                    <li
                      key={task.id}
                      style={{ padding: '10px 0', borderTop: i === 0 ? 'none' : '1px solid var(--line)' }}
                    >
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>{task.title}</p>
                      {task.description && (
                        <p className="muted" style={{ margin: '3px 0 0', fontSize: 13.5 }}>{task.description}</p>
                      )}
                      {task.dueAt && (
                        <p
                          className="num"
                          style={{ margin: '4px 0 0', fontSize: 12.5, color: late ? 'var(--bad)' : 'var(--ink-faint)' }}
                        >
                          {late ? 'Was due ' : 'Due '}{formatDate(task.dueAt)}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* ===== RECENT INVOICES ===== */}
        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-head">
            <span className="card-title">Recent invoices</span>
            <Link to="/invoices" className="link" style={{ fontSize: 13.5 }}>View all</Link>
          </div>

          <div className="rows">
            {recent.map((inv) => (
              <Link key={inv.id} to={`/invoices/${inv.invoiceNumber}`} className="row">
                <span>
                  <span className="num" style={{ fontSize: 14, fontWeight: 500 }}>{inv.invoiceNumber}</span>
                  <span className="faint" style={{ display: 'block', fontSize: 12.5 }}>
                    Issued {formatDate(inv.issuedAt)}
                  </span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span className="num" style={{ fontSize: 14, fontWeight: 500 }}>{formatMoney(inv.amountCents)}</span>
                  <span style={{ minWidth: 132, display: 'flex', justifyContent: 'flex-end' }}>
                    <StatusPill status={displayStatus(inv)} />
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>

        <p className="note-preview" style={{ marginTop: 20 }}>Sample data. Not wired to the API yet.</p>
      </div>
    </div>
  );
}

/**
 * The amount-due strip. Says one thing and offers one action.
 *
 * ACH gets its own copy: money that has left the sponsor's account but has not
 * settled is neither unpaid nor paid, and telling a company that already paid you
 * that they still owe you is the fastest way to lose them.
 */
function Outstanding({
  amountCents,
  invoiceNumber,
  dueAt,
  processing,
}: {
  amountCents: number;
  invoiceNumber: string;
  dueAt: string | null;
  processing: boolean;
}) {
  const days = daysUntil(dueAt);
  const late = !processing && days !== null && days < 0;

  return (
    <div
      className={`card ${processing ? 'note-info' : late ? 'note-error' : 'note-warn'}`}
      style={{
        marginTop: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
      <div>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>
          {processing ? 'Payment in progress' : late ? 'Overdue' : 'Amount due'}
        </p>
        <p className="num" style={{ margin: '2px 0 0', fontSize: 24, fontWeight: 600 }}>
          {formatMoney(amountCents)}
        </p>
        <p style={{ margin: '2px 0 0', fontSize: 13.5 }}>
          {processing ? (
            <>Bank transfer for {invoiceNumber} is clearing. This usually takes 3 to 5 business days.</>
          ) : (
            <>
              {invoiceNumber}
              {dueAt && (
                <>
                  {' '}&middot; {late ? 'was due' : 'due'} {formatDate(dueAt)}
                  {!late && days !== null && days <= 30 && ` (${days} days)`}
                </>
              )}
            </>
          )}
        </p>
      </div>

      <Link to={`/invoices/${invoiceNumber}`} className="btn btn-primary">
        {processing ? 'View invoice' : 'Pay this invoice'}
      </Link>
    </div>
  );
}
