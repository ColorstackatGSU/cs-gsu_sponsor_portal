import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../auth/AuthProvider';

/**
 * The tier catalog, straight from the API. Replaces the old MOCK_TIERS
 * lookup in Dashboard / InvoiceDetail so tier copy is single-sourced from
 * the DB.
 *
 * Fetched once per signed-in session — tiers change so rarely that a per-
 * page re-fetch would be pure churn.
 */
export type ApiTier = {
  id: string;
  name: string;
  amountCents: number;
  benefits: string[];
  sortOrder: number;
};

type State =
  | { status: 'loading' }
  | { status: 'ready'; tiers: ApiTier[] }
  | { status: 'error'; message: string };

export function useTiers(): State {
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    if (authLoading || !user) return;
    let cancelled = false;
    api
      .get<ApiTier[]>('/tiers')
      .then((tiers) => {
        if (!cancelled) setState({ status: 'ready', tiers });
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
