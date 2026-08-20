/*
 * Build the orgchart block-sample page.
 *
 * Rather than hand-authoring the (very large) orgchart content, this script
 * extracts the already-authored `<div class="orgchart">…</div>` block verbatim
 * from the Lideranças draft and wraps it in the standard block-sample layout:
 * a top-clearance spacer, a heading + description section, and gap spacers
 * around the demonstrated block (same shape as the other block-samples).
 *
 * Idempotent: re-running overwrites the sample with the current source block.
 *
 * Run: node tools/samples/build-orgchart-sample.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';

const SOURCE = 'content/drafts/rusmeen/quem-somos/liderancas.plain.html';
const OUT = 'content/drafts/block-samples/orgchart.plain.html';

// Extract a balanced <div class="orgchart"> … </div> from the source markup.
function extractBlock(html, className) {
  const openRe = new RegExp(`<div class="${className}"`);
  const start = html.search(openRe);
  if (start === -1) throw new Error(`block .${className} not found in ${SOURCE}`);

  // Walk div tags from `start`, tracking depth, until the matching close.
  const tagRe = /<div\b[^>]*>|<\/div>/g;
  tagRe.lastIndex = start;
  let depth = 0;
  let m;
  while ((m = tagRe.exec(html)) !== null) {
    if (m[0].startsWith('</')) depth -= 1;
    else depth += 1;
    if (depth === 0) return html.slice(start, m.index + m[0].length);
  }
  throw new Error(`unbalanced .${className} block in ${SOURCE}`);
}

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

const html = await readFile(SOURCE, 'utf8');
const block = extractBlock(html, 'orgchart');

const page = `<div>
${TOP}
</div>
<div>
  <h1>Orgchart (Organograma)</h1>
  <p>Orgchart block: a colour-coded organizational hierarchy. A vertical spine of top-level nodes with a horizontal, scrollable slider of executive-directorate branch columns below it. Cards flip on click to reveal the responsible person; a bordered legend maps the role-category colours. Author each node as: color | area | responsible | contact | link | group (group = "spine" or "col-N").</p>
${GAP}
  ${block}
${GAP}
</div>
`;

await writeFile(OUT, page);
process.stdout.write(`wrote ${OUT} (${page.length} bytes)\n`);
