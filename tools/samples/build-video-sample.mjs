/*
 * Build the video block-sample page.
 *
 * The video block (variant: youtube) renders a lightweight facade — a YouTube
 * poster thumbnail plus an accessible play button — and only injects the real
 * <iframe> on click. Authored as a table with an optional heading/caption cell
 * and a cell holding a YouTube URL.
 *
 * The gasolina source video (xpLkO3QFLqI) is private, so its thumbnail cannot
 * load on a standalone sample; we use a public Petrobras channel video instead
 * so the facade poster renders. Swap the id/URL for the real one in authoring.
 *
 * Idempotent: re-running overwrites the sample.
 * Run: node tools/samples/build-video-sample.mjs
 */
import { writeFile } from 'node:fs/promises';

const OUT = 'content/drafts/block-samples/video.plain.html';

// A public Petrobras video (poster renders); source page uses xpLkO3QFLqI (private).
const VIDEO_URL = 'https://www.youtube.com/watch?v=LQNoXCaUDgw';

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

const block = `  <div class="video">
    <div>
      <div>
        <h3>De onde vem a gasolina?</h3>
        <p>Antes de chegar aos postos de combustível, a nossa gasolina passa por uma longa jornada — que começa a milhares de metros de profundidade!</p>
      </div>
    </div>
    <div>
      <div><a href="${VIDEO_URL}">${VIDEO_URL}</a></div>
    </div>
  </div>`;

const page = `<div>
${TOP}
</div>
<div>
  <h1>Video (YouTube)</h1>
  <p>Video block: a lazy YouTube embed. Shows the poster thumbnail with an accessible play button; the real privacy-friendly iframe is only injected on click (keep-it-100). Author an optional heading/caption cell and a cell with a YouTube URL.</p>
${GAP}
${block}
${GAP}
</div>
`;

await writeFile(OUT, page);
process.stdout.write(`wrote ${OUT} (${page.length} bytes)\n`);
