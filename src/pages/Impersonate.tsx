import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

/**
 * Officer-only entry point: consumes a Zeffy-style token_hash out of the URL
 * and finishes it locally with verifyOtp, landing the officer in a real
 * session as the target sponsor contact. The admin portal opens
 *
 *   /impersonate?token=<hash>&sponsor=<name>
 *
 * in a new tab after calling POST /admin/sponsors/{id}/impersonate on the
 * backend. Nothing here validates the officer's authority — the backend is
 * the gate; this route is a plumbing endpoint for the resulting hash.
 *
 * The token is single-use and short-lived, so we consume it immediately on
 * mount. An error surfaces inline instead of throwing so the officer sees
 * a helpful message rather than a blank overlay.
 */
export default function Impersonate() {
  const [search] = useSearchParams();
  const nav = useNavigate();
  const token = search.get('token');
  const sponsor = search.get('sponsor');

  const [error, setError] = useState<string | null>(null);
  // StrictMode remounts effects; without this guard we would call verifyOtp
  // twice with the same hash and the second attempt would fail (already used).
  const consumed = useRef(false);

  useEffect(() => {
    if (!token || consumed.current) return;
    consumed.current = true;

    supabase.auth
      .verifyOtp({ type: 'magiclink', token_hash: token })
      .then(({ error: err }) => {
        if (err) {
          setError(err.message);
          return;
        }
        // Replace so the token never sits in browser history.
        nav('/dashboard', { replace: true });
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Could not sign in.');
      });
  }, [token, nav]);

  if (!token) return <Navigate to="/login" replace />;

  return (
    <div className="page">
      <div className="wrap-narrow" style={{ paddingTop: 40, textAlign: 'center' }}>
        {error ? (
          <>
            <h1>Could not open this sponsor</h1>
            <p className="page-sub" style={{ margin: '14px auto 22px' }}>
              {error}. Ask an officer to open a fresh view-as link — the previous
              one has been spent.
            </p>
          </>
        ) : (
          <p className="page-sub" style={{ marginTop: 0 }}>
            {sponsor ? `Opening ${sponsor}…` : 'Signing you in…'}
          </p>
        )}
      </div>
    </div>
  );
}
