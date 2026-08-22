/*
 * Build the cards-variants block-sample pages.
 *
 * Writes TWO standalone sample pages — one per new cards variant — following
 * the standard block-sample layout (top-clearance spacer, heading + one-line
 * description, gap spacers around the demonstrated block):
 *   - content/drafts/block-samples/cards-overlay.plain.html
 *   - content/drafts/block-samples/cards-audio.plain.html
 *
 * The base cards block turns each authored row into an <li>; a cell holding a
 * single picture becomes `.cards-card-image`, any other cell `.cards-card-body`.
 * The variant is the 2nd class on `.cards`:
 *   - overlay: full-bleed image navigation tiles with the heading overlaid and
 *              the whole tile linking out. Author each card as: a picture cell
 *              and a body cell holding a heading + a link (the link becomes the
 *              stretched whole-tile overlay). Source: the Sustentabilidade
 *              "Você pode se interessar por" tiles.
 *   - audio:   species cards with a megaphone icon, a name, an italic
 *              scientific name + description, and a functional audio player
 *              built from an authored mp3 link. Author each card as: a
 *              megaphone picture cell and a body cell holding a heading, a
 *              paragraph (italic sci-name + description) and a link to the mp3.
 *              Source: the Biodiversidade "Ouça os sons" cards.
 *
 * Does NOT touch the existing cards-*.plain.html samples.
 * Idempotent: re-running overwrites the two sample pages.
 *
 * Run: node tools/samples/build-cards-variants-sample.mjs
 */
import { writeFile } from 'node:fs/promises';

const OUT_OVERLAY = 'content/drafts/block-samples/cards-overlay.plain.html';
const OUT_AUDIO = 'content/drafts/block-samples/cards-audio.plain.html';

// spacer authored as a readBlockConfig table (label | value per device)
const spacer = (desktop, tablet, mobile) => {
  const rows = [
    ['Desktop', desktop],
    ...(tablet ? [['Tablet', tablet]] : []),
    ['Mobile', mobile],
  ];
  const cells = rows.map(([k, v]) => `    <div><div>${k}</div><div>${v}</div></div>`).join('\n');
  return `  <div class="spacer">\n${cells}\n  </div>`;
};

const TOP = spacer('180px', '170px', '96px'); // clear the fixed header
const GAP = spacer('48px', null, '40px'); // breathing room around the sample

// --- overlay: one navigation tile (picture cell + heading/link body) --------
const tile = (src, alt, title, href) => `    <div>
      <div><picture><img src="${src}" alt="${alt}"></picture></div>
      <div><h3>${title}</h3><p><a href="${href}">${title}</a></p></div>
    </div>`;

const overlayBlock = `  <div class="cards overlay">
${tile('https://petrobras.com.br/documents/2677942/35679554/petrobras-tej.jpeg/eff7ed28-7f1f-9038-9dea-2184d7a280f7?version=1.0&t=1751658905000', 'Campo de cana-de-açúcar ao pôr do sol com uma refinaria ao fundo, simbolizando a produção de biocombustíveis.', 'Transição Energética Justa', '/transicao-energetica')}
${tile('https://petrobras.com.br/documents/2677942/41758384/operacoes-bolivia.jpg/9ff552b8-9bdf-cd1f-7207-d873571428fc?version=1.0&t=1760710441000', 'Plataforma de petróleo da Petrobras em alto-mar.', 'Quem somos', '/quem-somos')}
${tile('https://petrobras.com.br/documents/2677942/5913300/PreSal.webp/a1c46b87-7714-70d3-3300-884f51c55cc7?version=3.0&t=1696279670000', 'Operação de exploração do pré-sal em alto-mar.', 'Pré-sal', '/pre-sal')}
${tile('https://petrobras.com.br/documents/2677942/35679554/bioqav-petrobras-transicao-energetica.png/d12feeef-4394-9044-c452-33ac09ba8140?version=1.0&t=1749823665000', 'Pesquisadores em um laboratório de inovação e tecnologia da Petrobras.', 'Inovação e Tecnologia', '/inovacao-e-tecnologia')}
  </div>`;

