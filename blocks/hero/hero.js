/**
 * Petrobras hero banner.
 *
 * Authored structure (each row = one slide):
 *   row 0 -> main banner: [ image cell ][ h1 + subtitle + cta cell ]
 *   row 1..n -> highlight card: [ image cell ][ link cell ]
 *
 * Rendered structure:
 *   .hero
 *     .hero-main            (row 0)
 *       .hero-main-image
 *       .hero-overlay
 *       .hero-main-content
 *     .hero-cards           (rows 1..n)
 *       .hero-card * n
 */
/**
 * Hero "diagonal-split" variant.
 *
 * Authored as "Hero (diagonal-split)" (block classes: `hero diagonal-split`).
 * Content model — a single row with two cells:
 *   cell 1 (content): a <ul> breadcrumb trail (last <li> = current page, no link),
 *                     an <h1>/<h2> heading, and a body <p>.
 *   cell 2 (media):   a <picture>/<img> photo (descriptive alt required).
 *
 * Rendered structure:
 *   .hero.diagonal-split
 *     .hero-ds-content
 *       nav.hero-ds-breadcrumb > ol > li…      (last li aria-current)
 *       h1/h2                                   (yellow accent bar via CSS ::after)
 *       .hero-ds-body
 *     .hero-ds-media                            (diagonal clip-path on the image)
 *       svg.hero-ds-outline (aria-hidden)       (thin gold stroked parallelogram,
 *                                                offset outward, tracing the photo)
 *       picture/img
 */
const SVG_NS = 'http://www.w3.org/2000/svg';

// Shared geometry for the diagonal-split hero — the SINGLE source of truth.
// Both paths are the EXACT source shapes (petrobras.com.br/bolivia, 1440px),
// captured from the live DOM and expressed in the SAME coordinate system:
// objectBoundingBox fractions of the photo box (proportioned 735x848), so the
// clip and the gold frame stay perfectly coherent at every viewport. Curves are
// preserved verbatim (the source's bottom/left edges bow slightly — reproducing
// them avoids the over-pointed corners a straight-line quad would give).
// Coordinates exceed 1 on purpose: the photo/frame bleed off the right edge.
//
// HERO_DS_CLIP_PATH — the photo clip (source's computed clip-path, normalised).
const HERO_DS_CLIP_PATH = 'M 0.33592 0.25350 L 1.92875 0.18793 L 1.94439 0.89371 '
  + 'C 1.70684 0.86300 0.03327 0.72993 0.01282 0.72098 '
  + 'C -0.00763 0.71202 0.00089 0.69142 0.00771 0.68223 '
  + 'C 0.08951 0.55740 0.25596 0.30257 0.26742 0.28191 '
  + 'C 0.27887 0.26125 0.31786 0.25436 0.33592 0.25350 Z';

// HERO_DS_OUTLINE_PATH — the decorative gold frame (source's stroked <svg> path,
// mapped through its screen CTM into the SAME photo-box fractions). A subtle line
// near the top-left whose dominant sweep runs off toward the bottom-right, tracing
// just outside the photo's edges as an offset echo.
const HERO_DS_OUTLINE_PATH = 'M 0.12013 0.34988 L 1.81047 -0.00986 '
  + 'C 1.83067 -0.01416 1.85017 -0.00091 1.85017 0.01713 L 1.85017 0.87740 '
  + 'C 1.85017 0.89362 1.83419 0.90640 1.81553 0.90510 L 0.26267 0.79671 '
  + 'C 0.24954 0.79579 0.23839 0.78801 0.23456 0.77708 L 0.09710 0.38495 '
  + 'C 0.09175 0.36970 0.10227 0.35369 0.12013 0.34988 Z';

/**
 * Build the decorative gold outline tracing the diagonal photo — the EXACT source
 * stroked path (HERO_DS_OUTLINE_PATH), drawn in a unit viewBox (0 0 1 1) with
 * `preserveAspectRatio: none` so it stretches to the same box as the photo clip.
 * `vector-effect: non-scaling-stroke` keeps the 1.3px stroke crisp despite the
 * tiny user units; `overflow: visible` lets the frame fly off the right edge.
 * @returns {SVGElement} the decorative outline
 */
function buildOutline() {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'hero-ds-outline');
  svg.setAttribute('viewBox', '0 0 1 1');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', HERO_DS_OUTLINE_PATH);
  path.setAttribute('fill', 'none');
  path.setAttribute('vector-effect', 'non-scaling-stroke');
  svg.append(path);
  return svg;
}

// Unique id so multiple diagonal-split heroes on a page don't collide.
let heroDsClipSeq = 0;

