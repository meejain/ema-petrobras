/*
 * Build the energy-journey block-sample page.
 *
 * The energy-journey block is the pinned line-drawing scrollytelling centerpiece
 * of petrobras.com.br/en/jornada-da-energia (source ".section-slider-green").
 *
 * Authored structure:
 *   row 0 (intro): an <h2> opening statement + a <p>.
 *   row 1..n (stages): [ media cell: a link to a local Lottie JSON ]
 *                      [ content cell: an eyebrow <p>, an <h3> heading, body
 *                        <p>s (and lists/tables), and a "Did you know?" callout
 *                        authored as an <h4> + a following <p> ].
 *
 * The block renders a pinned stepper on desktop (each step reveals a stage,
 * plays its Lottie, travels a grow-line, advances the left dot-rail) and a
 * simple reveal-on-scroll flow on mobile. The Lottie JSONs are the source's own
 * animations, hosted LOCALLY under the sample media folder.
 *
 * The block MUST be wrapped in a section <div> (a bare top-level <div> becomes a
 * SECTION in EDS .plain.html).
 *
 * Idempotent: re-running overwrites the sample.
 *
 * Run: node tools/samples/build-energy-journey-sample.mjs
 */
import { writeFile } from 'node:fs/promises';

const OUT = 'content/drafts/block-samples/energy-journey.plain.html';
const MEDIA = '/media-da/drafts/block-samples/energy-journey';

// A short spacer clears the fixed header so its (transparent) utility strip
// sits over white rather than the green journey band — matching the real page,
// where a dark hero-movie is the first section and the header text is white.
const spacer = (desktop, tablet, mobile) => {
  const rows = [
    ['Desktop', desktop],
    ...(tablet ? [['Tablet', tablet]] : []),
    ['Mobile', mobile],
  ];
  const cells = rows.map(([k, v]) => `    <div><div>${k}</div><div>${v}</div></div>`).join('\n');
  return `  <div class="spacer">\n${cells}\n  </div>`;
};

const TOP = spacer('120px', '110px', '84px');

// one stage: [ media cell: Lottie JSON link ][ eyebrow + h3 + body[] + callout ]
const stage = (json, eyebrow, heading, bodyParas, calloutTitle, calloutBody) => {
  const body = bodyParas.map((p) => `        <p>${p}</p>`).join('\n');
  return `    <div>
      <div><a href="${MEDIA}/${json}">${heading}</a></div>
      <div>
        <p>${eyebrow}</p>
        <h3>${heading}</h3>
${body}
        <h4>${calloutTitle}</h4>
        <p>${calloutBody}</p>
      </div>
    </div>`;
};

