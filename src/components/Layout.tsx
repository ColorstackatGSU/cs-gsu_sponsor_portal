import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

/** Routes that centre a card instead of running the normal page column. */
const AUTH_ROUTES = ['/login', '/activate', '/reset'];

export default function Layout() {
  const { pathname } = useLocation();
  const isAuth = AUTH_ROUTES.includes(pathname);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <div className="shell">
      <Navbar signedIn={!isAuth} />
      {isAuth ? (
        <main className="auth">
          <Outlet />
        </main>
      ) : (
        <main style={{ flex: 1 }}>
          <Outlet />
        </main>
      )}
      <Footer />
    </div>
  );
}
