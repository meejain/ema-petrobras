/*
 * Template: jornada-da-energia
 * Page-scoped JavaScript for the Jornada da Energia scrollytelling page.
 *
 * Exports a default `decorateTemplate(main)` invoked by loadTemplate() in
 * scripts.js after the page's sections are decorated. It builds the page-level
 * fixed dot-rail (source `.energy-page__nav`): a single vertical rail pinned to
 * the left of the viewport that tracks scroll progress across ALL sections,
 * highlighting the dot for the section currently in view (active dot gold). The
 * rail links to each section so clicking a dot scrolls to it.
 *
 * No external dependencies (No-Build Rule). Everything is scoped under
 * body.jornada-da-energia so it can't leak to other pages.
 */

/* The sections the rail tracks, top to bottom, with their short labels (source
   anchor menu). Matched to the assembled page's section order. */
const NAV_ITEMS = [
  { label: 'The Journey of Energy' },
  { label: 'Main operations' },
  { label: 'Explore the journey' },
  { label: 'New energy sources' },
  { label: 'End-to-end technologies' },
  { label: 'Stages of the journey' },
  { label: 'Fuel prices' },
  { label: 'Common questions' },
];

/**
 * Build the fixed left dot-rail and wire it to the page's sections. One dot per
 * top-level section (capped to the label list); an IntersectionObserver marks
 * the dot for whichever section most fills the viewport as active.
 * @param {Element} main The main element
 */
function buildNav(main) {
  const sections = [...main.querySelectorAll(':scope > .section')]
    // skip metadata-only / empty sections
    .filter((s) => s.querySelector('.block, h1, h2, h3, p, picture'));
  if (sections.length < 2) return;

  const nav = document.createElement('nav');
  nav.className = 'jde-nav';
  nav.setAttribute('aria-label', 'Page sections');

  const dots = sections.map((section, i) => {
    // ensure the section is a scroll target
    if (!section.id) section.id = `jde-section-${i}`;
    const label = (NAV_ITEMS[i] && NAV_ITEMS[i].label) || `Section ${i + 1}`;
    const a = document.createElement('a');
    a.className = 'jde-nav-dot';
    a.href = `#${section.id}`;
    a.innerHTML = `<span>${label}</span>`;
    a.setAttribute('aria-label', label);
    nav.append(a);
    return { a, section };
  });

  document.body.append(nav);

  // active-dot tracking: the section whose center is nearest the viewport
  // center wins (robust for very tall pinned sections and short ones alike).
  let ticking = false;
  const update = () => {
    ticking = false;
    const mid = window.innerHeight / 2;
    let best = 0;
    let bestDist = Infinity;
    dots.forEach(({ section }, i) => {
      const r = section.getBoundingClientRect();
      // distance from viewport center to the section's nearest visible point
      let dist = 0;
      if (r.top > mid) dist = r.top - mid;
      else if (r.bottom < mid) dist = mid - r.bottom;
      if (dist < bestDist) { bestDist = dist; best = i; }
    });
    dots.forEach(({ a }, i) => a.classList.toggle('active', i === best));
  };
  const onScroll = () => {
    if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();

  // smooth-scroll on dot click
  nav.addEventListener('click', (e) => {
    const a = e.target.closest('.jde-nav-dot');
    if (!a) return;
    const target = document.getElementById(a.getAttribute('href').slice(1));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

/**
 * Reorder sections to the source narrative: the isometric operations map is the
 * FIRST green window after the hero ("explore this journey"), followed by the
 * step-by-step journey scrollytelling. Authored content may place the journey
 * first; we move the map ahead of it here so the page reads like the source
 * without changing the authored content. Scoped to this template only.
 * @param {Element} main The main element
 */
function orderSections(main) {
  const sections = [...main.querySelectorAll(':scope > .section')];
  const map = sections.find((s) => s.classList.contains('energy-map-container'));
  const firstJourney = sections.find((s) => s.classList.contains('energy-journey-container'));
  // only move if the map currently comes AFTER the first journey section
  if (map && firstJourney && map !== firstJourney
    && sections.indexOf(map) > sections.indexOf(firstJourney)) {
    firstJourney.before(map);
  }
}

/**
 * Decorate the Jornada da Energia page. Runs once, lazily, on that page only.
 * @param {Element} main The main element
 */
export default async function decorateTemplate(main) {
  if (!main) return;
  main.dataset.jdeReady = 'true';
  orderSections(main);
  buildNav(main);
}
