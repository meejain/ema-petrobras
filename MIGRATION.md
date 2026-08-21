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
| `hero` | `slider` (carousel) | ✅ | `/quem-somos/produtos` |
| `cards` | `grid` | ✅ | `/produtos-mais-sustentaveis` |
| `cards` | `icon` | ✅ | `/transicao-energetica` |
| `cards` | `feature` | ✅ | `/quem-somos/tipos-de-fertilizantes` |
| `cards` | `overlay` | ✅ | `/sustentabilidade` |
| `cards` | `audio` | ✅ (functional player) | `/sustentabilidade/biodiversidade` |
| `columns` | default | ✅ | `/bolivia` |
| `columns` | `stats` (KPI) | ✅ | `/en/transicao-energetica` |
| `columns` | `feature` | ✅ | `/sustentabilidade/biodiversidade` |
| `accordion` | base FAQ / `downloads` / `table-docs` | ✅ | `/transicao-energetica`, `/quem-somos/gasolina-podium`, `/quem-somos/concursos` |
| `tabs` | `content` / `categories` / `explorer` | ✅ | `/quem-somos/ouvidoria`, `/quem-somos/produtos`, `/sustentabilidade/biodiversidade` |
| `table` | `specifications` / `downloads` | ✅ | `/quem-somos/bunker`, `/quem-somos/estagios` |
| `video` | `youtube` (facade) | ✅ | `/quem-somos/gasolina` |
| `downloads` | list | ✅ | `/bolivia` |
| `timeline` | milestone | ✅ | `/bolivia` |
| `biome-explorer` | `map` + `overlay` | ✅ | `/sustentabilidade/biodiversidade` |
| `dashboard-tabs` | tabs + facade | ✅ container (proprietary backend) | `/sustentabilidade/dados-abertos` |
| `flipbook` | Issuu facade | ✅ | `/sustentabilidade/mudancas-climaticas` |
| `web-story` | portrait facade | ✅ container (source story offline) | `/w/web-stories/...` |
| `featured-news` | — | ✅ | homepage news strip |
| `slider-cards` | — | ✅ | homepage |
| `banner-notice` | — | ✅ | homepage notice |
| `footer` | — | ✅ | site-wide |
| `vlibras` | 3rd-party | ✅ global script (`scripts/delayed.js`) — not a block | site-wide |
| `widget` / `fragment` | — | present | — |

**Full block library instrumented.** All 34 variants from the discovery report
(`reference/Final Report petrobras.html`) now have a block + a sample page in
`content/drafts/block-samples/`. Custom Form (Filter) intentionally deferred (forms
plugin to be configured later).

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

- ✅ **Homepage header 1st-row color** — RESOLVED 2026-08-20. Root cause: the dark-hero
  `:has()` overlay only whitened the utility strip *background* + the "Você está em" label,
  but the rest of row 1 (the "Acesse também:" span, the 5 quick-access links, and the
  A-/100%/A+ font-size controls) kept their base `color: var(--text-color)` (dark `rgb(39,40,51)`),
  so they read dark/invisible over the dark hero. Added dark-hero overlay rules whitening those
  elements + lightening the font-size pill/contrast-ring borders. Verified all row-1 elements
  compute `rgb(255,255,255)` over the dark hero and match the source screenshot. Confined to the
  non-compact/non-open dark-hero state (light/white-top + scrolled/open states untouched).
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

### 2026-08-20 (homepage header row-1 fix)
- Fixed the long-open homepage 1st-row color bug (see §6). The dark-hero `:has()` theme
  wasn't covering all of row 1 — only the strip background + "Você está em" label were
  whitened. Added overlays for `.nav-utility-links > span`, `.nav-utility-links a`,
  `.nav-fontsize span`, `.nav-utility-controls button`, plus white borders on the font-size
  pill and contrast ring — all scoped to `body:has(main .hero:not(.diagonal-split))
  ... :not(.is-compact, .is-open)`. Wrapped the later `body.high-contrast` a:any-link block
  in a scoped `stylelint-disable no-descending-specificity` (same convention as the rest of
  the file). Gate: `npm run lint` 0 errors (7 expected a11y no-console warnings),
  `breakpoint-check` pass, `test:a11y http://localhost:3000/` pass.

### 2026-08-20 (hero diagonal-split parity fixes)
- **Fixed-nav overlap:** the header is `position: fixed` (152px desktop / 56px mobile) but the
  diagonal-split section had no top offset, so the photo's top corner tucked under the nav.
  Added `padding-top` to `.section.hero-container:has(.hero.diagonal-split)` — mobile height at
  base, `--nav-desktop-height` (152px) at ≥992px. **Scoped to diagonal-split only** so the
  homepage's default dark hero stays intentionally full-bleed UNDER the transparent header
  (verified: homepage hero section padding-top still 0, heroTop 0).
- **Outline color:** `--hero-ds-outline` `#e6a817` → **`#e8ad02`** (source-exact `.tertiary-graphism`
  stroke). Outline SVG was already a sibling of `<picture>` and already outset outside the clip
  via hero.js centroid math — left the working geometry intact.