/**
 * Build an SVG clipPath (objectBoundingBox units) reproducing the source's exact
 * diagonal parallelogram (HERO_DS_CLIP_PATH). Returns { defs, id } so the image
 * can reference url(#id).
 * @returns {{ defs: SVGElement, id: string }}
 */
function buildClip() {
  heroDsClipSeq += 1;
  const id = `hero-ds-clip-${heroDsClipSeq}`;
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'hero-ds-clip-defs');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const defs = document.createElementNS(SVG_NS, 'defs');
  const clip = document.createElementNS(SVG_NS, 'clipPath');
  clip.setAttribute('id', id);
  clip.setAttribute('clipPathUnits', 'objectBoundingBox');
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', HERO_DS_CLIP_PATH);
  clip.append(path);
  defs.append(clip);
  svg.append(defs);
  return { defs: svg, id };
}
function decorateDiagonalSplit(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  if (!rows.length) return;

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Banner');

  const row = rows[0];
  const cells = [...row.children];
  // The media cell is whichever cell holds the picture/img; the other is content.
  const mediaCell = cells.find((c) => c.querySelector('picture, img'));
  const contentCell = cells.find((c) => c !== mediaCell) || cells[0];

  // breadcrumb: authored as a <ul> inside the content cell; render as an
  // accessible <nav><ol> and HOIST it to be the block's first child so, on
  // mobile, the stack order matches the source (breadcrumb, photo, heading, body).
  let breadcrumb = null;
  const list = contentCell ? contentCell.querySelector('ul, ol') : null;
  if (list) {
    breadcrumb = document.createElement('nav');
    breadcrumb.className = 'hero-ds-breadcrumb';
    breadcrumb.setAttribute('aria-label', 'Breadcrumb');
    const ol = document.createElement('ol');
    [...list.children].forEach((li, i, arr) => {
      const item = document.createElement('li');
      const link = li.querySelector('a');
      if (link && i < arr.length - 1) {
        item.append(link);
      } else {
        // current page (or a plain-text crumb): no link, mark as current.
        const span = document.createElement('span');
        span.textContent = li.textContent.trim();
        span.setAttribute('aria-current', 'page');
        item.append(span);
      }
      ol.append(item);
    });
    breadcrumb.append(ol);
    list.remove();
  }

  // --- content column (heading + body) ---
  if (contentCell) {
    contentCell.className = 'hero-ds-content';

    const heading = contentCell.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) heading.classList.add('hero-ds-heading');

    // body: the paragraphs that are not part of the breadcrumb.
    contentCell.querySelectorAll(':scope > p').forEach((p) => p.classList.add('hero-ds-body'));
  }

  // --- media column ---
  if (mediaCell) {
    mediaCell.className = 'hero-ds-media';
    // rounded diagonal clip for the photo (unique id per instance)
    const { defs, id } = buildClip();
    mediaCell.prepend(defs);
    const img = mediaCell.querySelector('img');
    if (img) img.style.clipPath = `url('#${id}')`;
    // decorative thin gold outline tracing the diagonal photo (purely visual).
    mediaCell.prepend(buildOutline());
  }

  // Hoist to direct children of the block in source stacking order —
  // breadcrumb, media, content — so the block layout controls the split, then
  // drop the empty authored row. On desktop the CSS grid repositions the
  // breadcrumb and content into the left column and the media into the right.
  if (breadcrumb) block.append(breadcrumb);
  if (mediaCell) block.append(mediaCell);
  if (contentCell) block.append(contentCell);
  row.remove();
}

/**
 * Hero "slider" variant — a full-bleed hero CAROUSEL (source: the banner at the
 * top of petrobras.com.br/quem-somos/produtos, `.banner-hero`).
 *
 * Authored as "Hero (slider)" (block classes: `hero slider`). Each row = ONE
 * slide, with two cells:
 *   cell 1 (media):   a <picture>/<img> full-bleed background (descriptive alt).
 *   cell 2 (content): an <h1>/<h2> heading, a body <p>, and an optional CTA link.
 *
 * Rendered structure:
 *   .hero.slider [role=region, aria-roledescription=carousel]
 *     .hero-slider-track [aria-live]
 *       .hero-slide[.is-active] [role=group, aria-roledescription=slide] * N
 *         .hero-slide-image  (absolute, object-fit:cover)
 *         .hero-slide-content (heading + body + optional green pill CTA)
 *     .hero-slider-controls           (only when N > 1)
 *       button.hero-slider-playpause  (pause/play, white icon)
 *       .hero-slider-nav
 *         button.hero-slider-prev / .hero-slider-next  (white chevrons)
 *       .hero-slider-dots
 *         button[aria-current] * N
 *
 * Behaviour: autoplay (paused on hover/focus, and NOT started when the user
 * prefers reduced motion), prev/next + dot navigation, arrow-key operable.
 */
