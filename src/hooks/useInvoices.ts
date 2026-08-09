import { useEffect, useState } from 'react';
import { api, ApiError } from '../lib/api';
import { useAuth } from '../auth/AuthProvider';
import type { InvoiceStatus, PaymentMethod } from '../data/types';

/**
 * Wire shape mirrors Spring's Invoice record 1:1. amountCents comes across as a
 * JS number because JSON does not distinguish long from int; safe up to 2^53
 * cents, which is more than the chapter will ever bill.
 */
export type ApiInvoice = {
  id: string;
  sponsorId: string;
  tierId: string | null;
  tierName: string | null;
  amountCents: number;
  title: string;
  status: InvoiceStatus;
  issuedAt: string | null;
  dueAt: string | null;
  paidAt: string | null;
  paymentMethod: PaymentMethod | null;
  zeffyInvoiceId: string | null;
  notes: string | null;
};

type ListState =
  | { status: 'loading' }
  | { status: 'ready'; invoices: ApiInvoice[] }
  | { status: 'error'; message: string };

/** All invoices visible to the caller, newest first. */
export function useInvoices(): ListState {
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<ListState>({ status: 'loading' });

  useEffect(() => {
    if (authLoading || !user) return;
    let cancelled = false;
    api
      .get<ApiInvoice[]>('/invoices')
      .then((invoices) => !cancelled && setState({ status: 'ready', invoices }))
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

type OneState =
  | { status: 'loading' }
  | { status: 'ready'; invoice: ApiInvoice }
  | { status: 'not-found' }
  | { status: 'error'; message: string };

/** One invoice by id, or not-found (404 from the API means either does-not-exist
 *  or belongs-to-someone-else; the API deliberately does not distinguish). */
export function useInvoice(id: string | undefined): OneState {
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<OneState>({ status: 'loading' });

  useEffect(() => {
    if (authLoading || !user || !id) return;
    let cancelled = false;
    api
      .get<ApiInvoice>(`/invoices/${encodeURIComponent(id)}`)
      .then((invoice) => !cancelled && setState({ status: 'ready', invoice }))
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) {
          setState({ status: 'not-found' });
          return;
        }
        setState({
          status: 'error',
          message: err instanceof Error ? err.message : 'unknown error',
        });
      });
    return () => {
      cancelled = true;
    };
  }, [id, user, authLoading]);

  return state;
}
