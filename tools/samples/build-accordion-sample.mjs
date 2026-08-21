/*
 * Build the accordion block-sample page.
 *
 * Demonstrates all three accordion variants (base FAQ, downloads, table-docs)
 * each with its own heading, wrapped in the standard block-sample layout:
 * a top-clearance spacer, then per-block a heading + description, a gap
 * spacer, the block, and a trailing gap spacer.
 *
 * The accordion content model is one row per item: label cell + body cell.
 * Variants are the 2nd class on the block (downloads / table-docs).
 *
 * Idempotent: re-running overwrites the sample.
 *
 * Run: node tools/samples/build-accordion-sample.mjs
 */
import { writeFile } from 'node:fs/promises';

const OUT = 'content/drafts/block-samples/accordion.plain.html';

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

// One accordion row: label cell + body cell (body is raw HTML).
const row = (label, bodyHtml) => `    <div>
      <div>${label}</div>
      <div>${bodyHtml}</div>
    </div>`;

const accordion = (variant, rows) => {
  const cls = variant ? `accordion ${variant}` : 'accordion';
  return `  <div class="${cls}">\n${rows.join('\n')}\n  </div>`;
};

// --- base FAQ ------------------------------------------------------------
const faq = accordion('', [
  row(
    'Quais são as fontes de energia mais utilizadas na matriz energética brasileira?',
    '<p>A matriz energética brasileira é composta principalmente por fontes renováveis, como a energia hidráulica, a biomassa e os biocombustíveis, além do petróleo e do gás natural.</p>',
  ),
  row(
    'Qual o papel do petróleo na transição energética?',
    '<p>O petróleo permanece como parte da matriz energética nas próximas décadas, contribuindo para a segurança do suprimento enquanto novas fontes ganham escala.</p>',
  ),
  row(
    'Como as mudanças climáticas afetam a transição energética?',
    '<p>As mudanças climáticas aceleram a necessidade de reduzir emissões, ampliando investimentos em energias de baixo carbono e em eficiência energética.</p>',
  ),
  row(
    'Qual é o principal desafio do Brasil na transição energética?',
    '<p>O principal desafio é ampliar o acesso a energia limpa e acessível para todos, considerando o impacto social e econômico nos territórios.</p>',
  ),
]);

// --- downloads: body is a list of document links -------------------------
const downloads = accordion('downloads', [
  row(
    'Gasolina Petrobras Podium — Carbono Neutro',
    `<ul>
        <li><a href="/documents/gasolina-podium-avaliacao-ciclo-de-vida.pdf">Avaliação do ciclo de vida e compensação das emissões de GEE (PDF)</a></li>
        <li><a href="/documents/disclaimer-gasolina-podium.pdf">Informações sobre a compensação de emissões (PDF)</a></li>
        <li><a href="/documents/certificados-de-aposentadoria-dos-creditos.pdf">Certificados de Aposentadoria dos Créditos (PDF)</a></li>
      </ul>`,
  ),
  row(
    'Fichas com Dados de Segurança (FDS)',
    `<ul>
        <li><a href="/documents/fds-gasolina-podium.pdf">FDS — Gasolina Podium (PDF)</a></li>
        <li><a href="/documents/fds-diesel-podium.pdf">FDS — Diesel Podium (PDF)</a></li>
      </ul>`,
  ),
]);

// --- table-docs: body has a specs table + document links -----------------
const specTable = (rowsHtml) => `<table><tbody>${rowsHtml}</tbody></table>`;
const trow = (k, v) => `<tr><th>${k}</th><td>${v}</td></tr>`;

const tableDocs = accordion('table-docs', [
  row(
    'PETRÓLEO BRASILEIRO S.A. — PETROBRAS 2021',
    `${specTable([
    trow('Situação', 'Finalizado'),
    trow('Vagas', '757'),
    trow('Escolaridade', 'Nível Superior'),
    trow('Remuneração', 'R$ 11.716,82'),
    trow('Inscrições', 'Encerradas'),
  ].join(''))}
      <ul>
        <li><a href="/documents/edital-psp-2021.pdf">Edital de abertura (PDF)</a></li>
        <li><a href="/documents/resultado-final-psp-2021.pdf">Resultado final (PDF)</a></li>
      </ul>`,
  ),
  row(
    'PETRÓLEO BRASILEIRO S.A. — PETROBRAS 2018',
    `${specTable([
    trow('Situação', 'Finalizado'),
    trow('Vagas', '146'),
    trow('Escolaridade', 'Nível Superior'),
    trow('Inscrições', 'Encerradas'),
  ].join(''))}
      <ul>
        <li><a href="/documents/edital-psp-2018.pdf">Edital de abertura (PDF)</a></li>
        <li><a href="/documents/resultado-final-psp-2018.pdf">Resultado final (PDF)</a></li>
      </ul>`,
  ),
]);

const page = `<div>
${TOP}
</div>
<div>
  <h1>Accordion</h1>
  <p>Accordion block: a stacked list of expandable disclosure rows. Author each row as a label cell (the question/title) and a body cell (the answer). The base FAQ variant lays out as a two-column grid on desktop with a single-open behaviour; a rotating chevron marks the open state. Source: petrobras.com.br/transicao-energetica.</p>
${GAP}
${faq}
${GAP}
  <h2>Accordion (downloads)</h2>
  <p>Downloads variant: each row expands to a list of document/download links styled as green underlined links. Author the block as <strong>Accordion (downloads)</strong>. Source: petrobras.com.br/quem-somos/gasolina-podium.</p>
${GAP}
${downloads}
${GAP}
  <h2>Accordion (table-docs)</h2>
  <p>Table-docs variant: each row expands to a specifications table (label + value rows) followed by document links. Author the block as <strong>Accordion (table-docs)</strong>. Source: petrobras.com.br/quem-somos/concursos.</p>
${GAP}
${tableDocs}
${GAP}
</div>
`;

await writeFile(OUT, page);
process.stdout.write(`wrote ${OUT} (${page.length} bytes)\n`);
