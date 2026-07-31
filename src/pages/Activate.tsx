import { Link } from 'react-router-dom';
import { ORG } from '../data/org';

/**
 * Shell only: nothing is wired up yet.
 *
 * Runs once per contact. An admin invites the sponsor's email, Supabase sends an
 * invite link, and clicking it lands here with a session already established. All
 * this screen does is set a password, so every later visit is a plain sign-in.
 *
 * When Supabase exists:
 *   - the invite link puts a session in the URL hash, which supabase-js picks up
 *   - supabase.auth.updateUser({ password })
 *   - stamp activated_at, then go to /dashboard
 *
 * Landing here without a valid invite session shows the "no invite" state rather
 * than a password form, so this page can never mint an account on its own.
 */
export default function Activate() {
  return (
    <div className="wrap-narrow">
      <div className="card">
        <h1 style={{ fontSize: 18, marginBottom: 4 }}>Set your password</h1>
        <p className="muted" style={{ fontSize: 13.5, marginBottom: 18 }}>
          One time only. After this you sign in with your email and password.
        </p>

        <div className="field">
          <label className="label" htmlFor="new-password">Choose a password</label>
          <input
            id="new-password"
            type="password"
            className="input"
            placeholder="At least 12 characters"
            autoComplete="new-password"
            disabled
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="confirm-password">Confirm password</label>
          <input id="confirm-password" type="password" className="input" autoComplete="new-password" disabled />
        </div>

        <button type="button" className="btn btn-primary btn-block" disabled>Save and continue</button>

        <div className="note" style={{ marginTop: 18 }}>
          This page only works from the invite link we email you. If you have not been invited
          yet, contact <a className="link" href={`mailto:${ORG.billingEmail}`}>{ORG.billingEmail}</a> and
          we'll set you up.
        </div>

        <p style={{ marginTop: 14, fontSize: 13.5, textAlign: 'center' }}>
          <Link className="link" to="/login">Already set up? Sign in</Link>
        </p>
      </div>

      <p className="note-preview" style={{ marginTop: 16 }}>Not wired to the API yet</p>
    </div>
  );
}
