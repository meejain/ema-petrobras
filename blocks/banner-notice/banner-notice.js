/**
 * Banner Notice — a bordered card with a heading, yellow accent bar, and notice text.
 * Authored structure: one row with the heading + paragraph(s).
 */
export default function decorate(block) {
  const rows = [...block.children];
  const cell = rows[0]?.querySelector(':scope > div') || rows[0];

  const inner = document.createElement('div');
  inner.className = 'banner-notice-inner';

  if (cell) {
    while (cell.firstChild) inner.append(cell.firstChild);
  }

  block.textContent = '';
  block.append(inner);
}
