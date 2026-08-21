/*
 * Build the web-story block-sample page.
 *
 * The web-story block replicates the portrait (~9:16) immersive web-story player
 * from petrobras.com.br/w/web-stories/...: a facade (portrait poster + play
 * button) that lazy-loads the story <iframe> on click (host allowlisted).
 * Authored as a table:
 *   | Web story URL |
 *   | Optional poster image + title |
 *
 * NOTE: at build time the specific source story was temporarily removed for the
 * Brazilian electoral "defeso" period (Jul–Oct 2026). We author the canonical
 * story URL so the container/facade demo faithfully; the embed will resolve when
 * the content returns.
 *
 * Idempotent: re-running overwrites the sample.
 * Run: node tools/samples/build-web-story-sample.mjs
 */
import { writeFile } from 'node:fs/promises';

const OUT = 'content/drafts/block-samples/web-story.plain.html';

const STORY = 'https://petrobras.com.br/w/web-stories/transicao-energetica/o-que-e-transicao-energetica';

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

const block = `  <div class="web-story">
    <div>
      <div><a href="${STORY}">${STORY}</a></div>
    </div>
    <div>
      <div>
        <h3>O que é transição energética?</h3>
      </div>
    </div>
  </div>`;

const page = `<div>
${TOP}
</div>
<div>
  <h1>Web Story (Custom Slider)</h1>
  <p>Web Story block: a portrait (~9:16) immersive story player. Shows a poster + play button facade; the real story iframe is only injected on click and only after the URL passes a host allowlist check (keep-it-100 + security). Author a cell with the story URL and an optional poster/title cell. Respects prefers-reduced-motion.</p>
${GAP}
${block}
${GAP}
</div>
`;

await writeFile(OUT, page);
process.stdout.write(`wrote ${OUT} (${page.length} bytes)\n`);
