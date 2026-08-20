// Petrobras header: utility bar + main nav with quadrilateral logo,
// click-triggered megamenus, expandable search, and sticky compact-on-scroll.

const isDesktop = window.matchMedia('(min-width: 992px)');

// Nav fragment links may be direct children of <li> or wrapped in <p> (CMS markup).
function getLiLink(li) {
  return li.querySelector(':scope > a, :scope > p > a');
}

// Quadrilateral white shape (angled bottom-right cut). The wordmark image src
// is read from the nav fragment (content-first), not hardcoded here.
const LOGO_SHAPE = `
  <div class="nav-logo-shape">
    <svg width="344" height="104" viewBox="0 0 344 104" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M0 0H344L267.811 94.3295C262.913 100.394 255.374 103.702 247.595 103.2L0 87.2258V0Z" fill="white"></path>
    </svg>
  </div>`;

// Bottom-bar + accessibility icons captured from the source (petrobras.com.br)
// so the mobile chrome uses the actual brand glyphs rather than approximations.
const MOBILE_ICONS = {
  lang: '<svg class="nav-mobile-ico" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z" stroke="#373737" stroke-width="1.5" stroke-miterlimit="10"/><path d="M1 9H17" stroke="#373737" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M9.00033 16.7835C10.8413 16.7835 12.3337 13.2987 12.3337 9.00013C12.3337 4.70151 10.8413 1.2168 9.00033 1.2168C7.15938 1.2168 5.66699 4.70151 5.66699 9.00013C5.66699 13.2987 7.15938 16.7835 9.00033 16.7835Z" stroke="#373737" stroke-width="1.5" stroke-miterlimit="10"/></svg>',
  a11y: '<svg class="nav-mobile-ico" width="15" height="17" viewBox="0 0 15 17" fill="none" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.75112 4.0173C8.3904 4.25832 7.96632 4.38696 7.53249 4.38696C6.95074 4.38696 6.39282 4.15587 5.98146 3.74451C5.5701 3.33315 5.339 2.77523 5.339 2.19348C5.339 1.75965 5.46765 1.33557 5.70867 0.97485C5.9497 0.614134 6.29227 0.332989 6.69308 0.16697C7.09388 0.000950396 7.53492 -0.0424878 7.96041 0.0421481C8.38591 0.126784 8.77675 0.335693 9.08351 0.642457C9.39028 0.949221 9.59918 1.34006 9.68382 1.76556C9.76846 2.19105 9.72502 2.63209 9.559 3.03289C9.39298 3.4337 9.11184 3.77627 8.75112 4.0173ZM9.27072 11.1046C9.02896 10.5415 8.90397 9.93517 8.90332 9.32237L8.9088 7.60048C10.8339 7.38115 12.6775 6.70015 14.2828 5.61538C14.4502 5.48803 14.5625 5.30139 14.5965 5.09383C14.6305 4.88628 14.5837 4.67357 14.4658 4.49944C14.3478 4.3253 14.1676 4.20297 13.9622 4.15759C13.7569 4.1122 13.5419 4.14721 13.3616 4.25542C11.6409 5.41531 9.613 6.03496 7.53787 6.03496C5.46274 6.03496 3.43488 5.41531 1.71418 4.25542C1.62518 4.18771 1.52331 4.13886 1.4148 4.11184C1.30628 4.08483 1.1934 4.08023 1.08304 4.09832C0.972689 4.11641 0.867181 4.15682 0.772969 4.21706C0.678758 4.27731 0.597819 4.35613 0.535101 4.44871C0.472383 4.5413 0.429201 4.6457 0.408196 4.75554C0.387191 4.86537 0.388802 4.97834 0.412932 5.08753C0.437063 5.19673 0.483204 5.29985 0.548538 5.39061C0.613872 5.48137 0.697025 5.55785 0.792918 5.61538C2.39829 6.70015 4.2419 7.38115 6.16695 7.60048V9.07012C6.16692 9.84885 6.00833 10.6194 5.70083 11.3349L3.76508 15.8535C3.67928 16.0542 3.67671 16.2807 3.75796 16.4833C3.8392 16.6859 3.99759 16.8479 4.1983 16.9337C4.399 17.0196 4.62557 17.0221 4.82816 16.9409C5.03076 16.8596 5.19278 16.7012 5.27859 16.5005L7.21434 11.982C7.25279 11.8965 7.28791 11.8077 7.3223 11.7208C7.33205 11.6962 7.34174 11.6717 7.35143 11.6475C7.36404 11.6094 7.38829 11.5762 7.42075 11.5526C7.45321 11.5289 7.49225 11.5161 7.53239 11.5158C7.57092 11.5168 7.60827 11.5294 7.63957 11.5519C7.67087 11.5744 7.69467 11.6058 7.70787 11.642L7.75722 11.7516L9.79168 16.5005C9.87748 16.7012 10.0395 16.8596 10.2421 16.9409C10.4447 17.0221 10.6713 17.0196 10.872 16.9337C11.0727 16.8479 11.2311 16.6859 11.3123 16.4833C11.3936 16.2807 11.391 16.0542 11.3052 15.8535L9.27072 11.1046Z" fill="#373737"/></svg>',
  menu: '<svg class="nav-mobile-menu-hamburger" width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true"><line x1="1" y1="1" x2="17" y2="1" stroke="#373737" stroke-width="2" stroke-linecap="round"/><line x1="1" y1="7" x2="17" y2="7" stroke="#373737" stroke-width="2" stroke-linecap="round"/><line x1="1" y1="13" x2="17" y2="13" stroke="#373737" stroke-width="2" stroke-linecap="round"/></svg>',
  close: '<svg class="nav-mobile-menu-close" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M15.625 4.375L4.375 15.625M15.625 15.625L4.375 4.375" stroke="#525252" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  canais: '<svg class="nav-mobile-ico" width="17" height="16" viewBox="0 0 17 16" fill="none" aria-hidden="true"><path d="M7.1 1H1.5V6.6H7.1V1Z" stroke="#373737" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M15.5004 1H9.90039V6.6H15.5004V1Z" stroke="#373737" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M7.1 9.40039H1.5V15.0004H7.1V9.40039Z" stroke="#373737" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M15.5004 9.40039H9.90039V15.0004H15.5004V9.40039Z" stroke="#373737" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  busca: '<svg class="nav-mobile-ico" width="17" height="16" viewBox="0 0 17 16" fill="none" aria-hidden="true"><path d="M7.625 13.25C11.0077 13.25 13.75 10.5077 13.75 7.125C13.75 3.74226 11.0077 1 7.625 1C4.24226 1 1.5 3.74226 1.5 7.125C1.5 10.5077 4.24226 13.25 7.625 13.25Z" stroke="#373737" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M11.9561 11.4561L15.4998 14.9998" stroke="#373737" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  contrast: '<svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true"><circle cx="32" cy="32" fill="#008542" r="32"/><circle cx="32" cy="32" r="15.5" stroke="white"/><path clip-rule="evenodd" d="M32.0004 21.5117C26.4571 21.799 22.0508 26.3847 22.0508 31.9996C22.0508 37.6144 26.4571 42.2001 32.0004 42.4875V21.5117Z" fill="white" fill-rule="evenodd"/></svg>',
  bigtext: '<svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true"><circle cx="32" cy="32" fill="#008542" r="32"/><path d="M18.208 39L21.12 29.51H23.395L26.32 39H24.279L23.668 36.803H20.717L20.119 39H18.208ZM21.133 35.256H23.317L22.212 31.226L21.133 35.256Z" fill="white"/><path d="M30.384 39L35.76 21.48H39.96L45.36 39H41.592L40.464 34.944H35.016L33.912 39H30.384ZM35.784 32.088H39.816L37.776 24.648L35.784 32.088Z" fill="white"/></svg>',
  globe: '<svg width="58" height="58" viewBox="0 0 58 58" fill="none" aria-hidden="true"><path d="M29 57C44.464 57 57 44.464 57 29C57 13.536 44.464 1 29 1C13.536 1 1 13.536 1 29C1 44.464 13.536 57 29 57Z" stroke="#008542" stroke-miterlimit="10" stroke-width="1.5"/><path d="M1 29H57" stroke="#008542" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/><path d="M28.9997 56.2411C35.443 56.2411 40.6663 44.0446 40.6663 28.9995C40.6663 13.9543 35.443 1.75781 28.9997 1.75781C22.5564 1.75781 17.333 13.9543 17.333 28.9995C17.333 44.0446 22.5564 56.2411 28.9997 56.2411Z" stroke="#008542" stroke-miterlimit="10" stroke-width="1.5"/></svg>',
};

