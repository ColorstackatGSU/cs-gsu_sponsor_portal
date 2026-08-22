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
 *   Signed-out pages get a two-panel split: a loud brand panel that says what
 *   this is, and the form beside it. Below 920px the panel drops out and the
 *   compact brand bar above the form takes over, because a marketing panel
 *   stacked above a sign-in form on a phone is only something to scroll past.
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
        <main className="auth-split">
          <aside className="auth-panel">
            <div className="auth-panel-brand">
              <img src="/images/colorstack-gsu-logo.png" alt="" />
              <span>
                ColorStack
                <br />
                at GSU
              </span>
            </div>

            <div className="auth-chips">
              <span className="auth-chip">Invoices</span>
              <span className="auth-chip">Payments</span>
              <span className="auth-chip">Tier benefits</span>
              <span className="auth-chip">Receipts</span>
            </div>

            <h2 className="auth-panel-title">
              Sponsor
              <br />
              <em>portal</em>
            </h2>
            <p className="auth-panel-copy">
              Everything we owe each other in one place: what you sponsor, what it
              includes, what is due, and what has already been paid.
            </p>
          </aside>

          <div className="auth-pane">
            <div className="auth-pane-inner">
              <div className="auth-mini">
                <img src="/images/colorstack-gsu-logo.png" alt="" />
                <span>
                  ColorStack at GSU
                  <br />
                  Sponsor portal
                </span>
              </div>
              <Outlet />
              <Footer />
            </div>
          </div>
        </main>
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
