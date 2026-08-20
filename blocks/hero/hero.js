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

export default async function decorate(block) {
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
