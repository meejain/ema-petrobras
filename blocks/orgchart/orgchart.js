/**
 * Orgchart (Organograma) block
 *
 * Renders a color-coded organizational hierarchy chart of pill-shaped cards.
 * Each node shows an area/department name (colored by its role category) and,
 * when it has an action, a green circular icon button on the right:
 *   - external-link icon when the card links out to another page
 *   - exchange/transfer icon when the card reveals a responsible person/contact
 * Node text colors map to role categories shown in a bordered legend box.
 *
 * Authoring content model (table rows):
 *  - Optional leading rows build the intro:
 *      1 cell  -> heading / intro paragraph (rich text)
 *      1 cell with a single link -> the "Acesse" document button
 *  - A row whose first cell is exactly "legend" defines the legend.
 *      Each remaining cell is "Color | Label" (e.g. "dark-blue | Presidente e Diretor Executivo").
 *  - Every other row is a node with cells, in order:
 *      color | area | responsible | contact | link | group  (all after area optional)
 *    where color is one of: dark-blue, orange, cyan, grey.
 *    group encodes the org tree:
 *      "spine"  -> the vertical trunk of top-level nodes (rendered stacked on the left)
 *      "col-N"  -> the Nth executive-directorate branch column (first card = column header)
 *    When group is omitted, all cards render in a single responsive column.
 *
 * The block degrades gracefully: missing cells are simply omitted.
 */

const COLORS = ['dark-blue', 'orange', 'cyan', 'grey'];

// External-link (open in new page) icon — used by cards that link out.
const ICON_EXTERNAL = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path opacity="0.98" d="M12.75 7.75005V13.25C12.75 13.3827 12.6973 13.5098 12.6036 13.6036C12.5098 13.6974 12.3826 13.75 12.25 13.75L2.75 13.75C2.61739 13.75 2.49022 13.6974 2.39645 13.6036C2.30268 13.5098 2.25 13.3827 2.25 13.25L2.25 3.75005C2.25 3.61744 2.30268 3.49026 2.39645 3.39649C2.49021 3.30272 2.61739 3.25005 2.75 3.25005L8.5 3.25005M10.2371 2.3562H13.9494M13.9494 2.3562V6.06851M13.9494 2.3562L7.25 9.00005" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// Exchange / transfer icon — used by cards that flip to reveal a person/contact.
const ICON_EXCHANGE = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M213.66,181.66l-32,32a8,8,0,0,1-11.32-11.32L188.69,184H48a8,8,0,0,1,0-16H188.69l-18.35-18.34a8,8,0,0,1,11.32-11.32l32,32A8,8,0,0,1,213.66,181.66Zm-139.32-64a8,8,0,0,0,11.32-11.32L67.31,88H208a8,8,0,0,0,0-16H67.31L85.66,53.66A8,8,0,0,0,74.34,42.34l-32,32a8,8,0,0,0,0,11.32Z"/></svg>';

function normalizeColor(value) {
  const v = (value || '').trim().toLowerCase();
  if (v === 'darkblue' || v === 'dark-blue' || v === 'blue') return 'dark-blue';
  if (COLORS.includes(v)) return v;
  return 'grey';
}

function textOf(cell) {
  return cell ? cell.textContent.trim() : '';
}

function firstLink(cell) {
  return cell ? cell.querySelector('a') : null;
}

function buildLegend(cells) {
  const legend = document.createElement('ul');
  legend.className = 'orgchart-legend';
  cells.forEach((cell) => {
    const raw = textOf(cell);
    if (!raw) return;
    const [colorPart, ...labelParts] = raw.split('|');
    const color = normalizeColor(colorPart);
    const label = labelParts.join('|').trim() || colorPart.trim();
    const li = document.createElement('li');
    li.className = 'orgchart-legend-item';
    const dot = document.createElement('span');
    dot.className = `orgchart-legend-dot orgchart-color-${color}`;
    dot.setAttribute('aria-hidden', 'true');
    const text = document.createElement('span');
    text.className = 'orgchart-legend-label';
    text.textContent = label;
    li.append(dot, text);
    legend.append(li);
  });
  return legend;
}

function buildIconButton(type) {
  const btn = document.createElement('span');
  btn.className = 'orgchart-card-button';
  btn.setAttribute('aria-hidden', 'true');
  btn.innerHTML = type === 'external' ? ICON_EXTERNAL : ICON_EXCHANGE;
  return btn;
}

