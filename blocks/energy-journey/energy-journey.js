/*
 * Energy Journey — the pinned scrollytelling centerpiece of
 * petrobras.com.br/en/jornada-da-energia ("The Journey of Energy").
 *
 * A full-height block whose FIRST authored row is the pinned background (a
 * looping muted video that stays fixed while the stages scroll over it), and
 * whose remaining rows are STAGES. Each stage reveals as it enters the viewport
 * (IntersectionObserver + CSS transition — no scroll library, no-build), and a
 * decorative yellow progress line fills as you advance through the journey.
 *
 * Authored structure (one row per part):
 *   row 0 (background): [ media cell: a link to the .mp4 (host-allowlisted),
 *                         optional poster <img> ]  [ (optional) empty ]
 *   row 1..n (stages):  [ media cell: a Lottie JSON link OR a <picture> ]
 *                       [ content cell: eyebrow (first <p>/<strong>), an
 *                         <h3> heading, body <p>s, and an optional "Did you
 *                         know?" callout authored as an <h4> + following <p> ]
 *
 * Rendered structure:
 *   .energy-journey
 *     .energy-journey-bg           (sticky/fixed video or poster)
 *     .energy-journey-line         (animated yellow progress line)
 *     .energy-journey-stages
 *       .energy-journey-stage[.is-active] * n
 *         .energy-journey-stage-media   (lottie slot or picture)
 *         .energy-journey-stage-content (eyebrow + h3 + body + callout)
 *
 * Lottie: if a stage media cell links to a *.json file, we render it with a
 * LOCALLY VENDORED lottie player (blocks/energy-journey/lottie_light.min.js) —
 * NOT an external CDN — to honour the No-Build / no-runtime-dependency rule.
 * If the player or JSON is absent, the stage still works (text reveal only).
 */

const VIDEO_HOSTS = ['petrobras.com.br', 'www.petrobras.com.br'];

function isAllowedHost(url) {
  try {
    return VIDEO_HOSTS.includes(new URL(url, window.location.href).hostname);
  } catch (e) {
    return false;
  }
}

/* ---- Lottie: load the locally vendored player once, lazily ---- */
let lottieLoader = null;
function loadLottie() {
  if (window.lottie && window.lottie.loadAnimation) return Promise.resolve(window.lottie);
  if (lottieLoader) return lottieLoader;
  lottieLoader = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    // vendored locally in the block folder (no external CDN)
    s.src = `${window.hlx.codeBasePath}/blocks/energy-journey/lottie_light.min.js`;
    s.async = true;
    s.onload = () => resolve(window.lottie);
    s.onerror = reject;
    document.head.append(s);
  }).catch(() => null);
  return lottieLoader;
}

/**
 * Render a Lottie animation from a local JSON URL into a container, lazily
 * (only when it first scrolls near the viewport). Falls back silently if the
 * player or the JSON can't load — the stage text still reveals.
 * @param {Element} container the .energy-journey-stage-media element
 * @param {string} jsonUrl absolute/relative path to the animation JSON
 */
function mountLottie(container, jsonUrl) {
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(async (entry) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      const lottie = await loadLottie();
      if (!lottie) return;
      let animationData = null;
      try {
        const res = await fetch(jsonUrl);
        if (res.ok) animationData = await res.json();
      } catch (e) { /* leave as text-only */ }
      if (!animationData) return;
      lottie.loadAnimation({
        container,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData,
      });
    });
  }, { rootMargin: '200px' });
  io.observe(container);
}

