/*
 * Flipbook Block
 *
 * Source parity: petrobras.com.br/sustentabilidade/mudancas-climaticas embeds an
 * Issuu flipbook viewer (e.issuu.com/embed.html) in a ~3:2 (measured 1.508)
 * container that fills the content column up to ~853px wide with a 2px inset
 * frame. The viewer is a heavy third-party iframe, so we do NOT eager-load it:
 * a lightweight FACADE (poster + open button) renders first and the real
 * <iframe> is only injected on the first click (keep-it-100). The embed URL is
 * host-allowlisted before injection (security).
 *
 * Authoring content model (EDS table rows):
 *   | Flipbook embed URL (link or text)      |
 *   | Optional poster image + caption text   |
 * The first cell holds the Issuu (or allowlisted) embed URL; an optional second
 * cell provides a poster image and/or short caption for the facade. Missing or
 * invalid URLs are handled gracefully (block emptied).
 *
 * Content is moved node-by-node (never innerHTML), so no HTML sanitisation is
 * needed.
 */

const ALLOWED_HOSTS = [
  'issuu.com',
  'e.issuu.com',
  'petrobras.com.br',
  'nossaenergia.petrobras.com.br',
];

function isAllowedHost(hostname) {
  return ALLOWED_HOSTS.some((h) => hostname === h || hostname.endsWith(`.${h}`));
}

// Validate an embed URL: absolute http(s) on an allowlisted host only.
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

// Open-book glyph shown on the facade launch button.
const BOOK_ICON = '<svg class="flipbook-open-icon" aria-hidden="true" focusable="false" width="28" height="28" viewBox="0 0 24 24"><path fill="currentColor" d="M12 6.5C10.5 5.4 8.6 5 7 5c-1.6 0-3.5.4-5 1.5v13C3.5 18.4 5.4 18 7 18c1.6 0 3.5.4 5 1.5 1.5-1.1 3.4-1.5 5-1.5 1.6 0 3.5.4 5 1.5v-13C20.5 5.4 18.6 5 17 5c-1.6 0-3.5.4-5 1.5zm0 0v13" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linejoin="round"/></svg>';

export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];

  // First cell yielding a valid, allowlisted embed URL.
  let url = null;
  let urlCell = null;
  cells.some((cell) => {
    const link = cell.querySelector('a[href]');
    url = safeEmbedUrl(link?.getAttribute('href')) || safeEmbedUrl(cell.textContent);
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

  // Any remaining cell provides the poster image and/or caption.
  const posterCell = cells.find((c) => c !== urlCell
    && (c.textContent.trim().length || c.querySelector('picture, img')));

  const title = (posterCell?.querySelector('h1,h2,h3,h4,h5,h6')?.textContent
    || 'Flipbook').trim();

  block.textContent = '';

  const figure = document.createElement('figure');
  figure.className = 'flipbook-figure';

  const frame = document.createElement('div');
  frame.className = 'flipbook-frame';

  const facade = document.createElement('div');
  facade.className = 'flipbook-facade';

  const posterImg = posterCell?.querySelector('picture, img');
  if (posterImg) {
    const posterWrap = document.createElement('div');
    posterWrap.className = 'flipbook-poster';
    posterWrap.setAttribute('aria-hidden', 'true');
    posterWrap.append(posterImg.closest('picture') || posterImg);
    facade.append(posterWrap);
  }

  const overlay = document.createElement('div');
  overlay.className = 'flipbook-overlay';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'flipbook-open';
  button.setAttribute('aria-label', `Abrir publicação: ${title}`);
  button.insertAdjacentHTML('afterbegin', BOOK_ICON);
  const btnLabel = document.createElement('span');
  btnLabel.className = 'flipbook-open-label';
  btnLabel.textContent = 'Abrir publicação';
  button.append(btnLabel);
  overlay.append(button);
  facade.append(overlay);
  frame.append(facade);
  figure.append(frame);

  // Optional caption below the frame (text nodes / non-media elements).
  if (posterCell) {
    const captionText = [...posterCell.childNodes]
      .filter((n) => n.nodeType === Node.TEXT_NODE
        || (n.nodeType === Node.ELEMENT_NODE && !n.matches('picture, img')))
      .map((n) => n.textContent.trim())
      .filter(Boolean)
      .join(' ');
    if (captionText) {
      const caption = document.createElement('figcaption');
      caption.className = 'flipbook-caption';
      caption.textContent = captionText;
      figure.append(caption);
    }
  }

  block.append(figure);

  button.addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.className = 'flipbook-embed';
    iframe.src = url;
    iframe.title = title;
    iframe.loading = 'lazy';
    iframe.setAttribute('allow', 'fullscreen; clipboard-write');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    facade.replaceWith(iframe);
    iframe.focus();
  }, { once: true });
}
