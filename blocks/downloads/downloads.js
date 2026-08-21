/*
 * Downloads Block — "downloads (list)" variant.
 * A list of downloadable documents. Each authored row is one document:
 *   - a cell containing a single link  -> the document (link text = title,
 *     href = the file)
 *   - an optional LEADING cell         -> a small descriptive / file label
 *     shown above the download affordance
 * Rows missing a link are dropped; a lone label with no link is ignored.
 *
 * Source parity: petrobras.com.br/bolivia — a 24px green download glyph + a
 * bold green underlined link, 12px gap, 5px/4px row padding, no dividers, with
 * an optional 14px descriptive label above.
 *
 * Behaviour: PDF / `download=true` document links open in a new tab and are
 * hinted as downloads; other links open in a new tab with a safe rel.
 */

// Phosphor-style "download" glyph (matches the source download-green icon).
// fill=currentColor so the block CSS controls the colour.
const DOWNLOAD_ICON = '<svg class="downloads-icon" aria-hidden="true" focusable="false" width="24" height="24" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M222 152v56a14 14 0 0 1-14 14H48a14 14 0 0 1-14-14v-56a6 6 0 0 1 12 0v56a2 2 0 0 0 2 2h160a2 2 0 0 0 2-2v-56a6 6 0 0 1 12 0Zm-98.24 4.24a6 6 0 0 0 8.48 0l40-40a6 6 0 0 0-8.48-8.48L134 137.51V40a6 6 0 0 0-12 0v97.51l-29.76-29.75a6 6 0 0 0-8.48 8.48Z"/></svg>';

// Treat a link as a downloadable document when it targets a file / download.
function isDocumentHref(href) {
  return /\.(pdf|docx?|xlsx?|pptx?|zip|csv|txt)(\?|$)/i.test(href)
    || /[?&]download=true\b/i.test(href);
}

export default function decorate(block) {
  const list = document.createElement('ul');
  list.className = 'downloads-list';

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const link = row.querySelector('a[href]');
    // Handle authors omitting cells gracefully: a row without a link is dropped.
    if (!link) {
      row.remove();
      return;
    }

    // The document link lives in one cell; a different, non-empty cell is an
    // optional descriptive label shown above the affordance.
    const linkCell = link.closest('div');
    const labelCell = cells.find((c) => c !== linkCell && c.textContent.trim());
    const labelText = labelCell ? labelCell.textContent.trim() : '';

    const item = document.createElement('li');
    item.className = 'downloads-item';

    if (labelText) {
      const label = document.createElement('span');
      label.className = 'downloads-label';
      label.textContent = labelText;
      item.append(label);
      item.classList.add('downloads-item-labelled');
    }

    // affordance row: icon + document link
    const affordance = document.createElement('div');
    affordance.className = 'downloads-affordance';
    affordance.insertAdjacentHTML('beforeend', DOWNLOAD_ICON);

    const anchor = document.createElement('a');
    anchor.className = 'downloads-link';
    anchor.href = link.getAttribute('href');
    const title = link.textContent.trim();
    if (title) anchor.textContent = title;
    else anchor.append(...link.childNodes);
    anchor.setAttribute('target', '_blank');
    anchor.setAttribute('rel', 'noopener noreferrer');
    if (isDocumentHref(anchor.getAttribute('href'))) anchor.setAttribute('download', '');

    affordance.append(anchor);
    item.append(affordance);
    list.append(item);
  });

  block.replaceChildren(list);
}
