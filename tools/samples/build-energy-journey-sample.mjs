/*
 * Build the energy-journey block-sample page.
 *
 * The energy-journey block is the pinned scrollytelling centerpiece of
 * petrobras.com.br/en/jornada-da-energia. The FIRST authored row is the pinned
 * background (a looping muted video, host-allowlisted); the remaining rows are
 * the 7 journey STAGES, each with an eyebrow, an <h3> heading, body copy, and a
 * "Did you know?" callout (authored as an <h4> + a following <p>).
 *
 * A stage's media cell may link to a local Lottie JSON (rendered via the block's
 * vendored player) or hold a <picture>; this sample leaves the media cells empty
 * for now (text-reveal only) until the source Lottie JSON files are supplied.
 *
 * The block MUST be wrapped in a section <div> (a bare top-level <div> becomes a
 * SECTION in EDS .plain.html). The journey is the FIRST section (full-bleed,
 * under the overlay header).
 *
 * Idempotent: re-running overwrites the sample.
 *
 * Run: node tools/samples/build-energy-journey-sample.mjs
 */
import { writeFile } from 'node:fs/promises';

const OUT = 'content/drafts/block-samples/energy-journey.plain.html';

const VIDEO = 'https://petrobras.com.br/documents/d/f3a44542-113e-11ee-be56-0242ac120002/hero';

// one stage: [ media cell (empty for now) ][ eyebrow + h3 + body[] + callout ]
const stage = (eyebrow, heading, bodyParas, calloutTitle, calloutBody) => {
  const body = bodyParas.map((p) => `        <p>${p}</p>`).join('\n');
  return `    <div>
      <div></div>
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
    'Exploration and production',
    'You must be wondering: How is the oil extracted?',
    [
      'Much of our production is done with modern Floating Production, Storage, and Offloading (FPSO) units.',
      'Oil is extracted from producing wells along with water and gas, separated by our FPSO platforms still in high seas. Our new-generation FPSOs also have HISEP technology, which reinjects CO2 on the sea floor.',
    ],
    'Did you know? Our Santos Basin, in the Pre-Salt Polygon, is the largest oil extraction basin in Brazil.',
    'It is home to the Búzios Field, recipient of the OTC Award. In October 2025, Búzios set a record of 1 million barrels per day.',
  ),
  stage(
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
    'Logistics',
    'And how does the logistics work to take this energy to people and industries?',
    [
      'We crossed sky, land, and sea to take our energy to people all over the world, through an integrated logistics of terminals, waterway and land, and pipelines.',
      'Our logistics terminals handle import and export, coastal navigation, process waste treatment and disposal, and support for offloading operations.',
    ],
    'Did you know? Our network of gas and oil pipelines is more than 7,000 km long',
    'This corresponds to the straight-line distance from the extreme north of Brazil to the extreme south of the Americas!',
  ),
  stage(
    'Energy transition',
    'And it is with this energy that we are going to lead a new journey: the energy transition',
    [
      'Our gaze is on tomorrow. We are developing a new generation of fuels and products, focusing on new energy sources and cleaner processes.',
      'It is the beginning of a new journey for our energy.',
    ],
    'Did you know? The journey does not end here.',
    'From oil and gas to bioproducts, offshore wind and green hydrogen, our energy keeps transforming.',
  ),
];

const block = `<div>
  <div class="energy-journey">
    <div>
      <div><a href="${VIDEO}">Vídeo de fundo da Jornada da Energia</a></div>
      <div></div>
    </div>
${stages.join('\n')}
  </div>
</div>
<div>
  <h1>Energy Journey</h1>
  <p>A pinned scrollytelling block: a looping muted background video stays fixed while the journey stages scroll over it, each revealing (fade + rise) as it enters the viewport, with a yellow progress line filling as you advance. Each stage carries an eyebrow, a heading, body copy, and a "Did you know?" callout. A stage's media cell can hold a local Lottie JSON (rendered via the block's vendored SVG player) or a picture. Author the block as <strong>Energy Journey</strong>: the first row is the background video, each following row is a stage.</p>
  <p>Source: <a href="https://petrobras.com.br/en/jornada-da-energia">https://petrobras.com.br/en/jornada-da-energia</a></p>
</div>
`;

await writeFile(OUT, block);
process.stdout.write(`wrote ${OUT} (${block.length} bytes)\n`);
