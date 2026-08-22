/*
 * Build the full "Jornada da Energia" page at the content root.
 *
 * Assembles the entire petrobras.com.br/en/jornada-da-energia experience as a
 * single .plain.html, composed from the blocks built for this migration:
 *   1. hero (movie)         — pinned autoplaying background video + title
 *   2. energy-journey       — green pinned line-drawing scrollytelling (Lottie)
 *   3. energy-map           — interactive isometric operations map
 *   4. energy-journey.new-energy — white "new energy sources" scrollytelling
 *   5. cards (overlay)      — "A pioneering journey, with technology" tech tiles
 *   6. cards (overlay)      — "Explore more about each step" tiles
 *   7. CTA                  — "Everything you need to learn about fuel prices"
 *   8. accordion            — "Common questions" FAQ
 * The page uses the dedicated `jornada-da-energia` template (page metadata),
 * which loads the template-scoped CSS/JS. Nav + footer come from the site's
 * shared content (content/nav.plain.html, content/footer.plain.html).
 *
 * Idempotent: re-running overwrites the page.
 *
 * Run: node tools/samples/build-jornada-page.mjs
 */
import { writeFile } from 'node:fs/promises';

const OUT = 'content/jornada-da-energia.plain.html';
const DOC = 'https://petrobras.com.br/documents/d/f3a44542-113e-11ee-be56-0242ac120002';
const MEDIA = '/media-da/drafts/block-samples/energy-journey';
const MAP_MEDIA = '/media-da/drafts/block-samples/energy-map';

/* ---------- 1. hero (movie) ---------- */
const hero = `<div>
  <div class="hero movie">
    <div>
      <div><a href="${DOC}/hero">Journey of Energy background video</a></div>
      <div>
        <h1>The Journey of Energy</h1>
        <p>Energy is not lost, nor is it created. She transforms. Ours, in particular, goes through a long journey to become industrial inputs, innovations, fuels and much more. Come with us!</p>
      </div>
    </div>
  </div>
</div>`;

/* ---------- 2. energy-journey (green scrollytelling) ---------- */
const journeyStage = (json, eyebrow, heading, body, calloutTitle, calloutBody) => `    <div>
      <div><a href="${MEDIA}/${json}">${heading}</a></div>
      <div>
        <p>${eyebrow}</p>
        <h3>${heading}</h3>
${body.map((p) => `        <p>${p}</p>`).join('\n')}
        <h4>${calloutTitle}</h4>
        <p>${calloutBody}</p>
      </div>
    </div>`;

const journey = `<div>
  <div class="energy-journey">
    <div>
      <h2>We want to be the best diversified and integrated company in energy in value creation</h2>
      <p>Building a more sustainable world, reconciling the focus on oil and gas with diversification into low-carbon businesses.</p>
    </div>
${journeyStage('anim-pessoas.json', 'Innovation and Technology', 'It all starts with a lot of research', [
    'Our research, development, and innovation center (Cenpes) has a clear mission: to imagine, create and build the future of Petrobras today, testing and developing technologies applied to our business.',
    'Our 2026–2030 Strategic Plan allocates US$ 4 billion to technological innovation, with US$ 1.25 billion specifically dedicated to low-carbon projects.',
  ], 'Did you know? So much research has enabled us to innovate to extract oil with lower greenhouse gas emissions', 'Our oil extraction from the pre-salt layer emits 70% less CO2 equivalent per barrel than the world average!')}
${journeyStage('anim-exploracao.json', 'Exploration and production', 'We innovate to overcome technological barriers and expand our frontiers of exploration', [
    'Oil exploration and production (E&P) and natural gas can be done onshore (on land) and offshore (on high seas). Oil extraction in the pre-salt layer accounts for 80% of our production.',
    'With pioneering technologies, such as 4D seismic, we locate promising basins at a depth of more than 7,000 meters and analyze the best drilling spots.',
  ], 'Our 2026–2030 Business Plan allocates US$ 7.1 billion to the exploration of new energy frontiers, with one-third dedicated to the Equatorial Margin.', 'This investment allows us to find new reserves combining efficiency and carbon footprint reduction.')}
${journeyStage('anim-plataforma.json', 'Exploration and production', 'You must be wondering: How is the oil extracted?', [
    'Much of our production is done with modern Floating Production, Storage, and Offloading (FPSO) units.',
    'Oil is extracted from producing wells along with water and gas, separated by our FPSO platforms still in high seas. Our new-generation FPSOs also have HISEP technology, which reinjects CO2 on the sea floor.',
    'The FPSOs transfer the oil to tankers, which transport it to our waterway terminals. From there, the oil is sent to one of our refineries.',
  ], 'Did you know? Our Santos Basin, in the Pre-Salt Polygon, is the largest oil extraction basin in Brazil.', 'It is home to the Búzios Field, recipient of the OTC Award. In October 2025, Búzios set a record of 1 million barrels per day.')}
${journeyStage('anim-refino.json', 'Refining', 'In refineries, we use technology to transform crude oil into many different products', [
    'In refineries, oil is transformed into various derivatives, such as diesel, gasoline, liquefied petroleum gas (LPG), aviation kerosene and many others.',
    'With the BioRefino Program, we plan to position ourselves as a leading company in the supply of low-carbon products, produced from renewable or residual raw materials.',
  ], 'Did you know? Our diesel with a renewable share also helps to increase the useful life of vehicles', 'R Diesel has greater thermal and oxidation stability, so it does not damage engines and improves their performance.')}
${journeyStage('anim-gas.json', 'Low Carbon Gas and Power', 'How natural gas is produced to generate electrical energy and fuel?', [
    'Natural gas, once separated from the oil, is sent to one of our processing units, where it is refined and converted into different raw materials, then sent to local distributors or directly to one of our thermoelectric plants.',
    'Our thermoelectric plants, spread across the national territory, use natural gas and other specific fuels to generate electricity for millions of people.',
  ], 'Did you know? Cooking gas (LPG) can also be used in industries.', 'Besides household kitchens, LPG can be utilized in the manufacturing of glass, ceramics, and food.')}
${journeyStage('anim-logistica.json', 'Logistics', 'And how does the logistics work to take this energy to people and industries?', [
    'We crossed sky, land, and sea to take our energy to people all over the world, through an integrated logistics of terminals, waterway and land, and pipelines.',
    'Our logistics terminals handle import and export, coastal navigation, process waste treatment and disposal, and support for offloading operations.',
  ], 'Did you know? Our network of gas and oil pipelines is more than 7,000 km long', 'This corresponds to the straight-line distance from the extreme north of Brazil to the extreme south of the Americas!')}
  </div>
</div>`;

