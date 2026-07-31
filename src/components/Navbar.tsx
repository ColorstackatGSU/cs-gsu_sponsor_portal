import { Link, NavLink } from 'react-router-dom';

const SITE_URL = 'https://colorstackatgsu.com';

const LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/invoices', label: 'Invoices' },
];

/**
 * The main site's floating white pill. On the auth pages it carries nothing but the
 * mark and a way back to the main site; once signed in it carries the app nav.
 *
 * Wider than the member portal's 860px because this one holds real navigation.
 */
export default function Navbar({ signedIn = false }: { signedIn?: boolean }) {
  return (
    <header
      className="app-nav"
      style={{
        position: 'absolute',
        top: 30,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)',
        maxWidth: signedIn ? 1000 : 860,
        zIndex: 50,
      }}
    >
      <nav
        className="nav-bar"
        style={{
          padding: '8px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: 'none',
          borderRadius: 999,
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.15)',
        }}
      >
        <Link
          to={signedIn ? '/dashboard' : '/login'}
          style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}
        >
          <img
            src="/images/colorstack-gsu-logo.png"
            alt="ColorStack GSU"
            className="nav-logo-img"
            style={{ display: 'block', width: 32, height: 32, borderRadius: '50%' }}
          />
          <span
            className="nav-brand-text"
            style={{
              fontFamily: 'var(--display)',
              fontWeight: 600,
              fontSize: 15,
              letterSpacing: '-0.01em',
              color: '#091024',
            }}
          >
            Sponsor Portal
          </span>
        </Link>

        {signedIn ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                {link.label}
              </NavLink>
            ))}
            {/* Sign out lands in step 4 with the auth context. A button that looks
                real but does nothing is worse than one that is visibly not ready. */}
            <span className="nav-link" style={{ opacity: 0.4, cursor: 'default' }}>
              Sign out
            </span>
          </div>
        ) : (
          <a
            href={SITE_URL}
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 11,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              padding: '8px 18px',
              borderRadius: 999,
              color: 'rgba(9, 16, 36, 0.75)',
              fontWeight: 500,
            }}
          >
            Main site
          </a>
        )}
      </nav>
    </header>
  );
}
