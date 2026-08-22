/*
 * Template: jornada-da-energia
 * Page-scoped JavaScript for the Jornada da Energia scrollytelling page.
 *
 * Exports a default `decorateTemplate(main)` invoked by loadTemplate() in
 * scripts.js after the page's sections are decorated. Use it for page-level
 * orchestration that spans multiple blocks (e.g. a shared scroll-progress
 * rail, cross-section pinning). Per-block behavior stays in each block's JS.
 *
 * Kept intentionally minimal for now — the section-spanning scroll wiring is
 * added as the page is assembled. No external dependencies (No-Build Rule).
 */

/**
 * Decorate the Jornada da Energia page. Runs once, lazily, on that page only.
 * @param {Element} main The main element
 */
export default async function decorateTemplate(main) {
  if (!main) return;
  // Mark the page as template-ready so scoped CSS can gate progressive
  // enhancements (e.g. reveal transitions) on JS being present. Page-level
  // scroll orchestration is added here as the page is assembled.
  main.dataset.jdeReady = 'true';
}
