/*
 * Build the tabs block-sample page.
 *
 * Demonstrates all three tabs variants (content / categories / explorer), each
 * with its own heading + description, wrapped in the standard block-sample
 * layout: a top-clearance spacer, then per-block a heading + description, a gap
 * spacer, the block, and a trailing gap spacer.
 *
 * The tabs content model is one row per tab: a label cell (optionally with a
 * leading icon image) + a panel cell (rich content). Variant is the 2nd class
 * on the block (content / categories / explorer).
 *
 * Idempotent: re-running overwrites the sample.
 *
 * Run: node tools/samples/build-tabs-sample.mjs
 */
import { writeFile } from 'node:fs/promises';

const OUT = 'content/drafts/block-samples/tabs.plain.html';

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

// One tab row: label cell (+ optional icon img) + panel cell (raw HTML).
const tab = (label, panelHtml, iconAlt) => {
  const icon = iconAlt
    ? `<img src="/icons/search.svg" alt="${iconAlt}"> `
    : '';
  return `    <div>
      <div>${icon}${label}</div>
      <div>${panelHtml}</div>
    </div>`;
};

const tabs = (variant, rows) => `  <div class="tabs ${variant}">\n${rows.join('\n')}\n  </div>`;

// --- content: horizontal folder tabs -------------------------------------
const content = tabs('content', [
  tab(
    'O que é a Ouvidoria',
    `<h3>Sobre a Ouvidoria-Geral</h3>
      <p>Criada em 2002 como assessoria da Presidência, a Ouvidoria-Geral é um canal direto com a sociedade e instância para a defesa de direitos, recebendo denúncias, reclamações, solicitações de informações, sugestões e elogios.</p>`,
  ),
  tab(
    'Atendimento',
    `<h3>Atendimento</h3>
      <p>Nossos canais conferem ampla acessibilidade aos públicos interno e externo da Petrobras. O atendimento presencial pode ser agendado pelo telefone 0800 2828280.</p>`,
  ),
  tab(
    'Ouvidora-Geral',
    `<h3>Ouvidora-Geral</h3>
      <p>Atuamos com autonomia, isenção e imparcialidade para cultivar diálogos francos e transparentes com todas as partes interessadas da Petrobras.</p>`,
  ),
  tab(
    'Números e Balanços',
    `<h3>Números e Balanços</h3>
      <p>Acompanhe nossos principais números e balanços anuais, com o registro das manifestações recebidas e das providências adotadas.</p>`,
  ),
]);

// --- categories: green icon/label pills switching product groups ---------
const productCard = (title, desc) => `<div>
          <p><strong>${title}</strong></p>
          <p>${desc}</p>
        </div>`;

const categories = tabs('categories', [
  tab(
    'Todos os Produtos',
    `${productCard('Diesel Marítimo', 'Ajuda as pessoas a navegarem com segurança em oceanos, mares e rios.')}
        ${productCard('Gasolina Podium', 'O melhor combustível do mercado para motores de alto desempenho.')}
        ${productCard('Gás Natural', 'Utilizado como combustível em diversas indústrias.')}`,
    'Ícone para filtrar todos os produtos',
  ),
  tab(
    'Automotivo',
    `${productCard('Gasolina Podium', 'Para carros com motores de alto desempenho e maior octanagem.')}
        ${productCard('Diesel', 'Principal fonte de energia de veículos de transporte de carga.')}`,
    'Ícone da categoria Automotivo',
  ),
  tab(
    'Aviação',
    `${productCard('Querosene de Aviação', 'Combustível usado principalmente no transporte aéreo comercial.')}
        ${productCard('SAF Petrobras', 'Combustível sustentável de aviação.')}`,
    'Ícone da categoria Aviação',
  ),
  tab(
    'Marítimos',
    `${productCard('Bunker', 'Óleo combustível marítimo para embarcações nos portos brasileiros.')}
        ${productCard('Diesel Verana', 'O primeiro diesel premium náutico do mercado.')}`,
    'Ícone da categoria Marítimos',
  ),
]);

// --- explorer: vertical icon + title tabs beside a species panel ---------
const speciesCard = (name, sciName, project) => `<div>
          <h4>${name}</h4>
          <p><em>Nome científico: ${sciName}</em></p>
          <p>${project}</p>
        </div>`;

const explorer = tabs('explorer', [
  tab(
    'Mamíferos aquáticos',
    `${speciesCard('Boto-cinza', 'Sotalia guianensis', 'Projeto de Monitoramento de Cetáceos na Bacia de Santos.')}
        ${speciesCard('Peixe-boi-marinho', 'Trichechus manatus', 'Projeto Viva o Peixe-Boi Marinho.')}`,
    'Ícone da aba Mamíferos aquáticos',
  ),
  tab(
    'Mamíferos terrestres',
    `${speciesCard('Onça-pintada', 'Panthera onca', 'Projeto Onde a Onça Bebe Água.')}
        ${speciesCard('Anta', 'Tapirus terrestris', 'Projeto Guapiaçu.')}`,
    'Ícone da aba Mamíferos terrestres',
  ),
  tab(
    'Aves',
    `${speciesCard('Trinta-réis-real', 'Thalasseus maximus', 'Projeto Aves Migratórias.')}
        ${speciesCard('Maçarico-de-costas-brancas', 'Limnodromus griseus', 'Projeto Aves Migratórias.')}`,
    'Ícone da aba Aves',
  ),
  tab(
    'Tartarugas',
    `${speciesCard('Tartaruga-de-pente', 'Eretmochelys imbricata', 'Projeto de Monitoramento de Praias.')}`,
    'Ícone da aba Tartarugas',
  ),
]);

const page = `<div>
${TOP}
</div>
<div>
  <h1>Tabs (content)</h1>
  <p>Content variant: horizontal "folder" tabs where the active tab reads as a continuous page of the panel below. Author each row as a label cell and a panel cell of rich content. Keyboard accessible (arrow keys, roving tabindex, ARIA tab/tabpanel). Source: the Ouvidoria page.</p>
${GAP}
${content}
${GAP}
  <h2>Tabs (categories)</h2>
  <p>Categories variant: a horizontal bar of green icon-over-label pills that switch groups of product cards. The active pill has a white border. The bar scrolls horizontally on mobile. Source: the Produtos page.</p>
${GAP}
${categories}
${GAP}
  <h2>Tabs (explorer)</h2>
  <p>Explorer variant: a vertical list of icon + title tabs beside a rich panel of cards. On mobile the panel sits above a horizontally scrollable tab strip; on desktop it becomes a two-column rail + panel layout. Source: the Biodiversidade page.</p>
${GAP}
${explorer}
${GAP}
</div>
`;

await writeFile(OUT, page);
process.stdout.write(`wrote ${OUT} (${page.length} bytes)\n`);
