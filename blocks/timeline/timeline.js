/*
 * Timeline (milestone timeline) block
 *
 * An interactive, horizontally-navigable milestone timeline (modelled on the
 * Petrobras "petro-timeline" widget, petrobras.com.br/bolivia). A strip of year
 * markers sits on a horizontal green axis; selecting a year reveals that
 * milestone's content panel above (a big year "title" beside one or more
 * heading + text sections). Prev/next and first/last arrow controls step or
 * jump through the milestones and keep the active marker scrolled into view.
 *
 * Authoring content model (one authored row per milestone):
 *   cell 0            year / short label (e.g. "1996")
 *   cell 1 .. cell N  one "section" each — rich content: an optional heading
 *                     (becomes the subtitle) followed by paragraphs and/or an
 *                     optional image (become the description).
 * A milestone with several section cells shows them stacked (matches the
 * source, where e.g. 1999 carries three events). Missing cells degrade
 * gracefully: a year with no sections simply shows an empty panel; a section
 * with no heading shows just its body.
 *
 * Accessibility: the markers are a WAI-ARIA tablist (each marker a role="tab"
 * button with aria-selected + roving tabindex); each panel is a role="tabpanel"
 * linked back via aria-controls / aria-labelledby. Arrow keys move + activate,
 * Home/End jump to first/last. Motion respects prefers-reduced-motion.
 */

// Arrow glyphs taken verbatim from the source widget (viewBox 0 0 14 12).
const ICON_LEFT = '<svg viewBox="0 0 14 12" width="14" height="12" fill="none" aria-hidden="true" focusable="false"><path d="M12.5 6H1.5M1.5 6L6 1.5M1.5 6L6 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ICON_RIGHT = '<svg viewBox="0 0 14 12" width="14" height="12" fill="none" aria-hidden="true" focusable="false"><path d="M1.5 6H12.5M12.5 6L8 1.5M12.5 6L8 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
// First/last use a bar + arrow (composed from the same arrow glyph).
const ICON_FIRST = '<svg viewBox="0 0 16 12" width="16" height="12" fill="none" aria-hidden="true" focusable="false"><path d="M14.5 6H3.5M3.5 6L8 1.5M3.5 6L8 10.5M1 1.5V10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ICON_LAST = '<svg viewBox="0 0 16 12" width="16" height="12" fill="none" aria-hidden="true" focusable="false"><path d="M1.5 6H12.5M12.5 6L8 1.5M12.5 6L8 10.5M15 1.5V10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const HEADING = 'h1,h2,h3,h4,h5,h6';

const prefersReducedMotion = () => window.matchMedia
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function textOf(el) {
  return el ? el.textContent.trim() : '';
}

// Turn one authored section cell into a .timeline-section (heading + body).
function buildSection(cell) {
  const section = document.createElement('div');
  section.className = 'timeline-section';

  const heading = cell.querySelector(HEADING);
  if (heading) {
    const subtitle = document.createElement('h3');
    subtitle.className = 'timeline-subtitle';
    subtitle.append(...heading.childNodes);
    section.append(subtitle);
    heading.remove();
  }

  const body = document.createElement('div');
  body.className = 'timeline-description';
  // Move whatever is left (paragraphs, lists, images…) into the description.
  while (cell.firstChild) body.append(cell.firstChild);
  if (body.childNodes.length) section.append(body);

  return section;
}

