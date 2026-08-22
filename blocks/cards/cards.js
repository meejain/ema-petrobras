import { createOptimizedPicture } from '../../scripts/aem.js';

/* inline glyphs for the audio player toggle (small UI glyphs, kept inline) */
const PLAY_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>';
const PAUSE_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 5h4v14H6zM14 5h4v14h-4z" fill="currentColor"/></svg>';

/* Overlay-card "graphism" — the EXACT source decorative shapes
   (petrobras.com.br/sustentabilidade "Você pode se interessar por"): a green
   diagonal panel filling the lower part of the card with a thin gold line
   tracing just above its top edge. Captured verbatim from the live DOM in the
   source viewBox (0 0 410 204); drawn with preserveAspectRatio:none so it
   stretches to the card width like the source. */
const CARD_OVERLAY_GRAPHISM_VIEWBOX = '0 0 410 204';
const CARD_OVERLAY_GREEN_PATH = 'M-7.24513 15.5353C-7.35844 14.4858 -7.16032 13.428 -6.67101 12.4699C-6.18171 11.5119 -5.41872 10.6878 -4.45996 10.0819C-3.50121 9.47604 -2.38102 9.11 -1.21373 9.02118C-0.0464504 8.93236 1.12609 9.12394 2.18423 9.57637L266.707 93.6029C272.459 95.7599 277.083 99.806 279.641 104.92L376.271 329.934C376.806 330.873 377.054 331.923 376.99 332.976C376.926 334.03 376.553 335.049 375.908 335.93C375.263 336.812 374.369 337.523 373.319 337.991C372.269 338.46 371.099 338.669 369.929 338.597L-0.152242 350.99C-1.4356 351.045 -2.71783 350.863 -3.91979 350.454C-5.12175 350.046 -6.21792 349.42 -7.14064 348.615C-8.06336 347.81 -8.79304 346.844 -9.28463 345.775C-9.77622 344.707 -10.0193 343.559 -9.99882 342.403L-7.24513 15.5353Z';
const CARD_OVERLAY_GOLD_PATH = 'M-13.006 30.9226C-13.0685 29.8698 -12.8205 28.8201 -12.2827 27.8613C-11.7449 26.9024 -10.9329 26.0623 -9.91461 25.4111C-8.89633 24.7599 -7.70132 24.3166 -6.42948 24.1181C-5.15765 23.9197 -3.84593 23.9719 -2.60396 24.2704L277.181 77.8508C283.508 79.3551 288.849 82.8327 292.041 87.5267L449.052 355.283C451.578 359.565 448.874 363.024 443.108 363L-7.5375 360.242C-8.92671 360.236 -10.3006 360.006 -11.58 359.565C-12.8593 359.124 -14.0188 358.482 -14.9914 357.674C-15.964 356.867 -16.7305 355.911 -17.2467 354.861C-17.7629 353.811 -18.0186 352.689 -17.9989 351.558L-13.006 30.9226Z';

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Build the overlay-card graphism (green diagonal panel + thin gold line),
 * reproducing the source shapes in the source viewBox. `preserveAspectRatio:
 * none` stretches it to the card, matching the source's non-uniform scaling.
 * `vector-effect: non-scaling-stroke` keeps the gold line 1px crisp.
 * @returns {SVGElement}
 */
function buildOverlayGraphism() {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'cards-overlay-graphism');
  svg.setAttribute('viewBox', CARD_OVERLAY_GRAPHISM_VIEWBOX);
  // Source renders the SVG at its NATURAL 410x204 (wider than the 300px card),
  // left-aligned; the card's overflow:hidden clips the right excess. Keep the
  // default preserveAspectRatio (meet) so the diagonal is NOT stretched — the
  // width/height attributes below make it 1:1 with the viewBox.
  svg.setAttribute('width', '410');
  svg.setAttribute('height', '204');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const green = document.createElementNS(SVG_NS, 'path');
  green.setAttribute('d', CARD_OVERLAY_GREEN_PATH);
  green.setAttribute('class', 'cards-overlay-graphism-fill');
  const gold = document.createElementNS(SVG_NS, 'path');
  gold.setAttribute('d', CARD_OVERLAY_GOLD_PATH);
  gold.setAttribute('class', 'cards-overlay-graphism-line');
  gold.setAttribute('fill', 'none');
  gold.setAttribute('vector-effect', 'non-scaling-stroke');
  svg.append(green, gold);
  return svg;
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Replace an authored mp3 link inside an audio card with a functional,
 * accessible custom player (play/pause toggle, seek slider, time readout).
 * @param {Element} body the `.cards-card-body` cell
 * @param {HTMLAnchorElement} link the authored link pointing at the audio file
 * @param {string} label an accessible label (the species name) for the controls
 */
