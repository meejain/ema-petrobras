/*
 * Energy Map — the interactive isometric energy map from
 * petrobras.com.br/en/jornada-da-energia ("Learn about our main operations").
 *
 * A LARGE illustration (1376×640) sits in a horizontally scrollable holder: on
 * every viewport the map keeps its full size and the user pans left↔right to
 * reach the orange "+" markers (it is NOT shrunk to fit). Each marker carries a
 * title tooltip (a dark pill that expands on hover) and, when clicked, opens a
 * white detail card (image + title + body + optional "Learn about…" link) that
 * slides/scales/fades in from the left. A "travelling" ripple pulse hops from
 * marker to marker at random. Esc / close button / clicking another marker
 * swaps the card; focus returns to the triggering marker on close.
 *
 * Authored structure:
 *   row 0 (map): a media cell holding the map illustration (a <picture>/<img>)
 *   row 1..n (hotspots): a cell whose first <p> is "x% y%" (position, optional
 *     trailing "blink" to seed the pulse), then a content cell: an optional
 *     <picture> (card image), an <h3> title, body <p>s, and an optional link.
 *
 * Rendered structure:
 *   .energy-map
 *     .energy-map-relative                (positioning context for the card)
 *       .energy-map-holder                (horizontal scroll viewport)
 *         .energy-map-stage
 *           .energy-map-illustration      (the full-size map image)
 *           button.energy-map-hotspot * n (span.energy-map-hotspot-icon + pill)
 *       .energy-map-card[hidden]          (detail card, role=dialog)
 *         button.energy-map-card-close
 *         .energy-map-card-media
 *         .energy-map-card-body (title + body + link)
 */

