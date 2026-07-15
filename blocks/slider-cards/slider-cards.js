import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'slider-cards-card-image';
      else div.className = 'slider-cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));

  // horizontal slider: scrollable track + prev/next arrow controls (matches source)
  const viewport = document.createElement('div');
  viewport.className = 'slider-cards-viewport';
  viewport.append(ul);

  const controls = document.createElement('div');
  controls.className = 'slider-cards-controls';
  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'slider-cards-arrow slider-cards-prev';
  prev.setAttribute('aria-label', 'Rolar para a esquerda');
  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'slider-cards-arrow slider-cards-next';
  next.setAttribute('aria-label', 'Rolar para a direita');
  controls.append(prev, next);

  const scrollByCards = (dir) => {
    const card = ul.querySelector('li');
    const gap = parseFloat(getComputedStyle(ul).columnGap) || 32;
    const step = card ? card.getBoundingClientRect().width + gap : viewport.clientWidth;
    viewport.scrollBy({ left: dir * step, behavior: 'smooth' });
  };
  prev.addEventListener('click', () => scrollByCards(-1));
  next.addEventListener('click', () => scrollByCards(1));

  const updateArrows = () => {
    const maxScroll = viewport.scrollWidth - viewport.clientWidth - 1;
    prev.disabled = viewport.scrollLeft <= 0;
    next.disabled = viewport.scrollLeft >= maxScroll;
  };
  viewport.addEventListener('scroll', updateArrows);
  window.addEventListener('resize', updateArrows);
  // recompute once the card widths from CSS/media queries have settled
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(updateArrows).observe(ul);
  }

  block.replaceChildren(viewport, controls);
  requestAnimationFrame(updateArrows);
}
