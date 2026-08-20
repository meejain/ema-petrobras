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
// Both arrays were MEASURED from the source (petrobras.com.br/bolivia) and are
// expressed in the SAME coordinate system: fractions of the media (photo) box,
// clockwise from the top-left. They live side-by-side here so the clip and the
// gold frame stay coherent and can only ever be changed together — never derived
// from live DOM, so they cannot drift.
//
// HERO_DS_CORNERS: the photo clip. In objectBoundingBox units (0..1). Matches the
// source's diagonal crop — top-left notched in/down, bottom-left lifted, and the
// right edge running off the media box.
const HERO_DS_CORNERS = [
  [0.167, 0.093], // top-left  — notched right + down
  [0.992, 0], // top-right — at the top edge, hard right
  [1, 1], // bottom-right — full corner (photo bleeds off the right)
  [0, 0.755], // bottom-left — on the left edge, lifted up from the bottom
];

// HERO_DS_OUTLINE_CORNERS: the decorative gold frame. NOT a scaled echo of the
// clip — the source draws a SEPARATE, more-skewed parallelogram that floats OFF
// the photo: its top-left clears the photo's top-left with a gap, its top edge
// rises steeply and flies far past the right edge, and its bottom sits below the
// photo. Measured (as media-box fractions) from the source's stroked <svg>. Values
// exceed 0..1 on purpose (the frame overflows the media box); the outline svg uses
// overflow:visible so the excess renders past the photo like the source.
const HERO_DS_OUTLINE_CORNERS = [
  [0.12, 0.505], // top-left  — floats left, mid-height (gap above the photo's TL)
  [1.81, -0.014], // top-right — rises up and flies well past the right edge
  [1.85, 1.265], // bottom-right — off the right, below the photo
  [0.263, 1.149], // bottom-left — below the photo, inset from the left
];

// corner fillet radius, as a fraction of the bounding box (soft rounded corners)
const HERO_DS_ROUND = 0.025;

/** unit vector from (0,0) toward (dx,dy) */
function unit(dx, dy) {
  const len = Math.hypot(dx, dy) || 1;
  return [dx / len, dy / len];
}

/** round to 3 decimals to keep path strings compact */
const fx = (v) => Math.round(v * 1000) / 1000;

/**
 * Build a rounded-quadrilateral SVG path `d` string from four corners.
 * Each corner arrives short of the vertex along the incoming edge, quadratic-
 * curves THROUGH the vertex, then leaves short along the outgoing edge — an even
 * fillet at all four corners.
 * @param {number[][]} corners four [x,y] points (clockwise)
 * @param {number} radius fillet radius in the same units as the corners
 * @param {number} scale multiply every coordinate (1 = bbox units, 100 = viewBox)
 * @returns {string} the path data
 */
function roundedQuadPath(corners, radius, scale) {
  const p = corners.map(([x, y]) => [x * scale, y * scale]);
  const r = radius * scale;
  const n = p.length;
  const pts = p.map((cur, i) => {
    const prev = p[(i - 1 + n) % n];
    const next = p[(i + 1) % n];
    const inDir = unit(prev[0] - cur[0], prev[1] - cur[1]);
    const outDir = unit(next[0] - cur[0], next[1] - cur[1]);
    return {
      cur,
      entry: [cur[0] + inDir[0] * r, cur[1] + inDir[1] * r],
      exit: [cur[0] + outDir[0] * r, cur[1] + outDir[1] * r],
    };
  });
  const parts = [`M ${fx(pts[0].entry[0])} ${fx(pts[0].entry[1])}`];
  for (let i = 0; i < n; i += 1) {
    const { cur, exit } = pts[i];
    const nextEntry = pts[(i + 1) % n].entry;
    parts.push(`Q ${fx(cur[0])} ${fx(cur[1])} ${fx(exit[0])} ${fx(exit[1])}`);
    parts.push(`L ${fx(nextEntry[0])} ${fx(nextEntry[1])}`);
  }
  parts.push('Z');
  return parts.join(' ');
}

/**
 * Build the decorative gold outline that FLOATS around the diagonal photo. It is
 * NOT a scaled echo of the clip — it draws the SEPARATE, more-skewed source
 * parallelogram (HERO_DS_OUTLINE_CORNERS) as a translated/parallel frame: it
 * clears the photo's top-left with a gap and flies off past the right edge,
 * matching the source's stroked <svg> graphism (stroke #E8AD02, ~1.3px).
 *
 * The outline shares the media box's coordinate system with the clip (both in
 * media-box fractions), so it stays aligned to the photo at every viewport. It is
 * rendered in a viewBox 0 0 100 100 with `preserveAspectRatio: none` so it
 * stretches to the media box; corners with coordinates outside 0..100 draw past
 * the photo (svg overflow: visible), just like the source.
 * @returns {SVGElement} the decorative outline
 */
function buildOutline() {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'hero-ds-outline');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', roundedQuadPath(HERO_DS_OUTLINE_CORNERS, HERO_DS_ROUND, 100));
  path.setAttribute('fill', 'none');
  path.setAttribute('vector-effect', 'non-scaling-stroke');
  svg.append(path);
  return svg;
}

// Unique id so multiple diagonal-split heroes on a page don't collide.
let heroDsClipSeq = 0;

/**
 * Build an SVG clipPath (objectBoundingBox units) reproducing the source's
 * diagonal parallelogram with softly rounded corners — generated from the SAME
 * HERO_DS_CORNERS the outline uses. Returns { defs, id } so the image can
 * reference url(#id).
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
  path.setAttribute('d', roundedQuadPath(HERO_DS_CORNERS, HERO_DS_ROUND, 1));
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

  // --- content column ---
  if (contentCell) {
    contentCell.className = 'hero-ds-content';

    // breadcrumb: authored as a <ul>; render as an accessible <nav><ol>.
    const list = contentCell.querySelector('ul, ol');
    if (list) {
      const nav = document.createElement('nav');
      nav.className = 'hero-ds-breadcrumb';
      nav.setAttribute('aria-label', 'Breadcrumb');
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
      nav.append(ol);
      list.replaceWith(nav);
    }

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

  // Hoist the two cells to be direct children of the block so the block's
  // flex layout controls the content/media split, then drop the empty row.
  if (contentCell) block.append(contentCell);
  if (mediaCell) block.append(mediaCell);
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
