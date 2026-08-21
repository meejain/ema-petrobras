/*
 * Biome Explorer block
 *
 * Interactive "conheça os biomas" experience from
 * petrobras.com.br/sustentabilidade/biodiversidade. One block, two variants
 * (2nd class on the block):
 *   - map      an interactive map background with a positioned pill hotspot
 *              per biome; selecting one opens the detail overlay.
 *   - overlay  no map — biome pills render as a horizontal selector; selecting
 *              one opens the same detail overlay. (Demonstrates the panel.)
 *
 * The detail overlay is a real dialog: role="dialog", aria-modal, focus trap,
 * Esc / backdrop / close-button to dismiss, and focus returns to the hotspot
 * that opened it. prefers-reduced-motion disables the slide transition.
 *
 * Authoring content model (one authored row per biome):
 *   name | coords "x% y%" | banner image | content (heading + text + gallery)
 * where:
 *   - name    the biome/region label shown on the pill (required)
 *   - coords  "x% y%" hotspot position for the map variant (optional; when
 *             omitted hotspots auto-distribute). Ignored by the overlay variant.
 *   - banner  an image shown across the top of the overlay (optional)
 *   - content rich text (heading, paragraphs, and an optional <ul> gallery of
 *             images) shown in the scrollable overlay body (optional)
 * A row whose first cell is exactly "map" (or "mapa") supplies the map
 * background image (in its second cell) for the map variant.
 * Missing cells degrade gracefully; N biomes are supported.
 */

// Close "X" icon (inherits currentColor).
const ICON_CLOSE = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

const FOCUSABLE = 'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])';

function textOf(cell) {
  return cell ? cell.textContent.trim() : '';
}

// Parse a "29% 19%" (or "29 19") coordinate cell into {x, y} percentages.
function parseCoords(value) {
  const nums = (value || '').match(/-?\d+(?:\.\d+)?/g);
  if (!nums || nums.length < 2) return null;
  const x = Math.min(100, Math.max(0, parseFloat(nums[0])));
  const y = Math.min(100, Math.max(0, parseFloat(nums[1])));
  return { x, y };
}

// Move an image (EDS wraps authored images in <p><picture>) out of a cell.
function extractPicture(cell) {
  if (!cell) return null;
  const pic = cell.querySelector('picture, img');
  return pic ? (pic.closest('picture') || pic) : null;
}

export default function decorate(block) {
  const isMap = block.classList.contains('map');
  const rows = [...block.children];

  let mapPicture = null;
  const biomes = [];

  rows.forEach((row) => {
    const cells = [...row.children];
    if (!cells.length) return;

    const firstText = textOf(cells[0]).toLowerCase();

    // The map background image row.
    if (firstText === 'map' || firstText === 'mapa') {
      mapPicture = extractPicture(cells[1]) || extractPicture(cells[0]);
      return;
    }

    const name = textOf(cells[0]);
    if (!name) return;

    const coords = parseCoords(textOf(cells[1]));
    // Content is the last cell; banner is the picture-bearing cell before it.
    const banner = extractPicture(cells[2]) || extractPicture(cells[3]);
    const contentCell = cells[3] || (banner ? null : cells[2]) || cells[2];

    biomes.push({
      name, coords, banner, contentCell,
    });
  });

  if (!biomes.length) return;

  // --- overlay dialog (shared by both variants) --------------------------
  const dialog = document.createElement('div');
  dialog.className = 'biome-explorer-dialog';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.hidden = true;

  const backdrop = document.createElement('div');
  backdrop.className = 'biome-explorer-backdrop';

  const panel = document.createElement('div');
  panel.className = 'biome-explorer-panel';

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'biome-explorer-close';
  closeBtn.setAttribute('aria-label', 'Fechar');
  closeBtn.innerHTML = ICON_CLOSE;

  const bannerBox = document.createElement('div');
  bannerBox.className = 'biome-explorer-banner';

  const labelId = `biome-explorer-label-${Math.random().toString(36).slice(2, 8)}`;
  const label = document.createElement('span');
  label.className = 'biome-explorer-label';
  label.id = labelId;

  const contentBox = document.createElement('div');
  contentBox.className = 'biome-explorer-content';

  panel.append(closeBtn, bannerBox, label, contentBox);
  dialog.append(backdrop, panel);
  dialog.setAttribute('aria-labelledby', labelId);

  let lastFocused = null;

  const closeDialog = () => {
    if (dialog.hidden) return;
    dialog.hidden = true;
    dialog.classList.remove('is-open');
    document.body.classList.remove('biome-explorer-lock');
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  };

  const trapFocus = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeDialog();
      return;
    }
    if (e.key !== 'Tab') return;
    const focusables = [...panel.querySelectorAll(FOCUSABLE)]
      .filter((el) => el.offsetParent !== null || el === closeBtn);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const openDialog = (biome, trigger) => {
    lastFocused = trigger || document.activeElement;

    // Banner image.
    bannerBox.textContent = '';
    if (biome.banner) {
      bannerBox.append(biome.banner);
      bannerBox.hidden = false;
    } else {
      bannerBox.hidden = true;
    }

    // Label badge = biome name.
    label.textContent = biome.name;

    // Content: move authored nodes in (no innerHTML → no injection risk).
    contentBox.textContent = '';
    if (biome.contentCell) {
      [...biome.contentCell.childNodes].forEach((node) => {
        contentBox.append(node.cloneNode(true));
      });
    }
    // Tag any authored list of images as the gallery strip.
    contentBox.querySelectorAll('ul').forEach((ul) => {
      if (ul.querySelector('picture, img')) ul.classList.add('biome-explorer-gallery');
    });

    dialog.hidden = false;
    document.body.classList.add('biome-explorer-lock');
    // Next frame so the transition runs from the hidden state.
    requestAnimationFrame(() => {
      dialog.classList.add('is-open');
      closeBtn.focus();
    });
  };

  closeBtn.addEventListener('click', closeDialog);
  backdrop.addEventListener('click', closeDialog);
  dialog.addEventListener('keydown', trapFocus);

  // --- build the stage (map hotspots or overlay selector) ----------------
  const makeHotspot = (biome, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'biome-explorer-hotspot';
    btn.textContent = biome.name;
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.setAttribute('aria-label', `${biome.name}, abrir detalhes`);
    if (isMap) {
      let { x, y } = biome.coords || {};
      if (x === undefined) x = 12 + ((i * 76) / Math.max(1, biomes.length - 1));
      if (y === undefined) y = i % 2 ? 62 : 30;
      btn.style.left = `${x}%`;
      btn.style.top = `${y}%`;
    }
    btn.addEventListener('click', () => openDialog(biome, btn));
    return btn;
  };

  block.textContent = '';

  if (isMap) {
    const stage = document.createElement('div');
    stage.className = 'biome-explorer-stage';

    const inner = document.createElement('div');
    inner.className = 'biome-explorer-map-inner';

    if (mapPicture) {
      mapPicture.classList.add('biome-explorer-map-bg');
      inner.append(mapPicture);
    }

    biomes.forEach((biome, i) => inner.append(makeHotspot(biome, i)));
    stage.append(inner);

    const hint = document.createElement('p');
    hint.className = 'biome-explorer-hint';
    hint.textContent = 'Arraste e veja mais';
    hint.setAttribute('aria-hidden', 'true');

    block.append(stage, hint, dialog);
  } else {
    const selector = document.createElement('div');
    selector.className = 'biome-explorer-selector';
    biomes.forEach((biome, i) => selector.append(makeHotspot(biome, i)));
    block.append(selector, dialog);
  }
}
