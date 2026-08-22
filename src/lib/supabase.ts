import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './env';

/**
 * The one Supabase client for the app. Auth only: we use it to obtain and refresh
 * a session, never to query data. Data goes through the Spring API (see api.ts),
 * which validates the same JWT and does its queries as a non-superuser role
 * scoped by RLS.
 *
 * The URL and anon key are per-environment. Locally they point at the Supabase
 * stack in ../cs-gsu_backend on the 544xx port band. In production they point at
 * the cloud project.
 *
 * A missing var is reported by main.tsx, which renders the setup screen instead
 * of the app (see lib/env.ts). This module must not throw at import time: it is
 * pulled in by AuthProvider, which main.tsx imports statically, so a throw here
 * takes down the whole module graph before anything can be rendered and the
 * developer gets a blank page. The placeholders below only exist to keep
 * createClient happy in that case; the client is never used, because the app
 * never mounts.
 */
export const supabase = createClient(SUPABASE_URL || 'http://localhost', SUPABASE_ANON_KEY || 'not-configured', {
  auth: {
    // Persist session in localStorage so a refresh keeps the sponsor signed in.
    persistSession: true,
    // Refresh the JWT in the background before it expires. Without this a
    // long-lived tab starts getting 401s from the API when the token ages out.
    autoRefreshToken: true,
    // Detect and consume the session encoded in the URL hash after email link
    // callbacks. Harmless when there is no hash to consume.
    detectSessionInUrl: true,
  },
});
