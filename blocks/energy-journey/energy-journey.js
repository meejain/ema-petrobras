/*
 * Energy Journey — the pinned line-drawing scrollytelling centerpiece of
 * petrobras.com.br/en/jornada-da-energia (source ".section-slider-green").
 *
 * Behavior (reverse-engineered from the source, reproduced WITHOUT Swiper/GSAP
 * per the No-Build rule):
 *  - An opening title with a white dot; when the section reaches the top of the
 *    viewport, a vertical line draws UP then corners and turns RIGHT
 *    (the "inherit-line", pure CSS transition toggled by an `is-active` class).
 *  - The section then PINS (desktop ≥992px): it sticks for a tall scroll
 *    "track", and scrolling advances an internal STEP index. Each step reveals
 *    one stage — a white line-drawn Lottie illustration on the left (played once
 *    on reveal), a horizontal "grow-line" that travels toward it, and a white
 *    content card on the right (eyebrow + heading + body + gold "Did you know?"
 *    callout). A left dot-rail tracks the current step (active dot gold).
 *  - On the last step, the pin releases and the page scrolls to the next
 *    section. Below 992px the section does NOT pin: stages flow vertically and
 *    reveal on scroll (IntersectionObserver) — matching the source's mobile
 *    branch.
 *
 * Authored structure (one row per part):
 *   row 0 (intro): [ an <h2> title + optional <p> ]  (the opening statement)
 *   row 1..n (stages): [ media cell: a Lottie JSON link OR a <picture> ]
 *                      [ content cell: eyebrow (leading short <p>/<strong>),
 *                        an <h3> heading, body, optional "Did you know?"
 *                        callout as an <h4> + following <p> ]
 *
 * Lottie is rendered with the LOCALLY VENDORED player
 * (blocks/energy-journey/lottie_light.min.js) — no external CDN. If the player
 * or a JSON is missing, the stage still works (text only).
 */

/* Resolve an authored Lottie JSON link to a URL that is guaranteed to be served.
 * The animation JSONs are committed under the block folder (code, always served
 * on preview/publish). Author links may point at a content media path (e.g.
 * /media-da/.../anim-plataforma.json) which is NOT reliably served on
 * *.aem.live; so we remap any recognised `anim-*.json` basename to the
 * code-served copy under blocks/energy-journey/animations/. Unknown URLs pass
 * through unchanged. */
