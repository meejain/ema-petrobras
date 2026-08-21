/*
 * Video Block — variant: video (youtube)
 *
 * Source parity: petrobras.com.br/quem-somos/gasolina ("De onde vem a gasolina?").
 * The source embeds a YouTube player inside a 16:9 container with 4px rounded
 * corners that fills the content column.
 *
 * Performance (EDS keep-it-100): we do NOT eager-load the YouTube iframe. Instead
 * a lightweight FACADE renders the poster thumbnail + an accessible play button;
 * the real <iframe> (privacy-friendly youtube-nocookie.com, ?autoplay=1) is only
 * injected on the first click.
 *
 * Authoring model (EDS table rows -> cells):
 *   - one cell containing a YouTube URL (watch?v= / youtu.be/ / embed/), as a
 *     link or plain text — the video id is parsed from it.
 *   - an optional cell with a heading and/or caption text, rendered above the
 *     player.
 * Missing/invalid URLs are handled gracefully (the block is emptied).
 */

const YT_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
  'www.youtu.be',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
]);

// Parse an 11-char YouTube video id from a URL, validating the host first so we
// never build an embed from an arbitrary third-party origin (security).
function parseYouTubeId(raw) {
  if (!raw) return null;
  let url;
  try {
    url = new URL(raw.trim(), window.location.href);
  } catch {
    return null;
  }
  if (!YT_HOSTS.has(url.hostname)) return null;

  let id = '';
  if (url.hostname.endsWith('youtu.be')) {
    id = url.pathname.split('/')[1] || '';
  } else if (url.pathname.startsWith('/embed/') || url.pathname.startsWith('/v/')) {
    id = url.pathname.split('/')[2] || '';
  } else {
    id = url.searchParams.get('v') || '';
  }
  return /^[\w-]{11}$/.test(id) ? id : null;
}

// Solid white play triangle in a rounded rect, matching a standard player badge.
const PLAY_ICON = '<svg class="video-play-icon" aria-hidden="true" focusable="false" width="68" height="48" viewBox="0 0 68 48"><path class="video-play-bg" d="M66.52 7.74a8 8 0 0 0-5.63-5.66C55.79.99 34 .99 34 .99s-21.79 0-26.89 1.09a8 8 0 0 0-5.63 5.66A83.7 83.7 0 0 0 .35 24a83.7 83.7 0 0 0 1.13 16.26 8 8 0 0 0 5.63 5.66C12.21 47 34 47 34 47s21.79 0 26.89-1.08a8 8 0 0 0 5.63-5.66A83.7 83.7 0 0 0 67.65 24a83.7 83.7 0 0 0-1.13-16.26z"/><path d="M27.2 34.4 45 24 27.2 13.6z" fill="#fff"/></svg>';

export default async function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];

  // Find the first cell that yields a valid YouTube id (from a link or its text).
  let videoId = null;
  let urlCell = null;
  cells.some((cell) => {
    const link = cell.querySelector('a[href]');
    videoId = parseYouTubeId(link?.getAttribute('href')) || parseYouTubeId(cell.textContent);
    if (videoId) {
      urlCell = cell;
      return true;
    }
    return false;
  });

  // Graceful failure: no valid YouTube URL means nothing to render.
  if (!videoId) {
    block.textContent = '';
    return;
  }

  // Any remaining non-empty cell is treated as the heading/caption.
  const captionCell = cells.find((cell) => cell !== urlCell && cell.textContent.trim());

  // Capture a title for the button/iframe labels BEFORE we move caption nodes.
  const title = (captionCell?.querySelector('h1,h2,h3,h4,h5,h6')?.textContent
    || captionCell?.textContent || '').trim();

  block.textContent = '';

  const figure = document.createElement('figure');
  figure.className = 'video-figure';

  if (captionCell) {
    const caption = document.createElement('figcaption');
    caption.className = 'video-caption';
    caption.append(...captionCell.childNodes);
    figure.append(caption);
  }

  const frame = document.createElement('div');
  frame.className = 'video-frame';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'video-play';
  button.setAttribute('aria-label', title ? `Reproduzir vídeo: ${title}` : 'Reproduzir vídeo');

  const poster = document.createElement('img');
  poster.className = 'video-poster';
  poster.loading = 'lazy';
  poster.decoding = 'async';
  poster.alt = '';
  poster.width = 1280;
  poster.height = 720;
  poster.src = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
  // maxres isn't generated for every video; fall back to the always-present hq.
  poster.addEventListener('error', () => {
    if (!poster.dataset.fallback) {
      poster.dataset.fallback = '1';
      poster.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    }
  }, { once: false });

  button.append(poster);
  button.insertAdjacentHTML('beforeend', PLAY_ICON);
  frame.append(button);
  figure.append(frame);
  block.append(figure);

  // On click, swap the facade for the real player (privacy-friendly host).
  button.addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.className = 'video-embed';
    iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
    iframe.title = title || 'YouTube video player';
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
    iframe.allowFullscreen = true;
    iframe.setAttribute('frameborder', '0');
    button.replaceWith(iframe);
    iframe.focus();
  }, { once: true });
}
