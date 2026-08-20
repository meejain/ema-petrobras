import { readBlockConfig } from '../../scripts/aem.js';

/**
 * Spacer block — renders an empty box of a configurable height, responsive per
 * device. Authored as a 2-column config table:
 *   | Desktop | 200px |
 *   | Tablet  | 160px |   (optional; falls back to Mobile)
 *   | Mobile  | 120px |
 *
 * Used on the block-sample pages to push content clear of the fixed header
 * (replacing the old placeholder hero) and to add breathing room around a
 * sample. Height is applied inline from the matching breakpoint and kept in
 * sync on resize. Breakpoints follow the project set (1280 / 992).
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const blockCfg = readBlockConfig(block);
  block.textContent = '';

  const applyHeight = () => {
    const w = window.innerWidth;
    let height;
    if (w >= 1280) {
      height = blockCfg.desktop;
    } else if (w >= 992) {
      height = blockCfg.tablet || blockCfg.mobile;
    } else {
      height = blockCfg.mobile;
    }
    if (height) block.style.height = height;
  };

  applyHeight();
  window.addEventListener('resize', applyHeight, { passive: true });
}
