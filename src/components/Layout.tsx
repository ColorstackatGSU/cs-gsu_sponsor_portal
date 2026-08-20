import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Sidebar from './Sidebar';
import Footer from './Footer';
import SponsorBrandTheme from './SponsorBrandTheme';

/**
 * Two distinct shells share the same routes:
 *
 *   Signed-in pages get the sidebar. `.side-main` handles the outer padding so
 *   pages inside it need no wrap of their own.
 *
 *   Signed-out pages centre a card over a tiled chapter mark. No sidebar, no
 *   footer chrome beyond the support address under the card.
 */
const AUTH_ROUTES = ['/login', '/reset'];

export default function Layout() {
  const { pathname } = useLocation();
  const isAuth = AUTH_ROUTES.includes(pathname);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  if (isAuth) {
    return (
      <div className="shell shell-auth">
        <main className="auth-wrap">
          <Outlet />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="shell shell-app side-wrap">
      <SponsorBrandTheme />
      <Sidebar />
      <main className="side-main">
        <Outlet />
      </main>
    </div>
  );
}
