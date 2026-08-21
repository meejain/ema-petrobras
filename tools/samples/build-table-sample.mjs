/*
 * Build the table block-sample page.
 *
 * Demonstrates both table variants in the standard block-sample layout:
 * a top-clearance spacer, then each variant with its own heading + description
 * and gap spacers, matching the shape of the other block-samples.
 *
 *   - table (specifications): product/spec grid (source: /quem-somos/bunker)
 *   - table (downloads):      row-label table with document download links
 *                             (source: /quem-somos/estagios)
 *
 * Idempotent: re-running overwrites the sample.
 *
 * Run: node tools/samples/build-table-sample.mjs
 */
import { writeFile } from 'node:fs/promises';

const OUT = 'content/drafts/block-samples/table.plain.html';

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

const TOP = spacer('180px', '170px', '96px'); // top clearance below the fixed header
const GAP = spacer('48px', null, '40px'); // breathing room around the sample

// authored block row helper: each cell is a <div>
const row = (...cells) => `    <div>${cells.map((c) => `<div>${c}</div>`).join('')}</div>`;

const doc = (label, href) => `<p><a href="${href}?download=true">${label}</a></p>`;

const specifications = `  <div class="table specifications">
${row('Produto', 'Norma ISO', 'Viscosidade cinemática max.', 'Teor de enxofre máximo')}
${row('VLSFO 0,5% S LV', 'Atende à norma ISO 8217:2017 Class F:RME', '180 cSt @ 50°C', '0,50% em massa')}
${row('VLSFO 0,5% S', 'Atende à norma ISO 8217:2017 Class F:RMG', '380 cSt @ 50°C', '0,50% em massa')}
${row('MGO_2010', 'Atende à norma ISO 8217:2010 Class F:DMA', '60°C', '0,50% em massa')}
${row('LSMGO_2010', 'Atende à norma ISO 8217:2010 Class F:DMA', '60°C', '0,10% em massa')}
  </div>`;

const downloads = `  <div class="table downloads">
${row('Situação', 'Inscrições encerradas')}
${row('Portal de Inscrições', 'CIEE - Processos públicos: <a href="https://pp.ciee.org.br/vitrine/16805/detalhe">Faça sua inscrição</a>')}
${row('Período de Inscrição', '21/05/2026 a 03/06/2026')}
${row('Recursos', `${doc('Respostas aos recursos Petrobras I', '/documents/d/respostas-i')}${doc('Respostas aos recursos Petrobras II', '/documents/d/respostas-ii')}`)}
${row('Edital', doc('Edital 2026', '/documents/d/edital-estagio-2026'))}
${row('Anexos', `${doc('Anexo I - Quadro de Vagas', '/documents/d/anexo-i')}${doc('Anexo II - Cursos Correlatos', '/documents/d/anexo-ii')}${doc('Anexo III - Cronograma', '/documents/d/anexo-iii')}`)}
  </div>`;

const page = `<div>
${TOP}
</div>
<div>
  <h1>Table (specifications)</h1>
  <p>Specifications variant: a bordered product/specification grid built from authored rows of cells. The first row is the header (grey background, bold), the rest are data rows with thin light borders. Source: petrobras.com.br/quem-somos/bunker</p>
${GAP}
${specifications}
${GAP}
</div>
<div>
  <h1>Table (downloads)</h1>
  <p>Downloads variant: a row-label table where cells containing links become green document-download links with a document icon. Source: petrobras.com.br/quem-somos/estagios</p>
${GAP}
${downloads}
${GAP}
</div>
`;

await writeFile(OUT, page);
process.stdout.write(`wrote ${OUT} (${page.length} bytes)\n`);
