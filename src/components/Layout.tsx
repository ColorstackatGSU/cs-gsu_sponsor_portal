import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import Backdrop from './Backdrop';

/** Routes that get the light backdrop treatment instead of the dark app surface. */
const AUTH_ROUTES = ['/login', '/activate', '/reset'];

export default function Layout() {
  const { pathname } = useLocation();
  const isAuth = AUTH_ROUTES.includes(pathname);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <div
      className={isAuth ? 'app-shell auth-page' : 'app-shell'}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        // The backdrop is fixed and only covers the viewport, so anything taller
        // than one screen would otherwise expose the dark body colour underneath.
        background: isAuth ? 'var(--gsu-blue)' : 'var(--paper)',
      }}
    >
      {isAuth && <Backdrop />}
      <Navbar signedIn={!isAuth} />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* The auth pages are pinned to one viewport, so the footer would eat the
          height the form needs. Its only real content is the contact address,
          which those pages already surface in their own copy. */}
      {isAuth ? (
        <p className="notice-preview auth-status">Not wired to Supabase yet</p>
      ) : (
        <Footer />
      )}
    </div>
  );
}
