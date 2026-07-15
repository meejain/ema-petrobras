/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: petrobras.com.br section breaks + section metadata.
 *
 * The homepage template defines 4 sections (see tools/importer/page-templates.json):
 *   1. carrossel-hero-destaque   (style: null)
 *   2. banner-destaque-agencia   (style: "light")
 *   3. lista-de-cards-content    (style: "light")
 *   4. grade                     (style: null)
 *
 * For each section (processed in reverse document order so insertions don't
 * shift the positions of not-yet-processed sections):
 *   - When section.style is set, append a "Section Metadata" block after the
 *     section element with a `style` cell.
 *   - When the section is not the first, insert an <hr> before the section
 *     element to create the section break.
 *
 * Section selectors come from payload.template.sections (populated from the
 * captured DOM during analysis); every one is a `#main-content > div.lfr-...`
 * selector.
 *
 * Runs in beforeTransform, BEFORE the block parsers execute. This matters because
 * each block instance selector is the whole `#main-content > div.lfr-...` section
 * div, and the parsers call element.replaceWith(block) — once a section has been
 * parsed, its lfr- selector no longer matches anything. Inserting the <hr> breaks
 * and Section Metadata blocks now (as siblings, before/after each still-present
 * section div) means they survive the subsequent replaceWith and end up correctly
 * positioned between the resulting blocks/default content.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName !== TransformHook.beforeTransform) return;

  const template = payload && payload.template;
  const sections = template && Array.isArray(template.sections) ? template.sections : [];
  if (sections.length < 2) return;

  const doc = element.ownerDocument;

  // Reverse order so inserting <hr>/metadata for a later section does not move
  // the DOM position of earlier sections we have yet to process.
  for (let i = sections.length - 1; i >= 0; i -= 1) {
    const section = sections[i];
    if (!section || !section.selector) continue;

    const sectionEl = element.querySelector(section.selector);
    if (!sectionEl) continue;

    // Section Metadata block after the section, when a style is defined.
    if (section.style) {
      const metadataBlock = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      sectionEl.after(metadataBlock);
    }

    // Section break before every section except the first.
    if (i > 0) {
      sectionEl.before(doc.createElement('hr'));
    }
  }
}