function closeAllMegamenus(nav, except) {
  nav.querySelectorAll('.nav-drop[aria-expanded="true"]').forEach((drop) => {
    if (drop !== except) {
      drop.setAttribute('aria-expanded', 'false');
      const panel = drop.nextElementSibling;
      if (panel && panel.classList.contains('nav-megamenu')) panel.hidden = true;
    }
  });
  const wrapper = nav.closest('.nav-wrapper');
  const overlay = wrapper.querySelector('.nav-overlay');
  const anyOpen = nav.querySelector('.nav-drop[aria-expanded="true"]');
  if (overlay) overlay.classList.toggle('is-visible', !!anyOpen);
  wrapper.classList.toggle('is-open', !!anyOpen);
}

function buildUtilityBar(section) {
  const bar = document.createElement('div');
  bar.className = 'nav-utility';
  const inner = document.createElement('div');
  inner.className = 'nav-utility-inner';

  const label = document.createElement('span');
  label.className = 'nav-utility-label';
  label.textContent = 'Você está em: SITE PETROBRAS';
  inner.append(label);

  const links = document.createElement('div');
  links.className = 'nav-utility-links';
  const accessLabel = document.createElement('span');
  accessLabel.textContent = 'Acesse também:';
  links.append(accessLabel);
  // first link is the logo home link — skip it in the utility link row
  const anchors = [...section.querySelectorAll('a')].slice(1);
  anchors.forEach((a) => {
    const link = document.createElement('a');
    link.href = a.href;
    link.textContent = a.textContent.trim().toUpperCase();
    links.append(link);
  });
  inner.append(links);

  const controls = document.createElement('div');
  controls.className = 'nav-utility-controls';
  controls.innerHTML = `
    <div class="nav-fontsize">
      <button type="button" aria-label="Diminuir tamanho da fonte">A-</button>
      <span>100%</span>
      <button type="button" aria-label="Aumentar tamanho da fonte">A+</button>
    </div>
    <button type="button" class="nav-contrast" aria-label="Ativar alto contraste"></button>
    <div class="nav-lang" role="group" aria-label="Alterar idioma">
      <button type="button" class="is-active" aria-label="Alterar idioma para português">pt</button>
      <button type="button" aria-label="Alterar idioma para inglês">en</button>
    </div>`;

  // zoom controls (A-/A+): enlarge/shrink the whole page in 10% steps between
  // 90% and 130%, matching the source. The source scales all page content (not
  // just fonts) — because our migrated content is largely px-based, we apply a
  // real `zoom` on the document element so everything (header + content) grows,
  // exactly like the source behaviour.
  const [decBtn, incBtn] = controls.querySelectorAll('.nav-fontsize button');
  const pct = controls.querySelector('.nav-fontsize span');
  let scale = 100;
  const applyScale = () => {
    pct.textContent = `${scale}%`;
    document.documentElement.style.zoom = scale / 100;
  };
  decBtn.addEventListener('click', () => { scale = Math.max(90, scale - 10); applyScale(); });
  incBtn.addEventListener('click', () => { scale = Math.min(130, scale + 10); applyScale(); });

  // high-contrast toggle
  const contrastBtn = controls.querySelector('.nav-contrast');
  contrastBtn.addEventListener('click', () => {
    const on = document.body.classList.toggle('high-contrast');
    contrastBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
  });

  // language toggle (visual active state)
  const langBtns = controls.querySelectorAll('.nav-lang button');
  langBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      langBtns.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
    });
  });

  inner.append(controls);

  bar.append(inner);
  return bar;
}

