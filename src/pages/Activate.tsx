import { Link } from 'react-router-dom';
import { ORG } from '../data/org';

/**
 * Shell only: nothing is wired up yet.
 *
 * First run, once per contact. An admin invites the sponsor's email, Supabase sends
 * an invite link, and clicking it lands here with a session already established.
 * All this screen does is set a password, so every later visit is a plain sign-in.
 *
 * When Supabase exists:
 *   - the invite link puts a session in the URL hash, which supabase-js picks up
 *   - supabase.auth.updateUser({ password })
 *   - then mark the contact activated and send them to /dashboard
 *
 * Landing here without a valid invite session shows the "no invite" state rather
 * than a password form, so this page can never mint an account on its own.
 */
export default function Activate() {
  return (
    <section className="auth-pad">
      <div className="container-wide" style={{ maxWidth: 470 }}>
        <div className="fade-in-up" style={{ position: 'relative', zIndex: 1 }}>
          <p className="section-eyebrow" style={{ marginBottom: 14 }}>
            Sponsor Portal
          </p>
          <h1
            className="auth-heading"
            style={{ fontSize: 'clamp(28px, 3.6vw, 38px)', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}
          >
            Set your password
          </h1>
          <p className="auth-sub" style={{ marginTop: 8, fontSize: 14 }}>
            One time only. After this you sign in with your email and password.
          </p>
        </div>

        <div className="auth-card fade-in-up fade-delay-1" style={{ marginTop: 18 }}>
          <label className="field-label" htmlFor="new-password">
            Choose a password
          </label>
          <input
            id="new-password"
            type="password"
            className="field-input"
            placeholder="At least 12 characters"
            autoComplete="new-password"
            disabled
          />

          <label className="field-label" htmlFor="confirm-password" style={{ marginTop: 16 }}>
            Confirm password
          </label>
          <input
            id="confirm-password"
            type="password"
            className="field-input"
            placeholder="••••••••"
            autoComplete="new-password"
            disabled
          />

          <button type="button" className="btn-primary" style={{ marginTop: 20, width: '100%' }} disabled>
            Save and continue
          </button>

          <div className="divider-or">No invite?</div>

          <p className="muted" style={{ fontSize: 13, lineHeight: 1.55, margin: 0 }}>
            This page only works from the invite link we email you. If you have not been
            invited yet, contact us at{' '}
            <a href={`mailto:${ORG.billingEmail}`}>{ORG.billingEmail}</a> and we'll set you up.
          </p>

          <p className="auth-fineprint" style={{ marginTop: 14, textAlign: 'center' }}>
            <Link to="/login" style={{ fontSize: 13, textDecoration: 'underline' }}>
              Already set up? Sign in
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
