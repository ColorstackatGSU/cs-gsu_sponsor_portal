import { describe, expect, it } from 'vitest';
import { paletteFromHex } from './brand';

describe('paletteFromHex', () => {
  it('returns null for missing or malformed input', () => {
    expect(paletteFromHex(null)).toBeNull();
    expect(paletteFromHex(undefined)).toBeNull();
    expect(paletteFromHex('')).toBeNull();
    expect(paletteFromHex('not-a-hex')).toBeNull();
    expect(paletteFromHex('#abc')).toBeNull(); // 3-digit shorthand not supported
    expect(paletteFromHex('#gggggg')).toBeNull();
  });

  it('normalises the hex and accepts with or without leading #', () => {
    const withHash = paletteFromHex('#0039A6');
    const withoutHash = paletteFromHex('0039A6');
    const lower = paletteFromHex('#0039a6');
    expect(withHash?.brand).toBe('#0039a6');
    expect(withoutHash?.brand).toBe('#0039a6');
    expect(lower?.brand).toBe('#0039a6');
  });

  it('picks white ink on a dark brand and dark ink on a light brand', () => {
    // GSU blue is dark: white text clears the contrast floor.
    expect(paletteFromHex('#0039A6')?.brandInk).toBe('#ffffff');
    // A very pale colour should get near-black ink instead.
    expect(paletteFromHex('#FFF8DC')?.brandInk).toBe('#091024');
  });

  it('derives a darker hover shade and a paler soft shade', () => {
    const p = paletteFromHex('#0039A6');
    expect(p).not.toBeNull();
    // Hover is darker (roughly 15% mixed with black), soft is much lighter.
    // Just sanity-check ordering rather than exact bytes so a heuristic
    // tweak does not require rewriting the test.
    const brandLum = hexToBrightness(p!.brand);
    const hoverLum = hexToBrightness(p!.brandHover);
    const softLum = hexToBrightness(p!.brandSoft);
    expect(hoverLum).toBeLessThan(brandLum);
    expect(softLum).toBeGreaterThan(brandLum);
  });
});

/** Naive brightness proxy for ordering — not a WCAG luminance, just enough
 *  to compare "darker vs lighter" between siblings derived from the same base. */
function hexToBrightness(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 0xff;
  const g = (n >> 8) & 0xff;
  const b = n & 0xff;
  return r + g + b;
}
