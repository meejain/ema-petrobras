/*
 * Accordion Block
 * Recreate an accordion
 * https://www.hlx.live/developer/block-collection/accordion
 */

export default function decorate(block) {
  [...block.children].forEach((row) => {
    // decorate accordion item label
    const label = row.children[0];
    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';
    summary.append(...label.childNodes);
    // decorate accordion item body
    const body = row.children[1];
    body.className = 'accordion-item-body';
    // decorate accordion item
    const details = document.createElement('details');
    details.className = 'accordion-item';
    details.append(summary, body);
    row.replaceWith(details);
  });

  // single-open: opening one item closes the others.
  // Also toggle a `no-hover` class on the block while any item is open so the
  // hover highlight is disabled whenever an item is expanded (matches original).
  const items = [...block.querySelectorAll('details.accordion-item')];
  const syncNoHover = () => {
    block.classList.toggle('no-hover', items.some((d) => d.open));
  };
  items.forEach((details) => {
    details.addEventListener('toggle', () => {
      if (details.open) {
        items.forEach((other) => {
          if (other !== details) other.open = false;
        });
      }
      syncNoHover();
    });
    // Update the hover-disabling class immediately on click, before the async
    // toggle event fires, so the hover highlight never flashes during the change.
    details.querySelector('summary').addEventListener('click', () => {
      const willBeOpen = !details.open;
      block.classList.toggle('no-hover', willBeOpen || items.some((d) => d !== details && d.open));
    });
  });
}
