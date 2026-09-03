import { useState } from 'react';
import { useMe } from '../hooks/useMe';
import { fetchResumeUrl, useEligibleMembers, type ApiMember } from '../hooks/useMembers';
import { ORG } from '../data/org';

/**
 * The sponsor-facing member directory / resume book.
 *
 * Gated end to end: the backend's sponsor_eligible_members() returns [] for
 * tiers that do not unlock it, and this page shows an upgrade prompt when
 * useMe reports a non-eligible tier. Two locks so a bad frontend cannot
 * leak, and a bad backend cannot be exploited from a good frontend.
 *
 * WIP toggle: while members are still onboarding, the page shows a "coming
 * soon" placeholder instead of a nearly-empty list. Flip
 * VITE_RESUME_BOOK_ENABLED to any non-empty value ("true", "1", etc.) when
 * enough resumes are in to be worth showing. Everything else — API, RLS,
 * signed URLs — works right now, so the flip is a one-line deploy.
 */
const ELIGIBLE_TIERS = new Set([
  'Community Partner',
  'Signature Partner',
  'Founding Partner',
]);

const ENABLED = /^(1|true|yes|on)$/i.test(String(import.meta.env.VITE_RESUME_BOOK_ENABLED ?? ''));

export default function Directory() {
  const me = useMe();
  const list = useEligibleMembers();

  if (me.status !== 'ready') {
    return (
      <div className="page">
        <div className="wrap">
          {me.status === 'error' && (
            <div className="note note-error">Couldn't load your account: {me.message}</div>
          )}
        </div>
      </div>
    );
  }

  const tier = me.me.sponsor.tierName;
  const eligible = tier != null && ELIGIBLE_TIERS.has(tier);

  return (
    <div className="page">
      <div className="wrap">
        <h1>Member directory</h1>
        <p className="muted" style={{ fontSize: 14, marginTop: 2, marginBottom: 20 }}>
          ColorStack at GSU members who have opted in to sharing their profile with sponsors.
        </p>

        {!eligible ? (
          <UpgradePrompt tier={tier} />
        ) : !ENABLED ? (
          <ComingSoon />
        ) : (
          <MemberList list={list} />
        )}
      </div>
    </div>
  );
}

function UpgradePrompt({ tier }: { tier: string | null }) {
  return (
    <div className="card">
      <p className="card-title" style={{ marginBottom: 6 }}>Not included at your tier</p>
      <p className="muted" style={{ fontSize: 14, margin: 0 }}>
        Resume book access is a Community Partner benefit and above.
        {tier ? ` You're currently on ${tier}.` : ''} To upgrade, email{' '}
        <a className="link" href={`mailto:${ORG.billingEmail}`}>{ORG.billingEmail}</a>{' '}
        and we'll issue a new invoice at the higher tier.
      </p>
    </div>
  );
}

function ComingSoon() {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
      <span className="pill" style={{ marginBottom: 12 }}>Work in progress</span>
      <p style={{ fontSize: 16, fontWeight: 500, margin: '4px 0 8px' }}>
        The resume book is almost ready.
      </p>
      <p className="muted" style={{ fontSize: 14, margin: 0, maxWidth: 460, marginInline: 'auto' }}>
        Members are still uploading their resumes. We'll turn this on for you as soon as
        there's a meaningful set to browse. No action needed from your side.
      </p>
    </div>
  );
}

function MemberList({ list }: { list: ReturnType<typeof useEligibleMembers> }) {
  if (list.status === 'loading') {
    return <p className="muted" style={{ fontSize: 14 }}>Loading…</p>;
  }
  if (list.status === 'error') {
    return <div className="note note-error">Couldn't load members: {list.message}</div>;
  }
  if (list.members.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '32px 8px' }}>
        <p style={{ fontSize: 15, fontWeight: 500, margin: 0 }}>Nothing to show yet.</p>
        <p className="muted" style={{ fontSize: 14, marginTop: 6 }}>
          No members have opted in and uploaded a resume yet. Check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 0 }}>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {list.members.map((m, i) => (
          <MemberRow key={m.id} member={m} first={i === 0} />
        ))}
      </ul>
    </div>
  );
}

function MemberRow({ member, first }: { member: ApiMember; first: boolean }) {
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openResume() {
    if (opening) return;
    setError(null);
    setOpening(true);
    try {
      const url = await fetchResumeUrl(member.id);
      // Open in a new tab: Supabase serves the PDF inline so the browser
      // renders it, and staying on the page means the sponsor can keep
      // browsing without losing their scroll position.
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open resume');
    } finally {
      setOpening(false);
    }
  }

  const gradLine = [member.gradTerm, member.gradYear].filter(Boolean).join(' ');
  const summaryBits = [member.classYear, gradLine, member.majors].filter(Boolean);

  return (
    <li
      style={{
        padding: '16px 20px',
        borderTop: first ? 'none' : '1px solid var(--line)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ flex: '1 1 260px', minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 500 }}>
          {member.fullName ?? 'Member'}
        </p>
        {summaryBits.length > 0 && (
          <p className="muted" style={{ margin: '2px 0 0', fontSize: 13.5 }}>
            {summaryBits.join(' · ')}
          </p>
        )}
        {/* The point of the directory is that a recruiter who likes a resume can act on
            it. Without an address that meant going back through an officer. */}
        {member.contactEmail && (
          <p style={{ margin: '4px 0 0', fontSize: 13.5 }}>
            <a href={`mailto:${member.contactEmail}`} className="link">
              {member.contactEmail}
            </a>
          </p>
        )}
        {error && (
          <p style={{ margin: '4px 0 0', fontSize: 12.5, color: 'var(--bad)' }}>{error}</p>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {member.linkedinUrl && (
          <a
            href={member.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
          >
            LinkedIn ↗
          </a>
        )}
        {member.hasResume ? (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={openResume}
            disabled={opening}
          >
            {opening ? 'Opening…' : 'View resume ↗'}
          </button>
        ) : (
          <span className="faint" style={{ fontSize: 12.5 }}>No resume yet</span>
        )}
      </div>
    </li>
  );
}
