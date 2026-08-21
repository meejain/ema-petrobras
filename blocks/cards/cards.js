import { createOptimizedPicture } from '../../scripts/aem.js';

/* inline glyphs for the audio player toggle (small UI glyphs, kept inline) */
const PLAY_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>';
const PAUSE_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 5h4v14H6zM14 5h4v14h-4z" fill="currentColor"/></svg>';

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
