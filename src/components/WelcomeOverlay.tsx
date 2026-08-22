import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Me } from '../hooks/useMe';
import { paletteFromHex } from '../lib/brand';

/**
 * The brief moment between "verify-code succeeded" and "the dashboard is on
 * screen." Sits full-screen in the sponsor's own brand colour, fades their
 * name in, draws a checkmark, then hands off to /dashboard.
 *
 * Fetches /me in parallel with the animation so the colour and name land as
 * early as possible. If /me is slow or fails, we fall back to a plain
 * "signing you in" and the default GSU blue — a bad fallback is better than
 * blocking the sign-in on a display detail.
 *
 * Timing: total ~1.5s, split so that the sponsor name has time to read (600ms
 * fade-in, 700ms display, 200ms fade-out). onComplete fires at the end and
 * the caller navigates to /dashboard.
 */
const TOTAL_MS = 1500;

interface Props {
  onComplete: () => void;
}

export default function WelcomeOverlay({ onComplete }: Props) {
  const [me, setMe] = useState<Me | null>(null);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // Fire this off, don't await. The animation should not wait on the API:
    // if it succeeds in time, we personalise; if not, the fallback shows.
    api.get<Me>('/me').then(
      (result) => { if (!cancelled) setMe(result); },
      () => { /* fall back to defaults, do not surface the error here */ },
    );
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    // Two timers: begin fading out just before the end so the transition
    // completes right as we navigate away, avoiding a hard cut.
    const fadeAt = window.setTimeout(() => setFadingOut(true), TOTAL_MS - 200);
    const doneAt = window.setTimeout(onComplete, TOTAL_MS);
    return () => {
      window.clearTimeout(fadeAt);
      window.clearTimeout(doneAt);
    };
  }, [onComplete]);

  const palette = paletteFromHex(me?.sponsor.brandHex);
  const bg = palette?.brand ?? '#0039A6'; // fallback: GSU blue
  const ink = palette?.brandInk ?? '#ffffff';
  const sponsorName = me?.sponsor.name ?? 'Welcome';

  return (
    <div
      className={fadingOut ? 'welcome-overlay is-leaving' : 'welcome-overlay'}
      /* backgroundColor, not background: the shorthand would wipe out the dot
         pattern the stylesheet paints over this. */
      style={{ backgroundColor: bg, color: ink }}
      role="status"
      aria-live="polite"
      aria-label={me ? `Signing you in as ${me.contact.fullName ?? me.contact.email} at ${sponsorName}` : 'Signing you in'}
    >
      <div className="welcome-inner">
        {/* Ink frame, yellow fill, ink check. Yellow rather than the sponsor's
            colour: the brand already owns the full-screen background, and a dark
            brand would swallow a black check mark drawn on top of it. */}
        <svg className="welcome-check" viewBox="0 0 60 60" width="62" height="62" aria-hidden="true">
          <rect x="3" y="3" width="54" height="54" fill="var(--yellow)" stroke="currentColor" strokeWidth="3.5" />
          <path
            d="M17 31 L26 40 L43 21"
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="square"
            strokeLinejoin="miter"
          />
        </svg>
        <p className="welcome-hi">Welcome</p>
        <p className="welcome-sponsor">{sponsorName}</p>
      </div>
    </div>
  );
}
