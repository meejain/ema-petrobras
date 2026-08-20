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

/**
 * Build the decorative thin gold outline that traces the diagonal photo.
 * Mirrors the source's stroked <svg> graphism (stroke #E8AD02, ~2px): a
 * parallelogram offset slightly outward from the image clip so it peeks past
 * the top-right and bottom edges. Rendered as a viewBox 0 0 100 100 polygon
 * with a non-scaling stroke so the line stays crisp at any block size.
 * @returns {SVGElement} the decorative outline
 */
function buildOutline() {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'hero-ds-outline');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  // A thin gold parallelogram offset OUTWARD from the photo clip, with rounded
  // corners echoing the clip. viewBox 0-100; corners pushed a few units past
  // each clip vertex so the line peeks around the photo (source graphism).
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', [
    'M 19 21',
    'L 96 13',
    'Q 100.5 12.5 100.5 17',
    'L 101.5 86',
    'Q 101.5 90.5 97 89.5',
    'L 2 72',
    'Q -2.5 71 -2.3 66.5',
    'L 14 25',
    'Q 14.5 21.5 19 21',
    'Z',
  ].join(' '));
  path.setAttribute('fill', 'none');
  path.setAttribute('vector-effect', 'non-scaling-stroke');
  svg.append(path);
  return svg;
}

// Unique id so multiple diagonal-split heroes on a page don't collide.
let heroDsClipSeq = 0;

/**
 * Build an SVG clipPath (objectBoundingBox units) that reproduces the source's
 * diagonal parallelogram WITH softly rounded corners — a plain CSS polygon()
 * clip can only make sharp corners. The path walks the four corners
 * (0.17,0.25 → 0.99,0.19 → 1,0.89 → 0.01,0.72) and rounds each with a short
 * quadratic curve. Returns { defs, id } so the image can reference url(#id).
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
  // corners + short quadratic fillets (~0.02 in x, ~0.03 in y) at each vertex
  // Each corner: arrive short of the vertex, quadratic-curve THROUGH it, then
  // leave short on the next edge — a generous, even fillet at all four corners
  // (larger radius to match the source's soft parallelogram).
  // Corners: TL(0.17,0.25) TR(0.99,0.19) BR(1,0.89) BL(0.01,0.72).
  path.setAttribute('d', [
    'M 0.205 0.242',
    'L 0.95 0.194',
    'Q 0.99 0.19 0.99 0.235',
    'L 1 0.845',
    'Q 1 0.89 0.96 0.879',
    'L 0.05 0.71',
    'Q 0.01 0.72 0.012 0.675',
    'L 0.165 0.285',
    'Q 0.17 0.25 0.205 0.242',
    'Z',
  ].join(' '));
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
