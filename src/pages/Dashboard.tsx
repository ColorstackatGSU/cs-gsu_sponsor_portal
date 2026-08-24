import { Link } from 'react-router-dom';
import StatusPill from '../components/StatusPill';
import { displayStatus, formatDate, formatMoney, daysUntil, zeffyInvoiceUrl } from '../lib/format';
import { useMe } from '../hooks/useMe';
import { useInvoices, type ApiInvoice } from '../hooks/useInvoices';
import { useTasks } from '../hooks/useTasks';
import { useTiers } from '../hooks/useTiers';
import { ORG } from '../data/org';

/**
 * All data comes from the API. /me carries the sponsor's tierName; /tiers
 * carries the catalog, and we look up this sponsor's tier by name to render
 * its benefits list. If /tiers is still loading or failed we omit the tier
 * card rather than block the whole dashboard on it.
 *
 * Layout: sponsor name as the page title, one loud amount-due block if anything
 * is outstanding, then tier and tasks side by side, then recent invoices. The
 * due block is the only element that fills with colour, so the eye lands on the
 * one thing that might need an action.
 */
export default function Dashboard() {
  const me = useMe();
  const invoiceList = useInvoices();
  const taskList = useTasks();
  const tierList = useTiers();

  if (me.status === 'loading') return <Loading />;

  if (me.status === 'unlinked') {
    return (
      <div className="page">
        <div className="wrap-narrow" style={{ paddingTop: 40, textAlign: 'center' }}>
          <h1>Not linked yet</h1>
          <p className="page-sub" style={{ margin: '14px auto 0' }}>
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
  const tier =
    sponsor.tierName && tierList.status === 'ready'
      ? tierList.tiers.find((t) => t.name === sponsor.tierName)
      : undefined;

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
        <header className="page-head">
          <span className="eyebrow">Sponsor dashboard</span>
          <h1>{sponsor.name}</h1>
          <p className="page-sub">
            Signed in as {contact.fullName || contact.email}
            {contact.title ? `, ${contact.title}` : ''}
          </p>
        </header>

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
          <section className="card card-flush card-yellow">
            <div className="card-head">
              <span className="card-title">Your sponsorship</span>
              {tier && <button type="button" className="btn btn-sm btn-secondary" disabled>Change</button>}
            </div>

            <div className="card-pad">
              {tier ? (
                <>
                  <div className="tier-name">
                    <strong>{tier.name}</strong>
                    <span className="tier-price">{formatMoney(tier.amountCents)} / year</span>
                  </div>

                  <ul className="benefits">
                    {tier.benefits.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="page-sub" style={{ marginTop: 0 }}>
                  No tier assigned yet. We'll set this up with you.
                </p>
              )}
            </div>
          </section>

          {/* ===== TASKS ===== */}
          <section className="card card-flush card-sky">
            <div className="card-head">
              <span className="card-title">What we need from you</span>
              {openTasks.length > 0 && <span className="sticker">{openTasks.length} open</span>}
            </div>

            <div className="card-pad">
              {taskList.status === 'loading' ? (
                <p className="page-sub" style={{ marginTop: 0 }}>Loading…</p>
              ) : taskList.status === 'error' ? (
                <p className="page-sub" style={{ marginTop: 0 }}>Couldn't load tasks: {taskList.message}</p>
              ) : openTasks.length === 0 ? (
                <p className="page-sub" style={{ marginTop: 0 }}>
                  Nothing outstanding. We'll let you know when something comes up.
                </p>
              ) : (
                <ul className="tasks">
                  {openTasks.map((task) => {
                    const days = daysUntil(task.dueAt);
                    const late = days !== null && days < 0;
                    return (
                      <li key={task.id} className="task">
                        <p className="task-title">{task.title}</p>
                        {task.description && <p className="task-body">{task.description}</p>}
                        {task.dueAt && (
                          <span className={late ? 'task-due task-due-late' : 'task-due'}>
                            {late ? 'Was due ' : 'Due '}{formatDate(task.dueAt)}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>
        </div>

        {/* ===== RECENT INVOICES ===== */}
        <section className="card card-flush" style={{ marginTop: 22 }}>
          <div className="card-head">
            <span className="card-title">Recent invoices</span>
            <Link to="/invoices" className="btn btn-sm btn-secondary">View all</Link>
          </div>

          {invoiceList.status === 'loading' ? (
            <div className="card-pad"><p className="page-sub" style={{ marginTop: 0 }}>Loading…</p></div>
          ) : invoiceList.status === 'error' ? (
            <div className="card-pad">
              <p className="page-sub" style={{ marginTop: 0 }}>Couldn't load invoices: {invoiceList.message}</p>
            </div>
          ) : recent.length === 0 ? (
            <div className="empty">
              <p className="empty-title">No invoices yet</p>
              <p className="empty-body">
                When we issue your first sponsorship invoice it will show up here, and
                you'll get an email.
              </p>
            </div>
          ) : (
            <div className="rows">
              {recent.map((inv) => (
                <Link key={inv.id} to={`/invoices/${inv.id}`} className="row">
                  <span>
                    <span className="row-title">{inv.title}</span>
                    <span className="row-meta num">Issued {formatDate(inv.issuedAt)}</span>
                  </span>
                  <span className="row-right">
                    <span className="row-amount num">{formatMoney(inv.amountCents)}</span>
                    <span style={{ minWidth: 148, display: 'flex', justifyContent: 'flex-end' }}>
                      <StatusPill status={displayStatus(inv)} />
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="page">
      <div className="wrap">
        <p className="page-sub" style={{ marginTop: 0 }}>Loading…</p>
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
    <section className={`due ${processing ? 'due-processing' : late ? 'due-late' : ''}`}>
      <div>
        <p className="due-label">
          {processing ? 'Payment in progress' : late ? 'Overdue' : 'Amount due'}
        </p>
        <p className="due-amount">{formatMoney(amountCents)}</p>
        <p className="due-meta">
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
        <Link to={`/invoices/${id}`} className="btn btn-ink">View invoice</Link>
      ) : (
        <a href={zeffyInvoiceUrl(zeffyInvoiceId)} target="_blank" rel="noopener noreferrer" className="btn btn-ink">
          Pay on Zeffy &#x2197;
        </a>
      )}
    </section>
  );
}
