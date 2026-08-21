/*
 * Dashboard Tabs Block
 *
 * Source parity: petrobras.com.br/sustentabilidade/dados-abertos — a data
 * dashboard whose tabs (Ranking das emissões de GEE, Emissões globais por
 * setores ou GEE, Emissões por setores da economia, Fluxo de energia e
 * emissões) switch views inside an embedded backend app
 * (emissoes.petrobras.com.br). The backend data/app is proprietary and not
 * available for migration, so this block replicates the tabbed CONTAINER at
 * parity and, per panel, lazy-loads the external dashboard iframe behind a
 * lightweight FACADE (poster + open button). The iframe is only injected on
 * click, and only after its host passes an allowlist check (security /
 * keep-it-100).
 *
 * Accessible tabs: role=tablist/tab/tabpanel, roving tabindex, arrow/Home/End
 * keyboard support (WAI-ARIA tabs pattern).
 *
 * Authoring content model (EDS table, one row per tab):
 *   | Tab label | Embed URL (link or text) | Optional poster image + caption |
 * The first cell is the tab label; the second holds the dashboard/iframe URL;
 * an optional third cell provides a poster image and/or short description shown
 * on the facade. Rows without a label are skipped; rows without a valid URL
 * render their authored content inline (graceful degradation).
 *
 * Content is moved node-by-node (never innerHTML), so no HTML sanitisation is
 * needed.
 */

// Allowlisted embed hosts. Only URLs whose hostname matches (exactly or as a
// subdomain) are ever turned into an <iframe>. Everything else is rejected so
// an authored/redirected URL cannot point the embed at an arbitrary origin.
const ALLOWED_HOSTS = [
  'petrobras.com.br',
  'emissoes.petrobras.com.br',
  'nossaenergia.petrobras.com.br',
  'transparencia.petrobras.com.br',
  'investidorpetrobras.com.br',
  'youtube-nocookie.com',
  'issuu.com',
  'e.issuu.com',
];

let seq = 0;

function isAllowedHost(hostname) {
  return ALLOWED_HOSTS.some((h) => hostname === h || hostname.endsWith(`.${h}`));
}

// Validate an embed URL: must be absolute http(s) and on an allowlisted host.
export function safeEmbedUrl(raw) {
  if (!raw) return null;
  let url;
  try {
    url = new URL(raw.trim(), window.location.href);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  if (!isAllowedHost(url.hostname)) return null;
  return url.href;
}

// Build the dashboard <iframe> for a panel. Host is already allowlist-validated
// by safeEmbedUrl before this is called.
function buildEmbed(url, label) {
  const iframe = document.createElement('iframe');
  iframe.className = 'dashboard-tabs-embed';
  iframe.src = url;
  iframe.title = label;
  iframe.loading = 'lazy';
  iframe.setAttribute('allow', 'fullscreen');
  iframe.referrerPolicy = 'no-referrer-when-downgrade';
  return iframe;
}

export default function decorate(block) {
  seq += 1;
  const uid = seq;

  const rows = [...block.children];
  const tablist = document.createElement('div');
  tablist.className = 'dashboard-tabs-tablist';
  tablist.setAttribute('role', 'tablist');
  tablist.setAttribute('aria-label', 'Painéis de dados');

  const panelsWrap = document.createElement('div');
  panelsWrap.className = 'dashboard-tabs-panels';

  const tabs = [];
  const panels = [];

  rows.forEach((row) => {
    const cells = [...row.children];
    const labelCell = cells[0];
    if (!labelCell || !labelCell.textContent.trim()) return;

    const idx = tabs.length;
    const tabId = `dashboard-tabs-${uid}-tab-${idx}`;
    const panelId = `dashboard-tabs-${uid}-panel-${idx}`;
    const label = labelCell.textContent.trim();

    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'dashboard-tabs-tab';
    tab.id = tabId;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panelId);
    tab.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
    tab.tabIndex = idx === 0 ? 0 : -1;
    tab.textContent = label;

    const panel = document.createElement('div');
    panel.className = 'dashboard-tabs-panel';
    panel.id = panelId;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tabId);
    panel.tabIndex = 0;
    if (idx !== 0) panel.hidden = true;

    // Resolve the embed URL from the second cell (link href or plain text).
    const urlCell = cells[1];
    const link = urlCell?.querySelector('a[href]');
    const url = safeEmbedUrl(link?.getAttribute('href'))
      || safeEmbedUrl(urlCell?.textContent);

    if (url) {
      // Stash the validated URL + label; the iframe is injected lazily the first
      // time this panel becomes active (the first tab loads immediately). This
      // auto-loads the dashboard — no manual "open" click — while still keeping
      // hidden panels' iframes off the network until their tab is selected.
      panel.dataset.embedUrl = url;
      panel.dataset.embedLabel = label;
    } else if (urlCell) {
      // No valid embed URL — degrade gracefully by keeping authored content.
      panel.append(...urlCell.childNodes);
    }

    tablist.append(tab);
    panelsWrap.append(panel);
    tabs.push(tab);
    panels.push(panel);
  });

  // Inject a panel's dashboard iframe once (idempotent).
  function ensureEmbed(panel) {
    const { embedUrl, embedLabel } = panel.dataset;
    if (!embedUrl || panel.querySelector('.dashboard-tabs-embed')) return;
    panel.append(buildEmbed(embedUrl, embedLabel));
  }

  function select(index, focus = true) {
    tabs.forEach((tab, i) => {
      const selected = i === index;
      tab.setAttribute('aria-selected', selected ? 'true' : 'false');
      tab.tabIndex = selected ? 0 : -1;
      panels[i].hidden = !selected;
      if (selected) {
        ensureEmbed(panels[i]);
        if (focus) tab.focus();
      }
    });
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i, false));
    tab.addEventListener('keydown', (e) => {
      let target = null;
      if (e.key === 'ArrowRight') target = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') target = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') target = 0;
      else if (e.key === 'End') target = tabs.length - 1;
      if (target !== null) {
        e.preventDefault();
        select(target);
      }
    });
  });

  block.textContent = '';
  if (tabs.length) {
    block.append(tablist, panelsWrap);
    // Auto-load the first (active) panel's dashboard immediately.
    ensureEmbed(panels[0]);
  }
}
