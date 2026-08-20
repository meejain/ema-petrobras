import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * loads and decorates the cards block
 * Supports the default card (image + body) plus three visual variants
 * authored as a class on the block: `grid`, `icon`, `feature`.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.replaceChildren(ul);

  // grid variant: pull the title up next to the image in a shared header row
  // (source: bold title top-left, small rounded image top-right, yellow bar
  // under the title, then body text and green link below).
  if (block.classList.contains('grid')) {
    ul.querySelectorAll(':scope > li').forEach((li) => {
      const image = li.querySelector(':scope > .cards-card-image');
      const body = li.querySelector(':scope > .cards-card-body');
      const heading = body && body.querySelector('h1, h2, h3, h4, h5, h6');
      if (image && heading) {
        const head = document.createElement('div');
        head.className = 'cards-card-head';
        const title = document.createElement('div');
        title.className = 'cards-card-title';
        title.append(heading);
        head.append(title, image);
        li.prepend(head);
      }
    });
  }
}
