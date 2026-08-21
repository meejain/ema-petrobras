# Block-building playbook (Petrobras → EDS migration)

Read this fully before building. It captures the repo conventions so every block
is instrumented the same way. Also read `AGENTS.md` (root) and, when the trigger
matches, the relevant `skills/*` (e.g. `eds-code-conventions`, `responsive-breakpoints`,
`accessibility`, `container-block-vs-section-style`).

## Non-negotiable rules
- **No build**, vanilla ES modules, `.js` extensions in imports, block-scoped CSS.
- **No `!important`** (except the documented `.full-width` escape hatch).
- **Mobile-first, `min-width` only.** Breakpoints are **576 / 768 / 992 / 1280**
  (from `tools/quality/breakpoints.json`). NEVER mix `min-width` and `max-width`.
- **Never modify** `scripts/aem.js`, `head.html`, `package-lock.json`, `node_modules/`.
- **Scope every selector to the block**: `.blockname .part` (never bare `.part`,
  never `.blockname-container`/`.blockname-wrapper`).
- **Alt text**: content images get descriptive `alt`; decorative get `alt=""`.
- Sanitize any external/author HTML with DOMPurify before `innerHTML`; prefer
  `textContent`. No `eval`/`new Function`. No secrets.

## Block anatomy
- `blocks/<name>/<name>.js` — exports `export default async function decorate(block) {}`.
- `blocks/<name>/<name>.css` — block-scoped styles.
- Variants are extra classes on the block (`.cards.grid`), detected via
  `block.classList.contains('grid')`. Author them as the 2nd+ class in the table
  head (e.g. `Cards (grid)`), which EDS turns into `class="cards grid"`.

## Authoring/content model (EDS tables)
Authored block content arrives as nested divs: `.block > div(row) > div(cell)`.
Inspect the DOM you must decorate with `curl` or `browser_evaluate` BEFORE coding.
Handle authors omitting/adding cells gracefully.

## Sample pages (how to demo a block locally)
Sample pages live in `content/drafts/block-samples/<name>.plain.html`.
**DO NOT hand-write HTML into `content/`.** Instead write a Node generator under
`tools/samples/build-<name>-sample.mjs` that `writeFile`s the `.plain.html`
(follow `tools/samples/build-orgchart-sample.mjs` as the template), then run it.
Each sample page structure (one top-level `<div>` per EDS section):
1. Section 1: a `spacer` block (Desktop 180px / Tablet 170px / Mobile 96px) to
   clear the fixed header.
2. Section 2: `<h1>` title + `<p>` one-line description, a `spacer`
   (Desktop 48px / Mobile 40px), the demoed block, then another 48/40 `spacer`.
Serve at `http://localhost:3000/content/drafts/block-samples/<name>` (no `.plain.html`).
If the dev server 404s the new page, it may need a moment; the local server serves
local content directly.

## Source of truth
The live site `https://petrobras.com.br/...` is the design source. Measure exact
computed styles with Playwright `browser_evaluate` (getComputedStyle). Dismiss the
cookie banner first (click a button matching /Aceitar todos|Rejeitar todos|Permitir todos/).
AVOID full-page `browser_snapshot`/`browser_take_screenshot` unless pixel QA is
truly needed — they are token-expensive. Prefer `browser_evaluate` returning small
JSON of measurements (font, color, padding, gap, border, radius, layout at widths).

## Verify before claiming done (paste real output)
1. `npm run lint` — must be 0 errors (7 pre-existing a11y `no-console` warnings are OK).
2. `node tools/quality/breakpoint-check.mjs` — must pass.
3. `npm run test:a11y http://localhost:3000/content/drafts/block-samples/<name>` —
   fix critical/serious. NOTE: brand-color contrast on Petrobras swatches
   (orange #ed8b00, cyan #00b2a9) is a known parity-vs-WCAG exception kept per the
   content owner — flag it, don't "fix" by changing brand colors.
4. Verify layout at 390 / 768 / 1440 against the live source (no horizontal overflow;
   docWidth == innerWidth).

## When done
Return a concise summary (≤150 words): what block/variant, files touched, key
measurements matched, gate results. Do NOT paste large DOM dumps.
