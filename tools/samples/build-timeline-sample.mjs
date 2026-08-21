/*
 * Build the timeline block-sample page.
 *
 * The timeline block has no authored source draft to lift from, so this script
 * carries the milestone content inline (lifted verbatim from the source widget
 * on petrobras.com.br/bolivia) and emits it as the standard EDS block table:
 * one authored row per milestone — a year cell followed by one section cell per
 * event (each section = a <strong> heading + a paragraph). It wraps the block in
 * the usual block-sample layout: a top-clearance spacer, a heading + one-line
 * description, and 48/40 gap spacers around the demonstrated block.
 *
 * Idempotent: re-running overwrites the sample.
 *
 * Run: node tools/samples/build-timeline-sample.mjs
 */
import { writeFile } from 'node:fs/promises';

const OUT = 'content/drafts/block-samples/timeline.plain.html';

// Milestones: [year, [ [heading, body], … ]]
const MILESTONES = [
  ['1996', [
    ['Petrobras llega a Bolivia', 'La integración energética entre Bolivia y Brasil permitió concretar el mayor negocio hidrocarburifero del país, con Petrobras como principal protagonista.'],
  ]],
  ['1998', [
    ['Primer pozo perforado en San Alberto', 'En este megacampo de más de 17 mil hectáreas, perforamos 14 pozos, construimos una planta de gas y un sistema de compresión.'],
  ]],
  ['1999', [
    ['Primer pozo perforado en San Antonio', 'Fue el Sábalo X-1. Con la perforación de 11 pozos más, este campo gasífero se convirtió en uno de los más grandes del país.'],
    ['Entra en operaciones el GASBOL', 'Su construcción empezó en 1997. Estuvo a cargo de consorcios de empresas bolivianas y brasileñas y fue financiado por Petrobras en el lado boliviano, con casi $us 400 millones.'],
    ['Ingresamos al segmento de downstream', 'Asumimos las operaciones de las refinerías de Santa Cruz y Cochabamba. Con una inversión de $us 101 millones, ampliamos la oferta de carburantes, introdujimos tecnología y modernos métodos de gestión.'],
  ]],
  ['2001', [
    ['Iniciamos la actividad de distribución de carburantes', 'La comercialización de combustibles la realizamos a través de grandes consumidores y una cadena de 104 estaciones de servicio con emblemas Petrobras, EBR, y bandera blanca.'],
  ]],
  ['2007', [
    ['Entre 2007 y 2014, produjimos el 60% del gas natural de Bolivia', 'Durante 12 años (2003-2014) la producción de gas natural de Petrobras se mantuvo por encima del 50% del total de la producción nacional. Nos concentramos en el segmento de Exploración y Producción.'],
  ]],
  ['2016', [
    ['Entra en operaciones el sistema de compresión SAL-ITU', 'La obra demandó una inversión de $us 156,6 millones. Generamos 1.170 empleos directos, de los cuales un 75% fue personal oriundo de las comunidades aledañas al bloque.'],
  ]],
  ['2019', [
    ['Se pone en marcha el sistema de compresión del bloque San Antonio', 'Demandó una inversión de $us 121 millones. Generamos 1.566 empleos directos, de los cuales un 59% fue personal oriundo de las comunidades aledañas al bloque.'],
  ]],
  ['2023', [
    ['Los campos que operamos producen 9.01 MMm3/de gas y 6.10 barriles de hidrocarburos líquidos', 'Estos volúmenes corresponden al promedio anual, que abarca hasta el 31 de diciembre del año.'],
  ]],
  ['2024', [
    ['Los campos que operamos producen 7,8MM m³ de gas y 5,2 barriles de hidrocarburos líquidos', 'Estos volúmenes corresponden al promedio anual, que abarca hasta el 31 de diciembre del año.'],
  ]],
];

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

// One authored row per milestone: year cell + one section cell per event.
const rowFor = ([year, sections]) => {
  const cells = [`    <div>${year}</div>`];
  sections.forEach(([heading, body]) => {
    cells.push(`    <div><p><strong>${heading}</strong></p><p>${body}</p></div>`);
  });
  return `  <div>\n${cells.join('\n')}\n  </div>`;
};

const block = `<div class="timeline">\n${MILESTONES.map(rowFor).join('\n')}\n</div>`;

const page = `<div>
${TOP}
</div>
<div>
  <h1>Timeline (linha do tempo)</h1>
  <p>Timeline block: an interactive milestone timeline. A strip of year markers sits on a horizontal green axis; selecting a year reveals that milestone's content panel (a large year beside one or more heading + text sections). Prev/next and first/last controls step through the milestones; markers are keyboard-operable (arrows, Home/End). Author each row as a year cell plus one section cell per event. Source: petrobras.com.br/bolivia.</p>
${GAP}
  ${block}
${GAP}
</div>
`;

await writeFile(OUT, page);
process.stdout.write(`wrote ${OUT} (${page.length} bytes)\n`);
