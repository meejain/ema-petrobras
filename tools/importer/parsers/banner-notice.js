/* eslint-disable */
/* global WebImporter */
/**
 * Parser for banner-notice. Base: text notice card.
 * Source: https://petrobras.com.br/
 *
 * Block structure: single cell containing the heading (H) + notice paragraph.
 * Source markup: heading in an <h2>/<h3>; notice body text in a `.text` div
 * (sometimes a duplicate <p> repeats the heading text — deduplicate it).
 */
export default function parse(element, { document }) {
  const heading = element.querySelector('h1, h2, h3, h4');
  const headingText = heading ? heading.textContent.trim() : '';

  const content = [];
  if (heading) content.push(heading);

  // Notice body: `.text` blocks or paragraphs that are not a repeat of the heading.
  const bodyNodes = [...element.querySelectorAll('.text, p')];
  const seen = new Set();
  bodyNodes.forEach((node) => {
    const text = node.textContent.trim();
    if (!text || text === headingText || seen.has(text)) return;
    seen.add(text);
    const p = document.createElement('p');
    p.textContent = text;
    content.push(p);
  });

  // Empty-block guard
  if (content.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'banner-notice', cells: [[content]] });
  element.replaceWith(block);
}