// Build the DESTAQUES highlights view (default right-panel content) from a <ul> of image cards.
function buildHighlights(highlightList) {
  const right = document.createElement('div');
  right.className = 'nav-megamenu-highlights';
  const head = document.createElement('div');
  head.className = 'nav-megamenu-highlights-head';
  const title = document.createElement('p');
  title.textContent = 'DESTAQUES';
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'nav-megamenu-close';
  close.setAttribute('aria-label', 'Fechar submenu');
  head.append(title, close);
  right.append(head);

  const cards = document.createElement('div');
  cards.className = 'nav-megamenu-cards';
  [...highlightList.children].forEach((li) => {
    const a = li.querySelector('a');
    const img = li.querySelector('img');
    if (!a) return;
    const card = document.createElement('a');
    card.className = 'nav-megamenu-card';
    card.href = a.href;
    const desc = [...li.childNodes]
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent.trim())
      .filter(Boolean)
      .join(' ');
    const cardImg = img ? `<span class="nav-megamenu-card-img"><img src="${img.getAttribute('src')}" alt="${img.alt}"></span>` : '';
    const heading = a.textContent.trim();
    card.innerHTML = `${cardImg}<span class="nav-megamenu-card-title">${heading}</span>${desc ? `<span class="nav-megamenu-card-desc">${desc}</span>` : ''}`;
    cards.append(card);
  });
  right.append(cards);
  return right;
}

// Build a nested sub-list view (shown in the right panel when a category with a
// nested <ul> is clicked) — matches the source behavior where a chevron category
// swaps DESTAQUES for its own link list.
function buildSubList(categoryLabel, nestedUl) {
  const view = document.createElement('div');
  view.className = 'nav-megamenu-sublist';
  const head = document.createElement('div');
  head.className = 'nav-megamenu-highlights-head';
  const title = document.createElement('p');
  title.textContent = categoryLabel.toUpperCase();
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'nav-megamenu-close';
  close.setAttribute('aria-label', 'Fechar submenu');
  head.append(title, close);
  view.append(head);

  const list = document.createElement('ul');
  list.className = 'nav-megamenu-sublist-links';
  [...nestedUl.querySelectorAll(':scope > li > a, :scope > li > p > a')].forEach((a) => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = a.getAttribute('href');
    link.textContent = a.textContent.trim();
    li.append(link);
    list.append(li);
  });
  view.append(list);
  return view;
}

