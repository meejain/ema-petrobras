/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-product. Base: cards.
 * Source: https://petrobras.com.br/
 * Generated: 2026-07-15
 *
 * Block structure (from library-description.txt): 2 columns, multiple rows.
 * Row 1: block name. Each subsequent row = one card:
 *   cell 1 = product image (mandatory), cell 2 = heading + description + CTA link.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Preserve the section heading ("Produtos mais sustentáveis") as default
  // content. The block instance selector is the whole section div, so replacing
  // it would otherwise drop the heading. Capture it now (it is not part of any
  // card) and re-insert it before the block below.
  const sectionHeading = element.querySelector('.title-wrapper h1, .title-wrapper h2, .title-wrapper h3, .petro-title h1, .petro-title h2, .petro-title h3');

  // Each product card is a .card-container within the slider.
  const cards = element.querySelectorAll('.card-container');

  cards.forEach((card) => {
    const image = card.querySelector('.media-container img, picture img, img');
    const heading = card.querySelector('.content-body .title h3, .title h3, h3, h4, h2');
    const description = card.querySelector('.body-text .text, .body-text > .text, .text.paragraph-sm-regular');
    // CTA: the real navigable anchor (skip decorative icon markup).
    const anchor = card.querySelector('.card-label a[href], a.tertiary-button, a[href]');

    if (!image && !heading && !description && !anchor) return;

    const contentCell = [];
    if (heading && heading.textContent.trim()) contentCell.push(heading);
    if (description && description.textContent.trim()) contentCell.push(description);
    if (anchor && anchor.getAttribute('href')) {
      const link = document.createElement('a');
      link.setAttribute('href', anchor.getAttribute('href'));
      const label = card.querySelector('.button-text, .visuallyhidden');
      link.textContent = (label ? label.textContent : anchor.textContent).trim();
      contentCell.push(link);
    }

    cells.push([image || '', contentCell.length ? contentCell : '']);
  });

  // Empty-block guard
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'slider-cards', cells });

  // Re-insert the section heading as default content immediately before the block.
  if (sectionHeading && sectionHeading.textContent.trim()) {
    const h = document.createElement(sectionHeading.tagName.toLowerCase().match(/^h[1-6]$/) ? sectionHeading.tagName.toLowerCase() : 'h2');
    h.textContent = sectionHeading.textContent.trim();
    element.replaceWith(h, block);
    return;
  }

  element.replaceWith(block);
}
