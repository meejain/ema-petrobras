/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-hero. Base: carousel.
 * Source: https://petrobras.com.br/
 * Generated: 2026-07-15
 *
 * Block structure (from library-description.txt): 2 columns, multiple rows.
 * Row 1: block name. Each subsequent row = one slide:
 *   cell 1 = slide image (mandatory), cell 2 = title (H) + description + CTA (optional).
 */
export default function parse(element, { document }) {
  const cells = [];

  // --- Main hero slide -------------------------------------------------------
  const mainSlide = element.querySelector('.banner-container, .banner-hero, .item');
  const slideScope = mainSlide || element;

  const heroImage = slideScope.querySelector('.banner-hero-midia img, picture img, img');
  const heroTitle = slideScope.querySelector('.banner-hero-text-title h1, .petro-title h1, h1, h2');
  const heroDescription = slideScope.querySelector('.banner-hero-text-description');
  // Primary CTA: the real navigable link (skip icon/loading spans)
  const heroCta = slideScope.querySelector('.banner-hero-button a.petro-button-link, .banner-hero-button a[href], .petro-button-link');

  if (heroImage) {
    const contentCell = [];
    if (heroTitle) contentCell.push(heroTitle);
    if (heroDescription) contentCell.push(heroDescription);
    if (heroCta && heroCta.getAttribute('href')) {
      // Normalize CTA to a clean anchor with visible label text.
      const link = document.createElement('a');
      link.setAttribute('href', heroCta.getAttribute('href'));
      const label = slideScope.querySelector('.button-text, .visuallyhidden');
      link.textContent = (label ? label.textContent : heroCta.textContent).trim();
      contentCell.push(link);
    }
    cells.push([heroImage, contentCell.length ? contentCell : '']);
  }

  // --- Additional promotional slides (highlight cards) -----------------------
  const highlightCards = element.querySelectorAll('.banner-highlight-card');
  highlightCards.forEach((card) => {
    const cardImage = card.querySelector('.banner-highlight-card-image img, picture img, img');
    const cardLink = card.querySelector('a.banner-highlight-card-link, a[href]');
    if (!cardImage && !cardLink) return;

    const contentCell = [];
    if (cardLink && cardLink.getAttribute('href')) {
      const link = document.createElement('a');
      link.setAttribute('href', cardLink.getAttribute('href'));
      link.textContent = cardLink.textContent.trim();
      contentCell.push(link);
    }
    cells.push([cardImage || '', contentCell.length ? contentCell : '']);
  });

  // Empty-block guard
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero', cells });
  element.replaceWith(block);
}
