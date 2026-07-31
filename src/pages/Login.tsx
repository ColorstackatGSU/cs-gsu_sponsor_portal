import { Link } from 'react-router-dom';

/**
 * Shell only: nothing is wired up yet.
 *
 * Email and password is the everyday path. Sponsors only get a link in their inbox
 * once, when an admin first invites them (see Activate.tsx), so email is not in the
 * loop for routine sign-ins.
 *
 * When Supabase exists: supabase.auth.signInWithPassword({ email, password }).
 */
export default function Login() {
  return (
    <div className="wrap-narrow">
      <div className="card">
        <h1 style={{ fontSize: 18, marginBottom: 4 }}>Sign in</h1>
        <p className="muted" style={{ fontSize: 13.5, marginBottom: 18 }}>
          Manage your sponsorship, invoices and payments.
        </p>

        <div className="field">
          <label className="label" htmlFor="email">Work email</label>
          <input id="email" type="email" className="input" placeholder="you@company.com" autoComplete="email" disabled />
        </div>

        <div className="field">
          <label className="label" htmlFor="password">Password</label>
          <input id="password" type="password" className="input" autoComplete="current-password" disabled />
        </div>

        <button type="button" className="btn btn-primary btn-block" disabled>Sign in</button>

        <p style={{ marginTop: 12, fontSize: 13.5 }}>
          <a className="link" href="#" aria-disabled="true">Forgot your password?</a>
        </p>

        <hr style={{ border: 0, borderTop: '1px solid var(--line)', margin: '18px 0' }} />

        <p className="muted" style={{ fontSize: 13.5, marginBottom: 10 }}>
          First time here?
        </p>
        <Link to="/activate" className="btn btn-secondary btn-block">Set up your account</Link>

        <p className="hint" style={{ marginTop: 12 }}>
          Accounts are created by invitation. If your company sponsors us and you need access,
          email us and we'll add you.
        </p>
      </div>

      <p className="note-preview" style={{ marginTop: 16 }}>Not wired to the API yet</p>
    </div>
  );
}