/* ---------- 3. energy-map ---------- */
const mapHotspot = (pos, img, alt, title, paras, linkText, href) => `    <div>
      <div>${pos}</div>
      <div>
        <picture><img src="${MAP_MEDIA}/${img}" alt="${alt}" loading="lazy"></picture>
        <h3>${title}</h3>
${paras.map((p) => `        <p>${p}</p>`).join('\n')}
${linkText ? `        <p><a href="${href}">${linkText}</a></p>` : ''}
      </div>
    </div>`;

const map = `<div>
  <div class="energy-map">
    <div>
      <div><picture><img src="${MAP_MEDIA}/map.webp" alt="Mapa isométrico ilustrado das operações da Petrobras: caminhão, refinarias, unidades de processamento, terminais, navios e parque eólico offshore." loading="lazy"></picture></div>
    </div>
${mapHotspot('18% 22%', 'card-1-distributors.webp', 'Ilustração de um caminhão-tanque distribuidor sobre o mapa.', 'Distributors', [
    'Distributors import oil and natural gas derivatives, originating in our refineries and processing units, and supply them to their local network of industries, businesses, and homes. They are also the ones who distribute the energy electricity generated in our thermoelectric plants.',
    'The operations of these distributors follow standards and processes defined by regulatory agencies, such as ANP and ANEEL.',
  ], 'Learn more about fuel distribution', 'https://precos.petrobras.com.br/en/home')}
${mapHotspot('28% 81%', 'card-2-fpsos.webp', 'Ilustração de uma plataforma FPSO no mar.', 'FPSOs and Drillships', [
    'FPSOs are floating platforms that perform oil extraction, fluid separation, storage and offloading to tankers. All in high seas! Our new-generation FPSO also uses HISEP technology to perform CO2 separation from oil and reinjection directly into the soil.',
  ], 'Learn more about FPSOs', '/en/quem-somos/exploracao-e-producao')}
${mapHotspot('36% 41% blink', 'card-3-thermoelectric.webp', 'Ilustração de uma usina termoelétrica.', 'Thermoelectric', [
    'We generate and sell electrical energy from a generating complex that consists of thermoelectric plants powered by natural gas or diesel. These plants are designed to complement the energy from the country\'s hydroelectric plants.',
  ], 'Learn about our thermoelectric plants', '/en/quem-somos/gas')}
${mapHotspot('50% 70%', 'card-4-regasification.webp', 'Ilustração de um terminal de regaseificação.', 'Regasification terminals', [
    'Did you know that liquefied natural gas (LNG) takes up 600% less space than its gaseous form? Therefore, the natural gas that we import from other countries is transported in its liquid state to our regasification terminals, where it is reconverted to its gaseous form and can continue its journey of energy.',
  ], 'Learn about our operations in Gas and Energy', '/en/quem-somos/gas')}
${mapHotspot('57% 7%', 'card-5-gas-processing.webp', 'Ilustração de uma unidade de processamento de gás natural.', 'Natural Gas Processing Units', [
    'It is there that Natural Gas extracted, already separated from oil, or imported from other countries, is refined to be converted into different industrial raw materials and for personal use, such as Compressed Natural Gas. From there, these derivatives are sent to local distributors through an extensive and integrated network of gas pipelines.',
  ], 'Learn about the Processing and Natural Gas Offer', '/en/negocios/oferta-processamento-de-gas')}
${mapHotspot('59% 51%', 'card-6-logistics.webp', 'Ilustração de um terminal logístico com tanques e dutos.', 'Logistic terminals', [
    'We operate a large and complex infrastructure of pipelines and terminals, and a marine fleet to transport oil products and crude oil to the Brazilian and global markets.',
  ], 'Know our logistics', '/en/quem-somos/logistica')}
${mapHotspot('82% 33%', 'card-7-refineries.webp', 'Ilustração de uma refinaria.', 'Refineries', [
    'It is there that crude oil undergoes separation and treatment processes for its derivative products, such as gasoline, natural gas, diesel and much more.',
  ], 'Learn about our refining', '/en/quem-somos/refino')}
${mapHotspot('85% 73%', 'card-8-offshore-wind.webp', 'Ilustração de um parque eólico offshore.', 'Offshore wind farms', [
    'The technology associated with offshore wind generation uses the force of the winds at sea to produce renewable energy. Petrobras and Equinor signed an agreement to assess the viability of seven offshore wind farms in Brazil.',
  ], null, null)}
  </div>
</div>`;

