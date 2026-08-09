import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

/**
 * Wraps the app in a Supabase auth session. Two responsibilities:
 *
 *   1. Load whatever session Supabase already has in localStorage before we
 *      render anything that depends on auth state, so protected routes do not
 *      briefly bounce a signed-in user to /login on refresh.
 *   2. Subscribe to onAuthStateChange so a sign-in or sign-out in this tab
 *      (or another tab of the same origin) updates the whole app immediately.
 *
 * Deliberately does NOT expose the raw supabase client. Callers use the exposed
 * signIn/signOut/signUp methods, so if we ever switch backends this file is the
 * only one that changes.
 */

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial load: getSession() reads localStorage synchronously (from disk).
    // Resolve loading=false only after this returns so ProtectedRoute never
    // renders a redirect on the first frame for a signed-in user.
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    // Keep the local state in sync with Supabase's. Fires on sign-in, sign-out,
    // token refresh, and password recovery.
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
    signIn: async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    signUp: async (email, password) => {
      // Local-dev flow only: sponsors self-signup with email + password. The real
      // production flow is admin-invites-by-email + set-password-on-first-click,
      // which lands in step 9 (admin pages) once we have real invite UI.
      const { error } = await supabase.auth.signUp({ email, password });
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