function resolveAnimationUrl(href) {
  // Accept the animation basename in any of the forms the content pipeline may
  // emit: `anim-name.json`, `anim-name-json` (the `.` mangled to `-` in a
  // media-da link), or a bare `.../anim-name` path segment. Always remap to the
  // code-served copy under blocks/energy-journey/animations/ (content media-da
  // paths 404 on *.aem.live).
  const m = (href || '').match(/anim-([a-z0-9]+)(?:[-.]json)?(?:[?#].*)?$/i);
  if (m) return `${window.hlx.codeBasePath}/blocks/energy-journey/animations/anim-${m[1].toLowerCase()}.json`;
  return href;
}

// A media link is an animation link if its href resolves to an `anim-*` asset
// in any of the accepted forms above.
const ANIM_LINK_RE = /anim-[a-z0-9]+(?:[-.]json)?(?:[?#].*)?$/i;
function findAnimLink(cell) {
  if (!cell) return null;
  return [...cell.querySelectorAll('a[href]')]
    .find((a) => ANIM_LINK_RE.test(a.getAttribute('href') || '')) || null;
}

/* ---- Lottie: load the locally vendored player once, lazily ---- */
let lottieLoader = null;
function loadLottie() {
  if (window.lottie && window.lottie.loadAnimation) return Promise.resolve(window.lottie);
  if (lottieLoader) return lottieLoader;
  lottieLoader = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = `${window.hlx.codeBasePath}/blocks/energy-journey/lottie_light.min.js`;
    s.async = true;
    s.onload = () => resolve(window.lottie);
    s.onerror = reject;
    document.head.append(s);
  }).catch(() => null);
  return lottieLoader;
}

/**
 * Prepare a Lottie animation in a container from a local JSON URL. Returns a
 * handle with play(); loads the player + JSON on first call and caches the
 * animation so it plays from the start each time the step is revealed.
 * @param {Element} container the .energy-journey-anim element
 * @param {string} jsonUrl path to the animation JSON
 * @returns {{ play: () => void }}
 */
function createLottieHandle(container, jsonUrl) {
  let anim = null;
  let building = false;
  const build = async () => {
    if (anim || building) return;
    building = true;
    const lottie = await loadLottie();
    if (!lottie) return;
    let animationData = null;
    try {
      const res = await fetch(jsonUrl);
      if (res.ok) animationData = await res.json();
    } catch (e) { /* text-only fallback */ }
    if (!animationData) return;
    anim = lottie.loadAnimation({
      container,
      renderer: 'svg',
      loop: false,
      autoplay: false,
      animationData,
    });
  };
  return {
    async play() {
      await build();
      if (anim) { anim.goToAndStop(0, true); anim.play(); }
    },
  };
}

/** Extract eyebrow/heading/body/callout from an authored content cell. */
function decorateContent(contentCell, newEnergy) {
  contentCell.classList.add('energy-journey-content');
  // eyebrow = a leading short paragraph before the heading
  const heading = contentCell.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) {
    const prev = heading.previousElementSibling;
    if (prev && prev.tagName === 'P' && prev.textContent.trim().length < 60) {
      prev.classList.add('energy-journey-eyebrow');
    }
    if (heading.tagName !== 'H3') {
      const h3 = document.createElement('h3');
      h3.innerHTML = heading.innerHTML;
      heading.replaceWith(h3);
    }
  }
  if (newEnergy) {
    // the .new-energy stages are statement pairs joined by a "What makes it
    // possible for us…" chip — style that paragraph as a connector.
    [...contentCell.querySelectorAll('p')].forEach((p) => {
      if (/what makes .*possible for us/i.test(p.textContent)) {
        p.classList.add('energy-journey-connector');
      }
    });
    return contentCell;
  }
  // callout: the last <h4> (a "Did you know?" marker) + its following paragraph
  const h4 = [...contentCell.querySelectorAll('h4')].pop();
  if (h4) {
    const callout = document.createElement('div');
    callout.className = 'energy-journey-callout';
    const after = h4.nextElementSibling;
    h4.classList.add('energy-journey-callout-title');
    callout.append(h4);
    if (after && after.tagName === 'P') callout.append(after);
    contentCell.append(callout);
  }
  return contentCell;
}

/* ---- Swiper: load the locally vendored bundle (JS + CSS) once, lazily ----
   The source builds these horizontal sliders with Swiper; we vendor it (like
   the Lottie player) and reuse it so the slide layout/transitions match exactly
   without a build step or CDN dependency. */
let swiperLoader = null;
function loadSwiper() {
  if (window.Swiper) return Promise.resolve(window.Swiper);
  if (swiperLoader) return swiperLoader;
  swiperLoader = new Promise((resolve, reject) => {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = `${window.hlx.codeBasePath}/blocks/energy-journey/swiper-bundle.min.css`;
    document.head.append(css);
    const s = document.createElement('script');
    s.src = `${window.hlx.codeBasePath}/blocks/energy-journey/swiper-bundle.min.js`;
    s.async = true;
    s.onload = () => resolve(window.Swiper);
    s.onerror = reject;
    document.head.append(s);
  }).catch(() => null);
  return swiperLoader;
}

export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  if (!rows.length) return;

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Interactive journey');
  if (!block.hasAttribute('aria-label')) block.setAttribute('aria-label', 'The Journey of Energy');

  const isNewEnergy = block.classList.contains('new-energy');

  const [introRow, ...stageRows] = rows;

  // ---- opening title (step 0) ----
  const intro = document.createElement('div');
  intro.className = 'energy-journey-intro';
  const introCell = introRow ? introRow.querySelector(':scope > div') || introRow : null;
  const introHandles = [];
  if (introCell) {
    // the .new-energy variant shows a Lottie (the wind turbine) atop the intro,
    // authored as a leading JSON link in the intro cell.
    const introJson = findAnimLink(introCell);
    if (introJson) {
      const anim = document.createElement('div');
      anim.className = 'energy-journey-intro-anim';
      anim.setAttribute('aria-hidden', 'true');
      introHandles.push(createLottieHandle(anim, resolveAnimationUrl(introJson.getAttribute('href'))));
      introJson.closest('p')?.remove();
      introJson.remove();
      intro.append(anim);
    }
    [...introCell.childNodes].forEach((n) => intro.append(n));
  }
  // white dot + inherit-line (draws up, turns right)
  const dot = document.createElement('div');
  dot.className = 'energy-journey-dot';
  dot.setAttribute('aria-hidden', 'true');
  // location marker: a white teardrop pin with a green target glyph, sitting
  // ABOVE the dot (source .green-starting-dot img, alt "Target icon").
  const marker = document.createElement('div');
  marker.className = 'energy-journey-marker';
  marker.setAttribute('aria-hidden', 'true');
  marker.innerHTML = '<svg viewBox="0 0 40 52" width="40" height="52" focusable="false" aria-hidden="true">'
    + '<path d="M20 0C9 0 0 9 0 20c0 13 20 32 20 32s20-19 20-32C40 9 31 0 20 0Z" fill="#fff"/>'
    + '<circle cx="20" cy="20" r="10" fill="none" stroke="#008542" stroke-width="2"/>'
    + '<circle cx="20" cy="20" r="5" fill="none" stroke="#008542" stroke-width="2"/>'
    + '<circle cx="20" cy="20" r="1.6" fill="#008542"/></svg>';
  dot.append(marker);
  const inheritLine = document.createElement('div');
  inheritLine.className = 'energy-journey-inherit-line';
  dot.append(inheritLine);
  // the intro dot's own grow-line (source .green-starting-dot .grow-line.to-pessoas)
  const introGrowLine = document.createElement('div');
  introGrowLine.className = 'energy-journey-grow-line to-pessoas';
  introGrowLine.setAttribute('aria-hidden', 'true');
  dot.append(introGrowLine);
  intro.append(dot);

  // ---- stages ----
  const stagesWrap = document.createElement('div');
  stagesWrap.className = 'energy-journey-stages';

  // Per-stage grow-line targets, VERBATIM from the source (.section-slider-green
  // .grow-line.to-*). Each stage's line has a fixed left/top + a default width
  // reaching toward its illustration; when the stage's slide becomes active the
  // line collapses to 0 (source `.swiper-slide-active .grow-line{width:0}`), so
  // it reads as a line travelling in from the left toward the vector. The intro
  // dot carries `to-pessoas`; stages carry to-map/boat/factory/storage/truck.
  const GROW_TARGETS = ['to-map', 'to-boat', 'to-factory', 'to-storage', 'to-truck'];

  const lottieHandles = [];
  const stages = stageRows.map((row, stageIndex) => {
    const cells = [...row.children];
    const mediaCell = cells.find((c) => c.querySelector('a[href], picture, img')) || cells[0];
    const contentCell = cells.find((c) => c !== mediaCell) || cells[1] || cells[0];

    const stage = document.createElement('div');
    stage.className = 'energy-journey-stage';

    // media: lottie JSON link → anim slot; picture → image. plus a grow-line.
    const image = document.createElement('div');
    image.className = 'energy-journey-image';
    if (mediaCell) {
      const jsonLink = findAnimLink(mediaCell);
      const pic = mediaCell.querySelector('picture, img');
      if (jsonLink) {
        const anim = document.createElement('div');
        anim.className = 'energy-journey-anim';
        // tag the anim with its source name (anim-plataforma → anim-plataforma)
        // so the per-anim SVG transforms (from the source) can position it.
        const nameMatch = (jsonLink.getAttribute('href') || '').match(/anim-([a-z0-9]+)/i);
        if (nameMatch) anim.classList.add(`anim-${nameMatch[1].toLowerCase()}`);
        anim.setAttribute('aria-hidden', 'true');
        image.append(anim);
        lottieHandles.push(createLottieHandle(anim, resolveAnimationUrl(jsonLink.getAttribute('href'))));
      } else if (pic) {
        const wrap = document.createElement('div');
        wrap.className = 'energy-journey-anim';
        wrap.append(pic.closest('picture') || pic);
        image.append(wrap);
        lottieHandles.push(null);
      } else {
        lottieHandles.push(null);
      }
    } else {
      lottieHandles.push(null);
    }
    // grow-line with the source's per-target class (the last stage has none)
    const target = GROW_TARGETS[stageIndex];
    if (target) {
      const growLine = document.createElement('div');
      growLine.className = `energy-journey-grow-line ${target}`;
      growLine.setAttribute('aria-hidden', 'true');
      image.append(growLine);
    }
    stage.append(image);

    // content card
    if (contentCell) {
      const scroll = document.createElement('div');
      scroll.className = 'energy-journey-content-scroll';
      // the card body can scroll on desktop; make it keyboard-operable (a11y:
      // scrollable-region-focusable) and label it from its heading.
      scroll.tabIndex = 0;
      scroll.setAttribute('role', 'group');
      const decorated = decorateContent(contentCell, isNewEnergy);
      const h = decorated.querySelector('h1, h2, h3');
      if (h) scroll.setAttribute('aria-label', h.textContent.trim());
      // move the decorated children into the scroll wrapper
      [...decorated.childNodes].forEach((n) => scroll.append(n));
      decorated.append(scroll);
      stage.append(decorated);
    }

    stagesWrap.append(stage);
    return stage;
  });

  // Progress is shown by the PAGE-LEVEL fixed dot-rail (.jde-nav, built by the
  // jornada-da-energia template), not a per-block rail — matching the source
  // where a single fixed rail tracks all sections.

  // ---- assemble into a Swiper: track > pin > swiper[ intro, stages… ] ----
  // The section PINS while you scroll; scroll position drives Swiper.slideTo, so
  // the horizontal strip advances one full-viewport panel at a time (intro, then
  // each vector) — travelling RIGHT along the baseline, vectors appearing one
  // after another. At the last panel the pin releases and the page scrolls on.
  // Below 992px Swiper is not used: panels flow vertically and reveal on scroll.
  intro.classList.add('swiper-slide');
  stages.forEach((s) => s.classList.add('swiper-slide'));

  const wrapper = document.createElement('div');
  wrapper.className = 'swiper-wrapper';
  wrapper.append(intro, ...stages);

  const swiperEl = document.createElement('div');
  swiperEl.className = 'swiper energy-journey-swiper';
  swiperEl.append(wrapper);

  const pin = document.createElement('div');
  pin.className = 'energy-journey-pin';
  pin.append(swiperEl);
  const track = document.createElement('div');
  track.className = 'energy-journey-track';
  track.append(pin);

  block.textContent = '';
  block.append(track);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = window.matchMedia('(min-width: 992px)');

  // activate the inherit-line (draw up + turn right) when the section is pinned,
  // and play the intro Lottie (the .new-energy turbine) once on first activation
  let introPlayed = false;
  const activateLine = () => {
    inheritLine.classList.add('is-active');
    if (!introPlayed && !reduceMotion.matches) {
      introPlayed = true;
      introHandles.forEach((h) => h && h.play());
    }
  };

  // mark the current stage and play its Lottie ONCE the first time it is reached
  const played = new Set();
  const playStage = (i) => {
    stages.forEach((s, idx) => s.classList.toggle('is-current', idx === i));
    if (i < 0 || played.has(i) || reduceMotion.matches) return;
    const handle = lottieHandles[i];
    if (handle) { played.add(i); window.setTimeout(() => handle.play(), 250); }
  };

  // ---- MOBILE (and reduced motion): reveal-on-scroll, no Swiper ----
  let revealObserver = null;
  const setupReveal = () => {
    activateLine();
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-active');
        const idx = stages.indexOf(entry.target);
        const handle = lottieHandles[idx];
        if (handle && !reduceMotion.matches) handle.play();
      });
    }, { threshold: 0.35 });
    stages.forEach((s) => revealObserver.observe(s));
  };
  const teardownReveal = () => {
    if (revealObserver) { revealObserver.disconnect(); revealObserver = null; }
    stages.forEach((s) => s.classList.remove('is-active'));
  };

  // ---- DESKTOP: Swiper horizontal slider, driven by a TALL PINNED TRACK ----
  // The source locks the page and drives slides by mouse-wheel notches. Snapping
  // window.scrollTo every frame fights the browser's native scroll (janky, and it
  // can't actually PIN a section that is only one viewport tall). Instead we give
  // the track REAL scroll distance — (panels)×100svh — so the inner .pin sticks
  // for the whole strip, and we map how far the track has scrolled to the active
  // slide. Result is the same experience the source gives: as you scroll the
  // section holds, the vertical inherit-line draws to the pin, then each vector's
  // grow-line collapses in turn as the strip advances, and at the end the pin
  // releases and the page scrolls on — but scroll-LINKED, so it never fights you.
  let swiper = null;
  let scrollHandler = null;
  const panels = stages.length + 1; // intro + stages
  const setupPinned = async () => {
    // one viewport of scroll distance PER panel, so the pin sticks the whole way
    track.style.height = `${panels * 100}svh`;
    const Swiper = await loadSwiper();
    if (!Swiper) { track.style.height = ''; setupReveal(); return; }
    swiper = new Swiper(swiperEl, {
      direction: 'horizontal',
      slidesPerView: 1,
      speed: reduceMotion.matches ? 0 : 600,
      allowTouchMove: false, // scroll position (not drag/wheel) drives the slides
      keyboard: { enabled: true },
      a11y: { enabled: true },
    });
    swiper.on('slideChange', () => playStage(swiper.activeIndex - 1));

    let lineActivated = false;
    let ticking = false;
    const update = () => {
      ticking = false;
      const rect = track.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = track.offsetHeight - vh; // scroll distance while pinned
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      const p = total > 0 ? scrolled / total : 0;
      const pinned = rect.top <= 1 && rect.bottom >= vh;
      // draw the inherit-line (and play the intro anim) as soon as we pin
      if ((pinned || p > 0) && !lineActivated) { activateLine(); lineActivated = true; }
      if (!pinned && p <= 0 && lineActivated) {
        // scrolled back above the section → retract the line, reset to intro
        inheritLine.classList.remove('is-active');
        lineActivated = false;
      }
      block.classList.toggle('is-scrollable', pinned || p > 0);
      // map scroll progress → active panel (0 = intro, then each stage)
      const panel = Math.min(panels - 1, Math.max(0, Math.round(p * (panels - 1))));
      if (swiper && panel !== swiper.activeIndex) swiper.slideTo(panel);
    };
    scrollHandler = () => {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    };
    window.addEventListener('scroll', scrollHandler, { passive: true });
    window.addEventListener('resize', scrollHandler, { passive: true });
    update();
  };

  const teardownPinned = () => {
    if (scrollHandler) {
      window.removeEventListener('scroll', scrollHandler);
      window.removeEventListener('resize', scrollHandler);
      scrollHandler = null;
    }
    if (swiper) { swiper.destroy(true, true); swiper = null; }
    track.style.height = '';
    block.classList.remove('is-scrollable', 'is-past');
    stages.forEach((s) => s.classList.remove('is-current'));
  };

  const applyMode = () => {
    teardownPinned();
    teardownReveal();
    if (desktop.matches) setupPinned();
    else setupReveal();
  };

  applyMode();
  // re-evaluate on breakpoint changes (desktop Swiper ⇄ mobile reveal)
  if (desktop.addEventListener) desktop.addEventListener('change', applyMode);
}