function buildMegamenuPanel(subLists, title) {
  const panel = document.createElement('div');
  panel.className = 'nav-megamenu';
  panel.hidden = true;

  const inner = document.createElement('div');
  inner.className = 'nav-megamenu-inner';

  // First <ul> = category list (may contain nested <ul> level-2 submenus).
  // A later <ul> that contains images = DESTAQUES highlights.
  const categoryList = subLists.find((ul) => !ul.querySelector('img'));
  const highlightList = subLists.find((ul) => ul.querySelector('img'));

  // Left: panel title + category links
  const left = document.createElement('div');
  left.className = 'nav-megamenu-list';
  if (title) {
    const heading = document.createElement('p');
    heading.className = 'nav-megamenu-title';
    heading.textContent = title;
    left.append(heading);
  }
  const catUl = document.createElement('ul');

  // Right: swappable region (default = highlights; category with nested list swaps in its sublist)
  const rightWrap = document.createElement('div');
  rightWrap.className = 'nav-megamenu-right';
  const defaultRight = highlightList ? buildHighlights(highlightList) : null;
  if (defaultRight) rightWrap.append(defaultRight);

  const subViews = [];
  const showDefault = () => {
    rightWrap.querySelectorAll('.nav-megamenu-sublist').forEach((v) => { v.hidden = true; });
    if (defaultRight) defaultRight.hidden = false;
    left.querySelectorAll('.nav-megamenu-cat.is-active').forEach((c) => c.classList.remove('is-active'));
  };

  if (categoryList) {
    [...categoryList.children].filter((li) => li.tagName === 'LI').forEach((li) => {
      const a = getLiLink(li);
      const nestedUl = li.querySelector(':scope > ul');
      const item = document.createElement('li');
      item.className = 'nav-megamenu-cat';

      if (nestedUl && a) {
        // expandable category: click swaps the right panel to its sublist
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'nav-megamenu-cat-toggle';
        btn.innerHTML = `<span>${a.textContent.trim()}</span>`;
        item.append(btn);

        const subView = buildSubList(a.textContent.trim(), nestedUl);
        subView.hidden = true;
        rightWrap.append(subView);
        subViews.push(subView);

        btn.addEventListener('click', () => {
          const active = item.classList.contains('is-active');
          showDefault();
          if (!active) {
            item.classList.add('is-active');
            if (defaultRight) defaultRight.hidden = true;
            subView.hidden = false;
          }
        });
        const subClose = subView.querySelector('.nav-megamenu-close');
        if (subClose) subClose.addEventListener('click', showDefault);
      } else if (a) {
        const link = document.createElement('a');
        link.href = a.getAttribute('href');
        link.textContent = a.textContent.trim();
        item.append(link);
      }
      catUl.append(item);
    });
  }
  left.append(catUl);
  inner.append(left);
  inner.append(rightWrap);

  panel.append(inner);
  return panel;
}

