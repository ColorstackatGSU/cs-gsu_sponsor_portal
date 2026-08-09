import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../auth/AuthProvider';
import type { TaskStatus } from '../data/types';

export type ApiTask = {
  id: string;
  sponsorId: string | null;
  title: string;
  description: string | null;
  dueAt: string | null;
  status: TaskStatus;
};

type State =
  | { status: 'loading' }
  | { status: 'ready'; tasks: ApiTask[] }
  | { status: 'error'; message: string };

/** Every task visible to the caller: their sponsor's, and any chapter-wide ones.
 *  Ordering (open first, then by due date) comes from the API. */
export function useTasks(): State {
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    if (authLoading || !user) return;
    let cancelled = false;
    api
      .get<ApiTask[]>('/tasks')
      .then((tasks) => !cancelled && setState({ status: 'ready', tasks }))
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
