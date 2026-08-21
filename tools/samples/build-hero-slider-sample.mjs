/*
 * Build the hero-slider block-sample page.
 *
 * The hero (slider) variant is a full-bleed hero CAROUSEL (source: the banner at
 * the top of petrobras.com.br/quem-somos/produtos, `.banner-hero`). Unlike the
 * orgchart sample, there is no pre-authored draft to extract, so this script
 * authors a few representative slides directly (each authored row = one slide:
 * an image cell + a heading/description/CTA cell) and wraps them in the standard
 * block-sample layout: a top-clearance spacer, a heading + description section,
 * and gap spacers around the demonstrated block.
 *
 * Idempotent: re-running overwrites the sample.
 *
 * Run: node tools/samples/build-hero-slider-sample.mjs
 */
import { writeFile } from 'node:fs/promises';

const OUT = 'content/drafts/block-samples/hero-slider.plain.html';

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

const GAP = spacer('48px', null, '40px'); // breathing room around the sample

// Each slide = one authored row: [ image cell ][ heading + description + CTA ].
const slides = [
  {
    img: 'https://petrobras.com.br/documents/2677942/38145008/produtos-banner-petrobras.webp/f4cb8cd2-c235-ab3a-d560-ecca431bd475?version=1.0&t=1752588235000',
    alt: 'Foto aérea de diversas autoestradas com carros, representando o uso de produtos da Petrobras.',
    heading: 'Desenvolvemos produtos para variados públicos',
    body: 'Nossos produtos são desenvolvidos com tecnologia e qualidade, com diferentes aplicações, para atender às demandas diversas da sociedade.',
    cta: { label: 'Conheça nossos produtos', href: '/quem-somos/produtos' },
  },
  {
    img: 'https://petrobras.com.br/documents/2677942/41758384/operacoes-bolivia.jpg/9ff552b8-9bdf-cd1f-7207-d873571428fc?version=1.0&t=1760710441000',
    alt: 'Vista aérea de instalações industriais da Petrobras em meio à paisagem árida.',
    heading: 'Energia que move o país',
    body: 'O nosso trabalho e a nossa tecnologia estão em todos os lugares: nas estradas, nos oceanos, nos céus, nas indústrias e nos postos.',
    cta: { label: 'Nossa energia', href: '/transicao-energetica' },
  },
  {
    img: 'https://petrobras.com.br/documents/2677942/38145008/produtos-banner-petrobras.webp/f4cb8cd2-c235-ab3a-d560-ecca431bd475?version=1.0&t=1752588235000',
    alt: 'Foto aérea de autoestradas movimentadas, ilustrando a presença dos combustíveis Petrobras.',
    heading: 'Tecnologia e qualidade em cada produto',
    body: 'Da aviação à navegação, dos fertilizantes aos combustíveis mais sustentáveis, entregamos soluções para diferentes setores.',
    cta: { label: 'Produtos mais sustentáveis', href: '/produtos-mais-sustentaveis' },
  },
];

const slideRow = (s) => `    <div>
      <div><picture><img src="${s.img}" alt="${s.alt}" loading="lazy"></picture></div>
      <div>
        <h1>${s.heading}</h1>
        <p>${s.body}</p>
        <p><a href="${s.cta.href}">${s.cta.label}</a></p>
      </div>
    </div>`;

const block = `  <div class="hero slider">
${slides.map(slideRow).join('\n')}
  </div>`;

// The hero slider is a FULL-BLEED banner that sits at the very top of the page,
// UNDER the transparent/overlay header — exactly like the source product page and
// the hero-diagonal-split sample. It must therefore be the first section with NO
// top-clearance spacer above it; a leading spacer would push the header off the
// dark hero image onto the white page background, where the header's dark-hero
// theme (white row-1 text) would render white-on-white (a real a11y failure).
const page = `${block}
<div>
${GAP}
  <h2>Hero (slider)</h2>
  <p>Hero variant rendered as a full-bleed carousel: image slides with a white heading, a description, and an optional green pill CTA, plus a bottom-left control cluster (play/pause, previous/next arrows, and dot pagination). Autoplays, pauses on hover/focus, respects reduced motion, and is keyboard operable. Author the block as <strong>Hero (slider)</strong> with one row per slide.</p>
  <p>Source: <a href="https://petrobras.com.br/quem-somos/produtos">https://petrobras.com.br/quem-somos/produtos</a></p>
${GAP}
</div>
`;

await writeFile(OUT, page);
process.stdout.write(`wrote ${OUT} (${page.length} bytes)\n`);
