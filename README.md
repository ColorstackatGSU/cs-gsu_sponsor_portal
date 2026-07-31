# ColorStack @ GSU Sponsor Portal

Sponsors sign in, see their sponsorship and what we need from them, generate invoices,
and pay by card, bank transfer, or wire. Deploys to **sponsor.colorstackatgsu.com**.

**Status: step 1 of 10 complete.** The design system, routing, and page shells are in
place and read from `src/data/mock.ts`. Nothing talks to a backend yet. Forms are
deliberately inert rather than faked.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run lint
```

## House style

**No em dashes.** Not in UI copy, not in comments, not in this file. Use a colon, a
comma, parentheses, or two sentences.

## Design system

Ported from `../cs-gsu_member_portal`, which ported it from
`../cs-gsu_official_website`. The source of truth is the `:root` block in
[`src/index.css`](src/index.css), **not** `tailwind.config.js`.

The main site's `tailwind.config.js` declares Space Grotesk and its `index.css` has a
stale Space Grotesk `@import`, but its `--display` and `--mono` vars both resolve to
**Montserrat** and every component reads those vars, so Space Grotesk never renders.
This repo drops the dead config and uses Montserrat throughout.

- Paper `#091024`, warm panel `#0d152d`, ink `#ffffff` (dark only)
- GSU blue `#0039A6`, bright `#1d56c9`, dim `#002a7a`, sky `#97CAEB`, red `#CC0000`
- Fully-rounded buttons, uppercase 13px Montserrat, `0.04em` tracking
- Floating white pill navbar, `rgba(255,255,255,0.92)` with `blur(20px)`

**Sign in and account setup are light**, a white card over a blueprint-grid backdrop.
Everything behind the login stays dark navy. The light overrides are all scoped to
`.auth-card` / `.auth-page`.

The member portal floats its auth card over a photo mosaic. This repo has no photo set
of its own, so `Backdrop.tsx` draws a GSU-blue grid instead. If the chapter ever wants
the mosaic here, copy `PhotoMosaic.tsx` and its build script across.

### Sponsor brand theming (step 9, not built yet)

`--sponsor-brand*` and `--sponsor-ink` in `:root` currently resolve to GSU blue, so an
unthemed page is indistinguishable from the main site. They will be overwritten per
sponsor at runtime.

Two rules when that lands:

- **Accents only.** Buttons, eyebrow rules, the tier card, active nav. The page surface
  stays `--paper`. A brand colour that recolours everything means one bad hex wrecks the
  whole page.
- **Contrast floor.** If a brand colour fails 4.5:1 against `--paper`, fall back to GSU
  blue. A dark navy sponsor brand on a dark navy page is invisible.

## Money-safety rules

Load-bearing. Violating any one of them is how a student org loses money.

1. **Prices never come from the client.** The client sends a tier id, the server looks
   up the price.
2. **Only the Stripe webhook marks an invoice paid.** Not the success redirect. The user
   can close the tab, and a redirect URL is trivially forgeable.
3. **The webhook handler is idempotent**, keyed on the Stripe event id. Stripe retries,
   so double-crediting must be impossible.
4. **Verify the webhook signature** before reading the body.
5. **The `service_role` key never enters `src/` or the repo.** Edge Functions only.
6. **Issued invoices are append-only.** Changing a tier voids the old invoice and issues
   a new one with a new number. Never mutate an issued invoice's amount.
7. **Money is integer cents**, never a float. Formatting happens once, in
   `src/lib/format.ts`.

## The invoice is the page

`InvoiceDetail.tsx` is the invoice, not a preview of one. The sponsor's AP department
prints it to PDF and files it, and the `@media print` block in `index.css` strips the app
chrome and flips it to black on white. There is deliberately no second PDF renderer that
could drift out of sync with what is shown on screen.

Two traps already hit once, both caught by the screenshot check below:

- **Do not hide the bare `header` tag in print.** The invoice has its own `<header>`
  holding the logo, the invoice number and the dates. A blanket rule prints an invoice
  with no letterhead and no number on it. Target `.app-nav`.
- **`Layout` sets the page background inline**, which outranks any plain print rule.
  `.app-shell` needs `background: #fff !important` or the whole sheet prints navy.

## Verifying a change

There is no test runner yet. Until there is, the screenshot pass catches the things that
actually break: horizontal overflow on a phone, console errors, and the print layout.

```bash
npm run dev
# then, from ../cs-gsu_official_website (which has playwright installed):
node <scratch>/shots.mjs <out-dir>
```

It walks every route at 1440x900 and 390x844, asserts no horizontal overflow and no
console errors, and renders the invoice in print media to both PNG and PDF.

Check by hand at 1280x720 too: the auth pages are pinned to one viewport and adding a
field there means taking height back somewhere else, or the form starts scrolling.

## Known dependency advisory

`npm audit` reports a high-severity React Router advisory
([GHSA-qwww-vcr4-c8h2](https://github.com/advisories/GHSA-qwww-vcr4-c8h2), RSC-mode CSRF).

It does not apply here: this is a plain SPA using `BrowserRouter` with no RSC and no data
actions. `npm audit fix` cannot resolve it either, because `react-router-dom` is only
published to 7.18.2 while the patch landed in `react-router` 8.3.0, and forcing a v8 core
under a v7 DOM package would break routing for no real gain.

Re-check when `react-router-dom` 8.x ships. The main site and member portal carry the
same dependency.

## Open items before real money moves

- Real sponsorship tier names and amounts. The ones in `src/data/mock.ts` are invented.
- Bank details for wire and check remittance, in `src/data/org.ts`. The invoice hides the
  remittance block until these are filled in rather than printing a placeholder account
  number a sponsor might try to pay against.
- The legal entity name and address for the invoice bill-from block, plus whether the
  chapter bills under its own name or through the GSU foundation. **This affects the
  sponsor's tax treatment, so confirm before issuing any real invoice.**
- The EIN, which corporate AP departments will ask for.
- Whether sponsorships run per fiscal year or per academic year, which sets the invoice
  number year and the default due date.

## Build order

1. **Scaffold that runs** (done)
2. Design pass on the sponsor-facing shell
3. Supabase local, schema, RLS negative tests
4. Auth: invite, set password, password login, reset
5. Invoices, no payment yet
6. Stripe in test mode, card and ACH, webhook
7. Email via Resend, invoice and receipt
8. Admin pages
9. Sponsor brand theming
10. Production

Member directory and resume book wait until `../cs-gsu_member_portal` is actually wired
to Supabase. It is a scaffold today.
