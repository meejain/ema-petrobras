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

---

## 8. Quick-start for the next iteration

1. Read §1–§6 above.
2. `npm install` if needed; start dev server:
   `npx -y @adobe/aem-cli up --no-open --forward-browser-logs` (background).
3. To validate a block visually, use a temporary root-level `drafts/*.html` harness (see §3),
   compare against the live source page, then delete the harness.
4. Always run the quality gate (§2) and paste output before claiming done.
5. Update §7 with a dated entry describing what you changed and any new gotchas.
