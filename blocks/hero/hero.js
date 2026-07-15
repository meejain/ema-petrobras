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
export default async function decorate(block) {
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