function buildMainNav(section, nav) {
  const inner = document.createElement('div');
  inner.className = 'nav-main-inner';

  const logo = document.createElement('a');
  logo.className = 'nav-logo';
  logo.href = 'https://petrobras.com.br';
  logo.setAttribute('aria-label', 'Página inicial Petrobras');
  // wordmark src comes from the nav fragment's home link image
  const logoImg = section.querySelector(':scope > p a img');
  const wordmarkSrc = logoImg ? logoImg.getAttribute('src') : '';
  logo.innerHTML = `${LOGO_SHAPE}<img class="nav-logo-wordmark" src="${wordmarkSrc}" alt="Petrobras" width="176" height="34">`;
  inner.append(logo);

  const topUl = section.querySelector(':scope > ul');
  const list = document.createElement('ul');
  list.className = 'nav-list';
  [...topUl.children].filter((li) => li.tagName === 'LI').forEach((li) => {
    const item = document.createElement('li');
    item.className = 'nav-item';
    const topA = getLiLink(li);
    const subUls = [...li.querySelectorAll(':scope > ul')];
    // label from the direct link, or the li's own text nodes when there's no link
    const label = topA ? topA.textContent.trim() : [...li.childNodes]
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent.trim())
      .filter(Boolean)
      .join(' ');

    if (subUls.length > 0) {
      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'nav-drop';
      trigger.setAttribute('aria-expanded', 'false');
      trigger.innerHTML = `<span>${label}</span>`;
      const panel = buildMegamenuPanel(subUls, label);
      item.append(trigger, panel);

      trigger.addEventListener('click', () => {
        const open = trigger.getAttribute('aria-expanded') === 'true';
        closeAllMegamenus(nav);
        if (!open) {
          trigger.setAttribute('aria-expanded', 'true');
          panel.hidden = false;
          const wrapper = nav.closest('.nav-wrapper');
          wrapper.classList.add('is-open');
          const overlay = wrapper.querySelector('.nav-overlay');
          if (overlay) overlay.classList.add('is-visible');
        }
      });
      const closeBtn = panel.querySelector('.nav-megamenu-close');
      if (closeBtn) closeBtn.addEventListener('click', () => closeAllMegamenus(nav));
    } else if (topA) {
      const link = document.createElement('a');
      link.href = topA.getAttribute('href');
      link.textContent = topA.textContent.trim();
      link.className = 'nav-link';
      item.append(link);
    } else if (label) {
      const span = document.createElement('span');
      span.className = 'nav-link';
      span.textContent = label;
      item.append(span);
    }
    list.append(item);
  });
  inner.append(list);

  // Expandable search: clicking the icon hides the nav links and reveals a
  // full-width rounded search pill (placeholder + magnifier), matching the source.
  const search = document.createElement('div');
  search.className = 'nav-search';
  search.innerHTML = `
    <form class="nav-search-form" role="search">
      <input type="search" aria-label="Campo de pesquisa" placeholder="O que você está procurando?">
      <button type="submit" class="nav-search-submit" aria-label="Buscar"></button>
      <button type="button" class="nav-search-close" aria-label="Fechar barra de pesquisa"></button>
    </form>
    <button type="button" class="nav-search-toggle" aria-label="Abrir barra de pesquisa"></button>`;
  const toggle = search.querySelector('.nav-search-toggle');
  const close = search.querySelector('.nav-search-close');
  const form = search.querySelector('.nav-search-form');
  const input = search.querySelector('input');
  const closeSearch = () => inner.classList.remove('is-searching');
  toggle.addEventListener('click', () => {
    const opening = !inner.classList.contains('is-searching');
    inner.classList.toggle('is-searching', opening);
    if (opening) input.focus();
  });
  close.addEventListener('click', closeSearch);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (q) window.location.assign(`https://petrobras.com.br/en/search?q=${encodeURIComponent(q)}`);
  });
  document.addEventListener('click', (e) => {
    if (inner.classList.contains('is-searching') && !search.contains(e.target)) closeSearch();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSearch();
  });
  inner.append(search);

  const main = document.createElement('div');
  main.className = 'nav-main';
  main.append(inner);
  return main;
}

// Build one mobile accordion list level from the nav fragment's <li> nodes.
// Recurses into nested category <ul>s (skipping image/megamenu lists) so the
// full hierarchy (e.g. Sustentabilidade → Meio Ambiente → …) is reproduced.
// `level` sets the indentation depth (0 = top level, dark-green bold).
function buildMobileList(liNodes, level) {
  const list = document.createElement('ul');
  list.className = 'nav-mobile-list';
  if (level > 0) list.dataset.level = String(level);

  liNodes.forEach((li) => {
    const topA = getLiLink(li);
    // a nested category <ul> (the sublist we expand) — ignore image/megamenu lists
    const catUl = [...li.querySelectorAll(':scope > ul')].find((ul) => !ul.querySelector('img'));
    const item = document.createElement('li');

    if (catUl) {
      // Expandable accordion row. The label comes from the direct link, or the
      // li's own text when there's no link.
      const label = topA ? topA.textContent.trim() : [...li.childNodes]
        .filter((n) => n.nodeType === Node.TEXT_NODE)
        .map((n) => n.textContent.trim())
        .filter(Boolean)
        .join(' ');

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'nav-mobile-toggle';
      btn.setAttribute('aria-expanded', 'false');
      btn.innerHTML = `<span>${label}</span>`;

      // recurse for the child level
      const childLis = [...catUl.children].filter((c) => c.tagName === 'LI');
      const sub = buildMobileList(childLis, level + 1);
      sub.classList.add('nav-mobile-sub');
      sub.hidden = true;
      const subId = `nav-mobile-sub-${(level)}-${Math.round(list.childElementCount)}-${label.replace(/\s+/g, '-').toLowerCase()}`;
      sub.id = subId;
      btn.setAttribute('aria-controls', subId);

      btn.addEventListener('click', () => {
        const open = btn.getAttribute('aria-expanded') === 'true';
        // single-open accordion (source behaviour): collapse any sibling that is
        // currently expanded at this same level before opening this one.
        if (!open) {
          [...list.children].forEach((sib) => {
            if (sib === item) return;
            const sibBtn = sib.querySelector(':scope > .nav-mobile-toggle');
            const sibSub = sib.querySelector(':scope > .nav-mobile-sub');
            if (sibBtn && sibBtn.getAttribute('aria-expanded') === 'true') {
              sibBtn.setAttribute('aria-expanded', 'false');
              if (sibSub) sibSub.hidden = true;
              sib.classList.remove('is-open');
            }
          });
        }
        btn.setAttribute('aria-expanded', open ? 'false' : 'true');
        sub.hidden = open;
        item.classList.toggle('is-open', !open);
      });
      item.append(btn, sub);
    } else if (topA) {
      const link = document.createElement('a');
      link.href = topA.getAttribute('href');
      link.textContent = topA.textContent.trim();
      item.append(link);
    }
    if (item.childElementCount) list.append(item);
  });

  return list;
}

