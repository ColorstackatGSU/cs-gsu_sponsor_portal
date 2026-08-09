import { Link } from 'react-router-dom';
import StatusPill from '../components/StatusPill';
import { MOCK_TIERS } from '../data/mock';
import { displayStatus, formatDate, formatMoney, daysUntil, zeffyInvoiceUrl } from '../lib/format';
import { useMe } from '../hooks/useMe';
import { useInvoices, type ApiInvoice } from '../hooks/useInvoices';
import { useTasks } from '../hooks/useTasks';
import { ORG } from '../data/org';

/**
 * All data comes from the API. Tier benefits still resolve against MOCK_TIERS
 * because there is no /tiers endpoint yet; the API returns tierName on the
 * sponsor, we look up the mock tier by name to render its benefits list. When
 * step 9 adds admin tier management, /tiers ships and this lookup drops.
 */
export default function Dashboard() {
  const me = useMe();
  const invoiceList = useInvoices();
  const taskList = useTasks();

  if (me.status === 'loading') return <Loading />;

  if (me.status === 'unlinked') {
    return (
      <div className="page">
        <div className="wrap-narrow" style={{ textAlign: 'center', paddingTop: 40 }}>
          <h1>Your account isn't linked yet</h1>
          <p className="muted" style={{ fontSize: 14, marginTop: 8 }}>
            You are signed in, but no sponsor is associated with this email. Email{' '}
            <a className="link" href={`mailto:${ORG.billingEmail}`}>{ORG.billingEmail}</a> and
            we'll finish setting up your access.
          </p>
        </div>
      </div>
    );
  }

  if (me.status === 'error') {
    return <ErrorPage message={me.message} />;
  }

  const { contact, sponsor } = me.me;
  const tier = sponsor.tierName ? MOCK_TIERS.find((t) => t.name === sponsor.tierName) : undefined;

  // Derive invoice-list-dependent state from whatever came back. Loading and
  // error are non-blocking for the dashboard header; we render as much as we can.
  const invoices: ApiInvoice[] = invoiceList.status === 'ready' ? invoiceList.invoices : [];
  const openInvoice = invoices.find(
    (i) => i.status === 'issued' || i.status === 'processing',
  );
  const recent = invoices.slice(0, 3);

  const tasks = taskList.status === 'ready' ? taskList.tasks : [];
  const openTasks = tasks.filter((t) => t.status === 'todo');

  return (
    <div className="page">
      <div className="wrap">
        <h1>{sponsor.name}</h1>
        <p className="muted" style={{ fontSize: 14, marginTop: 2 }}>
          Signed in as {contact.fullName || contact.email}
          {contact.title ? `, ${contact.title}` : ''}
        </p>

        {openInvoice && (
          <Outstanding
            id={openInvoice.id}
            amountCents={openInvoice.amountCents}
            title={openInvoice.title}
            dueAt={openInvoice.dueAt}
            processing={openInvoice.status === 'processing'}
            zeffyInvoiceId={openInvoice.zeffyInvoiceId}
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

            {taskList.status === 'loading' ? (
              <p className="muted" style={{ fontSize: 14 }}>Loading…</p>
            ) : taskList.status === 'error' ? (
              <p className="muted" style={{ fontSize: 14 }}>Couldn't load tasks: {taskList.message}</p>
            ) : openTasks.length === 0 ? (
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

          {invoiceList.status === 'loading' ? (
            <p className="muted" style={{ fontSize: 14 }}>Loading…</p>
          ) : invoiceList.status === 'error' ? (
            <p className="muted" style={{ fontSize: 14 }}>Couldn't load invoices: {invoiceList.message}</p>
          ) : recent.length === 0 ? (
            <p className="muted" style={{ fontSize: 14 }}>No invoices yet.</p>
          ) : (
            <div className="rows">
              {recent.map((inv) => (
                <Link key={inv.id} to={`/invoices/${inv.id}`} className="row">
                  <span>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{inv.title}</span>
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
          )}
        </div>
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="page">
      <div className="wrap">
        <p className="muted" style={{ fontSize: 14 }}>Loading…</p>
      </div>
    </div>
  );
}

function ErrorPage({ message }: { message: string }) {
  return (
    <div className="page">
      <div className="wrap">
        <div className="note note-error">Couldn't load your account: {message}</div>
      </div>
    </div>
  );
}

/**
 * The amount-due strip. Says one thing and offers one action.
 *
 * ACH gets its own copy: money that has left the sponsor's account but has not
 * settled is neither unpaid nor paid, and telling a company that already paid
 * you that they still owe you is the fastest way to lose them.
 *
 * Pay button opens Zeffy in a new tab if a Zeffy invoice is linked; otherwise
 * it falls back to our detail page so the sponsor at least lands somewhere.
 * The processing case always shows View invoice, because there is no action.
 */
function Outstanding({
  id,
  amountCents,
  title,
  dueAt,
  processing,
  zeffyInvoiceId,
}: {
  id: string;
  amountCents: number;
  title: string;
  dueAt: string | null;
  processing: boolean;
  zeffyInvoiceId: string | null;
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
            <>Bank transfer for {title} is clearing. This usually takes 3 to 5 business days.</>
          ) : (
            <>
              {title}
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

      {processing || !zeffyInvoiceId ? (
        <Link to={`/invoices/${id}`} className="btn btn-primary">View invoice</Link>
      ) : (
        <a href={zeffyInvoiceUrl(zeffyInvoiceId)} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
          Pay on Zeffy &#x2197;
        </a>
      )}
    </div>
  );
}
