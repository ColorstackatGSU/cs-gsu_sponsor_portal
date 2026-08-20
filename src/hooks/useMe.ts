import { useEffect, useState } from 'react';
import { api, ApiError } from '../lib/api';
import { useAuth } from '../auth/AuthProvider';

/**
 * External-refresh channel: anything that mutates the sponsor contact (today,
 * the profile page's PATCH /me) calls refreshMe() and every mounted useMe
 * re-fetches. Avoids threading a context provider through the whole tree for
 * one edit form. Module-scoped so it survives HMR of individual pages.
 */
type Listener = () => void;
const meRefreshListeners = new Set<Listener>();
export function refreshMe(): void {
  meRefreshListeners.forEach((fn) => fn());
}

/**
 * The Contact + Sponsor the signed-in user represents. Shape matches Spring's
 * MeResponse record so the JSON deserialises 1:1.
 *
 * A `null` value here means: authenticated with Supabase but not a sponsor in
 * our system (Spring returned 404). The dashboard turns this into a "your
 * account is not yet linked" state rather than crashing.
 */
export type Me = {
  contact: {
    id: string;
    email: string;
    fullName: string | null;
    title: string | null;
    role: 'primary' | 'billing' | 'viewer';
  };
  sponsor: {
    id: string;
    name: string;
    slug: string;
    brandHex: string | null;
    tierId: string | null;
    tierName: string | null;
    websiteUrl: string | null;
  };
};

type State =
  | { status: 'loading' }
  | { status: 'ready'; me: Me }
  | { status: 'unlinked' } // authenticated but no sponsor_contacts row
  | { status: 'error'; message: string };

/**
 * Reads /me for the signed-in user. Assumes the caller is signed in: it should
 * be rendered inside <ProtectedRoute>, which handles the no-user case. If the
 * user changes (sign out then sign in as someone else) we re-fetch.
 *
 * setState only fires inside the async callbacks, not synchronously in the
 * effect body. React's set-state-in-effect lint rule complains about the latter
 * because it usually means state can be derived instead; here the state is a
 * genuine async result, not derivable.
 */
export function useMe(): State {
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<State>({ status: 'loading' });
  // Incremented by refreshMe() to force a re-fetch across every mounted hook.
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const fn = (): void => setTick((t) => t + 1);
    meRefreshListeners.add(fn);
    return () => {
      meRefreshListeners.delete(fn);
    };
  }, []);

  useEffect(() => {
    if (authLoading || !user) return;

    let cancelled = false;
    api
      .get<Me>('/me')
      .then((me) => {
        if (!cancelled) setState({ status: 'ready', me });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) {
          setState({ status: 'unlinked' });
          return;
        }
        const message = err instanceof Error ? err.message : 'unknown error';
        setState({ status: 'error', message });
      });

    return () => {
      cancelled = true;
    };
  }, [user, authLoading, tick]);

  return state;
}