/* ---------- 4. energy-journey.new-energy ---------- */
const neStage = (upper, lower, linkText, href) => `    <div>
      <div></div>
      <div>
        <p>${upper}</p>
        <p>What makes it possible for us…</p>
        <p>${lower}</p>
${linkText ? `        <p><a href="${href}">${linkText}</a></p>` : ''}
      </div>
    </div>`;

const newEnergy = `<div>
  <div class="energy-journey new-energy">
    <div>
      <p><a href="${MEDIA}/anim-turbine.json">Wind turbine animation</a></p>
      <h2>With research and innovation, new technologies become new energy sources</h2>
      <p>Our experience and technical excellence will apply to diversify our operations, focusing on the development of bioproducts and on other frontiers of renewable energy.</p>
    </div>
${neStage('We have unique expertise and technical capacity to operate in deep and ultra-deep waters', 'To have a privileged position for the generation of offshore wind energy, crucial to position Brazil as one of the global leaders in clean energy', null, null)}
${neStage('We are major producers of natural gas, known as the “transition fuel” from fossil to renewable sources', 'To be pioneers in the generation of green hydrogen (H2V), one of the key fuels for the energy transition', null, null)}
${neStage('We have drawn up a strategic and investment plan to convert our refining units into bio-petro-gas refineries', 'To idealize and process new generation fuels, focusing on low-carbon energy and reducing CO2 emissions', 'Read about our biorefining', 'https://petrobras.com.br/en/quem-somos/refino')}
  </div>
</div>`;

/* ---------- 5. tech cards (overlay) ---------- */
const techCards = `<div>
  <h2>A pioneering journey, with technology</h2>
  <div class="cards overlay">
    <div>
      <div><picture><img src="${MAP_MEDIA}/card-7-refineries.webp" alt="Digital twins for exploration and refining." loading="lazy"></picture></div>
      <div><h3>Exploration and Production (E&amp;P) and Refining</h3><p><a href="https://nossaenergia.petrobras.com.br/w/inovacao/tecnologias-sustentaveis">Digital copies to explore with precision</a></p></div>
    </div>
    <div>
      <div><picture><img src="${MAP_MEDIA}/card-2-fpsos.webp" alt="HISEP technology on our platforms." loading="lazy"></picture></div>
      <div><h3>Energy Exploration and Production (E&amp;P)</h3><p><a href="https://nossaenergia.petrobras.com.br/w/inovacao/tecnologias-sustentaveis">HISEP technology to increase efficiency and reduce emissions</a></p></div>
    </div>
    <div>
      <div><picture><img src="${MAP_MEDIA}/card-5-gas-processing.webp" alt="Innovative gas storage and transport system." loading="lazy"></picture></div>
      <div><h3>Gas and Low Carbon Energy</h3><p><a href="http://www.ufc.br/noticias/noticias-de-2019/13619-em-parceria-com-petrobras-ufc-tem-aprovada-sua-primeira-carta-patente-conheca-a-tecnologia">Innovative system for storing and transporting natural gas</a></p></div>
    </div>
  </div>
  <div class="section-metadata"><div><div>style</div><div>light</div></div></div>
</div>`;

