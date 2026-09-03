import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../auth/AuthProvider';

/**
 * The eligible-members endpoint returns [] when the sponsor's tier does not
 * unlock the resume book, so the UI can distinguish "nothing to show" from
 * "you cannot see this" only by cross-referencing useMe().sponsor.tierName.
 * Deliberate — a would-be probe should see the same thing an ineligible
 * sponsor sees.
 */
export type ApiMember = {
  id: string;
  fullName: string | null;
  majors: string | null;
  classYear: string | null;
  gradTerm: string | null;
  gradYear: number | null;
  linkedinUrl: string | null;
  /** Personal address where the member gave one, otherwise their school address. */
  contactEmail: string | null;
  hasResume: boolean;
};

type State =
  | { status: 'loading' }
  | { status: 'ready'; members: ApiMember[] }
  | { status: 'error'; message: string };

export function useEligibleMembers(): State {
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    if (authLoading || !user) return;
    let cancelled = false;
    api
      .get<ApiMember[]>('/sponsor/members')
      .then((members) => {
        if (!cancelled) setState({ status: 'ready', members });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({
          status: 'error',
          message: err instanceof Error ? err.message : 'unknown error',
        });
      });
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  return state;
}

/**
 * Fetches a short-lived signed URL for a member's resume and returns it. The
 * caller decides what to do with it (usually window.open in a new tab). URLs
 * expire in ~60 seconds so it must be used immediately.
 */
export async function fetchResumeUrl(memberId: string): Promise<string> {
  const res = await api.get<{ url: string }>(`/sponsor/members/${encodeURIComponent(memberId)}/resume-url`);
  return res.url;
}
