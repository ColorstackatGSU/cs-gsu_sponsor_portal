import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useMe } from '../hooks/useMe';
import { ORG } from '../data/org';

/**
 * The signed-in shell's left column: a fixed 248px sidebar with the wordmark at
 * the top, the nav stacked in the middle, and a support sticker plus Sign Out
 * pinned to the bottom. Every nav item is its own framed block that presses into
 * its shadow on hover; the active one is filled with the brand colour.
 *
 * Below 900px the sidebar drops out of flow and becomes a slide-in drawer behind
 * a top bar with a hamburger. The scrim closes it on click, and Escape closes it
 * on desktop too, since a stuck drawer with no visible dismiss is disorienting.
 *
 * Icons are inline SVG rather than a lucide-react dependency. It is five icons,
 * drawn at stroke 2.25 so they hold up next to the uppercase labels.
 */

// Directory nav is only shown to sponsors on tiers that include resume book
// access. Non-eligible sponsors do not see the link at all — the page still
// exists and gives an upgrade prompt if hit directly, so nav visibility is
// UX polish, not a permission boundary.
const RESUME_BOOK_TIERS = new Set([
  'Community Partner',
  'Signature Partner',
  'Founding Partner',
]);

const BASE_NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: IconHome },
  { to: '/invoices', label: 'Invoices', icon: IconReceipt },
];
const DIRECTORY_ITEM = { to: '/directory', label: 'Directory', icon: IconPeople };
const PROFILE_ITEM = { to: '/profile', label: 'Profile', icon: IconUser };

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const { signOut } = useAuth();
  const me = useMe();
  const nav = useNavigate();

  const items = useMemo(() => {
    const eligible =
      me.status === 'ready' && me.me.sponsor.tierName != null &&
      RESUME_BOOK_TIERS.has(me.me.sponsor.tierName);
    return eligible
      ? [...BASE_NAV, DIRECTORY_ITEM, PROFILE_ITEM]
      : [...BASE_NAV, PROFILE_ITEM];
  }, [me]);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
      nav('/login', { replace: true });
    } finally {
      setSigningOut(false);
      setOpen(false);
    }
  }

  // Close on route change and on Escape. Without this a link tap inside the drawer
  // navigates but leaves the drawer open over the destination.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      {/* Mobile top bar. Hidden on desktop by CSS. */}
      <div className="side-top">
        <div className="side-top-brand">
          <img src="/images/colorstack-gsu-logo.png" alt="" />
          <span>
            ColorStack at GSU
            <br />
            Sponsor portal
          </span>
        </div>
        <button
          type="button"
          className="side-burger"
          aria-label="Open navigation"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <IconMenu />
        </button>
      </div>

      <div
        className={open ? 'scrim open' : 'scrim'}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <aside className={open ? 'side open' : 'side'}>
        <div className="side-brand">
          <img src="/images/colorstack-gsu-logo.png" alt="" />
          <span className="side-brand-text">
            ColorStack
            <br />
            at GSU
            <span className="side-brand-sub">Sponsor portal</span>
          </span>
        </div>

        <nav className="side-nav" aria-label="Primary">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => (isActive ? 'side-link active' : 'side-link')}
              onClick={() => setOpen(false)}
            >
              <Icon />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="side-foot">
          {/* The one place in the shell that carries a human to email. Sponsors
              who are stuck reach for the nav, so it lives with the nav. */}
          <div className="side-help">
            <span className="side-help-title">Need a hand?</span>
            <a href={`mailto:${ORG.billingEmail}`}>{ORG.billingEmail}</a>
          </div>

          <button
            type="button"
            className="side-link side-signout"
            onClick={handleSignOut}
            disabled={signingOut}
            style={{ width: '100%', textAlign: 'left', cursor: signingOut ? 'wait' : 'pointer' }}
          >
            <IconLogout />
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </aside>
    </>
  );
}

/* ============ ICONS ============ */
/* All 20x20, stroke 2.25, currentColor. Heavier than the usual feather weight so
   they carry the same visual mass as the 3px frames around them. */

function IconHome() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9v11a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9" />
    </svg>
  );
}

function IconReceipt() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" />
    </svg>
  );
}

function IconPeople() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="8" r="3.25" />
      <path d="M3 20c1-3 3.5-4.5 6-4.5s5 1.5 6 4.5" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M15.5 15c2.5 0 4.5 1.5 5.5 4" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 17l-5-5 5-5" />
      <path d="M5 12h11" />
    </svg>
  );
}
