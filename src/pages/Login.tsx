import { Link } from 'react-router-dom';

/**
 * Shell only: nothing is wired up yet.
 *
 * The everyday path is email plus password. Sponsors only see a link in their inbox
 * once, when an admin first invites them (see Activate.tsx), so email is not in the
 * loop for routine sign-ins.
 *
 * Sized to fit one viewport without scrolling. Adding fields here means taking
 * height back somewhere else.
 *
 * When Supabase exists: supabase.auth.signInWithPassword({ email, password }).
 */
export default function Login() {
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
            Sign in
          </h1>
          <p className="auth-sub" style={{ marginTop: 8, fontSize: 14 }}>
            Manage your sponsorship, invoices, and payments.
          </p>
        </div>

        <div className="auth-card fade-in-up fade-delay-1" style={{ marginTop: 18 }}>
          <label className="field-label" htmlFor="email">
            Work email
          </label>
          <input
            id="email"
            type="email"
            className="field-input"
            placeholder="you@company.com"
            autoComplete="email"
            disabled
          />

          <label className="field-label" htmlFor="password" style={{ marginTop: 16 }}>
            Password
          </label>
          <input
            id="password"
            type="password"
            className="field-input"
            placeholder="••••••••"
            autoComplete="current-password"
            disabled
          />

          <button type="button" className="btn-primary" style={{ marginTop: 20, width: '100%' }} disabled>
            Sign in
          </button>

          <p style={{ marginTop: 12, textAlign: 'center' }}>
            <a href="#" style={{ fontSize: 13, textDecoration: 'underline' }} aria-disabled="true">
              Forgot your password?
            </a>
          </p>

          <div className="divider-or">First time here?</div>

          <Link to="/activate" className="btn-secondary" style={{ width: '100%' }}>
            Set up your account
          </Link>

          <p
            className="muted auth-fineprint"
            style={{ marginTop: 12, fontSize: 12.5, lineHeight: 1.5, textAlign: 'center' }}
          >
            Accounts are created by invitation. If your company sponsors us and you need access,
            email us and we'll add you.
          </p>
        </div>
      </div>
    </section>
  );
}
