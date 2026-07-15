/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: petrobras.com.br site-wide cleanup.
 *
 * The source is a Liferay-based site. All authorable page content lives inside
 * `#main-content` (verified in migration-work/cleaned.html, line 825). Everything
 * else on the page is non-authorable site chrome added by the Liferay shell:
 * a "skip to content" quick-access <nav>, an accessibility menu, the header menu
 * (top bar + main nav + sticky header), the footer, cookie consent banners, and
 * the vLibras / Libras (Brazilian sign language) accessibility widget.
 *
 * Strategy:
 *  - beforeTransform: isolate `#main-content` so block parsers only see authorable
 *    content, and strip the two non-authorable widget subtrees that Liferay nests
 *    *inside* `#main-content` (the Libras sign-language widget and the standalone
 *    cookies button). Also defensively remove cookie banners/overlays in case they
 *    sit inside main-content. The `#main-content > div.lfr-layout-structure-item-*`
 *    section selectors used by parsers stay valid because `#main-content` is kept.
 *  - afterTransform: remove leftover non-authorable elements (link/iframe/noscript/
 *    source/script/style) and strip risky inline attributes.
 *
 * Every selector below was confirmed against migration-work/cleaned.html; none guessed.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

// Non-authorable subtrees that Liferay nests INSIDE #main-content and must be
// removed even after main-content is isolated.
// - .lfr-layout-structure-item-linguagem-de-sinais : vLibras / Libras sign-language widget (cleaned.html line 1434)
// - .lfr-layout-structure-item-bot-o-de-cookies    : standalone cookies button fragment (cleaned.html line 1484)
// - .vLibras-icon                                  : vLibras launcher icon (cleaned.html line 168)
const IN_CONTENT_CHROME_SELECTORS = [
  '.lfr-layout-structure-item-linguagem-de-sinais',
  '.lfr-layout-structure-item-bot-o-de-cookies',
  '.vLibras-icon',
];

// Cookie consent chrome (IDs/classes verified in cleaned.html lines 2882-3103).
const COOKIE_SELECTORS = [
  '#p_p_id_com_liferay_cookies_banner_web_portlet_CookiesBannerPortlet_',
  '#p_p_id_com_liferay_cookies_banner_web_portlet_CookiesBannerConfigurationPortlet_',
  '.petro-cookie-banner',
  '.cookie-overlay',
  '.cookies-banner',
  '.lfr-layout-structure-item-banner-de-cookies',
];

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove cookie consent banners/overlays up front (they can overlay content).
    WebImporter.DOMUtils.remove(element, COOKIE_SELECTORS);

    // Remove the non-authorable widget subtrees that live inside #main-content
    // BEFORE isolating it, so they never reach the block parsers.
    WebImporter.DOMUtils.remove(element, IN_CONTENT_CHROME_SELECTORS);

    // Remove hidden responsive duplicate sections. Liferay renders separate
    // desktop and mobile copies of some sections (e.g. banner-destaque-agencia
    // ships as two `#main-content > div.lfr-layout-structure-item-*` copies with
    // different hash classes); only one is visible at a given breakpoint via a CSS
    // media query. The importer runs at desktop width, so the mobile copy computes
    // to display:none. Left in place it becomes duplicate loose content next to the
    // block produced from the visible copy. Drop any display:none direct section
    // child of #main-content before isolating/parsing. (getComputedStyle is
    // available because this transformer runs in the page context.)
    const mc = element.querySelector('#main-content');
    if (mc && typeof element.ownerDocument.defaultView?.getComputedStyle === 'function') {
      const view = element.ownerDocument.defaultView;
      [...mc.children].forEach((child) => {
        if (view.getComputedStyle(child).display === 'none') {
          child.remove();
        }
      });
    }

    // Isolate #main-content: make it the sole content under `element`. This drops
    // all surrounding Liferay chrome (quick-access nav, accessibility menu, header
    // menu, sticky header, footer) in one move while keeping the
    // `#main-content > div.lfr-layout-structure-item-*` section selectors valid.
    const mainContent = element.querySelector('#main-content');
    if (mainContent) {
      element.replaceChildren(mainContent);
    }
  }

  if (hookName === TransformHook.afterTransform) {
    // Belt-and-suspenders: if #main-content was not found (unexpected markup),
    // still remove global chrome by its site-specific selectors from cleaned.html.
    WebImporter.DOMUtils.remove(element, [
      '#fmmu_quickAccessNav',        // "skip to content" quick-access nav (line 2)
      '.quick-access-nav',           // any other quick-access nav instances (line 150)
      '.accessibility-menu',         // accessibility menu portlet (line 16)
      '#fragment_85835',             // header menu top bar + main nav (line 60)
      '#fragment_87558',             // sticky/compact header (line 215)
      '.headerMenu',                 // header menu wrapper (line 61)
      '#fragment_86435',             // footer (line 1491)
      '#pet-fragment-footer',        // footer inner fragment (line 1932)
      '.petro-nav-anchor-menu',      // in-page anchor menu nav (line 812)
      'header',
      'footer',
      'nav',
    ]);

    // Remove non-authorable leftover elements.
    WebImporter.DOMUtils.remove(element, ['link', 'iframe', 'noscript', 'source', 'script', 'style']);

    // Strip risky/tracking inline attributes where present.
    element.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('onclick');
      el.removeAttribute('onload');
      el.removeAttribute('data-analytics-asset-tracker');
    });
  }
}
