# Jornada da Energia — migration brief & handoff

This document describes the target page, everything already built for it, exactly
how the source works (reverse‑engineered from the live site), where the current
migration still diverges, and a concrete checklist an LLM/developer can follow to
reach 100% parity.

- **Target (source):** https://petrobras.com.br/en/jornada-da-energia
- **Migrated page (preview):** https://main--ema-petrobras--meejain.aem.page/jornada-da-energia
- **Migrated page (live):** https://main--ema-petrobras--meejain.aem.live/jornada-da-energia
- **Local content page:** `content/jornada-da-energia.plain.html`
- **Local preview:** `http://localhost:3000/content/jornada-da-energia`

---

## 1. How the SOURCE page works (ground truth)

The source is a Liferay page using **React + Swiper + jQuery + Lottie (bodymovin)**.
The whole page is a single `.energy-page` wrapper with stacked **full‑height
sections**, and scroll is **hijacked/pinned** for the animated sections.

### 1.1 Page-level fixed elements (span the WHOLE page)
- **`.energy-page__nav`** — the left **dot‑rail**. `position: fixed; left: 32px;
  top: 50%`. 6 anchor dots (operações, jornada, fontes, tecnologias, etapas, faq).
  Each dot is an `<a>` with a hidden label that expands on hover; the **active dot
  is gold `#fdc82f`, scaled ×2**. It is visible on the hero already and stays fixed
  while you scroll all sections, changing its active dot per section. Hidden below
  the desktop breakpoint.
- **`.section-banner`** — the hero. `position: fixed; height: 100%; z-index: 10`.
  The whole page **scrolls up OVER the fixed hero**. Contains: `video` (bg,
  `object-fit: cover`, `width: 120%`), `.overlay` (`rgba(0,0,0,0.5)`),
  `.section-banner__line` (see below), `.container > .row` (`top:50%;
  translateY(-50%)` — vertically centered two columns: title left, description
  right; `p { max-width: 240px }`).
  - `.section-banner__line` — a **2px white vertical line** at `right: 15px`,
    `transition: 2s ease-in-out`; `.active { height: 70% }`. It **draws down** on
    load. (On desktop it sits between the two text columns.)

### 1.2 Section order (top → bottom)
1. `section-banner` — hero (fixed, video, drawing line, 2‑col centered text)
2. `section-map` — green interactive isometric operations map (the "+" hotspots)
3. `section-slider-green` — **pinned line‑drawing scrollytelling** (see 1.3)
4. `section-slider-white` — the white "new energy sources" pinned slider
5. `section-tech` — "A pioneering journey, with technology" cards
6. `section-steps` — "Explore more about each step" cards
7. price CTA — "Everything you need to learn about fuel prices"
8. `section-faq` — "Common questions" accordion

