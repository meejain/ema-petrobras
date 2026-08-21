/**
 * Table block.
 *
 * Builds a semantic <table> (thead/tbody) from the authored rows of cells.
 * The first authored row becomes the header (<th scope="col">); the rest
 * become body rows (<td>). Two visual variants, selected by a 2nd class:
 *   - table (specifications)  -> default: bordered product/spec grid
 *   - table (downloads)       -> row-label table whose link cells become
 *                                green document-download links
 *
 * Ragged rows are handled gracefully: a body row with a single cell in a
 * multi-column table is spanned across all columns (useful for sub-headings).
 *
 * @param {Element} block The block element
 */

// Small inline document glyph reused for every download link (no network,
// no external icon file). Uses currentColor so it inherits the link colour.
const DOC_ICON = '<svg class="table-download-icon" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm0 2 4 4h-4V4ZM8 13h8v2H8v-2Zm0 4h8v2H8v-2Zm0-8h3v2H8V9Z"/></svg>';

export default function decorate(block) {
  const isDownloads = block.classList.contains('downloads');
  const rows = [...block.children];
  if (!rows.length) return;

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  // Column count is defined by the first (header) row.
  const columnCount = rows[0] ? rows[0].children.length : 0;

  rows.forEach((row, rowIndex) => {
    const isHeaderRow = rowIndex === 0;
    const tr = document.createElement('tr');
    const cells = [...row.children];

    cells.forEach((cell) => {
      const el = document.createElement(isHeaderRow ? 'th' : 'td');
      if (isHeaderRow) el.setAttribute('scope', 'col');
      // Move authored content verbatim (already-safe, backend-delivered nodes).
      while (cell.firstChild) el.append(cell.firstChild);

      // Ragged row: a lone cell in a multi-column table spans the full width.
      if (!isHeaderRow && cells.length === 1 && columnCount > 1) {
        el.colSpan = columnCount;
      }

      tr.append(el);
    });

    (isHeaderRow ? thead : tbody).append(tr);
  });

  table.append(thead, tbody);

  // Downloads variant: a link that is the sole content of its paragraph/cell
  // (a document download) becomes a green download link with an icon. Links
  // sitting inline alongside text are left as plain links (matches source).
  if (isDownloads) {
    tbody.querySelectorAll('a').forEach((link) => {
      const parent = link.parentElement;
      const alone = parent
        && parent.children.length === 1
        && parent.textContent.trim() === link.textContent.trim();
      if (!alone) return;
      link.classList.add('table-download-link');
      link.insertAdjacentHTML('afterbegin', DOC_ICON);
    });
  }

  // Wrap in a horizontal-scroll container so a wide table never forces the
  // whole page to scroll sideways (matches the source's contained tables).
  const scroll = document.createElement('div');
  scroll.className = 'table-scroll';
  scroll.append(table);

  block.textContent = '';
  block.append(scroll);
}
