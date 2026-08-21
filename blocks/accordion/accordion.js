/*
 * Accordion Block
 * Each authored row is a label cell + a body cell. We turn every row into a
 * native <details>/<summary> disclosure so it works without JS, then add a
 * chevron and (for the base FAQ variant) single-open behaviour.
 *
 * Variants (2nd class on the block):
 *   - downloads   body is a list of document/download links
 *   - table-docs  body contains a specs table plus document links
 */

// Upward "^" chevron matching the source markup (viewBox 0 0 18 10).
const CHEVRON = '<svg class="accordion-chevron" aria-hidden="true" focusable="false" width="18" height="10" viewBox="0 0 18 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.5 9L9 1.5L16.5 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

export default function decorate(block) {
  const singleOpen = !block.classList.contains('downloads')
    && !block.classList.contains('table-docs');

  const items = [];

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    // Gracefully handle rows missing a label or body cell.
    const labelCell = cells[0];
    const bodyCell = cells[1];
    if (!labelCell) {
      row.remove();
      return;
    }

    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';
    summary.append(...labelCell.childNodes);
    summary.insertAdjacentHTML('beforeend', CHEVRON);

    const body = bodyCell || document.createElement('div');
    body.className = 'accordion-item-body';

    const details = document.createElement('details');
    details.className = 'accordion-item';
    details.append(summary, body);
    row.replaceWith(details);
    items.push(details);
  });

  if (singleOpen) {
    items.forEach((details) => {
      const summary = details.querySelector('summary');
      summary.addEventListener('click', () => {
        // Native toggle happens after this handler; close the others now.
        if (!details.open) {
          items.forEach((other) => {
            if (other !== details) other.open = false;
          });
        }
      });
    });
  }
}
