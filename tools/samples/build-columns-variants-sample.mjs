/*
 * Build the columns-variants block-sample pages.
 *
 * Writes TWO standalone sample pages — one per new columns variant — following
 * the standard block-sample layout (top-clearance spacer, heading + one-line
 * description, gap spacers around the demonstrated block):
 *   - content/drafts/block-samples/columns-stats.plain.html
 *   - content/drafts/block-samples/columns-feature.plain.html
 *
 * The base columns block treats the first row's cells as the columns and adds a
 * `columns-N-cols` class. The variant is the 2nd class on `.columns`:
 *   - stats:   KPI banner. Each cell = <p>US$</p> / <p><strong>N</strong> unit</p>
 *              / <p>label</p>. Dark #104C6D banner, white text.
 *   - feature: icon + heading + text columns. Each cell = <picture> icon,
 *              <h3> heading, <p> supporting copy.
 *
 * Does NOT touch the existing columns.plain.html.
 * Idempotent: re-running overwrites the two sample pages.
 *
 * Run: node tools/samples/build-columns-variants-sample.mjs
 */
import { writeFile } from 'node:fs/promises';

const OUT_STATS = 'content/drafts/block-samples/columns-stats.plain.html';
const OUT_FEATURE = 'content/drafts/block-samples/columns-feature.plain.html';

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

// --- stats: one KPI cell -------------------------------------------------
const stat = (number, unit, label) => `      <div>
        <p>US$</p>
        <p><strong>${number}</strong> ${unit}</p>
        <p>${label}</p>
      </div>`;

const statsBlock = `  <div class="columns stats">
    <div>
${stat('4,3', 'billion', 'in emissions mitigation')}
${stat('13', 'billion', 'in low-carbon energy')}
${stat('4,8', 'billion', 'in bioproducts')}
${stat('1,2', 'billion', 'in low-carbon R&amp;D and innovation')}
    </div>
  </div>`;

// --- feature: one icon + heading + text cell -----------------------------
const EARTH = 'https://petrobras.com.br/documents/2677942/2678045/energia+com+menos+emissao.webp/4cbd71cb-c0cc-7fb6-044e-c37ed90cc1c7?version=1.0&t=1782237529000';
const BRAZIL = 'https://petrobras.com.br/documents/2677942/2678045/abrangencia.webp/7ce45976-137d-93ca-ccf1-a1e97f25b4dc?version=1.0&t=1782237557000';
const HAND = 'https://petrobras.com.br/documents/2677942/2678045/contribuicao.webp/4861ff36-f38b-7d22-22ed-ada295373385?version=1.0&t=1782237577000';

const feature = (src, alt, heading, text) => `      <div>
        <picture><img src="${src}" alt="${alt}"></picture>
        <h3>${heading}</h3>
        <p>${text}</p>
      </div>`;

const featureBlock = `  <div class="columns feature">
    <div>
${feature(EARTH, 'Ilustração da Terra com uma árvore representando um mundo sustentável.', 'Produção de energia com menor intensidade de emissões', 'Ampliamos fontes mais limpas e reduzimos a intensidade de emissões da produção tradicional.')}
${feature(BRAZIL, 'Ilustração do mapa do Brasil.', 'Abrangência e acesso à energia', 'Mantemos uma oferta de energia acessível a todos, hoje e no futuro, em todas as regiões.')}
${feature(HAND, 'Ilustração de uma mão com pessoas em cima.', 'Contribuição ao desenvolvimento social e econômico', 'Consideramos o impacto das atividades energéticas nos territórios onde atuamos.')}
    </div>
  </div>`;

const statsPage = `<div>
${TOP}
</div>
<div>
  <h1>Columns (stats)</h1>
  <p>Stats variant: a dark KPI banner of big numbers with labels. Author one row with a cell per metric; each cell holds "US$", a number line (the big number in bold), and a label. Two columns on mobile, four from desktop. Source: the Energy Transition investments block.</p>
${GAP}
${statsBlock}
${GAP}
</div>
`;

const featurePage = `<div>
${TOP}
</div>
<div>
  <h1>Columns (feature)</h1>
  <p>Feature variant: icon + heading + text columns. Author one row with a cell per feature; each cell holds an illustration, a heading and a short paragraph. One column on mobile, two at tablet, three from desktop. Source: the Energy Transition / Biodiversidade feature columns.</p>
${GAP}
${featureBlock}
${GAP}
</div>
`;

await writeFile(OUT_STATS, statsPage);
process.stdout.write(`wrote ${OUT_STATS} (${statsPage.length} bytes)\n`);
await writeFile(OUT_FEATURE, featurePage);
process.stdout.write(`wrote ${OUT_FEATURE} (${featurePage.length} bytes)\n`);
