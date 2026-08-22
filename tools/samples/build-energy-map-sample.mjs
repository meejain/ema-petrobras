/*
 * Build the energy-map block-sample page.
 *
 * The energy-map block is the interactive isometric map from
 * petrobras.com.br/en/jornada-da-energia ("Learn about our main operations"):
 * a wide illustration (map-2 webp) with orange "+" hotspots at fixed %-
 * positions; clicking one dims the map and opens a detail card.
 *
 * Authored structure:
 *   row 0 (map): the map illustration (a <picture>/<img>)
 *   row 1..n (hotspots): a position cell ("x% y%" [blink]) + a content cell
 *     (optional card image, an <h3> title, body <p>s, optional link).
 *
 * Idempotent: re-running overwrites the sample.
 *
 * Run: node tools/samples/build-energy-map-sample.mjs
 */
import { writeFile } from 'node:fs/promises';

const OUT = 'content/drafts/block-samples/energy-map.plain.html';

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

// Assets are downloaded from the source and hosted LOCALLY (cache-friendly, no
// CORS, and resilient to source URL changes) under the sample media folder.
const MEDIA = '/media-da/drafts/block-samples/energy-map';
const MAP = `${MEDIA}/map.webp`;

// each hotspot: position cell ("x% y%" [blink]) + content cell (card image,
// title, body paragraphs, optional link). `paras` is an array — the source
// cards carry multiple paragraphs, so render them all for full parity.
const hotspot = (pos, img, imgAlt, title, paras, linkText, href) => {
  const body = paras.map((p) => `        <p>${p}</p>`).join('\n');
  return `    <div>
      <div>${pos}</div>
      <div>
        <picture><img src="${MEDIA}/${img}" alt="${imgAlt}" loading="lazy"></picture>
        <h3>${title}</h3>
${body}
${linkText ? `        <p><a href="${href}">${linkText}</a></p>` : ''}
      </div>
    </div>`;
};

