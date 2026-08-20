import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthProvider';

/**
 * The signed-in shell's left column, modelled on app.colorstack.io: a fixed 224px
 * sidebar with the brand at the top, the nav items stacked, and Sign Out pinned to
 * the bottom. Active item is a filled GSU-blue pill.
 *
 * Below 900px the sidebar drops out of flow and becomes a slide-in drawer behind a
 * top bar with a hamburger. The overlay scrim closes it on click, and the escape
 * key closes it on desktop too, since a stuck drawer with no visible dismiss is
 * disorienting.
 *
 * Icons are inline SVG rather than a lucide-react dependency. It is five icons.
 */

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: IconHome },
  { to: '/invoices', label: 'Invoices', icon: IconReceipt },
  { to: '/profile', label: 'Profile', icon: IconUser },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const { signOut } = useAuth();
  const nav = useNavigate();

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
          <span>ColorStack at GSU</span>
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
          <span className="side-brand-text">ColorStack at GSU</span>
        </div>

        <nav className="side-nav" aria-label="Primary">
          {NAV.map(({ to, label, icon: Icon }) => (
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
          <button
            type="button"
            className="side-link"
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
/* All 20x20, stroke 1.75, currentColor. Matched to the visual weight ColorStack
   uses in their sidebar (feather / lucide family). */

function IconHome() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9v11a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9" />
    </svg>
  );
}

function IconReceipt() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 17l-5-5 5-5" />
      <path d="M5 12h11" />
    </svg>
  );
}
