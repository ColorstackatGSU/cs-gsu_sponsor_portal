import { type FormEvent, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

/**
 * Real email + password sign-in against Supabase Auth. On success, sends the
 * user to the page they were trying to reach (from Navigate's location.state)
 * or to /dashboard by default.
 *
 * Already-signed-in visitors are bounced straight to /dashboard: signed-in
 * users landing on /login is almost always a stale back-button, and rendering
 * the form would let them re-authenticate as a different account without
 * signing out first.
 */
export default function Login() {
  const { user, signIn } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user) return <Navigate to={from} replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email.trim().toLowerCase(), password);
      nav(from, { replace: true });
    } catch (err: unknown) {
      // Supabase's default sign-in error is "Invalid login credentials", which is
      // fine to surface: it deliberately does not disclose whether the email
      // exists (mitigates enumeration).
      setError(err instanceof Error ? err.message : 'Sign-in failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="wrap-narrow">
      <form className="card" onSubmit={onSubmit} noValidate>
        <h1 style={{ fontSize: 18, marginBottom: 4 }}>Sign in</h1>
        <p className="muted" style={{ fontSize: 13.5, marginBottom: 18 }}>
          Manage your sponsorship, invoices and payments.
        </p>

        {error && (
          <div className="note note-error" style={{ marginBottom: 14 }} role="alert">
            {error}
          </div>
        )}

        <div className="field">
          <label className="label" htmlFor="email">Work email</label>
          <input
            id="email"
            type="email"
            className="input"
            placeholder="you@company.com"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="input"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={submitting || !email || !password}
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>

        <p style={{ marginTop: 12, fontSize: 13.5 }}>
          <a className="link" href="#" aria-disabled="true">Forgot your password?</a>
        </p>

        <hr style={{ border: 0, borderTop: '1px solid var(--line)', margin: '18px 0' }} />

        <p className="muted" style={{ fontSize: 13.5, marginBottom: 10 }}>First time here?</p>
        <Link to="/activate" className="btn btn-secondary btn-block">Set up your account</Link>

        <p className="hint" style={{ marginTop: 12 }}>
          Accounts are created by invitation. If your company sponsors us and you need access,
          email us and we'll add you.
        </p>
      </form>
    </div>
  );
}
