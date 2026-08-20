import { useEffect } from 'react';
import { useMe } from '../hooks/useMe';
import { paletteFromHex } from '../lib/brand';

/**
 * Overrides the design system's --brand vars with the signed-in sponsor's own
 * colour, once /me has loaded and iff the sponsor set a brand_hex. Removes the
 * overrides on sign-out so the next visitor sees the default GSU blue again.
 *
 * Renders nothing. Mounted inside the signed-in shell in Layout.tsx.
 */
export default function SponsorBrandTheme() {
  const me = useMe();

  useEffect(() => {
    if (me.status !== 'ready') return;
    const palette = paletteFromHex(me.me.sponsor.brandHex);
    if (!palette) return;

    const root = document.documentElement;
    root.style.setProperty('--brand', palette.brand);
    root.style.setProperty('--brand-hover', palette.brandHover);
    root.style.setProperty('--brand-soft', palette.brandSoft);
    root.style.setProperty('--brand-ink', palette.brandInk);

    return () => {
      root.style.removeProperty('--brand');
      root.style.removeProperty('--brand-hover');
      root.style.removeProperty('--brand-soft');
      root.style.removeProperty('--brand-ink');
    };
  }, [me]);

  return null;
}
