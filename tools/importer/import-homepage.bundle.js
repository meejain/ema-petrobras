/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/hero.js
  function parse(element, { document }) {
    const cells = [];
    const mainSlide = element.querySelector(".banner-container, .banner-hero, .item");
    const slideScope = mainSlide || element;
    const heroImage = slideScope.querySelector(".banner-hero-midia img, picture img, img");
    const heroTitle = slideScope.querySelector(".banner-hero-text-title h1, .petro-title h1, h1, h2");
    const heroDescription = slideScope.querySelector(".banner-hero-text-description");
    const heroCta = slideScope.querySelector(".banner-hero-button a.petro-button-link, .banner-hero-button a[href], .petro-button-link");
    if (heroImage) {
      const contentCell = [];
      if (heroTitle) contentCell.push(heroTitle);
      if (heroDescription) contentCell.push(heroDescription);
      if (heroCta && heroCta.getAttribute("href")) {
        const link = document.createElement("a");
        link.setAttribute("href", heroCta.getAttribute("href"));
        const label = slideScope.querySelector(".button-text, .visuallyhidden");
        link.textContent = (label ? label.textContent : heroCta.textContent).trim();
        contentCell.push(link);
      }
      cells.push([heroImage, contentCell.length ? contentCell : ""]);
    }
    const highlightCards = element.querySelectorAll(".banner-highlight-card");
    highlightCards.forEach((card) => {
      const cardImage = card.querySelector(".banner-highlight-card-image img, picture img, img");
      const cardLink = card.querySelector("a.banner-highlight-card-link, a[href]");
      if (!cardImage && !cardLink) return;
      const contentCell = [];
      if (cardLink && cardLink.getAttribute("href")) {
        const link = document.createElement("a");
        link.setAttribute("href", cardLink.getAttribute("href"));
        link.textContent = cardLink.textContent.trim();
        contentCell.push(link);
      }
      cells.push([cardImage || "", contentCell.length ? contentCell : ""]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/featured-news.js
  function parse2(element, { document }) {
    const cells = [];
    const sectionHeading = element.querySelector(".agency-highlight-title h1, .agency-highlight-title h2, .agency-highlight-title h3");
    const cards = element.querySelectorAll("article.card");
    cards.forEach((card) => {
      const image = card.querySelector("picture img, img.card-news-image, img");
      const editoria = card.querySelector(".editoria");
      const heading = card.querySelector("h2.title, h3.title, h2, h3, .title:not(a)");
      const anchor = card.querySelector("a.link, a.home-banner-card-link, a.home-banner-btn-link, a[href]");
      if (!image && !heading && !anchor) return;
      const contentCell = [];
      if (editoria) {
        const tag = document.createElement("p");
        tag.textContent = editoria.textContent.trim();
        contentCell.push(tag);
      }
      if (heading && heading.textContent.trim()) {
        contentCell.push(heading);
      }
      if (anchor && anchor.getAttribute("href")) {
        const link = document.createElement("a");
        link.setAttribute("href", anchor.getAttribute("href"));
        const label = anchor.querySelector("span");
        const text = (label ? label.textContent : anchor.textContent).trim();
        link.textContent = text;
        contentCell.push(link);
      }
      cells.push([image || "", contentCell.length ? contentCell : ""]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "featured-news", cells });
    if (sectionHeading && sectionHeading.textContent.trim()) {
      const h = document.createElement(sectionHeading.tagName.toLowerCase().match(/^h[1-6]$/) ? sectionHeading.tagName.toLowerCase() : "h2");
      h.textContent = sectionHeading.textContent.trim();
      element.replaceWith(h, block);
      return;
    }
    element.replaceWith(block);
  }

  // tools/importer/parsers/slider-cards.js
  function parse3(element, { document }) {
    const cells = [];
    const sectionHeading = element.querySelector(".title-wrapper h1, .title-wrapper h2, .title-wrapper h3, .petro-title h1, .petro-title h2, .petro-title h3");
    const cards = element.querySelectorAll(".card-container");
    cards.forEach((card) => {
      const image = card.querySelector(".media-container img, picture img, img");
      const heading = card.querySelector(".content-body .title h3, .title h3, h3, h4, h2");
      const description = card.querySelector(".body-text .text, .body-text > .text, .text.paragraph-sm-regular");
      const anchor = card.querySelector(".card-label a[href], a.tertiary-button, a[href]");
      if (!image && !heading && !description && !anchor) return;
      const contentCell = [];
      if (heading && heading.textContent.trim()) contentCell.push(heading);
      if (description && description.textContent.trim()) contentCell.push(description);
      if (anchor && anchor.getAttribute("href")) {
        const link = document.createElement("a");
        link.setAttribute("href", anchor.getAttribute("href"));
        const label = card.querySelector(".button-text, .visuallyhidden");
        link.textContent = (label ? label.textContent : anchor.textContent).trim();
        contentCell.push(link);
      }
      cells.push([image || "", contentCell.length ? contentCell : ""]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "slider-cards", cells });
    if (sectionHeading && sectionHeading.textContent.trim()) {
      const h = document.createElement(sectionHeading.tagName.toLowerCase().match(/^h[1-6]$/) ? sectionHeading.tagName.toLowerCase() : "h2");
      h.textContent = sectionHeading.textContent.trim();
      element.replaceWith(h, block);
      return;
    }
    element.replaceWith(block);
  }

  // tools/importer/parsers/banner-notice.js
  function parse4(element, { document }) {
    const heading = element.querySelector("h1, h2, h3, h4");
    const headingText = heading ? heading.textContent.trim() : "";
    const content = [];
    if (heading) content.push(heading);
    const bodyNodes = [...element.querySelectorAll(".text, p")];
    const seen = /* @__PURE__ */ new Set();
    bodyNodes.forEach((node) => {
      const text = node.textContent.trim();
      if (!text || text === headingText || seen.has(text)) return;
      seen.add(text);
      const p = document.createElement("p");
      p.textContent = text;
      content.push(p);
    });
    if (content.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "banner-notice", cells: [[content]] });
    element.replaceWith(block);
  }

  // tools/importer/transformers/petrobras-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  var IN_CONTENT_CHROME_SELECTORS = [
    ".lfr-layout-structure-item-linguagem-de-sinais",
    ".lfr-layout-structure-item-bot-o-de-cookies",
    ".vLibras-icon"
  ];
  var COOKIE_SELECTORS = [
    "#p_p_id_com_liferay_cookies_banner_web_portlet_CookiesBannerPortlet_",
    "#p_p_id_com_liferay_cookies_banner_web_portlet_CookiesBannerConfigurationPortlet_",
    ".petro-cookie-banner",
    ".cookie-overlay",
    ".cookies-banner",
    ".lfr-layout-structure-item-banner-de-cookies"
  ];
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, COOKIE_SELECTORS);
      WebImporter.DOMUtils.remove(element, IN_CONTENT_CHROME_SELECTORS);
      const mc = element.querySelector("#main-content");
      if (mc && typeof element.ownerDocument.defaultView?.getComputedStyle === "function") {
        const view = element.ownerDocument.defaultView;
        [...mc.children].forEach((child) => {
          if (view.getComputedStyle(child).display === "none") {
            child.remove();
          }
        });
      }
      const mainContent = element.querySelector("#main-content");
      if (mainContent) {
        element.replaceChildren(mainContent);
      }
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#fmmu_quickAccessNav",
        // "skip to content" quick-access nav (line 2)
        ".quick-access-nav",
        // any other quick-access nav instances (line 150)
        ".accessibility-menu",
        // accessibility menu portlet (line 16)
        "#fragment_85835",
        // header menu top bar + main nav (line 60)
        "#fragment_87558",
        // sticky/compact header (line 215)
        ".headerMenu",
        // header menu wrapper (line 61)
        "#fragment_86435",
        // footer (line 1491)
        "#pet-fragment-footer",
        // footer inner fragment (line 1932)
        ".petro-nav-anchor-menu",
        // in-page anchor menu nav (line 812)
        "header",
        "footer",
        "nav"
      ]);
      WebImporter.DOMUtils.remove(element, ["link", "iframe", "noscript", "source", "script", "style"]);
      element.querySelectorAll("*").forEach((el) => {
        el.removeAttribute("onclick");
        el.removeAttribute("onload");
        el.removeAttribute("data-analytics-asset-tracker");
      });
    }
  }

  // tools/importer/transformers/petrobras-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName !== TransformHook2.beforeTransform) return;
    const template = payload && payload.template;
    const sections = template && Array.isArray(template.sections) ? template.sections : [];
    if (sections.length < 2) return;
    const doc = element.ownerDocument;
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section || !section.selector) continue;
      const sectionEl = element.querySelector(section.selector);
      if (!sectionEl) continue;
      if (section.style) {
        const metadataBlock = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        sectionEl.after(metadataBlock);
      }
      if (i > 0) {
        sectionEl.before(doc.createElement("hr"));
      }
    }
  }

  // tools/importer/import-homepage.js
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "Petrobras home page with hero carousel, agency highlight news, sustainable products slider, and a notice text block",
    urls: [
      "https://petrobras.com.br/"
    ],
    blocks: [
      {
        name: "hero",
        instances: [
          "#main-content > div.lfr-layout-structure-item-carrossel-hero-destaque.lfr-layout-structure-item-670001a6-a672-1dd3-b0b6-823f0762dc4e"
        ]
      },
      {
        name: "featured-news",
        instances: [
          "#main-content > div.lfr-layout-structure-item-banner-destaque-agencia.lfr-layout-structure-item-52cb4c53-f8c8-8298-7cae-6b6c970cfc58"
        ]
      },
      {
        name: "slider-cards",
        instances: [
          "#main-content > div.lfr-layout-structure-item-lista-de-cards-content.lfr-layout-structure-item-b84fa5e3-f603-2c6c-b4c6-42aad28dfe00"
        ]
      },
      {
        name: "banner-notice",
        instances: [
          "#main-content > div.lfr-layout-structure-item-grade.lfr-layout-structure-item-b9a44bf9-a2c7-47d2-4574-afafbc9830bb"
        ]
      }
    ],
    sections: [
      {
        id: "rc2c5c1",
        name: "carrossel-hero-destaque",
        selector: "#main-content > div.lfr-layout-structure-item-carrossel-hero-destaque.lfr-layout-structure-item-670001a6-a672-1dd3-b0b6-823f0762dc4e",
        style: null,
        blocks: ["hero"],
        defaultContent: []
      },
      {
        id: "rc2c5c2",
        name: "banner-destaque-agencia",
        selector: "#main-content > div.lfr-layout-structure-item-banner-destaque-agencia.lfr-layout-structure-item-52cb4c53-f8c8-8298-7cae-6b6c970cfc58",
        style: "light",
        blocks: ["featured-news"],
        defaultContent: [".agency-highlight-title"]
      },
      {
        id: "rc2c5c3",
        name: "lista-de-cards-content",
        selector: "#main-content > div.lfr-layout-structure-item-lista-de-cards-content.lfr-layout-structure-item-b84fa5e3-f603-2c6c-b4c6-42aad28dfe00",
        style: "light",
        blocks: ["slider-cards"],
        defaultContent: [".title-wrapper"]
      },
      {
        id: "rc2c5c4",
        name: "grade",
        selector: "#main-content > div.lfr-layout-structure-item-grade.lfr-layout-structure-item-b9a44bf9-a2c7-47d2-4574-afafbc9830bb",
        style: null,
        blocks: ["banner-notice"],
        defaultContent: []
      }
    ]
  };
  var parsers = {
    hero: parse,
    "featured-news": parse2,
    "slider-cards": parse3,
    "banner-notice": parse4
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
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
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
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
  var import_homepage_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