export default function decorate(block) {
  const rows = [...block.children];
  const uid = `timeline-${Math.random().toString(36).slice(2, 8)}`;

  // Parse authored rows into milestones, skipping empty rows.
  const milestones = rows
    .map((row) => {
      const cells = [...row.children];
      const year = textOf(cells[0]);
      const sections = cells.slice(1).filter((c) => c.textContent.trim() || c.querySelector('img'));
      return { year, sections };
    })
    .filter((m) => m.year);

  block.textContent = '';
  if (!milestones.length) return;

  // --- Panels (content) ---------------------------------------------------
  const panels = document.createElement('div');
  panels.className = 'timeline-panels';

  // --- Markers strip (tablist) -------------------------------------------
  const viewport = document.createElement('div');
  viewport.className = 'timeline-track-viewport';
  const track = document.createElement('div');
  track.className = 'timeline-track';
  track.setAttribute('role', 'tablist');
  track.setAttribute('aria-label', 'Marcos por ano');
  viewport.append(track);

  const tabs = [];
  const panelEls = [];

  milestones.forEach((m, i) => {
    const panelId = `${uid}-panel-${i}`;
    const tabId = `${uid}-tab-${i}`;

    // Panel
    const panel = document.createElement('div');
    panel.className = 'timeline-panel';
    panel.id = panelId;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tabId);
    panel.setAttribute('tabindex', '0');
    if (i !== 0) panel.hidden = true;

    const year = document.createElement('h2');
    year.className = 'timeline-year';
    year.textContent = m.year;
    panel.append(year);

    const sections = document.createElement('div');
    sections.className = 'timeline-sections';
    m.sections.forEach((cell) => sections.append(buildSection(cell)));
    panel.append(sections);

    panels.append(panel);
    panelEls.push(panel);

    // Marker (tab)
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'timeline-marker';
    tab.id = tabId;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panelId);
    tab.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    tab.tabIndex = i === 0 ? 0 : -1;

    const label = document.createElement('span');
    label.className = 'timeline-marker-label';
    label.textContent = m.year;

    const axis = document.createElement('span');
    axis.className = 'timeline-marker-axis';
    axis.setAttribute('aria-hidden', 'true');
    const dot = document.createElement('span');
    dot.className = 'timeline-marker-dot';
    axis.append(dot);

    tab.append(label, axis);
    track.append(tab);
    tabs.push(tab);
  });

  // --- Controls -----------------------------------------------------------
  const controls = document.createElement('div');
  controls.className = 'timeline-controls';

  const mkBtn = (cls, aria, icon) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `timeline-control ${cls}`;
    b.setAttribute('aria-label', aria);
    b.innerHTML = icon;
    return b;
  };
  const stepGroup = document.createElement('div');
  stepGroup.className = 'timeline-controls-group';
  const prevBtn = mkBtn('timeline-prev', 'Marco anterior', ICON_LEFT);
  const nextBtn = mkBtn('timeline-next', 'Próximo marco', ICON_RIGHT);
  stepGroup.append(prevBtn, nextBtn);

  const jumpGroup = document.createElement('div');
  jumpGroup.className = 'timeline-controls-group';
  const firstBtn = mkBtn('timeline-first', 'Primeiro marco', ICON_FIRST);
  const lastBtn = mkBtn('timeline-last', 'Último marco', ICON_LAST);
  jumpGroup.append(firstBtn, lastBtn);

  controls.append(stepGroup, jumpGroup);

  block.append(panels, viewport, controls);

  // --- Selection logic ----------------------------------------------------
  let current = 0;

  const scrollActiveIntoView = () => {
    const tab = tabs[current];
    if (!tab) return;
    const behavior = prefersReducedMotion() ? 'auto' : 'smooth';
    // Keep the active marker centred without ever scrolling the whole page.
    const vpRect = viewport.getBoundingClientRect();
    const tRect = tab.getBoundingClientRect();
    const delta = (tRect.left + tRect.width / 2) - (vpRect.left + vpRect.width / 2);
    viewport.scrollBy({ left: delta, behavior });
  };

  const update = () => {
    tabs.forEach((tab, i) => {
      const active = i === current;
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
      tab.tabIndex = active ? 0 : -1;
      tab.classList.toggle('is-active', active);
      panelEls[i].hidden = !active;
    });
    prevBtn.disabled = current === 0;
    firstBtn.disabled = current === 0;
    nextBtn.disabled = current === milestones.length - 1;
    lastBtn.disabled = current === milestones.length - 1;
    scrollActiveIntoView();
  };

  const select = (index, focusTab = false) => {
    current = Math.max(0, Math.min(milestones.length - 1, index));
    update();
    if (focusTab) tabs[current].focus();
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i));
    tab.addEventListener('keydown', (e) => {
      let target = null;
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown': target = current + 1; break;
        case 'ArrowLeft':
        case 'ArrowUp': target = current - 1; break;
        case 'Home': target = 0; break;
        case 'End': target = milestones.length - 1; break;
        default: return;
      }
      e.preventDefault();
      select(target, true);
    });
  });

  prevBtn.addEventListener('click', () => select(current - 1));
  nextBtn.addEventListener('click', () => select(current + 1));
  firstBtn.addEventListener('click', () => select(0));
  lastBtn.addEventListener('click', () => select(milestones.length - 1));

  window.addEventListener('resize', scrollActiveIntoView, { passive: true });

  update();
}
