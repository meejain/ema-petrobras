/*
 * Build the downloads block-sample page.
 *
 * Emits the standard block-sample layout (top-clearance spacer, heading +
 * description, gap spacers around the demonstrated block) with a "downloads
 * (list)" block: a list of downloadable documents, each authored as a row.
 *
 * Content model per row:
 *   - one cell = the document link (link text = title, href = the file)
 *   - an optional leading cell = a short descriptive / file label
 *
 * Source parity: petrobras.com.br/bolivia (the downloadable-documents rows).
 * Idempotent: re-running overwrites the sample.
 *
 * Run: node tools/samples/build-downloads-sample.mjs
 */
import { writeFile } from 'node:fs/promises';

const OUT = 'content/drafts/block-samples/downloads.plain.html';

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

// Each row is one document. First form: label cell + link cell. Second form:
// link only. The block drops rows without a link and ignores lone labels.
const docs = [
  ['Informaciones acerca del Marco Legal', 'Ser proveedor de Petrobras Bolivia (PDF)', 'https://petrobras.com.br/documents/2677942/0/Ser+proveedor+de+Petrobras+Bolivia.pdf?download=true'],
  ['Proveedor Nacional y Extranjero', 'Requisitos de habilitación (PDF)', 'https://petrobras.com.br/documents/2677942/0/Proveedor+Nacional+y+Extranjero.pdf?download=true'],
  [null, 'Programa Anual de Contratación (PAC) Petrobras 2026', 'https://petrobras.com.br/documents/2677942/41758490/Anexo+1_PAC+2026+Petrobras+Bolivia.pdf?download=true'],
  [null, 'Link al programa de Compliance Petrobras', 'https://petrobras.com.br/documents/2677942/13003231/Programa+de+Compliance+de+Petrobras_esp.pdf?download=true'],
  [null, 'Acceda al Código de Conducta Ética', 'https://petrobras.com.br/documents/2677942/13003231/2025+Codigo+de+Conducta+Etica+PEB.pdf?download=true'],
];

const rows = docs.map(([label, title, href]) => {
  const link = `<div><a href="${href}">${title}</a></div>`;
  return label
    ? `    <div><div>${label}</div>${link}</div>`
    : `    <div>${link}</div>`;
}).join('\n');

const block = `  <div class="downloads">\n${rows}\n  </div>`;

const page = `<div>
${TOP}
</div>
<div>
  <h1>Downloads (list)</h1>
  <p>Downloads block: a single-column list of downloadable documents. Each authored row is one document — a cell with a single link (text = title, href = the file), plus an optional leading cell for a short descriptive label above the affordance. Each item shows a green download icon and a bold green underlined link; document links open in a new tab and download. Source: petrobras.com.br/bolivia.</p>
${GAP}
${block}
${GAP}
</div>
`;

await writeFile(OUT, page);
process.stdout.write(`wrote ${OUT} (${page.length} bytes)\n`);