const HERO_AUTOPLAY_MS = 6000;

// Static, trusted inline SVGs (white strokes) mirroring the source controls.
const HERO_ICON_PAUSE = '<svg viewBox="0 0 14 16" fill="none" aria-hidden="true" focusable="false" width="14" height="16"><path d="M12.625 1.125H9.8125C9.4673 1.125 9.1875 1.4048 9.1875 1.75V14.25C9.1875 14.5952 9.4673 14.875 9.8125 14.875H12.625C12.9702 14.875 13.25 14.5952 13.25 14.25V1.75C13.25 1.4048 12.9702 1.125 12.625 1.125Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.1875 1.125H1.375C1.0298 1.125 0.75 1.4048 0.75 1.75V14.25C0.75 14.5952 1.0298 14.875 1.375 14.875H4.1875C4.5327 14.875 4.8125 14.5952 4.8125 14.25V1.75C4.8125 1.4048 4.5327 1.125 4.1875 1.125Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const HERO_ICON_PLAY = '<svg viewBox="0 0 18 20" fill="none" aria-hidden="true" focusable="false" width="18" height="20"><path d="M16.3844 9.3625 2.8938 1.1125C2.7802 1.0425 2.65 1.004 2.5166 1.001 2.3832 0.998 2.2514 1.0308 2.1349 1.0957 2.0183 1.1607 1.9212 1.2556 1.8535 1.3706 1.7859 1.4856 1.7502 1.6166 1.75 1.75V18.25C1.7502 18.3835 1.7859 18.5144 1.8535 18.6295 1.9212 18.7445 2.0183 18.8393 2.1349 18.9043 2.2514 18.9693 2.3832 19.002 2.5166 18.999 2.65 18.9961 2.7802 18.9576 2.8938 18.8875L16.3844 10.6375C16.4952 10.572 16.5869 10.4788 16.6507 10.367 16.7145 10.2552 16.748 10.1287 16.748 10 16.748 9.8714 16.7145 9.7449 16.6507 9.6331 16.5869 9.5213 16.4952 9.4281 16.3844 9.3625Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const HERO_ICON_PREV = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false" width="24" height="24"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const HERO_ICON_NEXT = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false" width="24" height="24"><path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function decorateSlider(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  if (!rows.length) return;

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'carousel');
  if (!block.hasAttribute('aria-label')) block.setAttribute('aria-label', 'Destaques');

  const track = document.createElement('div');
  track.className = 'hero-slider-track';

  const slides = rows.map((row, i) => {
    const cells = [...row.children];
    const imageCell = cells.find((c) => c.querySelector('picture, img')) || cells[0];
    const contentCell = cells.find((c) => c !== imageCell) || cells[1] || cells[0];

    const slide = document.createElement('div');
    slide.className = 'hero-slide';
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');
    slide.setAttribute('aria-label', `${i + 1} de ${rows.length}`);

    if (imageCell) {
      imageCell.className = 'hero-slide-image';
      slide.append(imageCell);
    }
    if (contentCell && contentCell !== imageCell) {
      contentCell.className = 'hero-slide-content';
      // decorate an optional CTA link (a standalone <p><a>) as the green pill.
      const cta = contentCell.querySelector('p:last-of-type a');
      if (cta && cta.closest('p').textContent.trim() === cta.textContent.trim()) {
        cta.classList.add('hero-cta');
        cta.closest('p').classList.add('hero-cta-wrapper');
      }
      slide.append(contentCell);
    }
    track.append(slide);
    return slide;
  });

  block.textContent = '';
  block.append(track);

  const total = slides.length;
  let current = 0;
  let timer = null;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const setActive = (idx) => {
    current = (idx + total) % total;
    slides.forEach((s, i) => {
      const active = i === current;
      s.classList.toggle('is-active', active);
      s.setAttribute('aria-hidden', active ? 'false' : 'true');
      if (active) s.removeAttribute('inert');
      else s.setAttribute('inert', '');
    });
    block.querySelectorAll('.hero-slider-dots button').forEach((dot, i) => {
      if (i === current) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  };

  // Single slide: no controls, no autoplay — just show it.
  if (total <= 1) {
    setActive(0);
    return;
  }

  // ---- controls ----
  const controls = document.createElement('div');
  controls.className = 'hero-slider-controls';

  let playing = false;
  const playPause = document.createElement('button');
  playPause.type = 'button';
  playPause.className = 'hero-slider-playpause';

  const stop = () => {
    if (timer) { clearInterval(timer); timer = null; }
    playing = false;
    playPause.innerHTML = HERO_ICON_PLAY;
    playPause.setAttribute('aria-label', 'Reproduzir apresentação');
    playPause.setAttribute('aria-pressed', 'false');
    track.setAttribute('aria-live', 'polite');
  };
  const start = () => {
    if (reduceMotion.matches) return;
    if (timer) clearInterval(timer);
    timer = setInterval(() => setActive(current + 1), HERO_AUTOPLAY_MS);
    playing = true;
    playPause.innerHTML = HERO_ICON_PAUSE;
    playPause.setAttribute('aria-label', 'Pausar apresentação');
    playPause.setAttribute('aria-pressed', 'true');
    track.setAttribute('aria-live', 'off');
  };

  playPause.addEventListener('click', () => (playing ? stop() : start()));

  const nav = document.createElement('div');
  nav.className = 'hero-slider-nav';
  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'hero-slider-prev';
  prev.setAttribute('aria-label', 'Slide anterior');
  prev.innerHTML = HERO_ICON_PREV;
  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'hero-slider-next';
  next.setAttribute('aria-label', 'Próximo slide');
  next.innerHTML = HERO_ICON_NEXT;
  prev.addEventListener('click', () => setActive(current - 1));
  next.addEventListener('click', () => setActive(current + 1));
  nav.append(prev, next);

  const dots = document.createElement('div');
  dots.className = 'hero-slider-dots';
  dots.setAttribute('role', 'group');
  dots.setAttribute('aria-label', 'Selecionar slide');
  slides.forEach((s, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Ir para o slide ${i + 1}`);
    dot.addEventListener('click', () => setActive(i));
    dots.append(dot);
  });

  controls.append(playPause, nav, dots);
  block.append(controls);

  // keyboard: arrow keys advance/retreat when focus is within the carousel.
  block.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      setActive(current - 1);
      e.preventDefault();
    } else if (e.key === 'ArrowRight') {
      setActive(current + 1);
      e.preventDefault();
    }
  });

  // pause on hover/focus, resume when leaving (only if it was autoplaying).
  const pauseIfPlaying = () => {
    if (playing && timer) { clearInterval(timer); timer = null; }
  };
  const resumeIfPlaying = () => {
    if (playing && !timer && !reduceMotion.matches) {
      timer = setInterval(() => setActive(current + 1), HERO_AUTOPLAY_MS);
    }
  };
  block.addEventListener('mouseenter', pauseIfPlaying);
  block.addEventListener('mouseleave', resumeIfPlaying);
  block.addEventListener('focusin', pauseIfPlaying);
  block.addEventListener('focusout', resumeIfPlaying);

  setActive(0);
  // respect reduced motion: leave paused; otherwise autoplay.
  if (reduceMotion.matches) stop();
  else start();
}

export default async function decorate(block) {
  if (block.classList.contains('slider')) {
    decorateSlider(block);
    return;
  }
  if (block.classList.contains('diagonal-split')) {
    decorateDiagonalSplit(block);
    return;
  }

  const rows = [...block.querySelectorAll(':scope > div')];
  if (!rows.length) return;

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Banner');

  const [mainRow, ...cardRows] = rows;

  // --- main banner ---
  const main = document.createElement('div');
  main.className = 'hero-main';

  const mainCells = [...mainRow.children];
  const imageCell = mainCells[0];
  const contentCell = mainCells[1];

  if (imageCell) {
    imageCell.className = 'hero-main-image';
    main.append(imageCell);
  }

  const overlay = document.createElement('div');
  overlay.className = 'hero-overlay';
  main.append(overlay);

  if (contentCell) {
    contentCell.className = 'hero-main-content';
    // decorate the CTA link (last <p> containing a link) as the pill button
    const cta = contentCell.querySelector('p:last-of-type a');
    if (cta) {
      cta.classList.add('hero-cta');
      cta.closest('p').classList.add('hero-cta-wrapper');
    }
    main.append(contentCell);
  }

  block.append(main);

  // --- highlight cards ---
  if (cardRows.length) {
    const cards = document.createElement('div');
    cards.className = 'hero-cards';

    cardRows.forEach((row) => {
      const card = document.createElement('div');
      card.className = 'hero-card';

      const cells = [...row.children];
      const cardImage = cells[0];
      const cardContent = cells[1];

      if (cardImage) {
        cardImage.className = 'hero-card-image';
        card.append(cardImage);
      }

      // make the whole card clickable via the card link
      const link = cardContent ? cardContent.querySelector('a') : null;
      if (cardContent) {
        cardContent.className = 'hero-card-content';
        card.append(cardContent);
      }
      if (link) {
        card.classList.add('hero-card-linked');
        card.addEventListener('click', (e) => {
          if (e.target.closest('a')) return;
          link.click();
        });
      }

      cards.append(card);
    });

    block.append(cards);
  }

  rows.forEach((row) => row.remove());
}
