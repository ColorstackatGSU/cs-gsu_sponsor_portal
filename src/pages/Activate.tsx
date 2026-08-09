import { type FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { ORG } from '../data/org';

/**
 * Local-dev signup flow: enter email + password, hit Supabase signUp, land on
 * /dashboard. The database's link_sponsor_contact_on_signup() trigger claims
 * the matching sponsor_contacts row by email as a side effect of the auth.users
 * insert, so if you signup with an email seeded in supabase/seed.sql (e.g.
 * jane.doe@johndoe.example) the dashboard immediately shows your sponsor.
 *
 * PRODUCTION FLOW WILL BE DIFFERENT: an admin clicks Invite in /admin, which
 * sends the sponsor a magic link. That link lands here with a session already
 * established, and the form only sets a password (no email field, no signup).
 * Step 9 builds that out.
 */
export default function Activate() {
  const { user, signUp } = useAuth();
  const nav = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user) return <Navigate to="/dashboard" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Choose a password with at least 8 characters.');
      return;
    }
    setSubmitting(true);
    try {
      await signUp(email.trim().toLowerCase(), password);
      nav('/dashboard', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign-up failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="wrap-narrow">
      <form className="card" onSubmit={onSubmit} noValidate>
        <h1 style={{ fontSize: 18, marginBottom: 4 }}>Set up your account</h1>
        <p className="muted" style={{ fontSize: 13.5, marginBottom: 18 }}>
          One time only. After this you sign in with your email and password.
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
          <label className="label" htmlFor="new-password">Choose a password</label>
          <input
            id="new-password"
            type="password"
            className="input"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="confirm-password">Confirm password</label>
          <input
            id="confirm-password"
            type="password"
            className="input"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={submitting}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={submitting || !email || !password || !confirmPassword}
        >
          {submitting ? 'Creating account…' : 'Create account'}
        </button>

        <div className="note" style={{ marginTop: 18 }}>
          For local dev this is straight signup. In production, accounts are created by
          admin invite only; see <a className="link" href={`mailto:${ORG.billingEmail}`}>{ORG.billingEmail}</a>.
        </div>

        <p style={{ marginTop: 14, fontSize: 13.5, textAlign: 'center' }}>
          <Link className="link" to="/login">Already set up? Sign in</Link>
        </p>
      </form>
    </div>
  );
}
