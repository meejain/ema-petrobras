/*
 * Build the dashboard-tabs block-sample page.
 *
 * The dashboard-tabs block replicates the tabbed data-dashboard container from
 * petrobras.com.br/sustentabilidade/dados-abertos. The real dashboard lives in a
 * proprietary backend app (emissoes.petrobras.com.br); each tab here switches a
 * facade panel that lazy-loads that external dashboard iframe on click (host
 * allowlisted). Authored as a table, one row per tab:
 *   | Tab label | Embed URL | Optional poster/caption |
 *
 * Idempotent: re-running overwrites the sample.
 * Run: node tools/samples/build-dashboard-tabs-sample.mjs
 */
import { writeFile } from 'node:fs/promises';

const OUT = 'content/drafts/block-samples/dashboard-tabs.plain.html';

const EMBED = 'https://emissoes.petrobras.com.br/';

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

const TOP = spacer('180px', '170px', '96px');
const GAP = spacer('48px', null, '40px');

const tab = (label, caption) => `    <div>
      <div>${label}</div>
      <div><a href="${EMBED}">${EMBED}</a></div>
      <div>${caption}</div>
    </div>`;

const block = `  <div class="dashboard-tabs">
${tab('Ranking das emissões de GEE', 'Ranking animado das emissões históricas globais de gases de efeito estufa entre os países do G20.')}
${tab('Emissões globais por setores ou GEE', 'Distribuição das emissões globais por setores da economia ou por tipo de gás de efeito estufa.')}
${tab('Emissões por setores da economia', 'Comportamento das emissões de cada setor da economia ao longo das últimas décadas.')}
${tab('Fluxo de energia e emissões', 'Fluxo entre fontes de energia primária, consumo e emissões associadas.')}
  </div>`;

const page = `<div>
${TOP}
</div>
<div>
  <h1>Dashboard Tabs (Dados Abertos)</h1>
  <p>Dashboard Tabs block: an accessible tabbed container (role=tablist/tab/tabpanel, roving tabindex) mirroring the Dados Abertos dashboard. Each tab reveals a facade that lazy-loads the external, host-allowlisted dashboard iframe only on click (keep-it-100). Author one row per tab: label, embed URL, and an optional caption/poster.</p>
${GAP}
${block}
${GAP}
</div>
`;

await writeFile(OUT, page);
process.stdout.write(`wrote ${OUT} (${page.length} bytes)\n`);