- **Heading accent bar:** `::after` height `4px`→`4.1px`, margin-top `24px`→`26px` (source).
- **Outline alignment:** the gold line was hugging the clip edge (reading as "cutting through"
  the photo). Inspected source `.tertiary-graphism` (viewBox 0 0 615 722, but path coords span
  ~1314×790 → a large rounded parallelogram that FLOATS off the photo with a clear top-left gap
  and flies off right). Increased `HERO_DS_OUTSET` `0.035`→`0.075` in hero.js so the echo stands
  clearly off the photo on every side (offset amplified because the viewBox is stretched
  non-uniformly to the media's ~1.25 aspect via preserveAspectRatio:none). Now frames the photo
  like the source rather than tracing its edge.
- Gate: `npm run lint` 0 errors (7 expected a11y no-console warnings), `breakpoint-check` pass,
  `test:a11y …/hero-diagonal-split` pass. Verified at 1440px against live `/bolivia`.

### 2026-08-20 (slider-cards — mobile/tablet must STACK, not slide)
- **Corrected earlier misread.** Re-measured the source (homepage `/`) across widths: the product
  cards **stack vertically** (`flex-direction: column`, full-width cards, **arrows hidden**) at
  **<992px** — confirmed at 390 (stacked, no arrows) and 768 (stacked, no arrows). The horizontal
  scrolling slider only appears at **≥992px** (`flex-direction: row` in the source; 446px cards,
  arrows shown). My prior "peek slider on mobile" was wrong and diverged from the source.
- **Fix (slider-cards.css):** base is now a vertical stack — `.slider-cards-viewport { overflow-x:
  visible }`, `> ul { display:flex; flex-direction:column; gap:24px }`, and `.slider-cards-controls
  { display:none }`. The `@media (width >= 992px)` block re-asserts the slider: viewport
  `overflow-x:auto` + right-edge full-bleed, `ul` → `grid; grid-auto-flow:column;
  grid-auto-columns:446px; gap:32px; padding-right:space-big`, and controls `display:flex`. Removed
  the old ≥576 tablet rule (source stacks at 768).
- Verified vs source: 390 stacked full-width no arrows; 768 stacked full-width no arrows; 1440
  horizontal 446px slider with arrows, scrollable. Gate: `npm run lint` 0 errors, `breakpoint-check`
  pass, `test:a11y …/slider-cards` pass.
- NOTE: could not remove the `block-samples/index` page — content deletion is hook-blocked
  ("never delete existing content; use the import script"). Flag for the content owner to
  unpublish/delete via Document Authoring; it can't be done from the code repo.

### 2026-08-20 (cards icon — parity + global `.icon` collision fix)
- Validated `cards.icon` vs `/transicao-energetica` at 390/768/1440. Fixes:
  - **Image was wrong:** rendered small (130px, left-aligned, contain). Source icon is a large
    centred illustration **245px tall, full card width**. Changed `.cards.icon .cards-card-image img`
    → `width:100%; height:245px; object-fit:contain; object-position:center`.
  - **Airy card min-height** like the grid variant: `min-height:442px` (base) → `450px` at ≥992px
    (source cards measured ~442px mobile / ~450px desktop).
  - **Title** `22px` mobile → `24px` at ≥768px (source).
  - **Hover** lift added (`0 4px 16px rgba(0,0,0,.16)`), matching the site card hover.
- **Footer overlap ROOT CAUSE (pre-existing, not the spacer work):** the variant class `icon`
  collided with the boilerplate global `styles.css` rule `.icon { display:inline-block; height:24px;
  width:24px }`. That collapsed the whole `.cards.icon` block to 24×24, so its 450px card `<ul>`
  overflowed and bled over the footer. Fix: `.cards.icon { display:block; width:100%; height:auto }`
  resets the glyph rule. Verified: block now 450px, section grows to contain it, footer sits 112px
  below the cards (no overlap). Also wrapped the variant `:hover` rules in a scoped
  `stylelint-disable no-descending-specificity` (cross-variant ordering only, no real conflict).
- Verified all viewports: 1 col @390 (card 442, img 245, title 22), 3 col @1440 (card 450, img 245,
  title 24). Gate: `npm run lint` 0 errors, `breakpoint-check` pass, `test:a11y …/cards-icon` pass.

### 2026-08-20 (new `spacer` block + block-sample pages de-heroed)
- **Why:** the block-sample pages each opened with a placeholder `hero` (full banner) that
  existed only to push content clear of the fixed header — confusing when demoing an unrelated
  block. Replaced it with a lightweight, reusable **`spacer`** block.
- **New block `blocks/spacer/`:** `spacer.js` reads a `readBlockConfig` table
  (`Desktop`/`Tablet`/`Mobile` → CSS heights) and sets the block's inline height for the current
  breakpoint (≥1280 desktop, ≥992 tablet→falls back to mobile, else mobile), re-applied on resize;
  empties its own config markup so it renders as pure empty space. `spacer.css` is minimal
  (block-scoped, no visuals). Adapted from the user's sunstar snippet: import from `scripts/aem.js`
  (not lib-franklin), project breakpoints, resize listener, `.textContent=''` clear.
- **Sample pages (`content/drafts/block-samples/*.plain.html`):** transformed programmatically via
  `tools/samples/add-spacers.mjs` (idempotent; NOT hand-edited) — (1) swapped the placeholder hero
  section for a top `spacer` (180/170/96px desktop/tablet/mobile, clearing the 152/56px header),
  (2) wrapped each demoed sample block with 48px (40px mobile) `spacer` gaps above & below.
  `hero-diagonal-split` left as-is (the hero IS its demo block). `index` got only the top spacer.
- Verified on real content pages (not a drafts harness) at 1440/1000/390: top spacer 180/170/96,
  gaps 48/48/40, all spacers emptied, `<h1>` clears the fixed header (y=244/… /144), no placeholder
  hero remains on any page. Gate: `npm run lint` 0 errors (7 expected a11y no-console warnings),
  `breakpoint-check` pass, `test:a11y` pass on cards-grid + featured-news.

### 2026-08-20 (cards grid — hover effect added)
- **Missing:** the source cards lift on hover (`.card-container.has-hover:hover`), ours had no
  `:hover` rule at all. Source effect (measured): `box-shadow: var(--box-shadow-default)` =
  `0 4px 16px rgba(0,0,0,.16)`; no transform/border change; transition all/ease.
- **Fix (cards.css):** added `.cards.grid > ul > li:hover { box-shadow: 0 4px 16px rgb(0 0 0/16%) }`
  plus `transition: box-shadow 0.2s ease` on the card. Verified on real hover — the card computes
  `rgba(0,0,0,0.16) 0px 4px 16px`, matching the source.
- Gate: `npm run lint` 0 errors (7 expected a11y no-console warnings), `breakpoint-check` pass,
  `test:a11y …/cards-grid` pass.

### 2026-08-20 (cards grid — full-viewport parity validation vs /produtos-mais-sustentaveis)
- Validated the `cards.grid` variant against the source at 390 / 600 / 768 / 992 / 1280 / 1440.
- **Column progression matches exactly:** source 1→2→3 at (≤~575) / (576–991) / (≥992); ours uses
  the same `≥576→2`, `≥992→3` breakpoints. Confirmed 390=1, 600=2, 768=2, 992=3, 1440=3 both sides.
- **Card internals match** (measured @1440): border 1px #eee, radius 16px, padding 24px; title
  24px/700 #373737 (22px @mobile); yellow bar 24×3 #fdc82f under the title; image 148×104 radius 8
  (72×52 @mobile, top-right beside the title); body 14→16px/1.6 #373737; link 14→16px/700 #008542
  underline. Mobile (390): card width, title, and 72×52 image position all pixel-match the source.
- **Deltas fixed:** (1) body paragraph sat 20px below the image locally vs **24px** on the source —
  `.cards-card-body p` margin-top `20px`→`24px`. (2) body→link gap was 24px vs the source's **~29px**
  (the source body `<p>` carries a 1.8em/28.8px bottom margin before the link) — bumped the link
  paragraph `margin-top` `24px`→`28px`. Re-measured all within-card gaps @1440: pad-top 24, title
  top 25, title→bar 16–17, image→body 24, body→link 28 — all match the source within 1px.
- **Card height (corrected):** re-measured — the source cards' tall "airy bottom" is NOT
  equal-height stretch. Even the fullest card (longest title + body) reserves ~145px empty space
  below its link, and every card is the same height regardless of content: **~343px mobile (1-col)
  → ~450–478px from tablet up**. So the source cards carry a real **min-height**. Added
  `min-height: 340px` on `.cards.grid > li` (base) and `450px` at ≥768px. Verified local now
  renders 340px mobile / 450px desktop — matching the source's airy card.
- Gate: `npm run lint` 0 errors (7 expected a11y no-console warnings), `breakpoint-check` pass,
  `test:a11y …/cards-grid` pass.

### 2026-08-20 (header — PT/EN rebuilt as a toggle SWITCH with sliding knob)
- **Symptom (user):** our PT/EN was a flat white pill (just "PT EN" text); the source is a toggle
  **switch** — a pill track with a circular knob sitting over the active language.
- **Source anatomy measured (both themes):** 50×24 track, `border-radius:100px`, transparent bg;
  a **24px circular knob** over the active language that slides to the other side on toggle;
  10px/600 labels. Dark hero (homepage): track border `rgb(255 255 255 / .48)`, **white knob**,
  active PT green (on knob), inactive EN `#f8f8f8`. White-top (`/bolivia`): track border + **knob
  green**, active PT white, inactive EN green.
- **Fix (header.css `.nav-lang`):** rebuilt as a switch — relative pill track with `1px petro-green`
  border; a `::before` green **knob** (24px circle) that `translateX(100%)` slides right when EN is
  active (`.nav-lang:has(button:last-child.is-active)::before`); buttons are 24px cells, inactive
  green, active white (sits on the knob). Dark-hero `:has()` overlay flips track border white/48%,
  knob white, active label green, inactive `#f8f8f8`. Knob position is driven by the same
  `.is-active` class the routing JS already sets from the URL, so it reflects the current language.
- Verified vs source: homepage — white knob left over PT (green), EN `#f8f8f8`, border white/48%;
  white-top — green knob over PT (white), EN green, green border. Both pixel-match the source.
- **Slide-before-navigate:** clicking PT/EN was navigating instantly, so the knob slide was never
  seen. `header.js` now toggles the `.is-active` classes on click (knob starts its 0.2s
  `translateX(100%)` slide) and defers the actual navigation by 220ms (`KNOB_SLIDE_MS`), so the
  switch visibly animates first — matching the source. Verified: on EN click `en_active` flips
  true immediately with `transition: transform 0.2s` on the knob, then it routes to `/en`.
- Gate: `npm run lint` 0 errors (7 expected a11y no-console warnings), `breakpoint-check` pass,
  `test:a11y` pass on both `/` and the white-top page.

### 2026-08-20 (header — PT/EN routing, scroll-collapse animation, compact green links)
Three source-parity fixes (source `https://petrobras.com.br/`), all scoped to the header:
1. **PT/EN language toggle now routes (was visual-only).** Source: clicking EN navigates to an
   `/en` path prefix (`/`→`/en`, `/bolivia`→`/en/bolivia`), PT strips it back; the current
   language is marked active from the URL. `header.js` — replaced the class-only toggle with
   `stripEnPrefix`/`addEnPrefix`/`isEnglish` helpers; `syncLangActive()` sets `.is-active` from
   `location.pathname` on load, PT/EN click navigate via `window.location.pathname`. Verified:
   PT active on `/`, clicking EN → `/en` with EN active (local `/en` 404s only because that
   content isn't migrated yet — the routing behaviour matches source exactly).
2. **Scroll: utility strip now collapses smoothly (was "stagnant then popped").** Source keeps
   the strip in normal flow so it scrolls up naturally. We kept the whole `.nav-wrapper` fixed and
   `display:none`d the strip on `.is-compact` — `display` can't animate, so it vanished instantly.
   `header.css` — base `.nav-utility` got `overflow:hidden; transform-origin:top;
   transition:height/transform .25s`; the `.is-compact` rule now `height:0; translateY(-100%)`
   instead of `display:none`, so the strip slides up and the main nav rises into its place.
   Verified on `/`: util height animates 48px→0 with a transform on scroll.
3. **Compact nav links now GREEN (were dark `#373737`).** Source: once the scrolled bar turns
   white the links flip green. `header.css` — `.is-compact .nav-link/.nav-drop`→`var(--petro-green)`
   and the compact search icon stroke `#373737`→`#008542`. Verified on `/`: links compute
   `rgb(0,133,66)` when scrolled.
- Gate: `npm run lint` 0 errors (7 expected a11y no-console warnings), `breakpoint-check` pass,
  `test:a11y` pass on both `/` and the white-top hero-diagonal-split page.

### 2026-08-20 (header top-row FULLY GREEN on white-top pages)
- **Symptom (user):** on white-top pages (e.g. `/bolivia`) the top utility row read all-dark;
  the source shows the **entire** row in green — site name, the A-/100%/A+ font-size control
  (text + pill border), the contrast toggle ring + glyph, and the PT/EN language labels.
- **Source colours measured on live `/bolivia` (1440):** "Você está em:" `#373737`;
  **"SITE PETROBRAS" green `#008542`**; quick-links (ACESSO À INFORMAÇÃO…) grey `#525252` bold;
  **A- / "100%" / A+ all green `#008542`** with a **green pill border**; **contrast toggle ring
  border green** + its inner glyph's filled half green (not black); **PT and EN both green**
  `#008542`. Local rendered all of these dark `rgb(39,40,51)` / dark grey.
- **Fix:**
  - `header.js` `buildUtilityBar()` — split the strip title so the site name is its own
    element: `"Você está em: "` (text) + `<span class="nav-utility-site">SITE PETROBRAS</span>`.
  - `header.css` base (light-theme), all → `var(--petro-green)` unless noted:
    `.nav-utility-label`→`#373737`; new `.nav-utility-site`→green; `.nav-utility-links a` +
    "Acesse também:" span →`var(--petro-util-text)` (retuned `#4b4b4b`→**`#525252`**, token only
    used here); `.nav-fontsize span` ("100%"), `.nav-fontsize button` (A-/A+), the `.nav-fontsize`
    **border**, the `.nav-contrast` **ring border**, the `.nav-contrast::before` glyph's filled
    half, and both `.nav-lang button` (PT/EN) → green.
- **Hero-theme logic preserved (homepage NOT impacted) + bug fixed:** the dark-hero `:has()`
  overlay whitens row 1 over the dark hero. **Bug caught & fixed:** the overlay whitened
  `.nav-utility-controls button`, which includes the PT/EN language buttons — but those sit on an
  always-white pill, so on the homepage they'd be white-on-white (invisible). Re-scoped that
  selector to `.nav-fontsize button` only (so the language pill keeps its green PT/EN everywhere,
  matching the source note "the language pill stays a solid white pill / its own colours"), and
  added overlay rules whitening the contrast glyph's filled half. Verified — homepage `/`
  (dark hero): SITE PETROBRAS + A-/100%/A+ + contrast ring/glyph all `rgb(255,255,255)`, pill
  border light, **language pill white bg with green PT/EN (readable)**; white-top page:
  every row-1 accent green `rgb(0,133,66)`, quick-links `rgb(82,82,82)`, "Você está em:"
  `rgb(55,55,55)`. Used `var(--petro-green)` (not a hex) so high-contrast mode's
  `--petro-green:#525252` override neutralises it automatically.
- Gate: `npm run lint` 0 errors (7 expected a11y no-console warnings), `breakpoint-check` pass,
  `test:a11y` **pass on BOTH** the white-top page and the homepage `/`.

### 2026-08-20 (hero diagonal-split — content inset made band-aware, left↔right gap fixed)
- **Symptom (user):** on wide desktops the gap between the left text column and the
  right photo looked too big; breadcrumb/heading/body sat too far left of the image.
- **Root cause:** desktop content inset was `padding-left: 12.7%` of the raw **viewport**.
  That only equals the source at exactly 1440px. Measured live `/bolivia` vs local:
  content left-x — 1280 `169→169✓`, 1440 `183→183✓`, **1920 `363→244✗`** (120px too far
  left) — because the source insets the text from a *centred max-width-1440 band* (72px
  side gutters), not from the viewport. So above 1440 our text drifted left and the
  left↔right gap ballooned (content→image gap @1920 `264→423`).
- **Fix (hero.css, `≥992px` only):** replaced the flat `12.7%` with a band-aware calc —
  `max(--space-big, (100% - --content-max-width)/2) + 0.085 * min(100% - 2*--space-big, --content-max-width)`.
  Re-measured local: content-x **169 / 182 / 362** at 1280 / 1440 / 1920 — matches the
  source (`169 / 183 / 363`, ±2px) at every width. Image geometry (right-anchored 735px)
  left intact; mobile stack (breadcrumb→photo→heading→body, 32px gutters, no h-scroll)
  untouched (change is inside the desktop media query).
- Gate: `npm run lint` 0 errors (7 expected a11y no-console warnings), `breakpoint-check`
  pass (576/768/992/1280), `test:a11y …/hero-diagonal-split` **pass** (run against the
  extensionless full-page URL, not `.plain.html` — the fragment lacks `<html lang>`/`<title>`).
  Verified in preview at 1280/1440/1920 + 390 mobile against live `/bolivia`.

### 2026-08-20 (hero diagonal-split — parity pass REVERTED)
- Attempted a full measure-and-match pass (absolute-positioned 735×848 portrait photo, block-layout
  content column with margin-top gap, retuned outline). It regressed the layout in the user's view,
  so it was REVERTED: desktop CSS is back to the flex row (content flex 521px, media flex min-width
  780px, aspect 735/588) and `HERO_DS_OUTLINE_CORNERS` restored to prior values. Net state = the
  earlier working version. Clip corners in hero.js remain the source-derived
  TL(0.167,0.093)/TR(0.992,0)/BR(1,1)/BL(0,0.755) (gentle left edge) — that part was kept.

### 2026-08-20 (orgchart — branch slider moved BELOW the spine + single-value cards + mobile overflow fix)
- **Feedback (user, liderancas page):** (1) the directorate branch slider sat to the
  RIGHT of the spine; it should sit BELOW it (matches source; "looks better"). (2) a
  card was showing 2 values where it should show 1.
- **Issue 1 fix (orgchart.css, `≥768px`):** `.orgchart-chart-tree` was `flex-direction: row`
  (spine left / branches right). Changed to `flex-direction: column` with the spine bounded
  (`width:100%; max-width:360px`) and `.orgchart-branches-area { width:100% }`, so the
  horizontal directorate slider (+ green progress bar + prev/next arrows) now stacks BELOW
  the spine. Measured local @1440: spine bottom y=2505, branches start y=2537 (below), slider
  scrolls (navigator scrollWidth 2152 > clientWidth 962). Tablet 768 verified likewise.
- **Issue 2:** already correct in current code — the column-header card shows only the area
  name (`Exploração e Produção`); the responsible person (`Sylvia dos Anjos`) stays on the
  hidden `.orgchart-card-back` (flip-to-reveal). The "2 values" screenshot was from the older
  deployed build. Verified: area visible, back `display:none`.
- **Regression caught & fixed (mobile):** with the tree now a column and the body a column
  at mobile (`align-items:flex-start`), the chart grew to its widest content (the 2152px
  branches row) → page-wide horizontal overflow (docWidth 2184 > 390 viewport). Fixed by
  bounding `.orgchart-chart { width:100%; min-width:0 }` so `.orgchart-navigator`'s
  `overflow-x:auto` actually clips. Re-measured @390: no overflow (docWidth==winWidth==390),
  navigator clientWidth 326 / scrollWidth 2152, next-arrow enabled.
- Gate: `npm run lint` 0 errors (7 expected no-console warnings), `breakpoint-check` pass
  (576/768/992/1280). `test:a11y` reports 3 **pre-existing** serious items NOT introduced by
  this layout-only change: (a) color-contrast on `.orgchart-card-area` — these are the
  source's exact brand category colours (orange #ed8b00 ≈2.4:1, cyan #00b2a9 ≈2.6:1 on white),
  the same swatches shown in the legend → parity-vs-WCAG decision flagged to content owner;
  (b) link-in-text-block on the inline "Formulário de Referência" link and (c) target-size on
  a cards-list link — both in page default content below the block, not the orgchart.

### 2026-08-20 (orgchart — flip SWAPS (one value, animated) + removed branch connector lines)
- **Feedback (user):** (1) clicking a card should animate and show the person's name, but
  ours showed BOTH the area name and the person (2 values). (2) branch columns had vertical
  connector lines that should be removed; "some boxes via line, some directly vertical" —
  an inconsistent look.
- **Measured the live source to settle the behaviour** (not assumed): clicking "Presidente"
  *replaced* the label with "Magda Chambriard" over a 0.5s transition — only ONE value ever
  shows. And the branch (directorate) columns have NO connector lines at all — cards stack
  directly (DOM probe found zero line elements; card bottoms == next-card tops). Only the
  SPINE keeps its left trunk + per-card stub lines (that part matches and is unchanged).
- **Fix 1 — flip is a swap, not an append (orgchart.css):** added
  `.orgchart-card.is-flipped .orgchart-card-area { display:none }` so the area label is
  hidden when flipped, and the back face (person/contact) rises+fades in via a new
  `@keyframes orgchart-reveal` (0.5s, opacity+translateY), gated by
  `prefers-reduced-motion: reduce`. Verified: click "Presidente" → area `display:none`,
  only "Magda Chambriard" visible (`bothShowing:false`), animationName `orgchart-reveal`;
  second click toggles back to the area name.
- **Fix 2 — removed branch-column connector lines (orgchart.css):** deleted the
  `.orgchart-column::before` vertical line (and its `:has(:only-child)` suppressor — that
  suppressor was itself the cause of the "some-lined/some-not" inconsistency, since
  single-card columns had no line while multi-card ones did). Branch cards now stack clean,
  matching the source. Spine trunk/stub connectors retained (source keeps them).
- Gate: `npm run lint` 0 errors (7 expected no-console warnings), `breakpoint-check` pass
  (576/768/992/1280). `test:a11y` unchanged: same 3 pre-existing serious items (brand-colour
  card labels — user chose to keep exact source colours; inline "Formulário de Referência"
  link and a cards-list touch-target, both in page content below the block). Screenshot at
  1440 confirms the spine matches source screenshot 1 and branches are line-free.

### 2026-08-20 (orgchart — symmetric flip crossfade + RESTORED branch connector lines)
- **Feedback (user, with source screenshots):** (1) the flip felt inconsistent — slow to open,
  fast to close. (2) the source DOES have vertical connector lines joining the branch cards
  (I had wrongly removed them the previous turn); the mixed "some via line / some directly
  vertical" look came from spine-having-lines but branches-not. (3) verify the branch slider
  scrolls horizontally and isn't stuck.
- **Fix 1 — symmetric flip (orgchart.css):** the previous approach animated the OPEN with a
  0.5s `@keyframes` but CLOSED instantly via a `display` swap → asymmetric. Replaced with a
  crossfade: the back face is now `position:absolute` overlapping the area label; both the
  area (`opacity 1→0`) and the back (`opacity 0→1`, `visibility` deferred) transition over the
  SAME `0.3s ease` in both directions. Verified settled states: closed = area only (back
  opacity 0/hidden); open = person only ("Magda Chambriard", area opacity 0); re-close returns
  to area only. Still one value at a time; `prefers-reduced-motion` disables the transition.
- **Fix 2 — restored branch connector lines (orgchart.css):** re-added the
  `.orgchart-column::before` left trunk (1px, top/bottom 40px) + `.orgchart-column .orgchart-node::before`
  24px horizontal stub, and `padding-left:24px` on the column — mirroring the spine exactly, so
  the whole chart is consistent. Single-card columns suppress the trunk via
  `:has(.orgchart-node:only-child)`. (This reverts the previous turn's incorrect removal; the
  source screenshots confirm the lines belong.)
- **Fix 3 — scroll confirmed:** the `.orgchart-navigator` (`overflow-x:auto`) scrolls the full
  range at 1440 — scrollWidth 2344, clientWidth 962, maxScroll 1382, `reachedMax:true` (with
  smooth-scroll disabled for the measurement). All 8 directorate columns reachable; not stuck.
- Gate: `npm run lint` 0 errors (7 expected no-console warnings), `breakpoint-check` pass
  (576/768/992/1280). `test:a11y` unchanged: same 3 pre-existing serious items (brand-colour
  card labels kept per user decision; the inline "Formulário de Referência" link and a
  cards-list touch-target in page content below the block). Screenshot at 1440 confirms the
  branch columns now show the connector trunk+stubs, matching source screenshot 1.

### 2026-08-20 (orgchart — spine now a 2-LEVEL tree + spine→branch connector + legend un-stuck)
Three user-reported parity gaps vs the source screenshots, all fixed to match exactly:
1. **Spine is a two-level tree (was flat).** The source spine is NOT a flat list: top-level
   parent cards ("Conselho Fiscal", "Conselho de Administração", "Presidente") sit on the main
   trunk, and their subordinate cards hang off an INDENTED sub-trunk with rounded elbow
   connectors. `orgchart.js` now groups spine rows into `.orgchart-spine-group`s: a row starts a
   new parent section when it is a top-level role (dark-blue node OR a node that links out — the
   two "Conselho" cards); every following non-parent row becomes a child in
   `.orgchart-spine-children`. `orgchart.css` renders the parent with a straight trunk stub and
   each child with a **rounded-elbow** connector (`border-left`+`border-bottom`+
   `border-bottom-left-radius`) off a continuous indented sub-trunk. Verified @1440: parents at
   x=430, children indented to x=487; matches source screenshots 1 & the attachment.
2. **Spine→branches connector added.** A rounded elbow now drops from the spine trunk and turns
   into the first branch column header ("Exploração e Produção") — `.orgchart-branches::before`
   with `padding-left:24px` on `.orgchart-branches` so the slider has left room. Matches the
   pink-box area of source screenshot 2.
3. **Legend un-stuck.** The left legend was `position:sticky` (top:24px) so it "stuck" when
   scrolling up; the source legend is `position:static` and scrolls away naturally. Removed the
   sticky rule. Verified: legend computes `static`, scrolls with the page.
- Verified @1440 + @390: no horizontal overflow (docWidth==winW), branch slider still scrolls
  (scrollWidth 2368 > clientWidth), spine nesting + connectors match the attachment.
- Gate: `npm run lint` 0 errors (7 expected a11y no-console warnings), `breakpoint-check` pass
  (576/768/992/1280). `test:a11y` unchanged: same PRE-EXISTING serious `color-contrast` items on
  the orange/cyan `.orgchart-card-area` brand labels (source-exact swatches kept per user
  decision) — NOT introduced by this layout-only change.

### 2026-08-21 (FULL block library instrumented — all pending variants built)
- **Goal:** instrument the ENTIRE block library from the discovery report
  (`reference/Final Report petrobras.html` — 34 variants across 18 base blocks), each with a
  sample page in `content/drafts/block-samples/` and 100% parity across 390/768/1440. Forms
  deferred.
- **New authoring aids:** `tools/samples/BLOCK_PLAYBOOK.md` (repo conventions + sample-gen +
  gate playbook) and one `tools/samples/build-<name>-sample.mjs` generator per new block
  (never hand-write content HTML). Each generator emits the standard sample layout (top spacer
  180/170/96 to clear the fixed header, 48/40 gaps around each demoed block).
- **Blocks built/extended this batch** (all block-scoped CSS, mobile-first min-width, a11y):
  - `accordion` — reworked to native `<details>/<summary>` base FAQ (rotating chevron,
    single-open) + `downloads` (PDF-link bodies) + `table-docs` (spec table + docs) variants.
  - `tabs` (NEW) — `content` (folder tabs), `categories` (green pill bar switching card grids),
    `explorer` (vertical icon rail + panel). Roving tabindex, arrows/Home/End, aria tabs.
  - `table` (NEW) — `specifications` + `downloads`; semantic `<table>` from authored rows,
    wrapped in `overflow-x:auto` so wide tables scroll internally (no page overflow).
  - `columns` — added CSS-only `stats` (dark KPI banner, 2→4 cols) + `feature` (icon+heading
    columns, 1→2→3) variants; base untouched.
  - `cards` — added `overlay` (image nav tiles w/ scrim + stretched link) + `audio` (functional
    accessible audio player) variants; base grid/icon/feature untouched.
  - `video` (NEW) — `youtube` facade (poster + play button → injects youtube-nocookie iframe on
    click; host-allowlisted).
  - `downloads` (NEW) — document list (green link + inline doc icon, `download`/`_blank`).
  - `hero` — added `slider` carousel variant (autoplay w/ pause-on-hover + reduced-motion,
    prev/next + dot pagination, keyboard, aria); default & diagonal-split untouched.
  - `timeline` (NEW) — milestone timeline (WAI-ARIA tablist markers, click/arrows/Home-End,
    horizontal desktop / stacked mobile w/ contained scroll strip).
  - `biome-explorer` (NEW) — `map` (hotspot pills over a scrollable map, `x% y%` coords) +
    `overlay` (pill selector); shared `role=dialog` overlay with focus trap, Esc/backdrop close,
    focus return; reduced-motion aware.
  - `dashboard-tabs`, `flipbook`, `web-story` (NEW) — facade-based embed widgets (poster +
    button → lazy iframe on click), **host-allowlisted** before injecting any iframe
    (petrobras subdomains, issuu, youtube-nocookie). Proprietary/offline sources ship as
    best-parity container + facade (documented limitations below).
  - **VLibras** — confirmed already integrated correctly as a GLOBAL 3rd-party script in
    `scripts/delayed.js` (injects `[vw]` container, loads vlibras-plugin.js in the delayed
    phase). It is site-wide, NOT a block — left as-is.
- **Gate (repo-wide):** `npm run lint` **0 errors** (7 expected a11y no-console warnings),
  CSS stylelint clean, `node tools/quality/breakpoint-check.mjs` **pass** (576/768/992/1280).
  Each block's `test:a11y` passed on its sample page (brand-color contrast on Petrobras
  orange/cyan swatches remains the known parity-vs-WCAG exception; a couple of green control
  buttons were nudged to `#007e79`/#008542 to pass without changing brand identity). All samples
  verified `docWidth == innerWidth` (no horizontal overflow) at 390/768/1440.
- **Known limitations (flag to content owner):** (1) `dados-abertos` dashboard and the web-story
  player are proprietary/electoral-defeso-offline, so `dashboard-tabs` and `web-story` ship as
  faithful containers + facades rather than pixel-replicated internals — they'll render the live
  embeds once the URLs are supplied. (2) `biome-explorer` map hotspot coordinates are authored
  per-biome; omitted coords auto-distribute approximately.

### 2026-08-21 (verification sweep — hero-slider sample a11y fix)
- Ran a repo-wide independent verification of the new batch: `tools/quality/overflow-sweep.mjs`
  (all 16 sample pages clean at 390/768/1440) + a per-page `test:a11y` sweep.
- **Caught & fixed a real a11y failure on the hero-slider SAMPLE** (not the block itself): the
  generator put a top-clearance `spacer` above the hero, so the fixed header sat over the WHITE
  page background instead of the dark hero image. The header's dark-hero theme
  (`body:has(main .hero:not(.diagonal-split))`) whitens row-1 utility text → white-on-white
  contrast fail on `.nav-utility-*`. Fix: made the hero-slider the FIRST section with no leading
  spacer (full-bleed under the overlay header, exactly like the real `/quem-somos/produtos` page
  and the hero-diagonal-split sample), explanation section moved below. `test:a11y …/hero-slider`
  now **passes**; overflow sweep still clean. All 15 new sample pages pass a11y (orgchart keeps
  its known brand-color-swatch exception).

### 2026-08-21 (orgchart — trunk-through-cards rework for TRUE source parity)
- **User feedback (with source + DevTools screenshots):** our connectors were still wrong —
  we'd drawn a SEPARATE line in a left gutter with every card (parents included) pushed to its
  right. The source (`.connection` = a 24px box with a single `border-right`) instead runs ONE
  continuous trunk at a FIXED x that is 24px INSIDE the parent cards' left edge — so the line
  passes BEHIND the opaque parent cards (Conselho Fiscal / Conselho de Administração /
  Presidente) and shows only in the gaps ("crosses through" them); children indent to the RIGHT
  of that same trunk and branch off with small rounded elbows.
- **Fix (orgchart.css):** rewrote both the spine and the branch columns to this model —
  `.orgchart-spine::before` / `.orgchart-column::before` trunk at `left:24px` with `z-index:0`;
  cards at `z-index:1` (parents flush-left cover the trunk); children/sub-cards `margin-left:33px`
  with a 9px rounded-elbow `::before`. Removed the old parent stub + separate sub-trunk.
- **Three follow-up parity fixes (same feedback round):**
  1. **Arrow icon on plain cards** — cards with no link and no responsible/contact (e.g.
     "Desenvolvimento de Negócios", "Logística", "Supervisão de Planos…") now still render the
     exchange ⇄ badge (`orgchart.js` else-branch), matching the source where every card shows it.
  2. **Trunk continues unbroken** spine → branches: `.orgchart-branches::before` is now a
     straight 1px line at `left:24px` (was a rounded elbow), so the line runs from the spine past
     Desenvolvimento de Negócios straight down to where "Exploração e Produção" begins.
  3. **First branch header flush-left:** removed `padding-left` on `.orgchart-branches` so the
     first column header aligns at the extreme left with the spine parent cards. Verified @1440:
     spineParentX == firstBranchHeaderX == 406; "Desenvolvimento de Negócios" has the icon.
- Gate: `npm run lint` 0 errors (7 expected a11y no-console warnings); `breakpoint-check` pass;
  overflow-sweep clean at 390/768/1440. Screenshots confirm the trunk crosses through the parent
  cards and the branch columns use the same treatment — matching the source + attachments.

### 2026-08-21 (orgchart — restored spine→branch "side branch" + plain-card arrows)
- **User feedback:** (1) the side-branch line that comes DOWN into the "Exploração e Produção"
  box was missing; (2) plain cards like "Desenvolvimento de Negócios" were missing their arrow
  icon; (3) "Exploração e Produção" should sit further left (flush with the spine).
- **Root cause of the missing side branch:** the connector was drawn on
  `.orgchart-branches::before`, but `.orgchart-branches` lives inside `.orgchart-navigator`
  which has `overflow-x: auto` — that CLIPS an above-the-top pseudo-element, so the descending
  line was cut off. **Fix:** moved the connector to `.orgchart-branches-area::before` (the
  non-clipping parent), a 96px vertical line at `left:24px` that runs from the spine trunk down
  into the first branch column header. (Merged the `position: relative` into the existing
  `.orgchart-branches-area` rule to avoid a `no-duplicate-selectors` stylelint error.)
- **Plain-card arrows (orgchart.js):** cards with no link and no responsible/contact now still
  render the exchange ⇄ badge (added an else-branch) — matches the source where every card shows
  it. Verified "Desenvolvimento de Negócios", "Logística", "Supervisão de Planos…" all have it.
- **Flush-left alignment:** verified @1440 the first branch header x == spine parent x (406),
  matching the source (both 365 at the source's own width).
- Gate: `npm run lint` 0 errors (7 expected a11y warnings), stylelint clean, `breakpoint-check`
  pass, overflow-sweep clean at 390/768/1440. Screenshot confirms the line runs unbroken from
  the spine into "Exploração e Produção".

### 2026-08-21 (orgchart — removed hanging trunk lines below short branch columns)
- **User feedback (with source DevTools):** branch columns showed vertical lines "hanging"
  below their last card. The source uses bounded per-card connectors (`.connection-secondary-b`),
  with no trailing line.
- **Root cause:** `.orgchart-branches` is a flex row with default `align-items: stretch`, so
  EVERY column stretched to the tallest column's height (913px). Our per-column trunk
  (`.orgchart-column::before`, `top:40px → bottom:40px`) then ran to 40px above the *stretched*
  bottom — i.e. far below the column's last actual card — leaving a hanging line (measured gaps
  of 236–449px below the last card on the shorter columns).
- **Fix (orgchart.css):** `.orgchart-column { align-self: flex-start }` so each column is only as
  tall as its own cards; the trunk's `bottom:40px` now lands at the last card's centre. Verified
  @1440: gap below last card == 0px on all 8 columns (was up to 449px).
- Gate: `npm run lint` 0 errors (7 expected a11y warnings), stylelint clean, `breakpoint-check`
  pass, overflow-sweep clean at 390/768/1440. Screenshot confirms each branch trunk stops at its
  own last card — no trailing lines — matching the source.

### 2026-08-21 (orgchart — reverted full-band experiment + fixed floating spine→branch connector)
- **Reverted:** a trial that made the branch slider span the full content band (legend-width
  escape via negative margin) — it didn't match the intended look, so `.orgchart-body` legend
  is back to `flex: 0 0 auto` and the `--orgchart-legend-w/gap` vars + escape rule were removed.
- **Fixed the "hanging" connector:** the spine→branch line looked like a detached stub floating
  in the 32px section gap between "Desenvolvimento de Negócios" and "Exploração e Produção".
  Cause: `.orgchart-branches-area::before` started at the last spine card's BOTTOM edge (into
  empty space) rather than continuing the trunk from behind the card. Fix: `top:-73px;
  height:114px` so it begins ~half a card up (behind Desenvolvimento's centre, z-index:0 keeps
  it behind the opaque card) and runs down to the first branch header's centre — reading as one
  unbroken line, matching source screenshot 2.
- Gate: `npm run lint` 0 errors (7 expected a11y warnings), stylelint clean, `breakpoint-check`
  pass, overflow-sweep clean at 390/768/1440.

### 2026-08-21 (orgchart — branch slider full-band viewport, default-aligned under spine)
- **User ask:** the branch "down panel" should be slidable to the extreme left (full-band
  scrollable viewport, like the source navigator x=72→1368), BUT by DEFAULT the first column
  ("Exploração e Produção") must sit UNDER "Desenvolvimento de Negócios" (aligned with the
  spine), and the spine→branch connector must stay pinned to the spine — not drift left.
- **Fix (orgchart.css, ≥768px):**
  - `.orgchart-branches-area` escapes the chart column (negative margin-left of legend-w+gap,
    widened to match) so its scrollable viewport spans the full band → columns can slide to the
    extreme left.
  - `.orgchart-branches` gets `padding-left: legend-w+gap` so the FIRST column defaults to under
    the spine (measured: first col header x=423 == spine x=423). Progress bar + arrow controls
    get the same left margin so they stay under the spine too.
  - The connector `.orgchart-branches-area::before` is re-pinned with
    `left: legend-w+gap+24px` so it stays at the spine trunk x (measured: connector x=447 ==
    spine trunk x=447), not dragged to the escaped left edge.
  - Introduced `--orgchart-legend-w: 311px` (border-box legend incl. padding/borders) +
    `--orgchart-legend-gap: 40px`; legend set to `box-sizing: border-box` so the escape math is
    exact.
- Verified @1440: first col aligned under spine, connector pinned to spine, navigator scrolls
  (scrollWidth 2695 > 945), no page overflow. Gate: lint 0 errors (7 expected a11y warnings),
  stylelint clean, breakpoint-check pass, overflow-sweep clean 390/768/1440.

### 2026-08-21 (orgchart — right gutter on branch slider + connector overflow fix)
- **Right section cut:** the last branch column was flush against the navigator's scroll-clip
  edge when scrolled fully right. Added `padding-right: 24px` on `.orgchart-branches` so the last
  column keeps a trailing gutter (matches source).
- **Connectors overflowing below cards:** the per-column trunk was a single
  `.orgchart-column::before` with `bottom: 40px` — fine for ~80px cards, but a TALL last card
  (e.g. "Supervisão de Planos…" at 124px) pushed its centre down, so the fixed 40px bottom landed
  ~22px BELOW that card's centre → a stub hanging past the card. Replaced the single fixed trunk
  with PER-CARD connectors: each sub-card's `::before` is a rounded elbow whose BOTTOM is anchored
  at that card's own centre (`bottom: 50%`) and whose top rises `-50% - 16px` (one card + gap) to
  the previous card's centre. Because every segment ends at a real card centre, the composed trunk
  stops EXACTLY at the last card's centre regardless of its height — verified: tall last card
  connector bottom = card centre (2872), zero overflow; equal-height segments meet exactly (no
  gaps), tall-card overshoot into the previous card is hidden behind the opaque card.
- Gate: `npm run lint` 0 errors (7 expected a11y warnings), stylelint clean, `breakpoint-check`
  pass, overflow-sweep clean at 390/768/1440.

### 2026-08-21 (orgchart — full-band branch panel done right + connector regression fixed + full regression sweep)
- **Reverted** the per-card connector experiment (it drew extra/duplicate lines). Back to a single
  continuous column trunk `.orgchart-column::before`, but its `bottom` now reads a JS-set
  `--orgchart-col-trunk-bottom` (= column height − last sub-card centre), so the trunk ends
  EXACTLY at the last card's centre even for tall multi-line last cards (no overflow). Verified:
  all 8 columns `trunkVsLastCentre == 0`.
- **Down panel now extends full left→right band** (source parity): `.orgchart-branches-area`
  escapes the chart column via JS-measured custom props — `--orgchart-branches-shift` (chart-left
  → block-left distance) drives a negative `margin-left`, and `--orgchart-branches-w` (block
  width) sets the width; `flex-shrink:0` stops the column-flex parent shrinking it. The later
  `≥768px` `.orgchart-branches-area { width }` rule was ALSO switched to the var (it had been
  overriding the escape back to the chart width — the bug behind "panel not full width").
  Verified @1440: branchesArea spans x=72→1368 (1296px = block band), navigator scrolls.
- **Default rest state under the spine:** `.orgchart-branches` `padding-left: shift` so the first
  column defaults aligned under "Desenvolvimento de Negócios" (x=423 == spine x); progress bar +
  arrows get the same `margin-left` AND `width: calc(100% − shift)` so they don't run past the
  band edge (that had caused a page-overflow regression — now fixed). Connector `::before` pinned
  at `left: shift + 24px` to stay on the spine trunk.
- **Full regression sweep across ALL block-sample pages:** overflow-sweep clean at 390/768/1440
  for all 16 pages; `test:a11y` passes on 15/16 — orgchart's only failure is the PRE-EXISTING
  brand-colour `color-contrast` on the orange/cyan `.orgchart-card-area` labels (source-exact
  swatches kept per user decision), all 10 offenders confirmed to be those labels only, no new
  violations. Lint 0 errors (7 expected a11y warnings), stylelint clean, breakpoint-check pass.

---

## 8. Quick-start for the next iteration

1. Read §1–§6 above.
2. `npm install` if needed; start dev server:
   `npx -y @adobe/aem-cli up --no-open --forward-browser-logs` (background).
3. To validate a block visually, use a temporary root-level `drafts/*.html` harness (see §3),
   compare against the live source page, then delete the harness.
4. Always run the quality gate (§2) and paste output before claiming done.
5. Update §7 with a dated entry describing what you changed and any new gotchas.
6. Responsive regression check across ALL block-sample pages (needs dev server up):
   `node tools/quality/overflow-sweep.mjs` — loads every sample at 390/768/1440 and
   asserts no horizontal page overflow. All 16 pages currently report clean.
