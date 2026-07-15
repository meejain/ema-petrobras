// add delayed functionality here

// VLibras — Brazilian Sign Language (Libras) accessibility widget.
// Loaded in the delayed phase so it never competes with LCP.
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

  const script = document.createElement('script');
  script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
  script.onload = () => {
    if (window.VLibras) {
      // eslint-disable-next-line no-new
      new window.VLibras.Widget('https://vlibras.gov.br/app');
    }
  };
  document.body.append(script);
}

loadVLibras();
