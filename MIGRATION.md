# Petrobras → Edge Delivery Services — Migration Log

> **Purpose of this file:** a running, date-ordered record of what we're migrating,
> where we are, what's done, and what's still open. Read this first before picking
> up work — it saves you from re-deriving decisions and re-hitting solved bugs.
> Keep it updated as you go (newest dated entry at the bottom of the log).

---

## 1. What we're doing

Migrating **https://petrobras.com.br/** to **Adobe Edge Delivery Services (EDS)** with the
goal of **100% visual + functional parity across mobile, tablet, and desktop**.

- **Source of truth for design:** the current **live site** (`petrobras.com.br`), sampled
  page-by-page. Notable reference pages:
  - Homepage `/` — dark full-bleed hero (header must be white-overlay here)
  - `/bolivia` — `hero (diagonal-split)` + white-top page (header must be light/green here)
  - `/produtos-mais-sustentaveis` — `cards (grid)`
  - `/transicao-energetica` — `cards (icon)`
  - `/quem-somos/tipos-de-fertilizantes` — `cards (feature)`
- **Repo:** `main--ema-petrobras--meejain` (owner `meejain`).
  - Preview: `https://main--ema-petrobras--meejain.aem.page/`
  - Live: `https://main--ema-petrobras--meejain.aem.live/`
  - Local dev: `http://localhost:3000` — **reflects local uncommitted code** (this is the
    primary place we validate before pushing).

## 2. Ground rules (from AGENTS.md — do not violate)

- **No-build**, vanilla ES modules, `.js` in imports, block-scoped CSS, no `!important`
  (except the `.full-width` escape hatch).
- **Mobile-first, `min-width` only.** Breakpoints are the source's set recorded in
  `tools/quality/breakpoints.json`: **576 / 768 / 992 / 1280**. Never mix min/max.
- **Never modify** `scripts/aem.js`, `head.html`, `package-lock.json`, `node_modules/`.
- **Quality gate before claiming done** (paste real output):
  1. `npm run lint`
  2. `node tools/quality/breakpoint-check.mjs`
  3. `npm run check:svg` (only if `icons/*.svg` changed)
  4. `npm run test:a11y <url>` (any UI/CSS change)
  - Pre-existing noise: lint shows **7 `no-console` warnings** in `tests/a11y/*` — these
    are expected and NOT from our code (0 errors is the pass bar).

## 3. Content / preview quirks (important, cost us time)

- The **block-samples draft pages are NOT served** at `/drafts/...` or
  `/content/drafts/...html` by the local dev server (they 404 — they need previewed CMS
  content). To validate a block locally, build a **temporary standalone harness** under
  `drafts/` at the repo root and load the real block CSS/JS, e.g.
  `drafts/hero-ds-test.html`, then delete it afterward. Gotchas for the harness:
  - EDS `styles.css` keeps `body { display:none }` until page JS adds an `appear` class —
    add `body { display:block !important }` in the harness.
  - Sections/blocks need `data-section-status="loaded"` / `data-block-status="loaded"`
    to become visible.
- **Content is protected:** a hook blocks `rm` under `content/`. Don't try to delete
  content files; leftover intermediate files there are gitignored/harmless.
- **NEVER hand-write HTML into `content/`** — use the bundled import script (per AGENTS.md).

## 4. Blocks — current status

| Block | Variant(s) | Status | Reference page |
|---|---|---|---|
| `header` | desktop + mobile | ✅ parity (see open item on homepage theme) | `/` and `/bolivia` |
| `hero` | default (dark banner) | ✅ | `/` |
| `hero` | `diagonal-split` | ✅ reworked (see log) | `/bolivia` |
| `cards` | `grid` | ✅ | `/produtos-mais-sustentaveis` |
| `cards` | `icon` | ✅ | `/transicao-energetica` |
| `cards` | `feature` | ✅ | `/quem-somos/tipos-de-fertilizantes` |
| `featured-news` | — | ✅ | homepage news strip |
| `slider-cards` | — | ✅ | homepage |
| `banner-notice` | — | ✅ | homepage notice |
| `columns` | — | ✅ | — |
| `footer` | — | ✅ | site-wide |
| `widget` / `fragment` | — | present | — |

Sample pages live in `content/drafts/block-samples/*.plain.html` (+ an `index`), with local
PNG icons for the card samples.

## 5. Key design decisions / implementation notes

