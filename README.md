# ColorStack @ GSU Sponsor Portal

Sponsors sign in, see their sponsorship and what we need from them, generate invoices,
and pay by card, bank transfer, or wire. Deploys to **sponsors.colorstackatgsu.com**.

**Status: steps 1 and 2 of 11 complete.** The design system, routing, and page shells are
in place and read from `src/data/mock.ts`. Nothing talks to a backend yet. Forms are
deliberately inert rather than faked.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run lint
```

## Architecture

This repo is the **frontend only**. Server-side lives in `../cs-gsu_backend`.

| Concern | Owner |
|---|---|
| Auth (invite, password, sessions, reset) | Supabase Auth |
| Database, file storage | Supabase Postgres and Storage |
| Business logic (invoices, Stripe, email, admin) | One Spring Boot service |
| Static hosting | Vercel |

`@supabase/supabase-js` is used in the browser for **authentication only**, to get and
refresh a session. Every data read and write goes to the Spring API with the Supabase
access token as a `Bearer` header. The frontend never queries tables directly.

An earlier version of this plan put business logic in several Supabase Edge Functions.
That was dropped: one testable service beats five scattered Deno files, particularly for
invoice numbering and webhook idempotency, which want real tests around them.

## House style

**No em dashes.** Not in UI copy, not in comments, not in this file. Use a colon, a
comma, parentheses, or two sentences.

## Design system

Modelled on **app.colorstack.io**, not on `../cs-gsu_official_website`. This is a
deliberate split: the marketing site is a marketing site (dark navy, Montserrat, pill
buttons, uppercase eyebrows), and this is an application, which should get out of the
way. The chapter's own member portal should move to this language too.

The source of truth is the `:root` block in [`src/index.css`](src/index.css), **not**
`tailwind.config.js`.

- White surface `#ffffff`, subtle `#f9fafb`, hairline rules `#e5e7eb`
- Ink `#111827`, muted `#6b7280`, faint `#9ca3af`
- GSU blue `#0039A6` is the **only** accent: primary buttons, links, active nav, focus
  rings. Nothing else is coloured for decoration
- 8px corners, `ui-sans-serif / system-ui`, sentence case, no letter-spacing
- Plain sticky top bar with a hairline under it, not a floating pill

What was deliberately removed: dark navy surfaces, Montserrat, fully-rounded pill
buttons, uppercase wide-tracked eyebrow labels, gradients and blurred colour orbs. All
of it was decoration doing no work.

Sign in and account setup centre a card on a faintly tiled chapter mark. The mark is a
filled circle, so it is tiled small, sparse, and masked out towards the middle: tiled
tightly it reads as a grey block field rather than as texture.

### Sponsor brand theming (step 10, not built yet)

`--brand`, `--brand-hover`, `--brand-soft` and `--brand-ink` default to GSU blue and get
overwritten per sponsor at runtime.

Two rules when that lands:

- **Accents only.** They are already scoped to buttons, links, the active nav item and
  focus rings. Do not widen that set. A brand colour that recolours everything means one
  bad hex wrecks the whole page.
- **Contrast floor.** If a brand colour fails 4.5:1 against white, fall back to GSU blue.
  A pale yellow brand on a white page is invisible.

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
2. **Design pass, solid GSU blue backdrop** (done)
3. Supabase local, schema, `app_api` role, RLS negative tests
4. Spring Boot service: JWT validation and `GET /api/me`
5. Frontend auth wired, `src/data/mock.ts` deleted
6. Invoices via the API, no payment yet
7. Stripe in test mode, card and ACH, idempotent webhook
8. Email via Resend, invoice and receipt
9. Admin pages
10. Sponsor brand theming
11. Production

Member directory and resume book wait until `../cs-gsu_member_portal` moves onto the same
backend. It is a scaffold today.
