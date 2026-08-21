/*
 * Build the cards-product block-sample page.
 *
 * The `product` cards variant is the white vertical product card grid on a
 * green page band from petrobras.com.br/transicao-energetica (the
 * "combustíveis mais sustentáveis" section: CAP Pro / Diesel R / SAF /
 * Biobunker). Each card is a full-width photo on top (rounded top corners),
 * then a dark bold title, a yellow accent bar, a description, and a green
 * underlined link.
 *
 * The base cards block already splits a picture cell into `.cards-card-image`
 * and the rest into `.cards-card-body`; the `product` styling is pure CSS, so
 * each authored row is just: [ picture cell ][ heading + description + link ].
 *
 * Idempotent: re-running overwrites the sample.
 *
 * Run: node tools/samples/build-cards-product-sample.mjs
 */
import { writeFile } from 'node:fs/promises';

const OUT = 'content/drafts/block-samples/cards-product.plain.html';

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

// one product card: [ picture cell ][ heading + description + link ]
const card = (src, alt, title, desc, linkLabel, href) => `    <div>
      <div><picture><img src="${src}" alt="${alt}"></picture></div>
      <div><h3>${title}</h3><p>${desc}</p><p><a href="${href}">${linkLabel}</a></p></div>
    </div>`;

// Image URLs are the EXACT source card photos captured from the live
// /transicao-energetica "combustíveis mais sustentáveis" section (all 200 PNG).
const block = `  <div class="cards product">
${card('https://petrobras.com.br/documents/2677942/35679554/cap-pro-petrobras-transicao-energetica.png/92232c04-b797-daf3-9fd0-60ae4f0dd9ac?version=2.0&t=1753121046000', 'Foto aérea de uma estrada cortando um bosque.', 'CAP Pro', 'Novo asfalto que possibilita a redução de 65% das emissões estimadas na instalação.', 'Conheça o CAP Pro', '/quem-somos/cap-pro')}
${card('https://petrobras.com.br/documents/2677942/35679554/diesel-r-petrobras-transicao-energetica.png/baa81abd-b599-c740-8236-0028f1ad55a8?version=2.0&t=1753121053000', 'Mão de funcionário da Petrobras, vestindo luva, exibe um frasco com diesel R.', 'Diesel R', 'Sua parcela renovável emite até 90% menos gases de efeito estufa.', 'Conheça o Diesel R', '/quem-somos/diesel-r5')}
${card('https://petrobras.com.br/documents/2677942/35679554/bioqav-petrobras-transicao-energetica.png/d12feeef-4394-9044-c452-33ac09ba8140?version=1.0&t=1749823665000', 'Imagem de um avião em pleno vôo, visto em diagonal.', 'SAF', 'Combustível sustentável de aviação já produzido por coprocessamento na REDUC e REVAP.', 'Conheça o SAF', '/quem-somos/querosene-de-aviacao')}
${card('https://petrobras.com.br/documents/2677942/35679554/bunker-petrobras-transicao-energetica.png/83d62c33-9a66-8c79-41ac-9333478b51ee?version=1.0&t=1749823666000', 'Imagem de um navio cargueiro, visto em diagonal.', 'Biobunker', 'O VLS B24 é o óleo combustível marítimo da Petrobras com conteúdo renovável.', 'Conheça o Biobunker VLS B24', '/quem-somos/bunker')}
  </div>`;

// The whole card section sits on a full-bleed dark-green band (source: #00552a)
// with a white section heading + yellow accent bar and a trailing note — applied
// via Section Metadata (style=green). The demo heading/description stays in its
// own (non-green) intro section above.
const sectionMeta = (style) => `  <div class="section-metadata">
    <div><div>style</div><div>${style}</div></div>
  </div>`;

const page = `<div>
${TOP}
</div>
<div>
  <h1>Cards (product)</h1>
  <p>Product variant: white vertical cards with a full-width photo on top (rounded top corners), a dark bold title, a yellow accent bar, a description, and a green underlined link, all on a dark-green section band. One column on mobile, two at tablet, four from desktop. Source: petrobras.com.br/transicao-energetica ("combustíveis mais sustentáveis").</p>
</div>
<div>
  <h3>Estamos produzindo combustíveis mais sustentáveis para contribuir com a transição energética</h3>
${block}
  <p>Em 2022, biocombustíveis representavam 23% da demanda de energia no setor de transporte nacional. Investimentos em produtos de baixo carbono e carbono neutro permitem expansão desse segmento.</p>
${sectionMeta('green')}
</div>
`;

await writeFile(OUT, page);
process.stdout.write(`wrote ${OUT} (${page.length} bytes)\n`);
