/*
 * Tabs Block
 * A keyboard-accessible tabbed container with three visual variants (source parity
 * with petrobras.com.br). Each authored row is one tab: the FIRST cell is the tab
 * label (may include a leading icon image for the explorer variant), the SECOND
 * cell is that tab's panel content.
 *
 * Authoring content model (EDS table, one row per tab):
 *   | Tab label (text, optional leading image) | Panel content (rich text/media) |
 *   | Tab label 2                              | Panel content 2                 |
 * The first tab is selected by default. Rows missing a label are skipped; rows
 * missing a panel cell get an empty panel.
 *
 * Variants (2nd class on the block, e.g. "Tabs (content)"):
 *   - content     horizontal "folder" tabs; active tab reads as a page of the panel.
 *                 Source: petrobras.com.br/ouvidoria
 *   - categories  horizontal bar of green icon-over-label category pills switching
 *                 groups of cards. Source: petrobras.com.br/quem-somos/produtos
 *   - explorer    vertical list of icon + title tabs beside a rich panel; stacks
 *                 (panel above, scrollable tab strip below) on mobile.
 *                 Source: petrobras.com.br/sustentabilidade/biodiversidade
 *
 * NOTE (container-block-vs-section-style): panels here hold DEFAULT content
 * (headings, text, images, lists) authored inline — NOT nested EDS blocks, which
 * would not get decorated inside a block. If a project needs tabs whose panels are
 * real blocks (teasers/cards), model it as a section style instead.
 *
 * Content is moved node-by-node (never innerHTML), so no HTML sanitisation is
 * needed.
 */

let tabSeq = 0;

// Variant → whether the tab strip is oriented vertically (arrow key mapping).
function isVertical(block) {
  return block.classList.contains('explorer');
}

export default function decorate(block) {
  const variant = ['content', 'categories', 'explorer']
    .find((v) => block.classList.contains(v)) || 'content';
  tabSeq += 1;
  const uid = tabSeq;

  const rows = [...block.children];
  const tablist = document.createElement('div');
  tablist.className = 'tabs-tablist';
  tablist.setAttribute('role', 'tablist');
  tablist.setAttribute('aria-orientation', isVertical(block) ? 'vertical' : 'horizontal');

  const panels = document.createElement('div');
  panels.className = 'tabs-panels';

  const tabs = [];
  const tabPanels = [];

  rows.forEach((row) => {
    const cells = [...row.children];
    const labelCell = cells[0];
    if (!labelCell || !labelCell.textContent.trim()) return; // skip label-less rows

    const idx = tabs.length;
    const tabId = `tabs-${uid}-tab-${idx}`;
    const panelId = `tabs-${uid}-panel-${idx}`;

    // --- tab control -----------------------------------------------------
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'tabs-tab';
    tab.id = tabId;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panelId);
    tab.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
    tab.tabIndex = idx === 0 ? 0 : -1;

    // A leading image in the label cell becomes the tab's icon; remaining
    // text becomes the label. Move nodes so no markup is injected as a string.
    const icon = labelCell.querySelector('picture, img');
    if (icon) {
      const iconWrap = document.createElement('span');
      iconWrap.className = 'tabs-tab-icon';
      iconWrap.setAttribute('aria-hidden', 'true');
      iconWrap.append(icon.closest('picture') || icon);
      tab.append(iconWrap);
    }
    const label = document.createElement('span');
    label.className = 'tabs-tab-label';
    label.textContent = labelCell.textContent.trim();
    tab.append(label);

    // --- panel -----------------------------------------------------------
    const panel = document.createElement('div');
    panel.className = 'tabs-panel';
    panel.id = panelId;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tabId);
    panel.tabIndex = 0;
    if (idx !== 0) panel.hidden = true;
    const panelCell = cells[1];
    if (panelCell) panel.append(...panelCell.childNodes);
    // EDS may wrap sibling block elements (e.g. a grid of card divs) in a single
    // <p>. Unwrap that so the cards become direct children the panel can lay out.
    if (panel.children.length === 1) {
      const only = panel.firstElementChild;
      const hasBlockChildren = [...only.children]
        .some((c) => ['DIV', 'UL', 'OL', 'TABLE', 'ARTICLE', 'SECTION'].includes(c.tagName));
      const hasOwnText = [...only.childNodes]
        .some((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
      if (only.tagName === 'P' && hasBlockChildren && !hasOwnText) {
        only.replaceWith(...only.childNodes);
      }
    }

    tablist.append(tab);
    panels.append(panel);
    tabs.push(tab);
    tabPanels.push(panel);
    row.remove();
  });

  function select(index, focus = true) {
    tabs.forEach((tab, i) => {
      const selected = i === index;
      tab.setAttribute('aria-selected', selected ? 'true' : 'false');
      tab.tabIndex = selected ? 0 : -1;
      tabPanels[i].hidden = !selected;
      if (selected && focus) tab.focus();
    });
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i, false));
    tab.addEventListener('keydown', (e) => {
      const vertical = isVertical(block);
      const nextKey = vertical ? 'ArrowDown' : 'ArrowRight';
      const prevKey = vertical ? 'ArrowUp' : 'ArrowLeft';
      let target = null;
      if (e.key === nextKey) target = (i + 1) % tabs.length;
      else if (e.key === prevKey) target = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') target = 0;
      else if (e.key === 'End') target = tabs.length - 1;
      if (target !== null) {
        e.preventDefault();
        select(target);
      }
    });
  });

  block.textContent = '';
  if (variant === 'explorer') {
    // explorer places the panel first in the DOM so mobile can stack it above
    // the (horizontally scrollable) tab strip; CSS reorders on desktop.
    block.append(panels, tablist);
  } else {
    block.append(tablist, panels);
  }
}