// --- audio: one species card (megaphone cell + name/desc/mp3 body) ----------
const MEGA = 'https://petrobras.com.br/documents/2677942/2678183/icone-autofalante.jpg/386ef372-d066-5c16-959f-4f31ec75b5ca?version=1.0&t=1759847114000';
const audioCard = (name, sci, desc, mp3) => `    <div>
      <div><picture><img src="${MEGA}" alt="Ícone de megafone"></picture></div>
      <div><h4>${name}</h4><p><em>${sci}</em> ${desc}</p><p><a href="${mp3}">Ouça o som de ${name}</a></p></div>
    </div>`;

const audioBlock = `  <div class="cards audio">
${audioCard('Golfinho rotador', 'Stenella longirostris', 'Ouça os assovios do golfinho rotador.', 'https://petrobras.com.br/documents/2677942/0/Sons_rotadoresFN_assovios(1).mp3/bee8edb8-8da9-c101-d129-310c8442c57b')}
${audioCard('Maçarico-do-bico-torto', 'Numenius hudsonicus', 'Ouça o canto do maçarico-do-bico-torto.', 'https://petrobras.com.br/documents/2677942/0/Ma%C3%A7arico-do-bico-torto(Numenius%20hudsonicus)%20PAM_BA.mp3/d0de2a53-188a-06da-1052-7bfcca9ac2fe')}
${audioCard('Baleia jubarte', 'Megaptera novaeangliae', 'Ouça os sons das baleias jubartes.', 'https://petrobras.com.br/documents/2677942/0/Som_baleia-jubarte%20mp3.mp3/83fc7a50-02dd-9252-194a-e69c66362355')}
${audioCard('Peixe-boi-marinho', 'Trichechus manatus', 'Ouça os filhotes de peixe-boi-marinho.', 'https://petrobras.com.br/documents/2677942/0/OceanarioFilhotesCPB_TM4A.mp3/744db47c-87c5-644f-c43e-792d35841600')}
${audioCard('Piru-piru', 'Haematopus palliatus', 'Ouça o canto do piru-piru.', 'https://petrobras.com.br/documents/2677942/0/Piru-piru%20(Haematopus%20palliatus)%20PAM_BA.mp3/6c5577f7-e376-aa91-f8ee-7b590450cb25')}
${audioCard('Sagui-caveirinha', 'Callithrix aurita', 'Ouça o som do sagui-caveirinha.', 'https://petrobras.com.br/documents/2677942/0/Sons%20do%20Callithrix%20aurita-audio.mp3/bd6f4e73-6fd7-f6d8-9f47-a41841bbcf1f')}
  </div>`;

const overlayPage = `<div>
${TOP}
</div>
<div>
  <h1>Cards (overlay)</h1>
  <p>Overlay variant: full-bleed image navigation tiles with a brand-tint scrim and a white heading overlaid at the bottom-left; the whole tile is a link. One column on mobile, two at tablet, four from desktop. Source: the Sustentabilidade "Você pode se interessar por" tiles.</p>
${GAP}
${overlayBlock}
${GAP}
</div>
`;

const audioPage = `<div>
${TOP}
</div>
<div>
  <h1>Cards (audio)</h1>
  <p>Audio variant: species cards with a megaphone icon, a name, an italic scientific name and description, and a functional, accessible audio player (play/pause, seek, time) built from an authored mp3 link. One column on mobile, two at tablet, three from desktop. Source: the Biodiversidade "Ouça os sons" cards.</p>
${GAP}
${audioBlock}
${GAP}
</div>
`;

await writeFile(OUT_OVERLAY, overlayPage);
process.stdout.write(`wrote ${OUT_OVERLAY} (${overlayPage.length} bytes)\n`);
await writeFile(OUT_AUDIO, audioPage);
process.stdout.write(`wrote ${OUT_AUDIO} (${audioPage.length} bytes)\n`);