export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  if (!rows.length) return;

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Interactive journey');
  if (!block.hasAttribute('aria-label')) block.setAttribute('aria-label', 'The Journey of Energy');

  const [bgRow, ...stageRows] = rows;

  // ---- background (pinned video / poster) ----
  const bg = document.createElement('div');
  bg.className = 'energy-journey-bg';
  const bgCell = bgRow ? bgRow.querySelector(':scope > div') : null;
  const bgLink = bgCell && bgCell.querySelector('a[href]');
  const bgPoster = bgCell && bgCell.querySelector('img');
  const bgSrc = bgLink ? bgLink.getAttribute('href') : null;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (bgSrc && isAllowedHost(bgSrc)) {
    const video = document.createElement('video');
    video.className = 'energy-journey-bg-video';
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('aria-hidden', 'true');
    video.preload = 'metadata';
    if (bgPoster) video.poster = bgPoster.src;
    const source = document.createElement('source');
    source.src = bgSrc;
    source.type = 'video/mp4';
    video.append(source);
    bg.append(video);
    if (!reduceMotion.matches) {
      const play = () => { const p = video.play(); if (p && p.catch) p.catch(() => {}); };
      if (video.readyState >= 2) play();
      else video.addEventListener('loadeddata', play, { once: true });
    }
  } else if (bgPoster) {
    bg.append(bgPoster.closest('picture') || bgPoster);
  }

  // dark overlay so the white stage text stays legible over the video
  const bgOverlay = document.createElement('div');
  bgOverlay.className = 'energy-journey-bg-overlay';
  bg.append(bgOverlay);

  // ---- animated progress line ----
  const line = document.createElement('div');
  line.className = 'energy-journey-line';
  const lineFill = document.createElement('span');
  lineFill.className = 'energy-journey-line-fill';
  line.append(lineFill);

  // ---- stages ----
  const stagesWrap = document.createElement('div');
  stagesWrap.className = 'energy-journey-stages';

  const stages = stageRows.map((row) => {
    const cells = [...row.children];
    const mediaCell = cells.find((c) => c.querySelector('a[href], picture, img')) || cells[0];
    const contentCell = cells.find((c) => c !== mediaCell) || cells[1] || cells[0];

    const stage = document.createElement('div');
    stage.className = 'energy-journey-stage';

    // media: lottie JSON link → lottie slot; picture → image
    if (mediaCell) {
      const media = document.createElement('div');
      media.className = 'energy-journey-stage-media';
      const jsonLink = mediaCell.querySelector('a[href$=".json"], a[href*=".json?"]');
      const pic = mediaCell.querySelector('picture, img');
      if (jsonLink) {
        mountLottie(media, jsonLink.getAttribute('href'));
      } else if (pic) {
        media.append(pic.closest('picture') || pic);
      }
      stage.append(media);
    }

    // content: eyebrow + heading + body + optional "Did you know?" callout
    if (contentCell) {
      contentCell.className = 'energy-journey-stage-content';
      // eyebrow = a leading short paragraph before the heading
      const heading = contentCell.querySelector('h1, h2, h3, h4, h5, h6');
      if (heading) {
        const prev = heading.previousElementSibling;
        if (prev && prev.tagName === 'P' && prev.textContent.trim().length < 60) {
          prev.classList.add('energy-journey-eyebrow');
        }
      }
      // callout: an <h4> whose text starts with the "Did you know" marker (or a
      // sole <h4> late in the cell) + its following paragraph, wrapped in a box.
      const h4 = [...contentCell.querySelectorAll('h4')].pop();
      if (h4) {
        const callout = document.createElement('div');
        callout.className = 'energy-journey-callout';
        const after = h4.nextElementSibling;
        h4.classList.add('energy-journey-callout-title');
        callout.append(h4);
        if (after && after.tagName === 'P') callout.append(after);
        contentCell.append(callout);
      }
      stage.append(contentCell);
    }

    stagesWrap.append(stage);
    return stage;
  });

  block.textContent = '';
  block.append(bg, line, stagesWrap);

  // ---- reveal stages on scroll + drive the progress line ----
  const total = stages.length || 1;
  let activeCount = 0;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const wasActive = entry.target.classList.contains('is-active');
      if (entry.isIntersecting) {
        entry.target.classList.add('is-active');
        if (!wasActive) activeCount += 1;
      }
    });
    // fill the line proportional to how many stages have been revealed
    const pct = Math.min(100, Math.round((activeCount / total) * 100));
    lineFill.style.height = `${pct}%`;
  }, { threshold: 0.35 });
  stages.forEach((s) => io.observe(s));
}