// Build the mobile menu panel (accordion) + bottom tab bar from the nav fragment.
function buildMobileNav(section, wrapper) {
  const topUl = section.querySelector(':scope > ul');
  const logoImg = section.querySelector(':scope > p a img');

  // slide-in menu panel
  const panel = document.createElement('div');
  panel.className = 'nav-mobile-panel';
  panel.hidden = true;

  // panel title (source: "Navegue nas Seções:")
  const head = document.createElement('p');
  head.className = 'nav-mobile-head';
  head.textContent = 'Navegue nas Seções:';
  panel.append(head);

  // build the top-level accordion list, prefixed with the "Início" home entry
  const topLis = [...topUl.children].filter((li) => li.tagName === 'LI');
  const list = buildMobileList(topLis, 0);
  const homeLi = document.createElement('li');
  homeLi.innerHTML = '<a href="https://petrobras.com.br">Início</a>';
  list.prepend(homeLi);
  panel.append(list);

  // --- secondary bottom-bar panels (Idioma / Acessibilidade / Canais / Busca) ---
  // Each opens above the fixed bar like the main menu; only one panel is open at
  // a time. Content mirrors the source.

  // Idioma: "Selecione um idioma:" with Português / Inglês
  const langPanel = document.createElement('div');
  langPanel.className = 'nav-mobile-panel nav-mobile-panel-simple';
  langPanel.hidden = true;
  langPanel.innerHTML = `
    <p class="nav-mobile-head">Idioma:</p>
    <div class="nav-mobile-lang">
      <span class="nav-mobile-lang-globe">${MOBILE_ICONS.globe}</span>
      <p class="nav-mobile-lang-label">Selecione um idioma:</p>
      <div class="nav-mobile-lang-switch" role="radiogroup" aria-label="Selecione um idioma">
        <span class="nav-mobile-lang-slider" aria-hidden="true"></span>
        <button type="button" class="nav-mobile-lang-opt is-active" role="radio" aria-checked="true">Português</button>
        <button type="button" class="nav-mobile-lang-opt" role="radio" aria-checked="false">Inglês</button>
      </div>
    </div>`;
  // sliding pill toggle: the white slider sits behind the SELECTED option; the
  // other option shows on the green fill (source behaviour).
  const langSwitch = langPanel.querySelector('.nav-mobile-lang-switch');
  const langOpts = [...langPanel.querySelectorAll('.nav-mobile-lang-opt')];
  langOpts.forEach((b, i) => {
    b.addEventListener('click', () => {
      langOpts.forEach((x) => {
        x.classList.remove('is-active');
        x.setAttribute('aria-checked', 'false');
      });
      b.classList.add('is-active');
      b.setAttribute('aria-checked', 'true');
      langSwitch.classList.toggle('is-second', i === 1);
    });
  });

  // Acessibilidade: Alto-Contraste + Texto Grande — source uses card tiles with a
  // green icon circle, a label + on/off state, a vertical green divider, and a
  // pill toggle switch.
  const a11yPanel = document.createElement('div');
  a11yPanel.className = 'nav-mobile-panel nav-mobile-panel-simple';
  a11yPanel.hidden = true;
  a11yPanel.innerHTML = `
    <p class="nav-mobile-head">Acessibilidade</p>
    <div class="nav-mobile-a11y">
      <div class="nav-mobile-a11y-card">
        <div class="nav-mobile-a11y-info">
          <span class="nav-mobile-a11y-icon">${MOBILE_ICONS.contrast}</span>
          <span class="nav-mobile-a11y-name">Alto-Contraste</span>
          <span class="nav-mobile-a11y-state">Desligado</span>
        </div>
        <span class="nav-mobile-a11y-divider"></span>
        <label class="nav-mobile-switch">
          <input type="checkbox" class="nav-mobile-contrast-toggle" aria-label="Ativar Alto-Contraste">
          <span class="nav-mobile-switch-track"></span>
        </label>
      </div>
      <div class="nav-mobile-a11y-card">
        <div class="nav-mobile-a11y-info">
          <span class="nav-mobile-a11y-icon">${MOBILE_ICONS.bigtext}</span>
          <span class="nav-mobile-a11y-name">Texto Grande</span>
          <span class="nav-mobile-a11y-state">Desligado</span>
        </div>
        <span class="nav-mobile-a11y-divider"></span>
        <label class="nav-mobile-switch">
          <input type="checkbox" class="nav-mobile-bigtext-toggle" aria-label="Ativar Texto Grande">
          <span class="nav-mobile-switch-track"></span>
        </label>
      </div>
    </div>`;
  // reflect on/off in the state label ("Ligado" / "Desligado")
  const setState = (input) => {
    const state = input.closest('.nav-mobile-a11y-card').querySelector('.nav-mobile-a11y-state');
    state.textContent = input.checked ? 'Ligado' : 'Desligado';
  };
  // Alto-Contraste mirrors the utility-bar high-contrast toggle
  const contrastToggle = a11yPanel.querySelector('.nav-mobile-contrast-toggle');
  contrastToggle.addEventListener('change', (e) => {
    document.body.classList.toggle('high-contrast', e.target.checked);
    setState(e.target);
  });
  // Texto Grande zooms the page up (source "large text")
  const bigtextToggle = a11yPanel.querySelector('.nav-mobile-bigtext-toggle');
  bigtextToggle.addEventListener('change', (e) => {
    document.documentElement.style.zoom = e.target.checked ? 1.2 : 1;
    setState(e.target);
  });

  // Canais: "Escolha um Canal:" with channel card tiles (icon + label), 2-col grid
  const canaisPanel = document.createElement('div');
  canaisPanel.className = 'nav-mobile-panel nav-mobile-panel-simple';
  canaisPanel.hidden = true;
  // channel icons are the source's pre-rendered tiles (green circle + yellow
  // line-art baked in), served from petrobras.com.br to match exactly.
  canaisPanel.innerHTML = `
    <p class="nav-mobile-head">Escolha um Canal:</p>
    <ul class="nav-mobile-canais">
      <li><a href="https://transparencia.petrobras.com.br/">
        <span class="nav-mobile-canal-ico"><img src="https://petrobras.com.br/documents/2677942/0/transparencia/7a86c2a6-7ba5-0ac2-5ca4-c6e1401e83d1" alt="" width="64" height="64" loading="lazy"></span>
        <span class="nav-mobile-canal-label">Portal da Transparência</span>
      </a></li>
      <li><a href="https://www.investidorpetrobras.com.br/">
        <span class="nav-mobile-canal-ico"><img src="https://petrobras.com.br/documents/2677942/0/negocios/75396e66-bfc4-2ac5-f345-f5305e7194fb" alt="" width="64" height="64" loading="lazy"></span>
        <span class="nav-mobile-canal-label">Investidor Petrobras</span>
      </a></li>
      <li><a href="https://nossaenergia.petrobras.com.br/">
        <span class="nav-mobile-canal-ico"><img src="https://petrobras.com.br/documents/2677942/0/petrobras/964d9322-6efc-5fdf-ae3c-6401313af116" alt="" width="64" height="64" loading="lazy"></span>
        <span class="nav-mobile-canal-label">Nossa Energia</span>
      </a></li>
    </ul>`;

  // Busca: "Faça uma busca:" with a search field
  const buscaPanel = document.createElement('div');
  buscaPanel.className = 'nav-mobile-panel nav-mobile-panel-simple';
  buscaPanel.hidden = true;
  buscaPanel.innerHTML = `
    <p class="nav-mobile-head">Faça uma busca:</p>
    <form class="nav-mobile-busca" role="search">
      <input type="search" aria-label="Campo de pesquisa" placeholder="Buscar">
      <button type="submit" class="nav-mobile-busca-submit" aria-label="Buscar"></button>
    </form>`;
  buscaPanel.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const q = buscaPanel.querySelector('input').value.trim();
    if (q) window.location.assign(`https://petrobras.com.br/busca?q=${encodeURIComponent(q)}`);
  });

  // bottom tab bar
  const bar = document.createElement('div');
  bar.className = 'nav-mobile-bar';
  bar.innerHTML = `
    <button type="button" class="nav-mobile-btn" data-action="lang" aria-label="Idioma" aria-expanded="false">${MOBILE_ICONS.lang}<span class="nav-mobile-label">Idioma</span></button>
    <button type="button" class="nav-mobile-btn" data-action="a11y" aria-label="Acessibilidade" aria-expanded="false">${MOBILE_ICONS.a11y}<span class="nav-mobile-label">Acessibilidade</span></button>
    <button type="button" class="nav-mobile-btn nav-mobile-menu" data-action="menu" aria-label="Menu" aria-expanded="false">${MOBILE_ICONS.menu}${MOBILE_ICONS.close}</button>
    <button type="button" class="nav-mobile-btn" data-action="canais" aria-label="Canais" aria-expanded="false">${MOBILE_ICONS.canais}<span class="nav-mobile-label">Canais</span></button>
    <button type="button" class="nav-mobile-btn" data-action="busca" aria-label="Busca" aria-expanded="false">${MOBILE_ICONS.busca}<span class="nav-mobile-label">Busca</span></button>`;

  const menuBtn = bar.querySelector('.nav-mobile-menu');

  // map each bar button to its panel; only one open at a time
  const panelMap = [
    { btn: bar.querySelector('[data-action="lang"]'), panel: langPanel },
    { btn: bar.querySelector('[data-action="a11y"]'), panel: a11yPanel },
    { btn: menuBtn, panel },
    { btn: bar.querySelector('[data-action="canais"]'), panel: canaisPanel },
    { btn: bar.querySelector('[data-action="busca"]'), panel: buscaPanel },
  ];

  const closeAllPanels = (exceptPanel) => {
    panelMap.forEach(({ btn, panel: p }) => {
      if (p === exceptPanel) return;
      p.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      btn.classList.remove('is-open');
    });
  };

  panelMap.forEach(({ btn, panel: p }) => {
    btn.addEventListener('click', () => {
      const opening = p.hidden;
      closeAllPanels(opening ? p : null);
      p.hidden = !opening;
      btn.setAttribute('aria-expanded', opening ? 'true' : 'false');
      btn.classList.toggle('is-open', opening);
      if (btn === menuBtn) btn.setAttribute('aria-label', opening ? 'Fechar menu' : 'Menu');
      document.body.classList.toggle('nav-mobile-open', opening);
    });
  });

  wrapper.append(panel, langPanel, a11yPanel, canaisPanel, buscaPanel, bar);
  return {
    panel, bar, menuBtn, logoImg,
  };
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // fetch nav content: localhost / aem up first, then DA/EDS production
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) {
    const navMeta = document.querySelector('meta[name="nav"]');
    const navPath = navMeta ? new URL(navMeta.content, window.location).pathname : '/nav';
    resp = await fetch(`${navPath}.plain.html`);
  }
  if (!resp.ok) return;

  const html = await resp.text();
  const fragment = document.createElement('div');
  fragment.innerHTML = html;
  const sections = fragment.querySelectorAll(':scope > div');

  block.textContent = '';
  const wrapper = document.createElement('div');
  wrapper.className = 'nav-wrapper';

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main navigation');

  if (sections[0]) nav.append(buildUtilityBar(sections[0]));
  if (sections[1]) nav.append(buildMainNav(sections[1], nav));

  wrapper.append(nav);

  // overlay behind open megamenu (semi-transparent black, dismisses on click)
  const overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  overlay.addEventListener('click', () => closeAllMegamenus(nav));
  wrapper.append(overlay);

  // mobile menu panel + bottom tab bar (shown only below 992px via CSS)
  const mobile = sections[1] ? buildMobileNav(sections[1], wrapper) : null;

  block.append(wrapper);

  // Header theme: the source uses a white-text/transparent OVERLAY treatment only
  // when the page opens with a full-bleed DARK hero banner (e.g. the homepage);
  // on ordinary white-top pages (e.g. /bolivia, /novas-fronteiras) the header is
  // the LIGHT theme from the top (green nav links, dark utility text). We detect
  // the dark banner by looking for a `.hero` block (the default hero variant, NOT
  // `.hero.diagonal-split`) as the FIRST block of the page.
  //
  // The hero block may not exist in the DOM yet when the header decorates (block
  // load order isn't guaranteed), and if the header wrongly defaults to the light
  // theme the green nav links are invisible over the dark hero. So we detect it
  // synchronously if present, and otherwise observe `main` until the hero mounts.
  const isDarkHero = () => {
    const firstBlock = document.querySelector('main .hero, main [data-block-name="hero"]');
    return !!(firstBlock && !firstBlock.classList.contains('diagonal-split'));
  };
  const applyHeaderTheme = () => {
    wrapper.classList.toggle('has-hero-banner', isDarkHero());
  };
  applyHeaderTheme();
  if (!wrapper.classList.contains('has-hero-banner')) {
    // watch for the hero block appearing/decorating; stop once found or after
    // the DOM settles (whichever comes first).
    const mainEl = document.querySelector('main');
    if (mainEl && 'MutationObserver' in window) {
      const obs = new MutationObserver(() => {
        applyHeaderTheme();
        if (wrapper.classList.contains('has-hero-banner')) obs.disconnect();
      });
      obs.observe(mainEl, {
        childList: true, subtree: true, attributes: true, attributeFilter: ['class'],
      });
      // safety: stop observing after the page settles
      window.addEventListener('load', () => { applyHeaderTheme(); obs.disconnect(); });
    }
  }

  document.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') closeAllMegamenus(nav);
  });
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !overlay.contains(e.target)) closeAllMegamenus(nav);
  });

  // sticky compact-on-scroll: main nav fixes + shrinks (104 -> 56), utility bar hides
  let lastScroll = window.scrollY;
  const onScroll = () => {
    wrapper.classList.toggle('is-compact', window.scrollY > 50);
    // close any open megamenu when the user scrolls
    if (Math.abs(window.scrollY - lastScroll) > 10) closeAllMegamenus(nav);
    lastScroll = window.scrollY;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  isDesktop.addEventListener('change', () => {
    closeAllMegamenus(nav);
    // reset mobile menu when crossing to desktop
    if (mobile && isDesktop.matches) {
      mobile.panel.hidden = true;
      mobile.menuBtn.classList.remove('is-open');
      document.body.classList.remove('nav-mobile-open');
    }
  });
}
