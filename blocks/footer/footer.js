// Petrobras footer: light-grey top band (logo + social + search + contact),
// white link columns, and a legal bar. Content comes from content/footer.plain.html.

function buildTopBand(section) {
  const band = document.createElement('div');
  band.className = 'footer-top-band';
  const inner = document.createElement('div');
  inner.className = 'footer-top-inner';

  // brand + social (first <p> = logo, first <ul> = social icons)
  const brand = document.createElement('div');
  brand.className = 'footer-brand';
  const logoP = section.querySelector(':scope > p');
  if (logoP) brand.append(logoP.cloneNode(true));
  const socialUl = section.querySelector(':scope > ul');
  if (socialUl) {
    const social = socialUl.cloneNode(true);
    social.className = 'footer-social';
    brand.append(social);
  }
  inner.append(brand);

  // search column: "Utilize nossa busca..." + a search form built here
  const paras = [...section.querySelectorAll(':scope > p')];
  const searchLabel = paras.find((p) => /Utilize nossa busca/i.test(p.textContent));
  const searchCol = document.createElement('div');
  searchCol.className = 'footer-search-col';
  if (searchLabel) {
    const label = document.createElement('p');
    label.className = 'footer-search-label';
    label.textContent = searchLabel.textContent.trim();
    searchCol.append(label);
  }
  const form = document.createElement('form');
  form.className = 'footer-search-form';
  form.setAttribute('role', 'search');
  form.innerHTML = '<input type="search" aria-label="Campo de pesquisa" placeholder="O que você está procurando?"><button type="submit" class="footer-search-submit" aria-label="Buscar"></button>';
  searchCol.append(form);
  inner.append(searchCol);

  // contact column: SAC + Acesso à Informação (icon + text pairs)
  const contact = document.createElement('div');
  contact.className = 'footer-contact';
  const sacImg = paras.find((p) => p.querySelector('img[alt*="SAC"]'));
  const sacTitle = paras.find((p) => p.textContent.trim() === 'SAC Petrobras');
  const sacPhone = paras.find((p) => /0800/.test(p.textContent));
  if (sacImg) {
    const item = document.createElement('div');
    item.className = 'footer-contact-item';
    item.append(sacImg.querySelector('img').cloneNode(true));
    const body = document.createElement('div');
    body.innerHTML = `<p>${sacTitle ? sacTitle.textContent.trim() : ''}</p><p><strong>${sacPhone ? sacPhone.textContent.trim() : ''}</strong></p>`;
    item.append(body);
    contact.append(item);
  }
  const infoImg = paras.find((p) => p.querySelector('img[alt*="informação"]'));
  const infoTitle = paras.find((p) => p.textContent.trim() === 'Acesso à Informação');
  const infoLinkP = paras.find((p) => p.querySelector('a[href*="transparencia"]'));
  if (infoImg) {
    const item = document.createElement('div');
    item.className = 'footer-contact-item';
    item.append(infoImg.querySelector('img').cloneNode(true));
    const body = document.createElement('div');
    body.innerHTML = `<p>${infoTitle ? infoTitle.textContent.trim() : ''}</p>`;
    const link = infoLinkP ? infoLinkP.querySelector('a') : null;
    if (link) {
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      a.textContent = link.textContent.trim();
      body.append(a);
    }
    item.append(body);
    contact.append(item);
  }
  inner.append(contact);

  band.append(inner);
  return band;
}

function buildColumns(section) {
  const wrap = document.createElement('div');
  wrap.className = 'footer-columns';
  const inner = document.createElement('div');
  inner.className = 'footer-columns-inner';

  const topUl = section.querySelector(':scope > ul');
  [...topUl.children].filter((li) => li.tagName === 'LI').forEach((li) => {
    const col = document.createElement('div');
    col.className = 'footer-column';
    const heading = document.createElement('button');
    heading.type = 'button';
    heading.className = 'footer-column-title';
    heading.setAttribute('aria-expanded', 'false');
    heading.textContent = [...li.childNodes]
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent.trim())
      .filter(Boolean)
      .join(' ');
    col.append(heading);
    const sub = li.querySelector(':scope > ul');
    if (sub) {
      const list = document.createElement('ul');
      [...sub.querySelectorAll(':scope > li > a')].forEach((a) => {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = a.getAttribute('href');
        link.textContent = a.textContent.trim();
        item.append(link);
        list.append(item);
      });
      col.append(list);
      heading.addEventListener('click', () => {
        const open = heading.getAttribute('aria-expanded') === 'true';
        heading.setAttribute('aria-expanded', String(!open));
        col.classList.toggle('is-open', !open);
      });
    }
    inner.append(col);
  });

  wrap.append(inner);
  return wrap;
}

function buildLegal(section) {
  const bar = document.createElement('div');
  bar.className = 'footer-legal';
  const inner = document.createElement('div');
  inner.className = 'footer-legal-inner';

  const links = document.createElement('div');
  links.className = 'footer-legal-links';
  const legalUl = section.querySelector(':scope > ul');
  if (legalUl) {
    [...legalUl.querySelectorAll(':scope > li > a')].forEach((a) => {
      const link = document.createElement('a');
      link.href = a.getAttribute('href');
      link.textContent = a.textContent.trim();
      links.append(link);
    });
  }
  inner.append(links);

  const copyP = section.querySelector(':scope > p');
  if (copyP) {
    const copy = document.createElement('p');
    copy.className = 'footer-copyright';
    copy.textContent = copyP.textContent.trim();
    inner.append(copy);
  }

  bar.append(inner);
  return bar;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // fetch footer content: localhost / aem up first, then DA/EDS production
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) {
    const footerMeta = document.querySelector('meta[name="footer"]');
    const footerPath = footerMeta ? new URL(footerMeta.content, window.location).pathname : '/footer';
    resp = await fetch(`${footerPath}.plain.html`);
  }
  if (!resp.ok) return;

  const html = await resp.text();
  const fragment = document.createElement('div');
  fragment.innerHTML = html;
  const sections = fragment.querySelectorAll(':scope > div');

  block.textContent = '';
  const footer = document.createElement('div');
  footer.className = 'footer-inner';

  if (sections[0]) footer.append(buildTopBand(sections[0]));
  if (sections[1]) footer.append(buildColumns(sections[1]));
  if (sections[2]) footer.append(buildLegal(sections[2]));

  block.append(footer);
}
