import { type FormEvent, useState } from 'react';
import { api } from '../lib/api';
import { refreshMe, useMe, type Me } from '../hooks/useMe';

/**
 * The two fields a sponsor contact can edit about themselves: full name and
 * title. Email, role, and which sponsor they belong to are locked by a
 * database trigger on the backend (guard_sponsor_contact_columns), so an
 * officer must run SQL or use the admin portal to change any of those. The
 * locked fields sit under a rule, below the save button, as read-only facts
 * rather than as disabled inputs a sponsor would keep trying to click.
 *
 * Save calls PATCH /me and, on success, broadcasts refreshMe() so the sidebar
 * / dashboard pick up the new name without a page reload.
 */
export default function Profile() {
  const state = useMe();

  // The form's editable state is a null|value overlay on the server data:
  // null means "show the server value", a set value means "the sponsor has
  // typed here." That keeps this derived, so we do not need an effect to
  // sync server-into-form and cannot clobber unsaved edits when refreshMe()
  // fires elsewhere.
  const [nameEdit, setNameEdit] = useState<string | null>(null);
  const [titleEdit, setTitleEdit] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  if (state.status === 'loading' || state.status === 'unlinked') {
    return (
      <div className="page">
        <div className="wrap">
          <p className="page-sub" style={{ marginTop: 0 }}>Loading…</p>
        </div>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="page">
        <div className="wrap">
          <div className="note note-error">Couldn't load your profile: {state.message}</div>
        </div>
      </div>
    );
  }

  const original = state.me.contact;
  const fullName = nameEdit ?? original.fullName ?? '';
  const title = titleEdit ?? original.title ?? '';
  const trimmedName = fullName.trim();
  const trimmedTitle = title.trim();
  const dirty = trimmedName !== (original.fullName ?? '') || trimmedTitle !== (original.title ?? '');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!dirty || saving) return;
    setError(null);
    setSaving(true);
    try {
      await api.patch<Me>('/me', {
        fullName: trimmedName || null,
        title: trimmedTitle || null,
      });
      // Drop the local overlays so the form reflects the fresh server data
      // that refreshMe() is about to pull in.
      setNameEdit(null);
      setTitleEdit(null);
      refreshMe();
      setSavedAt(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <div className="wrap">
        <header className="page-head">
          <span className="eyebrow eyebrow-mint">Your details</span>
          <h1>Profile</h1>
          <p className="page-sub">
            What we and other people at {state.me.sponsor.name} see about you.
          </p>
        </header>

        <form className="card" onSubmit={onSubmit} noValidate style={{ maxWidth: 560 }}>
          {error && (
            <div className="note note-error" style={{ marginBottom: 18 }} role="alert">
              {error}
            </div>
          )}

          {savedAt && !dirty && !error && (
            <div className="note note-ok" style={{ marginBottom: 18 }} role="status">
              Saved.
            </div>
          )}

          <div className="field">
            <label className="label" htmlFor="fullName">Full name</label>
            <input
              id="fullName"
              type="text"
              className="input"
              placeholder="Jane Rivera"
              autoComplete="name"
              maxLength={200}
              value={fullName}
              onChange={(e) => setNameEdit(e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              className="input"
              placeholder="Head of University Recruiting"
              autoComplete="organization-title"
              maxLength={200}
              value={title}
              onChange={(e) => setTitleEdit(e.target.value)}
              disabled={saving}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={!dirty || saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>

          <hr className="meta-rule" />

          <p className="meta-key">Email</p>
          <p className="meta-val">{original.email}</p>

          <p className="meta-key">Role</p>
          <p className="meta-val" style={{ textTransform: 'capitalize' }}>{original.role}</p>

          <p className="hint">
            To change your email or role, email us and we'll sort it out.
          </p>
        </form>
      </div>
    </div>
  );
}