- **Header theme (dark vs light) is PURE CSS, no JS.** Driven by:
  `body:has(main .hero:not(.diagonal-split)) header .nav-wrapper:not(.is-compact, .is-open) .SELECTOR { ...white overlay... }`
  - Dark full-bleed hero present (e.g. homepage) → **white** nav links + dark utility overlay.
  - No hero / `.hero.diagonal-split` (white-top pages) → **light** theme (green links, dark utility text).
  - **Why CSS not JS:** the old JS class-toggle (`has-hero-banner` via `MutationObserver`)
    had a race that left the homepage first-row links green/invisible over the dark hero.
    The `:has()` selector reacts to the DOM directly, no timing dependency, can't flash wrong.
  - This introduced expected `no-descending-specificity` stylelint hits on the
    `.is-open` / `.is-compact` state overrides (they legitimately follow the higher-specificity
    `:has()` rules and don't actually conflict) — silenced with scoped
    `/* stylelint-disable no-descending-specificity */` blocks.
- **Hero `diagonal-split` geometry — single source of truth.** Both the image `clipPath`
  and the decorative gold outline are generated in `hero.js` from ONE shared corner array
  `HERO_DS_CORNERS` (objectBoundingBox units). The outline is a mathematical offset "echo"
  (`outsetCorners`) of the clip, with rounded corners (`roundedQuadPath`).
  - **Why:** originally the clip and outline were two independently hand-tuned paths that
    drifted apart, making the gold line look like a frame *around* the container instead of
    a line cutting *across* the clipped photo. Tying them together prevents recurrence.
  - Current corners: TL `(0.33, 0.22)` (steep ~1/3-in left cut), TR `(0.99, 0.05)`,
    BR `(1, 0.86)`, BL `(0.01, 0.71)`. Round `0.025`, outset `0.035`.
  - Outline stroke: **1.3px**, color `--hero-ds-outline: #e6a817` (warm amber).
  - Overflow: `.hero.diagonal-split` is `overflow: visible` (outline can peek out); scroll
    containment is at `.section.hero-container:has(.hero.diagonal-split) { overflow: hidden }`.
  - Desktop layout: content inset `padding: 40px 0 40px 12.7%`, content column `521px`,
    media `min-width: 780px` so the photo bleeds off the right edge (source parity).

## 6. Open issues / TODO

- ⚠️ **Homepage header 1st-row color** — user reports it is STILL not correct in their view
  (deferred by user: "we'll check that later"). Code-side, the pure-CSS `:has()` fix computes
  white links locally (verified `rgb(255,255,255)`), but the user still sees an issue —
  **needs another look with the user on the actual preview they're viewing.** Re-confirm
  whether it's the `.aem.page`/`.aem.live` env vs local, and whether a hard cache refresh is involved.
- Continue per-page parity validation as more pages are migrated.

---

## 7. Date-ordered log

### 2026-08-18
- Enabled guardrails; discovered & fixed the site breakpoints → `tools/quality/breakpoints.json`
  set to **576 / 768 / 992 / 1280** (source-derived).
- Added initial batch of blocks (7), plus `featured-news`, `header`, `hero`.

### 2026-08-19
- Iterated `header`, `hero`, `slider-cards`, `featured-news`.
- **Mobile header** deep-dive & parity fixes: 73px bottom bar, 56px contained center
  hamburger/X button, expandable menu panel, accordions, source SVG icons.
  - **Idioma** panel → green sliding pill toggle (globe, "Selecione um idioma:", PT/Inglês),
    highlighted-option styling.
  - **Acessibilidade** toggle-cards; **Canais** cards with green PNG icons (64px).
  - Fixed submenu gap (equal 16px), bottom-bar active highlight (green focus ring, no gold box).
- Built **`content/drafts/block-samples/`** with a sample page per block + `index`.
- Implemented / parity-fixed four blocks: hero `diagonal-split`, cards `grid`, cards `icon`,
  cards `feature`. Extracted source icons → PNG for samples.

### 2026-08-19 → 2026-08-20 (header theme saga)
- **Bug:** homepage first-row nav links rendered green/invisible over the dark hero after we
  added hero-color-based theming. Multiple JS approaches (load listeners → MutationObserver →
  inverted default) all had race conditions.
- **Resolution:** rewrote the theme as **pure CSS `:has()`** (no JS class toggling); removed
  the `settleHeaderTheme()` + observer logic from `header.js`. Verified locally: homepage nav
  links `rgb(255,255,255)`; no-hero page links green `rgb(0,133,66)`.
- ⚠️ User still reports the homepage 1st row looks off in their view — **left open** (see §6).

### 2026-08-20 (hero diagonal-split refinement)
- Reworked the gold outline + clip to a **shared-corner generator** so the border traces the
  clipped photo (was drifting as a container frame).
- **Round 1:** steepened left edge, thickened stroke to 3px, warm amber `#e6a817`, outline as
  offset echo peeking past corners. Matched better but border still read as a frame.
- **Round 2 (per user's precise measurements):**
  1. Moved `overflow: hidden` off `.hero.diagonal-split` (now `visible`) onto
     `.section.hero-container:has(.hero.diagonal-split)` — fixes outline being clipped +
     hero overflowing near the header, while still preventing horizontal scroll.
  2. Steepened clip diagonal — TL from `x=0.125` → **`x=0.33`** (dramatic ~1/3-in cut).
  3. Border now traces the steep clipped surface & flies off past the right edge; stroke
     reduced **3px → 1.3px** to match source's delicate line.
  - Verified at 1440px + mobile (390px) against live `/bolivia`: steep diagonal, thin gold
    line tracing the clipped edge and exiting right, rounded corners — close match.
    Confirmed **no horizontal scrollbar** (doc width == viewport width).

---

## 8. Quick-start for the next iteration

1. Read §1–§6 above.
2. `npm install` if needed; start dev server:
   `npx -y @adobe/aem-cli up --no-open --forward-browser-logs` (background).
3. To validate a block visually, use a temporary root-level `drafts/*.html` harness (see §3),
   compare against the live source page, then delete the harness.
4. Always run the quality gate (§2) and paste output before claiming done.
5. Update §7 with a dated entry describing what you changed and any new gotchas.
