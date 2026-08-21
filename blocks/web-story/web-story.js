/*
 * Web Story Block (Custom Slider Web Story)
 *
 * Source parity: petrobras.com.br/w/web-stories/... — an AMP/immersive web-story
 * player shown in a portrait (~9:16) container. Web-story players are heavy
 * tap-through experiences, so we render a lightweight FACADE (portrait poster +
 * a play/open button) and only inject the real story <iframe> on the first
 * click (keep-it-100). The story URL is host-allowlisted before injection
 * (security). NOTE: at build time the specific source story was temporarily
 * removed for the Brazilian electoral "defeso" period (Jul–Oct 2026), so the
 * container/facade are built to the documented player ratio; swap in the live
 * story URL/poster when it returns.
 *
 * Authoring content model (EDS table rows):
 *   | Web story URL (link or text)        |
 *   | Optional poster image + title text  |
 * The first cell holds the story URL; an optional second cell provides a
 * portrait poster image and/or title shown on the facade. Missing/invalid URLs
 * are handled gracefully (block emptied).
 *
 * Content is moved node-by-node (never innerHTML), so no HTML sanitisation is
 * needed.
 */

const ALLOWED_HOSTS = [
  'petrobras.com.br',
  'nossaenergia.petrobras.com.br',
  'youtube-nocookie.com',
];

function isAllowedHost(hostname) {
  return ALLOWED_HOSTS.some((h) => hostname === h || hostname.endsWith(`.${h}`));
}

// Validate a story URL: absolute http(s) on an allowlisted host only.
export function safeStoryUrl(raw) {
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

// Play triangle glyph on the facade open button.
const PLAY_ICON = '<svg class="web-story-play-icon" aria-hidden="true" focusable="false" width="32" height="32" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="rgba(255,255,255,0.9)"/><path fill="#0b2d2b" d="M9.5 7.5v9l7-4.5z"/></svg>';

export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];

  let url = null;
  let urlCell = null;
  cells.some((cell) => {
    const link = cell.querySelector('a[href]');
    url = safeStoryUrl(link?.getAttribute('href')) || safeStoryUrl(cell.textContent);
    if (url) {
      urlCell = cell;
      return true;
    }
    return false;
  });

  if (!url) {
    block.textContent = '';
    return;
  }

  const posterCell = cells.find((c) => c !== urlCell
    && (c.textContent.trim().length || c.querySelector('picture, img')));

  const title = (posterCell?.querySelector('h1,h2,h3,h4,h5,h6')?.textContent
    || posterCell?.textContent || 'Web Story').trim();

  block.textContent = '';

  const frame = document.createElement('div');
  frame.className = 'web-story-frame';

  const facade = document.createElement('div');
  facade.className = 'web-story-facade';

  const posterImg = posterCell?.querySelector('picture, img');
  if (posterImg) {
    const posterWrap = document.createElement('div');
    posterWrap.className = 'web-story-poster';
    posterWrap.setAttribute('aria-hidden', 'true');
    posterWrap.append(posterImg.closest('picture') || posterImg);
    facade.append(posterWrap);
  }

  const overlay = document.createElement('div');
  overlay.className = 'web-story-overlay';

  if (title) {
    const titleEl = document.createElement('p');
    titleEl.className = 'web-story-title';
    titleEl.textContent = title;
    overlay.append(titleEl);
  }

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'web-story-open';
  button.setAttribute('aria-label', `Abrir web story: ${title}`);
  button.insertAdjacentHTML('afterbegin', PLAY_ICON);
  const btnLabel = document.createElement('span');
  btnLabel.className = 'web-story-open-label';
  btnLabel.textContent = 'Ver story';
  button.append(btnLabel);
  overlay.append(button);

  facade.append(overlay);
  frame.append(facade);
  block.append(frame);

  button.addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.className = 'web-story-embed';
    iframe.src = url;
    iframe.title = title;
    iframe.loading = 'lazy';
    iframe.setAttribute('allow', 'autoplay; fullscreen');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    facade.replaceWith(iframe);
    iframe.focus();
  }, { once: true });
}