function buildCard(cells) {
  const color = normalizeColor(textOf(cells[0]));
  const area = textOf(cells[1]);
  const responsible = textOf(cells[2]);
  const contact = textOf(cells[3]);
  const link = firstLink(cells[4]) || firstLink(cells[1]);
  const hasBack = !!(responsible || contact);

  const container = document.createElement('div');
  container.className = 'orgchart-node';

  const card = document.createElement('div');
  card.className = `orgchart-card orgchart-color-${color}`;
  container.classList.add(`orgchart-node-${color}`);

  // Area label (colored by category).
  const areaEl = document.createElement('span');
  areaEl.className = 'orgchart-card-area';
  areaEl.textContent = area;
  card.append(areaEl);

  if (link) {
    // Card links out to another page — wrap in an anchor with the external icon.
    card.classList.add('orgchart-card-linked');
    const a = document.createElement('a');
    a.className = 'orgchart-card-link';
    a.href = link.href;
    if (link.target) a.target = link.target;
    if (a.target === '_blank') a.rel = 'noopener noreferrer';
    a.setAttribute('aria-label', area);
    a.append(buildIconButton('external'));
    card.append(a);
  } else if (hasBack) {
    // Card reveals the responsible person / contact when toggled.
    card.classList.add('orgchart-flip');
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-expanded', 'false');

    const back = document.createElement('div');
    back.className = 'orgchart-card-back';
    if (responsible) {
      const name = document.createElement('span');
      name.className = 'orgchart-card-responsible';
      name.textContent = responsible;
      back.append(name);
    }
    if (contact) {
      const c = document.createElement('span');
      c.className = 'orgchart-card-contact';
      c.textContent = contact;
      back.append(c);
    }
    card.append(back);
    card.append(buildIconButton('exchange'));

    const toggle = () => {
      const open = card.classList.toggle('is-flipped');
      card.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    card.addEventListener('click', toggle);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  }

  container.append(card);
  return container;
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  const intro = document.createElement('div');
  intro.className = 'orgchart-intro';

  let legendEl = null;

  // Collect node rows preserving their group tag, so we can rebuild the tree.
  const nodeRows = []; // { cells, group }

  rows.forEach((row) => {
    const cells = [...row.children];
    if (!cells.length) return;

    const firstText = textOf(cells[0]).toLowerCase();

    // Legend row
    if (firstText === 'legend') {
      legendEl = buildLegend(cells.slice(1));
      return;
    }

    // Node row: first cell is a color token AND there is an area name
    const colorToken = firstText.replace(/\s+/g, '-');
    const isColorToken = COLORS.includes(colorToken)
      || colorToken === 'darkblue' || colorToken === 'blue';
    if (isColorToken && cells.length >= 2) {
      const group = (textOf(cells[5]) || 'spine').toLowerCase();
      nodeRows.push({ cells, group });
      return;
    }

    // Otherwise treat as intro content (heading / paragraph / link button).
    // A row whose only populated cell is a lone link becomes the green
    // "Acesse" document button. (Rows are padded by the parser, so only the
    // first cell carries content.)
    const populated = cells.filter((c) => textOf(c));
    const link = firstLink(cells[0]);
    const isDocButton = link && populated.length === 1
      && textOf(cells[0]) === link.textContent.trim();
    if (isDocButton) {
      link.classList.add('orgchart-doc-button');
      link.classList.remove('button');
      intro.append(link);
    } else {
      cells.forEach((c) => { while (c.firstChild) intro.append(c.firstChild); });
    }
  });

  // Build the tree: a spine column (top-level trunk) + branch columns.
  const chart = document.createElement('div');
  chart.className = 'orgchart-chart';

  const spineRows = nodeRows.filter((n) => n.group === 'spine' || !n.group);
  const columnGroups = [...new Set(nodeRows
    .map((n) => n.group)
    .filter((g) => /^col-\d+$/.test(g)))]
    .sort((a, b) => Number(a.slice(4)) - Number(b.slice(4)));

  const hasTree = spineRows.length > 0 && columnGroups.length > 0;

  if (hasTree) {
    // Spine (vertical trunk of top-level nodes).
    const spine = document.createElement('div');
    spine.className = 'orgchart-spine';
    spineRows.forEach(({ cells }) => spine.append(buildCard(cells)));
    chart.append(spine);

    // Branches: one column per directorate; the first card is the column header.
    const branches = document.createElement('div');
    branches.className = 'orgchart-branches';
    columnGroups.forEach((g) => {
      const col = document.createElement('div');
      col.className = 'orgchart-column';
      nodeRows
        .filter((n) => n.group === g)
        .forEach(({ cells }, i) => {
          const node = buildCard(cells);
          if (i === 0) node.classList.add('orgchart-column-header');
          col.append(node);
        });
      branches.append(col);
    });
    chart.append(branches);
    chart.classList.add('orgchart-chart-tree');
  } else {
    // No grouping info — render all cards in a single responsive column.
    nodeRows.forEach(({ cells }) => chart.append(buildCard(cells)));
  }

  block.textContent = '';
  if (intro.childNodes.length) block.append(intro);
  if (legendEl) block.append(legendEl);
  block.append(chart);
}
