/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroParser from './parsers/hero.js';
import featuredNewsParser from './parsers/featured-news.js';
import sliderCardsParser from './parsers/slider-cards.js';
import bannerNoticeParser from './parsers/banner-notice.js';

// TRANSFORMER IMPORTS
import petrobrasCleanupTransformer from './transformers/petrobras-cleanup.js';
import petrobrasSectionsTransformer from './transformers/petrobras-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Petrobras home page with hero carousel, agency highlight news, sustainable products slider, and a notice text block',
  urls: [
    'https://petrobras.com.br/'
  ],
  blocks: [
    {
      name: 'hero',
      instances: [
        '#main-content > div.lfr-layout-structure-item-carrossel-hero-destaque.lfr-layout-structure-item-670001a6-a672-1dd3-b0b6-823f0762dc4e'
      ]
    },
    {
      name: 'featured-news',
      instances: [
        '#main-content > div.lfr-layout-structure-item-banner-destaque-agencia.lfr-layout-structure-item-52cb4c53-f8c8-8298-7cae-6b6c970cfc58'
      ]
    },
    {
      name: 'slider-cards',
      instances: [
        '#main-content > div.lfr-layout-structure-item-lista-de-cards-content.lfr-layout-structure-item-b84fa5e3-f603-2c6c-b4c6-42aad28dfe00'
      ]
    },
    {
      name: 'banner-notice',
      instances: [
        '#main-content > div.lfr-layout-structure-item-grade.lfr-layout-structure-item-b9a44bf9-a2c7-47d2-4574-afafbc9830bb'
      ]
    }
  ],
  sections: [
    {
      id: 'rc2c5c1',
      name: 'carrossel-hero-destaque',
      selector: '#main-content > div.lfr-layout-structure-item-carrossel-hero-destaque.lfr-layout-structure-item-670001a6-a672-1dd3-b0b6-823f0762dc4e',
      style: null,
      blocks: ['hero'],
      defaultContent: []
    },
    {
      id: 'rc2c5c2',
      name: 'banner-destaque-agencia',
      selector: '#main-content > div.lfr-layout-structure-item-banner-destaque-agencia.lfr-layout-structure-item-52cb4c53-f8c8-8298-7cae-6b6c970cfc58',
      style: 'light',
      blocks: ['featured-news'],
      defaultContent: ['.agency-highlight-title']
    },
    {
      id: 'rc2c5c3',
      name: 'lista-de-cards-content',
      selector: '#main-content > div.lfr-layout-structure-item-lista-de-cards-content.lfr-layout-structure-item-b84fa5e3-f603-2c6c-b4c6-42aad28dfe00',
      style: 'light',
      blocks: ['slider-cards'],
      defaultContent: ['.title-wrapper']
    },
    {
      id: 'rc2c5c4',
      name: 'grade',
      selector: '#main-content > div.lfr-layout-structure-item-grade.lfr-layout-structure-item-b9a44bf9-a2c7-47d2-4574-afafbc9830bb',
      style: null,
      blocks: ['banner-notice'],
      defaultContent: []
    }
  ]
};

// PARSER REGISTRY
const parsers = {
  hero: heroParser,
  'featured-news': featuredNewsParser,
  'slider-cards': sliderCardsParser,
  'banner-notice': bannerNoticeParser,
};

// TRANSFORMER REGISTRY - cleanup first, then section breaks/metadata
const transformers = [
  petrobrasCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [petrobrasSectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - The hook name ('beforeTransform' or 'afterTransform')
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - The payload containing { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Array of block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach(blockDef => {
    blockDef.instances.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach(element => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;

    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach(block => {
      if (!block.element.parentNode) return; // Already replaced by earlier parser
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform transformers (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '')
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map(b => b.name),
      }
    }];
  }
};
