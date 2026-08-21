/*
 * Build the flipbook block-sample page.
 *
 * The flipbook block replicates the Issuu flipbook embed from
 * petrobras.com.br/sustentabilidade/mudancas-climaticas: a ~3:2 framed container
 * showing a facade (poster + open button) that lazy-loads the real Issuu
 * <iframe> on click (host allowlisted). Authored as a table:
 *   | Flipbook embed URL |
 *   | Optional poster image + caption |
 *
 * Idempotent: re-running overwrites the sample.
 * Run: node tools/samples/build-flipbook-sample.mjs
 */
import { writeFile } from 'node:fs/promises';

const OUT = 'content/drafts/block-samples/flipbook.plain.html';

// The measured source embed (Caderno de Mudanças Climáticas e Transição
// Energética 2025, published by estantepetrobras on Issuu).
const EMBED = 'https://e.issuu.com/embed.html?d=caderno_de_mudan_as_clim_ticas_e_transi_o_energ_t&u=estantepetrobras';

const spacer = (desktop, tablet, mobile) => {
  const rows = [
    ['Desktop', desktop],
    ...(tablet ? [['Tablet', tablet]] : []),
    ['Mobile', mobile],
  ];
  const cells = rows.map(([k, v]) => `    <div><div>${k}</div><div>${v}</div></div>`).join('\n');
  return `  <div class="spacer">\n${cells}\n  </div>`;
};

const TOP = spacer('180px', '170px', '96px');
const GAP = spacer('48px', null, '40px');

const block = `  <div class="flipbook">
    <div>
      <div><a href="${EMBED}">${EMBED}</a></div>
    </div>
    <div>
      <div>
        <h3>Caderno de Mudanças Climáticas e Transição Energética 2025</h3>
        <p>Confira o perfil da Matriz Energética no Brasil e no Mundo — leia o documento na íntegra.</p>
      </div>
    </div>
  </div>`;

const page = `<div>
${TOP}
</div>
<div>
  <h1>Flipbook (Issuu)</h1>
  <p>Flipbook block: a lazy Issuu viewer embed in a ~3:2 framed container. Shows a poster + open button facade; the real privacy-conscious iframe is only injected on click and only after the embed host passes an allowlist check (keep-it-100 + security). Author a cell with the embed URL and an optional poster/caption cell.</p>
${GAP}
${block}
${GAP}
</div>
`;

await writeFile(OUT, page);
process.stdout.write(`wrote ${OUT} (${page.length} bytes)\n`);
