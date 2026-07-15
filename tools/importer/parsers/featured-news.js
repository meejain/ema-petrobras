/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-news. Base: cards.
 * Source: https://petrobras.com.br/
 * Generated: 2026-07-15
 *
 * Block structure (from library-description.txt): 2 columns, multiple rows.
 * Row 1: block name. Each subsequent row = one card:
 *   cell 1 = image (mandatory), cell 2 = category tag + heading + link.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Preserve the section heading ("Fique por dentro das últimas notícias") as
  // default content. The block instance selector is the whole section div, so
  // replacing it would otherwise drop the heading. Capture it now (it is not part
  // of any card) and re-insert it before the block below.
  const sectionHeading = element.querySelector('.agency-highlight-title h1, .agency-highlight-title h2, .agency-highlight-title h3');

  // Each news item is an <article class="card"> (the first is "card first" / big).
  const cards = element.querySelectorAll('article.card');

  cards.forEach((card) => {
    const image = card.querySelector('picture img, img.card-news-image, img');
    // Category / editoria tag.
    const editoria = card.querySelector('.editoria');
    // Heading: either a dedicated title heading or the card link acting as title.
    const heading = card.querySelector('h2.title, h3.title, h2, h3, .title:not(a)');
    // Card link: prefer the explicit "read more" / title link.
    const anchor = card.querySelector('a.link, a.home-banner-card-link, a.home-banner-btn-link, a[href]');

    if (!image && !heading && !anchor) return;

    const contentCell = [];

    if (editoria) {
      const tag = document.createElement('p');
      tag.textContent = editoria.textContent.trim();
      contentCell.push(tag);
    }

    if (heading && heading.textContent.trim()) {
      contentCell.push(heading);
    }

    if (anchor && anchor.getAttribute('href')) {
      const link = document.createElement('a');
      link.setAttribute('href', anchor.getAttribute('href'));
      // Prefer visible span label; fall back to trimmed link text (strip icon markup).
      const label = anchor.querySelector('span');
      const text = (label ? label.textContent : anchor.textContent).trim();
      link.textContent = text;
      contentCell.push(link);
    }

    cells.push([image || '', contentCell.length ? contentCell : '']);
  });

  // Empty-block guard
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'featured-news', cells });

  // Re-insert the section heading as default content immediately before the block.
  if (sectionHeading && sectionHeading.textContent.trim()) {
    const h = document.createElement(sectionHeading.tagName.toLowerCase().match(/^h[1-6]$/) ? sectionHeading.tagName.toLowerCase() : 'h2');
    h.textContent = sectionHeading.textContent.trim();
    element.replaceWith(h, block);
    return;
  }

  element.replaceWith(block);
}
