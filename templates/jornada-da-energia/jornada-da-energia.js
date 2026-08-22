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
 * Build the continuous connector line on the MAP section (source
 * .section-map__curve + .section-map__line). An elbow at the SECTION top runs
 * from the page centre — where the fixed hero's centre line ends — leftwards and
 * curves down; a vertical line then grows DOWNWARD along the left edge as the
 * section is scrolled. Drawn as ONE continuous SVG path so there is never a gap
 * between the elbow and the vertical line. Desktop only (CSS guards visibility).
 * @param {Element} main The main element
 */
const JDE_NS = 'http://www.w3.org/2000/svg';

function buildMapConnector(main) {
  const section = main.querySelector(':scope > .section.energy-map-container');
  if (!section) return;
  const svg = document.createElementNS(JDE_NS, 'svg');
  svg.setAttribute('class', 'jde-map-connector');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('preserveAspectRatio', 'none');
  const path = document.createElementNS(JDE_NS, 'path');
  path.setAttribute('stroke', '#fff');
  path.setAttribute('stroke-width', '2');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  svg.append(path);
  section.append(svg);

  // the journey section that follows the map — its intro dot is where the
  // descending line must ARRIVE, so the line flows seamlessly from the map,
  // past the section boundary, down to the location pin (then the journey's
  // own grow-lines carry it right through the vectors).
  const journey = section.nextElementSibling;

  const desktop = window.matchMedia('(min-width: 992px)');
  let ticking = false;
  const update = () => {
    ticking = false;
    if (!desktop.matches) { svg.style.display = 'none'; return; }
    svg.style.display = '';
    const w = section.offsetWidth;
    const h = section.offsetHeight;
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;
    // The line may extend BELOW the map section into the journey intro, so size
    // the SVG canvas to cover the map PLUS the reach to the journey's intro dot.
    // maxReach = distance from the map-section top to the journey intro dot (or
    // the map bottom if the journey isn't found). overflow:visible lets the
    // stroke paint past the section box.
    let maxReach = h - 70;
    const dot = journey ? journey.querySelector('.energy-journey-dot') : null;
    if (dot) {
      const dRect = dot.getBoundingClientRect();
      // dot centre in the map-section's coordinate space
      maxReach = Math.max(maxReach, (dRect.top + dRect.height / 2) - rect.top);
    }
    const svgH = Math.ceil(maxReach + 10);
    svg.setAttribute('width', w);
    svg.setAttribute('height', svgH);
    svg.setAttribute('viewBox', `0 0 ${w} ${svgH}`);
    const cx = Math.round(w / 2);
    // vertical line grows with scroll (source formula): 0 until the section top
    // rises past the viewport middle, then extends down — now allowed to reach
    // all the way to the journey intro dot so the line is continuous.
    const lineLen = Math.min(Math.max(vh / 2 - rect.top, 0), maxReach);
    const endY = 70 + lineLen;
    // centre-top down, rounded corner turning left (r=30), horizontal to x158,
    // rounded corner turning down (r=30) at x128, then the vertical line — ONE
    // continuous stroke so the elbow and vertical line never separate.
    const d = `M ${cx} 0 V 10 Q ${cx} 40 ${cx - 30} 40 L 158 40 Q 128 40 128 70 V ${endY}`;
    path.setAttribute('d', d);
    svg.style.opacity = (rect.top < vh && rect.bottom > -svgH) ? '1' : '0';
  };
  const onScroll = () => {
    if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
}

/**
 * Decorate the Jornada da Energia page. Runs once, lazily, on that page only.
 * @param {Element} main The main element
 */
export default async function decorateTemplate(main) {
  if (!main) return;
  main.dataset.jdeReady = 'true';
  orderSections(main);
  buildMapConnector(main);
  buildNav(main);
}