const stages = [
  stage(
    'anim-pessoas.json',
    'Innovation and Technology',
    'It all starts with a lot of research',
    [
      'Our research, development, and innovation center (Cenpes) has a clear mission: to imagine, create and build the future of Petrobras today, testing and developing technologies applied to our business.',
      'Our 2026–2030 Strategic Plan allocates US$ 4 billion to technological innovation, with US$ 1.25 billion specifically dedicated to low-carbon projects.',
    ],
    'Did you know? So much research has enabled us to innovate to extract oil with lower greenhouse gas emissions',
    'Our oil extraction from the pre-salt layer emits 70% less CO2 equivalent per barrel than the world average!',
  ),
  stage(
    'anim-exploracao.json',
    'Exploration and production',
    'We innovate to overcome technological barriers and expand our frontiers of exploration',
    [
      'Oil exploration and production (E&P) and natural gas can be done onshore (on land) and offshore (on high seas). Oil extraction in the pre-salt layer accounts for 80% of our production.',
      'With pioneering technologies, such as 4D seismic, we locate promising basins at a depth of more than 7,000 meters and analyze the best drilling spots.',
    ],
    'Our 2026–2030 Business Plan allocates US$ 7.1 billion to the exploration of new energy frontiers, with one-third dedicated to the Equatorial Margin.',
    'This investment allows us to find new reserves combining efficiency and carbon footprint reduction.',
  ),
  stage(
    'anim-plataforma.json',
    'Exploration and production',
    'You must be wondering: How is the oil extracted?',
    [
      'Much of our production is done with modern Floating Production, Storage, and Offloading (FPSO) units.',
      'Oil is extracted from producing wells along with water and gas, separated by our FPSO platforms still in high seas. Our new-generation FPSOs also have HISEP technology, which reinjects CO2 on the sea floor.',
      'The FPSOs transfer the oil to tankers, which transport it to our waterway terminals. From there, the oil is sent to one of our refineries.',
    ],
    'Did you know? Our Santos Basin, in the Pre-Salt Polygon, is the largest oil extraction basin in Brazil.',
    'It is home to the Búzios Field, recipient of the OTC Award. In October 2025, Búzios set a record of 1 million barrels per day.',
  ),
  stage(
    'anim-refino.json',
    'Refining',
    'In refineries, we use technology to transform crude oil into many different products',
    [
      'In refineries, oil is transformed into various derivatives, such as diesel, gasoline, liquefied petroleum gas (LPG), aviation kerosene and many others.',
      'With the BioRefino Program, we plan to position ourselves as a leading company in the supply of low-carbon products, produced from renewable or residual raw materials.',
    ],
    'Did you know? Our diesel with a renewable share also helps to increase the useful life of vehicles',
    'R Diesel has greater thermal and oxidation stability, so it does not damage engines and improves their performance.',
  ),
  stage(
    'anim-gas.json',
    'Low Carbon Gas and Power',
    'How natural gas is produced to generate electrical energy and fuel?',
    [
      'Natural gas, once separated from the oil, is sent to one of our processing units, where it is refined and converted into different raw materials, then sent to local distributors or directly to one of our thermoelectric plants.',
      'Our thermoelectric plants, spread across the national territory, use natural gas and other specific fuels to generate electricity for millions of people.',
    ],
    'Did you know? Cooking gas (LPG) can also be used in industries.',
    'Besides household kitchens, LPG can be utilized in the manufacturing of glass, ceramics, and food.',
  ),
  stage(
    'anim-logistica.json',
    'Logistics',
    'And how does the logistics work to take this energy to people and industries?',
    [
      'We crossed sky, land, and sea to take our energy to people all over the world, through an integrated logistics of terminals, waterway and land, and pipelines.',
      'Our logistics terminals handle import and export, coastal navigation, process waste treatment and disposal, and support for offloading operations.',
    ],
    'Did you know? Our network of gas and oil pipelines is more than 7,000 km long',
    'This corresponds to the straight-line distance from the extreme north of Brazil to the extreme south of the Americas!',
  ),
];

const block = `<div>
${TOP}
</div>
<div>
  <div class="energy-journey">
    <div>
      <h2>We want to be the best diversified and integrated company in energy in value creation</h2>
      <p>Building a more sustainable world, reconciling the focus on oil and gas with diversification into low-carbon businesses.</p>
    </div>
${stages.join('\n')}
  </div>
</div>
<div>
  <h1>Energy Journey</h1>
  <p>A pinned line-drawing scrollytelling block. An opening statement drops a white dot; a line draws up and turns right, then the section pins and each scroll step reveals a stage: a white line-drawn Lottie illustration on the left, a grow-line travelling toward it, and a white content card on the right (eyebrow, heading, body, and a gold "Did you know?" callout), with a left dot-rail tracking progress. On mobile the section flows vertically and each stage reveals on scroll. Author the block as <strong>Energy Journey</strong>: the first row is the opening title, each following row is a stage (a Lottie JSON link + a content cell).</p>
  <p>Source: <a href="https://petrobras.com.br/en/jornada-da-energia">https://petrobras.com.br/en/jornada-da-energia</a></p>
</div>
`;

await writeFile(OUT, block);
process.stdout.write(`wrote ${OUT} (${block.length} bytes)\n`);
