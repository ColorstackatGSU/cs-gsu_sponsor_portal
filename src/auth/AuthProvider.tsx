import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';

/**
 * Wraps the app in a Supabase auth session. Two responsibilities:
 *
 *   1. Load whatever session Supabase already has in localStorage before we
 *      render anything that depends on auth state, so protected routes do not
 *      briefly bounce a signed-in user to /login on refresh.
 *   2. Subscribe to onAuthStateChange so a sign-in or sign-out in this tab
 *      (or another tab of the same origin) updates the whole app immediately.
 *
 * Passwordless: the browser never handles a password. requestCode asks the
 * Spring backend to mail a six-digit code, verifyCode swaps the code for a
 * GoTrue magic-link token hash and completes it locally with verifyOtp, which
 * mints and stores a real Supabase session. Return visits skip this entirely:
 * supabase-js finds the persisted session on load.
 */

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  requestCode: (email: string) => Promise<CodeSent>;
  verifyCode: (email: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export type CodeSent = {
  /** May be null if we do not know their name yet — treat as optional. */
  firstName: string | null;
  /** Masked destination, e.g. "j***@company.com". Safe to render. */
  sentTo: string;
};

type SessionGrant = { email: string; tokenHash: string };

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value: AuthContextValue = {
    user: session?.user ?? null,
    session,
    loading,
    requestCode: (email) => api.post<CodeSent>('/auth/sponsor/request-code', { email }),
    verifyCode: async (email, code) => {
      const grant = await api.post<SessionGrant>('/auth/sponsor/verify-code', { email, code });
      // Completes the flow locally: supabase-js validates the hashed token with
      // GoTrue, gets back an access + refresh token pair, and writes them to
      // localStorage. Our onAuthStateChange subscription above then fires and
      // updates every consumer of useAuth in the same frame.
      const { error } = await supabase.auth.verifyOtp({
        type: 'magiclink',
        email: grant.email,
        token_hash: grant.tokenHash,
      });
      if (error) throw error;
    },
    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
