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
    <div class="nav-mobile-simple">
      <p class="nav-mobile-simple-label">Selecione um idioma:</p>
      <div class="nav-mobile-lang-opts">
        <button type="button" class="is-active">Português</button>
        <button type="button">Inglês</button>
      </div>
    </div>`;
  langPanel.querySelectorAll('.nav-mobile-lang-opts button').forEach((b) => {
    b.addEventListener('click', () => {
      langPanel.querySelectorAll('.nav-mobile-lang-opts button').forEach((x) => x.classList.remove('is-active'));
      b.classList.add('is-active');
    });
  });

  // Acessibilidade: Alto-Contraste + Texto Grande toggles
  const a11yPanel = document.createElement('div');
  a11yPanel.className = 'nav-mobile-panel nav-mobile-panel-simple';
  a11yPanel.hidden = true;
  a11yPanel.innerHTML = `
    <p class="nav-mobile-head">Acessibilidade</p>
    <div class="nav-mobile-simple">
      <label class="nav-mobile-a11y-row">
        <span class="nav-mobile-a11y-text">Alto-Contraste</span>
        <input type="checkbox" class="nav-mobile-contrast-toggle">
      </label>
      <label class="nav-mobile-a11y-row">
        <span class="nav-mobile-a11y-text">Texto Grande</span>
        <input type="checkbox" class="nav-mobile-bigtext-toggle">
      </label>
    </div>`;
  // Alto-Contraste mirrors the utility-bar high-contrast toggle
  a11yPanel.querySelector('.nav-mobile-contrast-toggle').addEventListener('change', (e) => {
    document.body.classList.toggle('high-contrast', e.target.checked);
  });
  // Texto Grande zooms the page up (source "large text")
  a11yPanel.querySelector('.nav-mobile-bigtext-toggle').addEventListener('change', (e) => {
    document.documentElement.style.zoom = e.target.checked ? 1.2 : 1;
  });

  // Canais: "Escolha um Canal:" with channel card tiles (icon + label), 2-col grid
  const canaisPanel = document.createElement('div');
  canaisPanel.className = 'nav-mobile-panel nav-mobile-panel-simple';
  canaisPanel.hidden = true;
  canaisPanel.innerHTML = `
    <p class="nav-mobile-head">Escolha um Canal:</p>
    <ul class="nav-mobile-canais">
      <li><a href="https://transparencia.petrobras.com.br/">
        <span class="nav-mobile-canal-ico nav-mobile-canal-ico-transp"></span>
        <span class="nav-mobile-canal-label">Portal da Transparência</span>
      </a></li>
      <li><a href="https://www.investidorpetrobras.com.br/">
        <span class="nav-mobile-canal-ico nav-mobile-canal-ico-invest"></span>
        <span class="nav-mobile-canal-label">Investidor Petrobras</span>
      </a></li>
      <li><a href="https://nossaenergia.petrobras.com.br/">
        <span class="nav-mobile-canal-ico nav-mobile-canal-ico-energia"></span>
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
    <button type="button" class="nav-mobile-btn" data-action="lang" aria-label="Idioma" aria-expanded="false"><span class="nav-mobile-ico nav-mobile-ico-lang"></span>Idioma</button>
    <button type="button" class="nav-mobile-btn" data-action="a11y" aria-label="Acessibilidade" aria-expanded="false"><span class="nav-mobile-ico nav-mobile-ico-a11y"></span>Acessibilidade</button>
    <button type="button" class="nav-mobile-btn nav-mobile-menu" data-action="menu" aria-label="Menu" aria-expanded="false"><span class="nav-mobile-ico nav-mobile-ico-menu"></span></button>
    <button type="button" class="nav-mobile-btn" data-action="canais" aria-label="Canais" aria-expanded="false"><span class="nav-mobile-ico nav-mobile-ico-canais"></span>Canais</button>
    <button type="button" class="nav-mobile-btn" data-action="busca" aria-label="Busca" aria-expanded="false"><span class="nav-mobile-ico nav-mobile-ico-busca"></span>Busca</button>`;

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
