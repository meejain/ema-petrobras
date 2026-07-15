// Delayed third-party widgets — loaded after LCP (see scripts.js loadDelayed).

const VLIBRAS_APP = 'https://vlibras.gov.br/app';

/**
 * Pin VLibras to the right edge, vertically centered (matches petrobras.com.br).
 * @param {HTMLElement} element
 */
function fixVLibrasPosition(element) {
  element.style.setProperty('left', 'initial', 'important');
  element.style.setProperty('right', '0', 'important');
  element.style.setProperty('bottom', 'initial', 'important');
  element.style.setProperty('transform', 'translateY(calc(-50% - 10px))', 'important');
  element.style.setProperty(
    'top',
    window.innerWidth <= 768 ? '40%' : '50%',
    'important',
  );
}

/**
 * VLibras registers its init on window.onload. When this file loads after
 * the load event (3s delay), we must invoke that handler manually.
 */
function initVLibrasWidget() {
  // eslint-disable-next-line no-new
  new window.VLibras.Widget(VLIBRAS_APP);
  if (document.readyState === 'complete' && typeof window.onload === 'function') {
    window.onload(new Event('load'));
  }
}

/**
 * VLibras — Brazilian Sign Language (Libras) accessibility widget.
 */
function loadVLibras() {
  if (document.querySelector('[vw]')) return;

  const container = document.createElement('div');
  container.setAttribute('vw', '');
  container.className = 'enabled';
  container.innerHTML = `
    <div vw-access-button class="active"></div>
    <div vw-plugin-wrapper>
      <div class="vw-plugin-top-wrapper"></div>
    </div>`;
  document.body.append(container);
  fixVLibrasPosition(container);
  window.addEventListener('resize', () => fixVLibrasPosition(container));

  const script = document.createElement('script');
  script.src = `${VLIBRAS_APP}/vlibras-plugin.js`;
  script.crossOrigin = 'anonymous';
  script.onload = () => {
    if (window.VLibras) {
      initVLibrasWidget();
      fixVLibrasPosition(container);
    }
  };
  document.body.append(script);
}

loadVLibras();
