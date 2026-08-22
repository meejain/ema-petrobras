/*
 * Build the new-energy block-sample page.
 *
 * The "new energy sources" section (source ".section-slider-white") is the
 * white/grey sibling of the green energy-journey scrollytelling. It is authored
 * as the SAME block with a `new-energy` variant class:
 *   row 0 (intro): a wind-turbine Lottie link + an <h2> + an intro <p>.
 *   row 1..n (stages): [ empty media cell ][ content cell: an upper statement
 *     <p>, a "What makes it possible for us…" connector <p>, a lower statement
 *     <p>, and an optional link ].
 *
 * On desktop the section pins and each scroll step reveals a statement pair with
 * a grey draw-line and a gold-active dot-rail; on mobile it flows vertically.
 * The turbine Lottie is the source's own animation, hosted LOCALLY.
 *
 * Idempotent: re-running overwrites the sample.
 *
 * Run: node tools/samples/build-new-energy-sample.mjs
 */
import { writeFile } from 'node:fs/promises';

const OUT = 'content/drafts/block-samples/new-energy.plain.html';
const MEDIA = '/media-da/drafts/block-samples/energy-journey';

const spacer = (desktop, tablet, mobile) => {
  const rows = [
    ['Desktop', desktop],
    ...(tablet ? [['Tablet', tablet]] : []),
    ['Mobile', mobile],
  ];
  const cells = rows.map(([k, v]) => `    <div><div>${k}</div><div>${v}</div></div>`).join('\n');
  return `  <div class="spacer">\n${cells}\n  </div>`;
};

const TOP = spacer('120px', '110px', '84px');

// one stage: [ empty media ][ upper statement + connector + lower statement (+link) ]
const stage = (upper, lower, linkText, href) => `    <div>
      <div></div>
      <div>
        <p>${upper}</p>
        <p>What makes it possible for us…</p>
        <p>${lower}</p>
${linkText ? `        <p><a href="${href}">${linkText}</a></p>` : ''}
      </div>
    </div>`;

const stages = [
  stage(
    'We have unique expertise and technical capacity to operate in deep and ultra-deep waters',
    'To have a privileged position for the generation of offshore wind energy, crucial to position Brazil as one of the global leaders in clean energy',
    null,
    null,
  ),
  stage(
    'We are major producers of natural gas, known as the “transition fuel” from fossil to renewable sources',
    'To be pioneers in the generation of green hydrogen (H2V), one of the key fuels for the energy transition',
    null,
    null,
  ),
  stage(
    'We have drawn up a strategic and investment plan to convert our refining units into bio-petro-gas refineries',
    'To idealize and process new generation fuels, focusing on low-carbon energy and reducing CO2 emissions',
    'Read about our biorefining',
    'https://petrobras.com.br/en/quem-somos/refino',
  ),
];

const block = `<div>
${TOP}
</div>
<div>
  <div class="energy-journey new-energy">
    <div>
      <p><a href="${MEDIA}/anim-turbine.json">Wind turbine animation</a></p>
      <h2>With research and innovation, new technologies become new energy sources</h2>
      <p>Our experience and technical excellence will apply to diversify our operations, focusing on the development of bioproducts and on other frontiers of renewable energy.</p>
    </div>
${stages.join('\n')}
  </div>
</div>
<div>
  <h1>New Energy Sources</h1>
  <p>The white/grey sibling of the Energy Journey scrollytelling (source "new energy sources"). It uses the same pinned stepper as a <strong>new-energy</strong> variant: the intro shows a line-drawn wind-turbine Lottie; each scroll step reveals a capability statement pair joined by a "What makes it possible for us…" connector, with a grey draw-line and a gold-active dot-rail. On mobile it flows vertically. Author as <strong>Energy Journey</strong> with the <strong>new-energy</strong> variant: first row is the intro (turbine link + title), each following row is a statement pair.</p>
  <p>Source: <a href="https://petrobras.com.br/en/jornada-da-energia">https://petrobras.com.br/en/jornada-da-energia</a></p>
</div>
`;

await writeFile(OUT, block);
process.stdout.write(`wrote ${OUT} (${block.length} bytes)\n`);