### 1.3 The green pinned scrollytelling (`section-slider-green`) — the hardest part
This is the section the user keeps flagging ("line comes up, turns right, draws
the vectors as you scroll"). Mechanics reverse‑engineered from the source JS/CSS:

- The section is `position: relative` but its inner `.swiper` is `position:
  absolute; inset: 0` and **height 900px** (one viewport). It is **8 Swiper
  slides**.
- On desktop (`>= 992px`) the source **hijacks scroll**: when you reach the
  section top it sets `window.allowScroll = 0`, adds `.scrollable`, activates the
  `.inherit-line`, and the **mouse‑wheel drives `swiper.slideTo()`** — i.e. the
  page is locked and each wheel notch advances one slide. When `swiper.isEnd`, it
  adds `.past` and releases the lock so the page scrolls on. Below 992px it does
  NOT pin — normal vertical flow, just toggling `.scrollable`/`.active`.
- **`.inherit-line`** (slide 0): a white line that **draws UP the viewport, then
  corners and turns RIGHT.** CSS: `.inherit-line::before { border-left + border-bottom;
  transition: height .5s, border-radius 1s, width .5s }`, `.active::before {
  height:100%; width:100%; border-radius: 0 0 0 60px }`.
- **`.grow-line`** (per slide): a **horizontal white line** that grows across
  `calc(100vw − Npx)` toward the illustration, then collapses to `0` when its slide
  becomes active. Per‑target geometry captured:
  `.to-pessoas`, `.to-map` (left480 top474), `.to-boat` (left430 top299),
  `.to-factory` (left483 top426), `.to-storage` (left435 top476), `.to-truck`
  (left509 top455). `background:#fff; height:2px; transition:1s ease-in-out`.
- Each slide plays a **Lottie line‑drawing** (`animPessoas`, `animExploracao`,
  `animPlataforma`, `animRefino`, `animGas`, `animLogistica`) — `loop:false,
  autoplay:false`, `.play()` called ~2s after the slide becomes active.
- Slide layout: **left** = `.green-image` (540px, the Lottie, `.animation-frame`
  600px tall, per‑anim `transform` tweaks) + a `.grow-line`; **right** =
  `.green-content` = **white card** (`border-radius:16px; padding:40px; color
  #373737`) with `.upper-title` (uppercase eyebrow), `h3` (32px), body, and a gold
  "Did you know?" callout. `.green-content__scroll { max-height: calc(100vh -
  320px); overflow:auto }`.
- **Dot‑rail**: the source pagination bullets are transparent w/ white ring;
  active = gold, scale ×2. BUT the visible left rail across the page is
  `.energy-page__nav` (see 1.1), a separate page‑level component.

### 1.4 The white slider (`section-slider-white`)
Same engine, grey theme (`#f8f8f8` bg, `#343a40` dot, `#767676` draw‑lines). Intro
shows the wind‑turbine Lottie (`catavento`). 4 slides; each stage is a **statement
pair** ("We have… / To have…") joined by a "What makes it possible for us…"
connector chip.

---

## 2. Ready‑made assets & scripts ALREADY in this repo

### 2.1 Vendored library
- `blocks/energy-journey/lottie_light.min.js` — **lottie‑web 5.12.2 light SVG
  build** (UMD, exposes `window.lottie.loadAnimation`). No CDN, no build step
  (No‑Build Rule). Loaded lazily as a `<script>` by the block.

### 2.2 The exact source Lottie JSONs (extracted from the live site)
Committed under **`blocks/energy-journey/animations/`** (served as CODE so they
work on preview/publish — the `content/media-da/...` copies **404 on
`*.aem.live`**, which is why illustrations were blank):
| file | source doc URL suffix | slide |
|------|----------------------|-------|
| `anim-pessoas.json` | `/pessoas` | research/people |
| `anim-exploracao.json` | `/exploracao` | exploration (Brazil map) |
| `anim-plataforma.json` | `/plataforma` | FPSO platform / ship |
| `anim-refino.json` | `/refino-2` | refining |
| `anim-gas.json` | `/gas` | gas |
| `anim-logistica.json` | `/logistica` | logistics |
| `anim-turbine.json` | `/catavento` | wind turbine (white slider) |

> They are genuine Lottie v5.9 JSONs. They can also be re‑extracted live from the
> source via `window.lottie.getRegisteredAnimations()[i].animationData`, or
> downloaded from `https://petrobras.com.br/documents/d/f3a44542-113e-11ee-be56-0242ac120002/<suffix>`.

### 2.3 Blocks & template already built
- **`blocks/energy-journey/`** (`.js` + `.css`) — the green pinned scrollytelling
  block, plus a **`new-energy` variant** (grey theme, turbine + statement pairs).
- **`blocks/hero/`** — has a **`movie` variant** (`decorateMovie`) for the hero:
  fixed‑look banner, video bg, vertical drawing line, 2‑col centered text.
- **`blocks/energy-map/`** — the interactive isometric map (done, good parity).
- **`templates/jornada-da-energia/`** (`.js` + `.css`) — page template: sets a body
  class from `template` metadata, builds the **page‑level fixed dot‑rail**
  (`.jde-nav`), loaded via `loadTemplateCSS()`/`loadTemplateJS()` in `scripts/scripts.js`.

### 2.4 Sample/page generator scripts (`tools/samples/`)
- `build-energy-journey-sample.mjs` → `content/drafts/block-samples/energy-journey.plain.html`
- `build-new-energy-sample.mjs` → `content/drafts/block-samples/new-energy.plain.html`
- `build-energy-map-sample.mjs` → `content/drafts/block-samples/energy-map.plain.html`
- `build-jornada-page.mjs` → **`content/jornada-da-energia.plain.html`** (the full page)
- Re‑run any with `node tools/samples/<script>.mjs`. Idempotent.

### 2.5 Quality gate (run after any change, paste output)
- `npm run lint`
- `node tools/quality/breakpoint-check.mjs`  (mobile‑first min‑width only)
- `npm run test:a11y <url>`  (axe‑core; dev server must be up)
- `node tools/quality/overflow-sweep.mjs`  (no horizontal overflow @390/768/1440)

---

## 3. Where the migration STILL diverges from source (open issues)

Ranked by visual impact. (Screenshots the user provided show the hero + first
green section.)

1. **The green journey's grow‑lines / inherit‑line are not actually drawing.**
   The block currently cross‑fades stages (opacity/translateX) and shows a static
   line, but does NOT reproduce: (a) the vertical inherit‑line drawing UP then
   cornering RIGHT with the source's exact `border-radius`/`width`/`height`
   timing, and (b) the per‑stage horizontal `grow-line` travelling to the
   illustration then collapsing. **This is the #1 parity gap.**
2. **Scroll model differs.** Source LOCKS the page (`allowScroll=0`) and drives
   slides by wheel; our version uses a tall `position:sticky` "track" and maps
   scroll offset → step. Visually close, but the "hold, then advance one vector at
   a time, then release" cadence and the wheel‑lock are not identical.
3. **Hero is not truly `position:fixed`.** Source hero is fixed and the page
   scrolls over it; ours is a normal first section styled to look similar. The
   "line comes up with the text" reveal is therefore not the same handoff as the
   source (where the green section slides up over the fixed hero).
4. **Dot‑rail count/labels.** Source has 6 anchors; our page has 8 sections so the
   rail shows 8 dots. Decide whether to group sections to 6 or keep 8.
5. **Illustration placement/scale.** Source applies per‑anim `transform`
   tweaks (e.g. `animPlataforma svg { transform: scale(1) translate(-8px,20px) }`).
   Ours renders the Lottie centered without those exact nudges.

> NOTE (already fixed this session, in staging): Lottie 404 on publish (moved to
> code path), stages overlapping (structural isolation + always‑pinned on
> desktop), page‑level fixed dot‑rail, hero 2‑col + drawing line. These are staged
> but **not yet committed/pushed**, so the live site still shows the old build.

---

## 4. Parity checklist (what an LLM should do next)

Work against the LOCAL preview first (`localhost:3000/content/jornada-da-energia`),
then commit + push to `main` (AEM Code Sync deploys code; content is published by
the author). **Read the source's real CSS/JS via DevTools rather than guessing.**

- [ ] **Verify the staged fixes render** (illustrations load from
      `blocks/energy-journey/animations/`, one stage visible at a time, fixed
      dot‑rail, hero 2‑col + line). Then commit + push so they go live.
- [ ] **Reproduce the inherit‑line draw** exactly: vertical grow (height 0→100%),
      then corner (`border-radius: 0 0 0 60px`), then extend right (width 0→100%),
      with the source's staggered `transition-delay`s.
- [ ] **Reproduce per‑stage grow‑lines**: a horizontal white 2px line that grows
      from the rail toward each illustration as the stage activates, then
      collapses to 0 — using the captured `.to-*` geometry.
- [ ] **Match the scroll cadence**: hold the section pinned, advance ONE stage per
      scroll step, release at the end. (Either keep the sticky‑track approach and
      tune the step math, or implement a wheel‑lock closer to source.)
- [ ] **Apply per‑anim transforms** so each Lottie sits like the source
      (see §1.3 list; pull the exact values from source CSS
      `.section-slider-green .green-image .animation-frame.animX svg`).
- [ ] **Decide hero fixed vs. sticky**: optionally make the hero `position:fixed`
      with the green section overlapping it, to match the "scroll over hero" feel.
- [ ] **Reconcile the dot‑rail** to the intended anchor set (6 vs 8) and confirm
      the active dot tracks correctly through all sections.
- [ ] **Re‑run the full quality gate** and confirm no overflow at 390/768/1440.
- [ ] **Confirm on the feature/preview URL** before merging to `main`.

---

## 5. Key source selectors → our equivalents (cheat sheet)

| Source | Ours |
|--------|------|
| `.energy-page__nav` (fixed dot‑rail) | `.jde-nav` (template JS/CSS) |
| `.section-banner` (fixed hero) | `.hero.movie` (blocks/hero) |
| `.section-banner__line` | `.hero-movie-line` |
| `.section-slider-green` | `.energy-journey` |
| `.inherit-line` | `.energy-journey-inherit-line` |
| `.grow-line` | `.energy-journey-grow-line` |
| `.green-image` / `.animation-frame` | `.energy-journey-image` / `.energy-journey-anim` |
| `.green-content` (white card) | `.energy-journey-content` |
| `.section-slider-white` | `.energy-journey.new-energy` |
| `.section-map` | `.energy-map` |

## 6. Tips for driving the LLM
- Always tell it to **open the source in DevTools** and read computed CSS +
  `window.lottie.getRegisteredAnimations()` rather than approximate.
- The animation JSONs and the Lottie player are already vendored — **do not
  re‑download**; reuse `blocks/energy-journey/animations/` + `lottie_light.min.js`.
- Everything page‑specific is scoped under `body.jornada-da-energia` (template) or
  the block class, so changes here won't leak to other pages.
- After edits, re‑run the generator (`node tools/samples/build-jornada-page.mjs`)
  only if you changed authored content; block/template code changes need no rebuild.
</content>