function buildAudioPlayer(body, link, label) {
  const src = link.getAttribute('href') || '';
  // only accept http(s) media URLs (client-side input validation)
  if (!/^https?:\/\//i.test(src)) return;

  const player = document.createElement('div');
  player.className = 'cards-audio-player';

  const audio = document.createElement('audio');
  audio.preload = 'metadata';
  audio.src = src;

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'cards-audio-toggle';
  toggle.innerHTML = PLAY_ICON;
  const playLabel = label ? `Reproduzir áudio: ${label}` : 'Reproduzir áudio';
  const pauseLabel = label ? `Pausar áudio: ${label}` : 'Pausar áudio';
  toggle.setAttribute('aria-label', playLabel);

  const seek = document.createElement('input');
  seek.type = 'range';
  seek.className = 'cards-audio-seek';
  seek.min = '0';
  seek.max = '100';
  seek.value = '0';
  seek.step = '0.1';
  seek.setAttribute('aria-label', 'Progresso do áudio');

  const time = document.createElement('span');
  time.className = 'cards-audio-time';
  time.textContent = '--:--';

  toggle.addEventListener('click', () => {
    if (audio.paused) audio.play(); else audio.pause();
  });
  audio.addEventListener('play', () => {
    toggle.innerHTML = PAUSE_ICON;
    toggle.setAttribute('aria-label', pauseLabel);
  });
  audio.addEventListener('pause', () => {
    toggle.innerHTML = PLAY_ICON;
    toggle.setAttribute('aria-label', playLabel);
  });
  audio.addEventListener('loadedmetadata', () => {
    time.textContent = formatTime(audio.duration);
  });
  audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
      seek.value = String((audio.currentTime / audio.duration) * 100);
      const remaining = audio.duration - audio.currentTime;
      time.textContent = formatTime(remaining);
    }
  });
  audio.addEventListener('ended', () => {
    seek.value = '0';
    time.textContent = formatTime(audio.duration);
  });
  seek.addEventListener('input', () => {
    if (audio.duration) audio.currentTime = (Number(seek.value) / 100) * audio.duration;
  });

  player.append(toggle, seek, time, audio);
  // drop the authored link and replace it with the player. Prefer replacing an
  // enclosing wrapper (EDS `.button-container`, or a paragraph that only holds
  // the link) so the player <div> is never left nested inside a <p>.
  const buttonContainer = link.closest('.button-container');
  const soleParagraph = link.parentElement
    && link.parentElement.tagName === 'P'
    && link.parentElement.textContent.trim() === link.textContent.trim()
    ? link.parentElement
    : null;
  (buttonContainer || soleParagraph || link).replaceWith(player);
}

/**
 * loads and decorates the cards block
 * Supports the default card (image + body) plus visual variants authored as a
 * class on the block: `grid`, `icon`, `feature`, `overlay`, `audio`.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.replaceChildren(ul);

  // grid variant: pull the title up next to the image in a shared header row
  // (source: bold title top-left, small rounded image top-right, yellow bar
  // under the title, then body text and green link below).
  if (block.classList.contains('grid')) {
    ul.querySelectorAll(':scope > li').forEach((li) => {
      const image = li.querySelector(':scope > .cards-card-image');
      const body = li.querySelector(':scope > .cards-card-body');
      const heading = body && body.querySelector('h1, h2, h3, h4, h5, h6');
      if (image && heading) {
        const head = document.createElement('div');
        head.className = 'cards-card-head';
        const title = document.createElement('div');
        title.className = 'cards-card-title';
        title.append(heading);
        head.append(title, image);
        li.prepend(head);
      }
    });
  }

  // overlay variant: full-bleed image navigation tile with the heading (and
  // any body text) overlaid bottom-left. The authored link becomes a
  // whole-tile "stretched link" so the entire card is clickable.
  // (source: petrobras.com.br/sustentabilidade — "Você pode se interessar por".)
  if (block.classList.contains('overlay')) {
    ul.querySelectorAll(':scope > li').forEach((li) => {
      const body = li.querySelector(':scope > .cards-card-body');
      const heading = body && body.querySelector('h1, h2, h3, h4, h5, h6');
      const link = body && body.querySelector('a[href]');
      // inject the decorative green diagonal panel + gold line between the image
      // and the heading (source graphism). Sits above the photo/scrim, below the
      // heading + stretched link, so the title reads white over the green panel.
      const image = li.querySelector(':scope > .cards-card-image');
      if (image) image.after(buildOverlayGraphism());
      else li.prepend(buildOverlayGraphism());
      if (link) {
        // turn the authored link into a whole-tile "stretched" overlay: empty
        // visually (the heading stays visible in the body) but keep an
        // accessible name from the link (or the heading) text.
        const label = link.textContent.trim() || (heading && heading.textContent.trim()) || '';
        link.setAttribute('aria-label', label);
        link.textContent = '';
        link.classList.add('cards-overlay-link');
        // remove the (now-empty) paragraph / button-container that held the link
        const wrapper = link.closest('.button-container')
          || (link.parentElement && link.parentElement.tagName === 'P' ? link.parentElement : null);
        if (wrapper && wrapper !== link) wrapper.remove();
        li.append(link);
      }
    });
  }

  // audio variant: species/topic card with a megaphone icon header and a
  // functional audio player built from an authored mp3 link.
  // (source: petrobras.com.br/sustentabilidade/biodiversidade — "Ouça os sons".)
  if (block.classList.contains('audio')) {
    ul.querySelectorAll(':scope > li').forEach((li) => {
      const body = li.querySelector(':scope > .cards-card-body');
      if (!body) return;
      const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
      const label = heading ? heading.textContent.trim() : '';
      const link = body.querySelector('a[href]');
      if (link) buildAudioPlayer(body, link, label);
    });
  }
}
