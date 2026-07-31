import { Link } from 'react-router-dom';
import StatusPill from '../components/StatusPill';
import { MOCK_CONTACT, MOCK_INVOICES, MOCK_SPONSOR, MOCK_TASKS, findTier } from '../data/mock';
import { displayStatus, formatDate, formatMoney, daysUntil } from '../lib/format';

/**
 * Shell only: everything here reads from src/data/mock.ts.
 *
 * The page answers three questions in order, because that is the order a sponsor
 * cares about them: do I owe you anything, what am I getting, and what do you need
 * from me. Anything else belongs on another page.
 */
export default function Dashboard() {
  const sponsor = MOCK_SPONSOR;
  const tier = findTier(sponsor.tierId);
  const openInvoice = MOCK_INVOICES.find((i) => i.status === 'issued' || i.status === 'processing');
  const openTasks = MOCK_TASKS.filter((t) => t.status === 'todo');
  const recentInvoices = MOCK_INVOICES.slice(0, 3);

  return (
    <section className="portal-pad">
      <div className="portal-col">
        {/* ===== HEADER ===== */}
        <div className="fade-in-up">
          <p className="section-eyebrow" style={{ marginBottom: 14 }}>
            Sponsor Portal
          </p>
          <h1 style={{ fontSize: 'clamp(30px, 4vw, 42px)', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
            {sponsor.name}
          </h1>
          <p style={{ marginTop: 8, fontSize: 15, color: 'rgba(255,255,255,0.6)' }}>
            Signed in as {MOCK_CONTACT.fullName}
            {MOCK_CONTACT.title ? `, ${MOCK_CONTACT.title}` : ''}
          </p>
        </div>

        {/* ===== AMOUNT DUE =====
            First thing on the page when there is one, because it is the only thing
            on this page with a deadline attached. */}
        {openInvoice && (
          <OutstandingBanner
            amountCents={openInvoice.amountCents}
            invoiceNumber={openInvoice.invoiceNumber}
            dueAt={openInvoice.dueAt}
            processing={openInvoice.status === 'processing'}
          />
        )}

        <div className="dash-grid fade-in-up fade-delay-2" style={{ marginTop: 24 }}>
          {/* ===== TIER ===== */}
          <div className="panel">
            <p className="field-label" style={{ marginBottom: 14 }}>
              Your sponsorship
            </p>
            {tier ? (
              <>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
                    {tier.name}
                  </h2>
                  <span className="tabular" style={{ fontSize: 17, color: 'var(--gsu-sky)', fontWeight: 600 }}>
                    {formatMoney(tier.amountCents)}
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', fontWeight: 400 }}>
                      {' '}
                      / year
                    </span>
                  </span>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '20px 0 0' }}>
                  {tier.benefits.map((benefit) => (
                    <li
                      key={benefit}
                      style={{
                        display: 'flex',
                        gap: 10,
                        alignItems: 'flex-start',
                        padding: '9px 0',
                        borderTop: '1px solid var(--line)',
                        fontSize: 14,
                        color: 'rgba(255,255,255,0.78)',
                      }}
                    >
                      <span aria-hidden="true" style={{ color: 'var(--sponsor-brand-bright)', flexShrink: 0 }}>
                        +
                      </span>
                      {benefit}
                    </li>
                  ))}
                </ul>

                <button type="button" className="btn-secondary btn-sm" style={{ marginTop: 22 }} disabled>
                  Change tier
                </button>
              </>
            ) : (
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, margin: 0 }}>
                No tier assigned yet. We'll set this up with you.
              </p>
            )}
          </div>

          {/* ===== TASKS ===== */}
          <div className="panel">
            <p className="field-label" style={{ marginBottom: 14 }}>
              What we need from you
            </p>

            {openTasks.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, margin: 0 }}>
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
                      style={{
                        padding: '14px 0',
                        borderTop: i === 0 ? 'none' : '1px solid var(--line)',
                      }}
                    >
                      <p style={{ margin: 0, fontSize: 14.5, fontWeight: 600 }}>{task.title}</p>
                      {task.description && (
                        <p
                          style={{
                            margin: '5px 0 0',
                            fontSize: 13,
                            lineHeight: 1.5,
                            color: 'rgba(255,255,255,0.55)',
                          }}
                        >
                          {task.description}
                        </p>
                      )}
                      {task.dueAt && (
                        <p
                          className="tabular"
                          style={{
                            margin: '7px 0 0',
                            fontFamily: 'var(--mono)',
                            fontSize: 11,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: late ? '#ff9d9d' : 'rgba(255,255,255,0.4)',
                          }}
                        >
                          {late ? 'Was due ' : 'Due '}
                          {formatDate(task.dueAt)}
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
        <div className="panel fade-in-up fade-delay-3" style={{ marginTop: 24 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              marginBottom: 18,
            }}
          >
            <p className="field-label" style={{ margin: 0 }}>
              Recent invoices
            </p>
            <Link
              to="/invoices"
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 11,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--gsu-sky)',
              }}
            >
              View all
            </Link>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {recentInvoices.map((invoice, i) => (
              <li key={invoice.id} style={{ borderTop: i === 0 ? 'none' : '1px solid var(--line)' }}>
                <Link
                  to={`/invoices/${invoice.invoiceNumber}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    flexWrap: 'wrap',
                    padding: '15px 0',
                  }}
                >
                  <span style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span className="tabular" style={{ fontSize: 14, fontWeight: 600 }}>
                      {invoice.invoiceNumber}
                    </span>
                    <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.45)' }}>
                      Issued {formatDate(invoice.issuedAt)}
                    </span>
                  </span>
                  {/* Fixed widths so the amounts and the pills form two straight
                      columns. Pills vary in width by several characters, and left
                      to themselves they drag the amounts out of alignment. */}
                  <span style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span
                      className="tabular"
                      style={{ fontSize: 15, fontWeight: 600, minWidth: 92, textAlign: 'right' }}
                    >
                      {formatMoney(invoice.amountCents)}
                    </span>
                    <span style={{ minWidth: 160, display: 'flex', justifyContent: 'flex-end' }}>
                      <StatusPill status={displayStatus(invoice)} />
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <p className="notice-preview" style={{ marginTop: 28, textAlign: 'center' }}>
          Preview with sample data. Not wired to Supabase yet.
        </p>
      </div>
    </section>
  );
}

/**
 * The amount-due banner. Says exactly one thing and gives exactly one action.
 *
 * ACH gets its own copy: money that has left the sponsor's account but has not
 * settled is neither unpaid nor paid, and telling a company that already paid you
 * that they still owe you is the fastest way to lose them.
 */
function OutstandingBanner({
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
      className={`fade-in-up fade-delay-1 ${processing ? 'notice-info' : late ? 'notice-error' : 'notice-warn'}`}
      style={{
        marginTop: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20,
        flexWrap: 'wrap',
        padding: '22px 24px',
      }}
    >
      <div>
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--mono)',
            fontSize: 11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            opacity: 0.8,
          }}
        >
          {processing ? 'Payment in progress' : late ? 'Overdue' : 'Amount due'}
        </p>
        <p className="tabular" style={{ margin: '6px 0 0', fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em' }}>
          {formatMoney(amountCents)}
        </p>
        <p style={{ margin: '6px 0 0', fontSize: 13.5, opacity: 0.85 }}>
          {processing ? (
            <>
              Bank transfer for {invoiceNumber} is clearing. This usually takes 3 to 5 business
              days, and we'll email you when it lands.
            </>
          ) : (
            <>
              {invoiceNumber}
              {dueAt && (
                <>
                  {' '}
                  &middot; {late ? 'was due' : 'due'} {formatDate(dueAt)}
                  {!late && days !== null && days <= 30 && ` (${days} days)`}
                </>
              )}
            </>
          )}
        </p>
      </div>

      <Link to={`/invoices/${invoiceNumber}`} className="btn-primary" style={{ flexShrink: 0 }}>
        {processing ? 'View invoice' : 'Pay this invoice'}
      </Link>
    </div>
  );
}
