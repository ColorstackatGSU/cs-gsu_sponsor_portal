/**
 * Turns a sponsor's `brand_hex` into the four CSS vars the design system reads:
 * --brand (the base), --brand-hover (a darker step for :hover), --brand-soft
 * (a very pale tint for focus rings / hover backgrounds), and --brand-ink (the
 * text colour that sits on --brand, chosen for contrast).
 *
 * A single hex value is enough because the derivation is deterministic. A
 * sponsor who wants full control lands in step 10; this function handles the
 * "we just picked one colour off their logo" case.
 *
 * Contrast floor is deliberately low (WCAG AA on large text, 3:1) rather than
 * AAA. A sponsor whose brand fails 3:1 against every reasonable text colour is
 * usually a very-pale pastel, and forcing them off-brand there is worse than
 * showing them their own colour at reduced contrast. If we ever need stricter,
 * bump `MIN_CONTRAST_RATIO`.
 */
const HEX_RE = /^#?([0-9a-fA-F]{6})$/;
const MIN_CONTRAST_RATIO = 3;

export interface BrandPalette {
  brand: string;       // "#RRGGBB", the sponsor's colour, normalised
  brandHover: string;  // ~15% darker
  brandSoft: string;   // very pale tint for focus/hover backgrounds
  brandInk: string;    // "#ffffff" or "#091024" — whichever hits contrast
}

export function paletteFromHex(hex: string | null | undefined): BrandPalette | null {
  if (!hex) return null;
  const match = HEX_RE.exec(hex.trim());
  if (!match) return null;

  const rgb = hexToRgb(match[1]);
  const brand = '#' + toHex(rgb);
  const brandHover = '#' + toHex(mixWithBlack(rgb, 0.15));
  const brandSoft = '#' + toHex(mixWithWhite(rgb, 0.92));

  // Pick the ink colour that gives better contrast; if neither clears the
  // floor, keep the design's default ink (#091024, near-black) so text never
  // becomes unreadable.
  const white = { r: 255, g: 255, b: 255 };
  const darkInk = { r: 9, g: 16, b: 36 }; // matches --ink in index.css
  const withWhite = contrastRatio(rgb, white);
  const withDark = contrastRatio(rgb, darkInk);
  const brandInk =
    withWhite >= withDark
      ? (withWhite >= MIN_CONTRAST_RATIO ? '#ffffff' : '#091024')
      : (withDark >= MIN_CONTRAST_RATIO ? '#091024' : '#091024');

  return { brand, brandHover, brandSoft, brandInk };
}

interface Rgb { r: number; g: number; b: number; }

function hexToRgb(sixHex: string): Rgb {
  const n = parseInt(sixHex, 16);
  return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff };
}

function toHex({ r, g, b }: Rgb): string {
  return [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('');
}

function mixWithBlack(rgb: Rgb, amount: number): Rgb {
  const k = 1 - amount;
  return {
    r: Math.round(rgb.r * k),
    g: Math.round(rgb.g * k),
    b: Math.round(rgb.b * k),
  };
}

function mixWithWhite(rgb: Rgb, amount: number): Rgb {
  return {
    r: Math.round(rgb.r + (255 - rgb.r) * amount),
    g: Math.round(rgb.g + (255 - rgb.g) * amount),
    b: Math.round(rgb.b + (255 - rgb.b) * amount),
  };
}

/**
 * WCAG relative luminance + contrast ratio. Straight out of the WCAG 2.x spec,
 * sRGB gamma decoded per channel before the 0.2126/0.7152/0.0722 weighted sum.
 */
function relativeLuminance({ r, g, b }: Rgb): number {
  const chan = (c: number): number => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);
}

function contrastRatio(a: Rgb, b: Rgb): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}