function parsePosition(text) {
  // "18% 22%" or "18% 22% blink" → { x, y, blink }
  const m = (text || '').match(/(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%/);
  if (!m) return null;
  return {
    x: parseFloat(m[1]),
    y: parseFloat(m[2]),
    blink: /\bblink\b/i.test(text),
  };
}

export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  if (!rows.length) return;

  const [mapRow, ...hotspotRows] = rows;

  // ---- scaffold: relative > holder > stage(illustration) + card ----
  const relative = document.createElement('div');
  relative.className = 'energy-map-relative';
  const holder = document.createElement('div');
  holder.className = 'energy-map-holder';
  const stage = document.createElement('div');
  stage.className = 'energy-map-stage';
  const illustration = document.createElement('div');
  illustration.className = 'energy-map-illustration';
  const mapPic = mapRow ? mapRow.querySelector('picture, img') : null;
  if (mapPic) illustration.append(mapPic.closest('picture') || mapPic);
  stage.append(illustration);
  holder.append(stage);

  // ---- detail card (one shared instance, sibling of the holder) ----
  const card = document.createElement('div');
  card.className = 'energy-map-card';
  card.hidden = true;
  card.setAttribute('role', 'dialog');
  card.setAttribute('aria-modal', 'false');
  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'energy-map-card-close';
  closeBtn.setAttribute('aria-label', 'Fechar');
  const cardMedia = document.createElement('div');
  cardMedia.className = 'energy-map-card-media';
  const cardBody = document.createElement('div');
  cardBody.className = 'energy-map-card-body';
  card.append(closeBtn, cardMedia, cardBody);

  relative.append(holder, card);

  let lastTrigger = null;

  const closeCard = () => {
    card.classList.remove('is-open');
    const finish = () => { card.hidden = true; };
    // let the fade/scale-out play, then hide
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) finish();
    else setTimeout(finish, 500);
    if (lastTrigger) lastTrigger.focus();
  };

  // fill the card's content from a hotspot's data
  const fillCard = (data) => {
    cardMedia.innerHTML = '';
    if (data.media) cardMedia.append(data.media.cloneNode(true));
    cardMedia.hidden = !data.media;
    cardBody.innerHTML = '';
    if (data.media) cardBody.removeAttribute('data-no-media');
    else cardBody.setAttribute('data-no-media', '');
    if (data.title) {
      const h = document.createElement('h3');
      h.className = 'energy-map-card-title';
      h.textContent = data.title;
      cardBody.append(h);
      card.setAttribute('aria-label', data.title);
    }
    data.body.forEach((html) => {
      const p = document.createElement('p');
      p.innerHTML = html;
      cardBody.append(p);
    });
    if (data.link) cardBody.append(data.link.cloneNode(true));
    cardBody.scrollTop = 0;
  };

  // slide/scale/fade the card in on the NEXT frame so the transition fires (a
  // display:none→flex change in the same frame is not animatable).
  const slideIn = () => {
    card.classList.remove('is-open');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => card.classList.add('is-open'));
    });
  };

  const reduceMotionCard = window.matchMedia('(prefers-reduced-motion: reduce)');

  const openCard = (data, trigger) => {
    lastTrigger = trigger;
    const alreadyOpen = !card.hidden && card.classList.contains('is-open');
    if (alreadyOpen && !reduceMotionCard.matches) {
      // another marker clicked while a card is open: fade/scale it OUT, then
      // swap content and slide the new one back IN (source behavior).
      let done = false;
      const onOut = () => {
        if (done) return;
        done = true;
        card.removeEventListener('transitionend', onOut);
        fillCard(data);
        slideIn();
        closeBtn.focus();
      };
      card.addEventListener('transitionend', onOut);
      card.classList.remove('is-open');
      // safety fallback if transitionend doesn't fire (> 0.5s transition)
      setTimeout(onOut, 600);
      return;
    }
    // first open (or reduced motion): fill, show, slide in
    fillCard(data);
    card.hidden = false;
    slideIn();
    closeBtn.focus();
  };

  // ---- hotspots ----
  const hotspots = [];
  hotspotRows.forEach((row, i) => {
    const cells = [...row.children];
    const posCell = cells[0];
    const pos = parsePosition(posCell ? posCell.textContent : '');
    if (!pos) return;
    const contentCell = cells[1] || cells[0];

    // extract card data from the content cell
    const media = contentCell.querySelector('picture, img');
    const heading = contentCell.querySelector('h1, h2, h3, h4, h5, h6');
    const title = heading ? heading.textContent.trim() : '';
    const link = contentCell.querySelector('a[href]');
    // Body = LEAF text paragraphs only. Skip any wrapper <p> that contains
    // media/headings/other paragraphs (the parser can nest content in a wrapper
    // <p>, which would otherwise duplicate the card), the link's own paragraph,
    // and any position-marker text.
    const body = [...contentCell.querySelectorAll('p')]
      .filter((p) => !p.querySelector('picture, img, h1, h2, h3, h4, h5, h6, p'))
      .filter((p) => !(link && p.contains(link)))
      .map((p) => p.innerHTML.trim())
      .filter((h) => h && !/^\s*-?\d+(?:\.\d+)?%/.test(h));

    const hotspot = document.createElement('button');
    hotspot.type = 'button';
    hotspot.className = 'energy-map-hotspot';
    // markers in the left third expand their tooltip pill to the RIGHT so it
    // never runs off the map's left edge (source uses a `left` modifier too).
    if (pos.x < 34) hotspot.classList.add('is-left');
    hotspot.style.left = `${pos.x}%`;
    hotspot.style.top = `${pos.y}%`;
    hotspot.setAttribute('aria-label', title || `Ponto ${i + 1}`);
    hotspot.setAttribute('aria-haspopup', 'dialog');
    // tooltip pill text is rendered via CSS content:attr(data-text)
    if (title) hotspot.setAttribute('data-text', title);
    const icon = document.createElement('span');
    icon.className = 'energy-map-hotspot-icon';
    icon.setAttribute('aria-hidden', 'true');
    hotspot.append(icon);
    hotspot.addEventListener('click', () => openCard({
      media: media ? (media.closest('picture') || media) : null,
      title,
      body,
      link,
    }, hotspot));
    stage.append(hotspot);
    hotspots.push(hotspot);
  });

  // ---- travelling ripple pulse ----
  // A single ripple hops from marker to marker at random intervals (source
  // toggles a `blink` class on a random dot; each pulse lasts ~1s, with gaps).
  if (hotspots.length && !reduceMotionCard.matches) {
    let current = -1;
    const pulse = () => {
      if (current >= 0 && hotspots[current]) hotspots[current].classList.remove('is-blinking');
      // pick a random marker different from the last
      let next = Math.floor(Math.random() * hotspots.length);
      if (hotspots.length > 1 && next === current) next = (next + 1) % hotspots.length;
      current = next;
      const dot = hotspots[current];
      dot.classList.add('is-blinking');
      // remove after the 1s animation so it can re-trigger later
      setTimeout(() => dot.classList.remove('is-blinking'), 1000);
      // schedule the next hop (1–2.5s gap, matching the source cadence)
      const gap = 1000 + Math.random() * 1500;
      window.setTimeout(pulse, gap);
    };
    window.setTimeout(pulse, 1200);
  }

  closeBtn.addEventListener('click', closeCard);
  block.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !card.hidden) { closeCard(); e.preventDefault(); }
  });

  block.textContent = '';
  block.append(relative);
}
