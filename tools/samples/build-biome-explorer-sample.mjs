/*
 * Build the biome-explorer block-sample page.
 *
 * Demonstrates both biome-explorer variants (map + overlay), each with its own
 * heading, wrapped in the standard block-sample layout: a top-clearance spacer,
 * then per-block a heading + description, a gap spacer, the block, and a
 * trailing gap spacer.
 *
 * Content model — one authored row per biome:
 *   name | coords "x% y%" | banner image | content (heading + text + gallery)
 * Plus, for the map variant, a leading row "map | <background image>".
 * Variants are the 2nd class on the block (map / overlay).
 *
 * Idempotent: re-running overwrites the sample.
 *
 * Run: node tools/samples/build-biome-explorer-sample.mjs
 */
import { writeFile } from 'node:fs/promises';

const OUT = 'content/drafts/block-samples/biome-explorer.plain.html';

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
const GAP = spacer('48px', null, '40px'); // breathing room around each sample

const MAP_IMG = 'https://webserver-petrobrasecossistemaint-prod1.lfr.cloud/documents/2677942/40606012/map.jpg';
// Representative Petrobras fauna imagery for banners / galleries.
const IMG = {
  amazonia: 'https://petrobras.com.br/documents/2677942/5913300/PreSal.webp/a1c46b87-7714-70d3-3300-884f51c55cc7?version=3.0&t=1696279670000',
  mangue: 'https://petrobras.com.br/documents/2677942/8353462/image+%281%29.webp/8d206f76-d4a0-78d0-a3bf-0b5291b021eb?version=1.0&t=1696278319000',
  fauna: 'https://petrobras.com.br/documents/2677942/8353462/image+%283%29.webp/15f8fa71-5ae9-657c-b36f-d6768733b2d7?version=1.0&t=1696278376000',
};

const pic = (src, alt) => `<picture><img src="${src}" alt="${alt}" loading="lazy"></picture>`;

// A biome content cell: heading + paragraphs + optional gallery of images.
const content = (heading, paras, gallery) => {
  const p = paras.map((t) => `<p>${t}</p>`).join('\n        ');
  const g = gallery && gallery.length
    ? `\n        <ul>\n${gallery.map((it) => `          <li>${pic(it.src, it.alt)}${it.caption ? `<p>${it.caption}</p>` : ''}</li>`).join('\n')}\n        </ul>`
    : '';
  return `<h3>${heading}</h3>\n        ${p}${g}`;
};

// One biome row: name | coords | banner | content
const biome = (name, coords, banner, contentHtml) => `    <div>
      <div>${name}</div>
      <div>${coords}</div>
      <div>${banner ? pic(banner, `Paisagem — ${name}`) : ''}</div>
      <div>${contentHtml}</div>
    </div>`;

// Shared biome data (coords measured from the source map, % of 1296x690).
const BIOMES = [
  ['Amazônia', '29% 19%', IMG.amazonia, content(
    'Biodiversidade na Amazônia',
    ['É quase impossível falar da biodiversidade brasileira sem destacar a Amazônia, a maior floresta tropical do planeta e um dos maiores reservatórios de vida da Terra.',
      'Atuamos com critérios rigorosos de sustentabilidade e proteção ambiental nas regiões onde operamos.'],
    [
      { src: IMG.fauna, alt: 'Macaco-aranha-da-cara-preta', caption: 'Macaco-aranha-da-cara-preta' },
      { src: IMG.mangue, alt: 'Sucuri-verde', caption: 'Sucuri-verde' },
    ],
  )],
  ['Caatinga', '64% 29%', IMG.mangue, content(
    'Biodiversidade na Caatinga',
    ['Único bioma exclusivamente brasileiro, a Caatinga abriga espécies adaptadas ao clima semiárido e a uma notável resiliência ambiental.'],
    [{ src: IMG.fauna, alt: 'Fauna da Caatinga', caption: 'Fauna da Caatinga' }],
  )],
  ['Cerrado', '54% 51%', IMG.amazonia, content(
    'Biodiversidade no Cerrado',
    ['A savana mais biodiversa do mundo, o Cerrado é berço das águas de importantes bacias hidrográficas brasileiras.'],
    null,
  )],
  ['Mata Atlântica', '63% 63%', IMG.mangue, content(
    'Biodiversidade na Mata Atlântica',
    ['Um dos biomas mais ameaçados e, ao mesmo tempo, mais ricos em espécies endêmicas do país.'],
    [{ src: IMG.mangue, alt: 'Manguezal da Mata Atlântica', caption: 'Manguezal' }],
  )],
  ['Pantanal', '39% 47%', IMG.fauna, content(
    'Biodiversidade no Pantanal',
    ['A maior planície alagável do planeta, com ciclos de cheia e seca que sustentam uma vida animal exuberante.'],
    null,
  )],
  ['Pampa', '54% 82%', IMG.amazonia, content(
    'Biodiversidade no Pampa',
    ['Campos nativos do extremo sul do Brasil, com grande diversidade de gramíneas, aves e mamíferos.'],
    null,
  )],
  ['Recifes de Coral', '65% 9%', IMG.mangue, content(
    'Ecossistemas marinhos e costeiros',
    ['Recifes de coral e ecossistemas costeiros abrigam parte significativa da vida marinha brasileira.'],
    [{ src: IMG.fauna, alt: 'Vida marinha nos recifes', caption: 'Vida marinha' }],
  )],
];

const mapRow = `    <div>
      <div>map</div>
      <div>${pic(MAP_IMG, 'Mapa do Brasil com os biomas e ecossistemas costeiros')}</div>
    </div>`;

const biomeRows = BIOMES.map(([n, c, b, ct]) => biome(n, c, b, ct)).join('\n');

const mapBlock = `  <div class="biome-explorer map">
${mapRow}
${biomeRows}
  </div>`;

const overlayBlock = `  <div class="biome-explorer overlay">
${biomeRows}
  </div>`;

const page = `<div>
${TOP}
</div>
<div>
  <h1>Biome Explorer</h1>
  <p>Interactive "Conheça os biomas" experience: selectable biome hotspots that open an accessible detail overlay (banner + label + rich text + image gallery). Source: the Biodiversidade page on petrobras.com.br.</p>
${GAP}
  <h2>Biome Explorer (map)</h2>
  <p>Map variant: pill hotspots positioned over an interactive map of Brazil. Author a leading <strong>map</strong> row with the background image, then one row per biome (name | "x% y%" coords | banner | content). Selecting a hotspot opens the overlay dialog.</p>
${GAP}
${mapBlock}
${GAP}
  <h2>Biome Explorer (overlay)</h2>
  <p>Overlay variant: the same biomes rendered as a horizontal pill selector (no map). Selecting a pill opens the identical detail overlay — a real dialog with focus trap, Esc / backdrop / close to dismiss, and focus return.</p>
${GAP}
${overlayBlock}
${GAP}
</div>
`;

await writeFile(OUT, page);
process.stdout.write(`wrote ${OUT} (${page.length} bytes)\n`);
