import { Link, NavLink } from 'react-router-dom';

const LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/invoices', label: 'Invoices' },
];

/**
 * The main site's floating white pill. The .topbar rule is its own width container,
 * so there is no .wrap inside it: nesting one would indent the contents twice.
 */
export default function Navbar({ signedIn = false }: { signedIn?: boolean }) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link to={signedIn ? '/dashboard' : '/login'} className="brand">
          <img src="/images/colorstack-gsu-logo.png" alt="" />
          <span className="brand-text">ColorStack at GSU</span>
        </Link>

        {signedIn ? (
          <nav className="nav">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                {link.label}
              </NavLink>
            ))}
            {/* Sign out lands with the auth context in step 5. A button that looks
                real but does nothing is worse than one that is visibly not ready. */}
            <span className="nav-link faint" style={{ cursor: 'default' }}>Sign out</span>
          </nav>
        ) : (
          <a className="nav-link" href="https://colorstackatgsu.com">
            Main site
          </a>
        )}
      </div>
    </header>
  );
}