// positions measured from the source map (x% y% within the illustration);
// full paragraph content captured verbatim from the source detail cards.
const hotspots = [
  hotspot('18% 22%', 'card-1-distributors.webp', 'Ilustração de um caminhão-tanque distribuidor sobre o mapa.', 'Distributors', [
    'Distributors import oil and natural gas derivatives, originating in our refineries and processing units, and supply them to their local network of industries, businesses, and homes. They are also the ones who distribute the energy electricity generated in our thermoelectric plants.',
    'There are fuel distributors, for example, who are responsible for the mandatory addition of biodiesel, as required by law. There are also energy distributors who handle the distribution of electrical energy generated in our thermoelectric plants.',
    'The operations of these distributors follow standards and processes defined by regulatory agencies, such as ANP and ANEEL.',
  ], 'Learn more about fuel distribution', 'https://precos.petrobras.com.br/en/home'),
  hotspot('28% 81%', 'card-2-fpsos.webp', 'Ilustração de uma plataforma FPSO no mar.', 'FPSOs and Drillships', [
    'FPSOs are floating platforms that perform oil extraction, fluid separation, storage and offloading to tankers. All in high seas! Our new-generation FPSO also uses HISEP technology to perform CO2 separation from oil and reinjection directly into the soil.',
  ], 'Learn more about FPSOs', '/en/quem-somos/exploracao-e-producao'),
  hotspot('36% 41% blink', 'card-3-thermoelectric.webp', 'Ilustração de uma usina termoelétrica.', 'Thermoelectric', [
    'We generate and sell electrical energy from a generating complex that consists of thermoelectric plants powered by natural gas or diesel. These plants are designed to complement the energy from the country\'s hydroelectric plants.',
  ], 'Learn about our thermoelectric plants', '/en/quem-somos/gas'),
  hotspot('50% 70%', 'card-4-regasification.webp', 'Ilustração de um terminal de regaseificação.', 'Regasification terminals', [
    'Did you know that liquefied natural gas (LNG) takes up 600% less space than its gaseous form? Therefore, the natural gas that we import from other countries is transported in its liquid state to our regasification terminals, where it is reconverted to its gaseous form and can continue its journey of energy.',
  ], 'Learn about our operations in Gas and Energy', '/en/quem-somos/gas'),
  hotspot('57% 7%', 'card-5-gas-processing.webp', 'Ilustração de uma unidade de processamento de gás natural.', 'Natural Gas Processing Units', [
    'It is there that Natural Gas extracted, already separated from oil, or imported from other countries, is refined to be converted into different industrial raw materials and for personal use, such as Compressed Natural Gas. From there, these derivatives are sent to local distributors through an extensive and integrated network of gas pipelines.',
  ], 'Learn about the Processing and Natural Gas Offer', '/en/negocios/oferta-processamento-de-gas'),
  hotspot('59% 51%', 'card-6-logistics.webp', 'Ilustração de um terminal logístico com tanques e dutos.', 'Logistic terminals', [
    'We operate a large and complex infrastructure of pipelines and terminals, and a marine fleet to transport oil products and crude oil to the Brazilian and global markets.',
    'Our logistics network encompasses proprietary terminals, operated through our wholly-owned subsidiary Petrobras Transporte S.A. ("Transpetro"), and we also have contracts for the use of partial storage capacity at third-party terminals.',
  ], 'Know our logistics', '/en/quem-somos/logistica'),
  hotspot('82% 33%', 'card-7-refineries.webp', 'Ilustração de uma refinaria.', 'Refineries', [
    'It is there that crude oil undergoes separation and treatment processes for its derivative products, such as gasoline, natural gas, diesel and much more.',
    'And, in the coming years, it will do even more: our investment strategy is to expand and adapt our refining park to produce a new generation of fuels, more modern and sustainable, such as diesel with a renewable share and aviation biokerosene.',
  ], 'Learn about our refining', '/en/quem-somos/refino'),
  hotspot('85% 73%', 'card-8-offshore-wind.webp', 'Ilustração de um parque eólico offshore.', 'Offshore wind farms', [
    'The technology associated with offshore wind generation uses the force of the winds at sea to produce energy renewable. Petrobras and Equinor signed an agreement to assess the viability of seven offshore wind farms in Brazil, in the states of Rio de Janeiro, Espírito Santo, Piauí, Ceará, Rio Grande do Norte and Rio Grande do Sul.',
    'The main advantages of offshore wind energy are the high speed and stability of offshore winds, free from interference from barriers, like ground roughness, forests, mountains, and buildings, for example.',
  ], null, null),
];

const block = `<div>
${TOP}
</div>
<div>
  <h1>Energy Map</h1>
  <p>An interactive isometric map of our main operations. The full-size illustration sits in a horizontally scrollable strip — on every viewport the map keeps its size and you pan left↔right to reach the orange "+" markers (it is never shrunk to fit). Hovering a marker expands a dark pill with its title; clicking one opens a white detail card (image, title, description, optional "Learn about…" link) that slides in from the left. A close button or Esc dismisses it, and a ripple pulse hops from marker to marker. Author the block as <strong>Energy Map</strong>: the first row is the map illustration, each following row is a hotspot (a position cell like "18% 22%" plus a content cell).</p>
  <p>Source: <a href="https://petrobras.com.br/en/jornada-da-energia">https://petrobras.com.br/en/jornada-da-energia</a></p>
</div>
<div>
  <div class="energy-map">
    <div>
      <div><picture><img src="${MAP}" alt="Mapa isométrico ilustrado das operações da Petrobras: caminhão, refinarias, unidades de processamento, terminais, navios e parque eólico offshore." loading="lazy"></picture></div>
    </div>
${hotspots.join('\n')}
  </div>
</div>
`;

await writeFile(OUT, block);
process.stdout.write(`wrote ${OUT} (${block.length} bytes)\n`);