/* ---------- 6. explore cards (overlay) ---------- */
const exploreCards = `<div>
  <h2>Explore more about each step of the journey</h2>
  <div class="cards overlay">
    <div>
      <div><picture><img src="${MAP_MEDIA}/card-2-fpsos.webp" alt="Exploration and production activities." loading="lazy"></picture></div>
      <div><h3>Exploration and Production (E&amp;P)</h3><p><a href="/en/quem-somos/exploracao-e-producao">Discover our E&amp;P activities</a></p></div>
    </div>
    <div>
      <div><picture><img src="${MAP_MEDIA}/card-7-refineries.webp" alt="Our refining operations." loading="lazy"></picture></div>
      <div><h3>Refining</h3><p><a href="/en/quem-somos/refino">Learn about our refining</a></p></div>
    </div>
    <div>
      <div><picture><img src="${MAP_MEDIA}/card-6-logistics.webp" alt="Our logistics network." loading="lazy"></picture></div>
      <div><h3>Logistics</h3><p><a href="/en/quem-somos/logistica">Know our logistics</a></p></div>
    </div>
    <div>
      <div><picture><img src="${MAP_MEDIA}/card-3-thermoelectric.webp" alt="Gas and power activities." loading="lazy"></picture></div>
      <div><h3>Low Carbon Gas and Power</h3><p><a href="/en/quem-somos/gas">Discover our G&amp;E activities</a></p></div>
    </div>
  </div>
  <div class="section-metadata"><div><div>style</div><div>light</div></div></div>
</div>`;

/* ---------- 7. CTA ---------- */
const cta = `<div>
  <h3>Everything you need to learn about fuel prices</h3>
  <p>Now that you know how our energy arrives at gas stations, how about finding out which portions make up the price of gasoline, diesel and cooking gas to consumers?</p>
  <p><a href="https://precos.petrobras.com.br">See all about fuel prices</a></p>
</div>`;

/* ---------- 8. FAQ accordion ---------- */
const faqItem = (q, a) => `    <div>
      <div>${q}</div>
      <div><p>${a}</p></div>
    </div>`;

const faq = `<div>
  <h2>Common questions</h2>
  <p>The journey of energy is long, so we've mapped out the most frequently asked questions to guide you.</p>
  <div class="accordion">
${faqItem('How is the oil extracted and explored today?', 'Oil exploration and extraction can be done on dry land (onshore) or on the high seas (offshore). Petrobras\' focus is oil extraction in deep and ultra-deep water, where the pre-salt oil is. First the promising basins are located, with state-of-the-art technologies, and exploratory drilling is carried out to prove the existence of oil. Afterwards, the oil is extracted by FPSO platforms and passed on to tankers, which transport it to logistic terminals.')}
${faqItem('How is oil refining done?', 'Oil refining is done in three stages: distillation, conversion, and treatments. In distillation, oil is heated until it evaporates to separate its derivatives. In conversion, the heaviest and lowest-value parts of oil are transformed into smaller molecules to originate more noble derivatives. Finally, treatments are carried out to adapt the derivatives to the quality demanded by the market.')}
${faqItem('How is fuel gas produced?', 'Fuel gas is produced in processing units, where natural gas is refined and converted into different raw materials, such as Compressed Natural Gas (CNG).')}
${faqItem('What is energy decarbonization?', 'Energy decarbonization is the reduction of greenhouse gas emissions in fossil energy operations, such as oil. It is the first step towards meeting the growing global energy demand and enabling a fair and safe energy transition to renewable sources.')}
  </div>
</div>`;

/* ---------- page metadata (template + SEO) ---------- */
const meta = `<div>
  <div class="metadata">
    <div><div>template</div><div>jornada-da-energia</div></div>
    <div><div>Title</div><div>The Journey of Energy: Innovation from start to finish | Petrobras</div></div>
    <div><div>Description</div><div>Energy is not lost, nor is it created. She transforms. Follow the long journey of our energy — from research and exploration to refining, gas, logistics and new energy sources.</div></div>
  </div>
</div>`;

const page = [hero, journey, map, newEnergy, techCards, exploreCards, cta, faq, meta].join('\n');

await writeFile(OUT, `${page}\n`);
process.stdout.write(`wrote ${OUT} (${page.length} bytes)\n`);
