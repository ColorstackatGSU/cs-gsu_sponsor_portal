import { type FormEvent, useState } from 'react';
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, type CodeSent } from '../auth/AuthProvider';
import WelcomeOverlay from '../components/WelcomeOverlay';
import { ORG } from '../data/org';

/**
 * Passwordless sign-in. Two steps in one page:
 *
 *   1. Enter your email. We POST /auth/sponsor/request-code and, if the address
 *      is on sponsor_contacts, a six-digit code lands in the inbox.
 *   2. Enter the code. We POST /auth/sponsor/verify-code, get a GoTrue
 *      magic-link token hash, and finish it locally with verifyOtp, which
 *      stores a real Supabase session in localStorage.
 *
 * Already-signed-in visitors are bounced straight to /dashboard: landing on
 * /login is almost always a stale back-button, and rendering the form would
 * let them sign in as a different account without signing out first.
 *
 * No /activate any more: the first-time and returning flows are identical
 * — an admin creates the sponsor_contacts row by SQL, the sponsor requests
 * a code, and GoTrue provisions the auth user on first successful verify.
 */
export default function Login() {
  const { user, requestCode, verifyCode } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [search] = useSearchParams();
  // Two paths land here: ProtectedRoute redirect (carries `from` in state) and
  // the 401 handler in api.ts (uses window.location.assign, carries `?from=`).
  // Prefer the state value when both are present, since it survives round-trips
  // through the app more reliably than a query string a user might edit.
  const from =
    (location.state as { from?: string } | null)?.from ??
    search.get('from') ??
    '/dashboard';

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState<CodeSent | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Once verify-code succeeds, cover the form with the welcome overlay and
  // hold the navigation until it completes. Prevents a jarring flash from
  // "form" to "dashboard chrome" in a single frame.
  const [welcoming, setWelcoming] = useState(false);

  if (user && !welcoming) return <Navigate to={from} replace />;

  async function onRequest(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await requestCode(email.trim().toLowerCase());
      setSent(result);
      setCode('');
    } catch (err) {
      setError(messageOf(err, 'We could not send you a code just now.'));
    } finally {
      setSubmitting(false);
    }
  }

  async function onVerify(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await verifyCode(email.trim().toLowerCase(), code.trim());
      // Session is now stored. Show the welcome overlay; its onComplete
      // navigates when the animation ends. Keep `submitting` true so the
      // form is not interactive underneath the overlay if it flickers.
      setWelcoming(true);
    } catch (err) {
      setError(messageOf(err, 'That code did not work.'));
      setSubmitting(false);
    }
  }

  function reset() {
    setSent(null);
    setCode('');
    setError(null);
  }

  return (
    <div className="wrap-narrow">
      {welcoming && <WelcomeOverlay onComplete={() => nav(from, { replace: true })} />}
      <form className="card" onSubmit={sent ? onVerify : onRequest} noValidate>
        <h1 style={{ fontSize: 18, marginBottom: 4 }}>Sign in</h1>
        <p className="muted" style={{ fontSize: 13.5, marginBottom: 18 }}>
          {sent
            ? `We sent a six-digit code to ${sent.sentTo}. Enter it below to sign in.`
            : 'Enter your work email and we will send you a six-digit sign-in code.'}
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
            disabled={submitting || sent !== null}
          />
        </div>

        {sent && (
          <div className="field">
            <label className="label" htmlFor="code">Six-digit code</label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              className="input"
              placeholder="123456"
              autoComplete="one-time-code"
              required
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              disabled={submitting}
            />
            <p className="hint" style={{ marginTop: 6 }}>
              The code expires in 10 minutes.
            </p>
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={submitting || !email || (sent !== null && code.length !== 6)}
        >
          {submitting
            ? sent ? 'Signing in…' : 'Sending code…'
            : sent ? 'Sign in' : 'Email me a code'}
        </button>

        {sent && (
          <button
            type="button"
            className="btn btn-secondary btn-block"
            style={{ marginTop: 10 }}
            onClick={reset}
            disabled={submitting}
          >
            Use a different email
          </button>
        )}

        <p className="hint" style={{ marginTop: 14 }}>
          Accounts are created by invitation. If your company sponsors us and you need
          access, email <a className="link" href={`mailto:${ORG.billingEmail}`}>{ORG.billingEmail}</a>.
        </p>
      </form>
    </div>
  );
}

function messageOf(err: unknown, fallback: string): string {
  // ApiError carries the Spring ProblemDetail as `body`; render its `detail` when
  // present so the sponsor sees the same friendly copy the backend wrote.
  if (err && typeof err === 'object' && 'body' in err) {
    const body = (err as { body: unknown }).body;
    if (body && typeof body === 'object' && 'detail' in body && typeof (body as { detail: unknown }).detail === 'string') {
      return (body as { detail: string }).detail;
    }
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
