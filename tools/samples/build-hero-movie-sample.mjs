/*
 * Build the hero-movie block-sample page.
 *
 * The hero (movie) variant is a full-bleed autoplaying background VIDEO with a
 * white title + subtitle overlaid at the bottom-left (source: the hero at the
 * top of petrobras.com.br/en/jornada-da-energia). Authored as one row, two
 * cells: a media cell with a link to the .mp4 (optionally a poster image), and
 * a content cell with an <h1> heading + a body <p> subtitle.
 *
 * The block MUST be wrapped in a section <div> (a bare top-level <div> becomes
 * a SECTION in EDS .plain.html and would never decorate as a block). The hero
 * is the FIRST section with no leading spacer so it sits full-bleed under the
 * transparent/overlay header, exactly like the source.
 *
 * Idempotent: re-running overwrites the sample.
 *
 * Run: node tools/samples/build-hero-movie-sample.mjs
 */
import { writeFile } from 'node:fs/promises';

const OUT = 'content/drafts/block-samples/hero-movie.plain.html';

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

const GAP = spacer('48px', null, '40px'); // breathing room around the explainer

// The video source (mp4) is authored as a plain link in the media cell; the
// block injects a muted/looped/inline background <video> from it (host-
// allowlisted). This is the exact source hero movie.
const VIDEO = 'https://petrobras.com.br/documents/d/f3a44542-113e-11ee-be56-0242ac120002/hero';

const block = `<div>
  <div class="hero movie">
    <div>
      <div><a href="${VIDEO}">Vídeo de fundo da Jornada da Energia</a></div>
      <div>
        <h1>The Journey of Energy</h1>
        <p>Energy is not lost, nor is it created. She transforms. Ours, in particular, goes through a long journey to become industrial inputs, innovations, fuels and much more. Come with us!</p>
      </div>
    </div>
  </div>
</div>
<div>
${GAP}
  <h2>Hero (movie)</h2>
  <p>Hero variant rendered as a full-bleed autoplaying background video with a white title and subtitle overlaid at the bottom-left, over a bottom-darkening gradient. The video is muted, looped, inline, and paused when the visitor prefers reduced motion; its host is allowlisted before injection. Author the block as <strong>Hero (movie)</strong> with a media cell (a link to the .mp4) and a content cell (heading + subtitle).</p>
  <p>Source: <a href="https://petrobras.com.br/en/jornada-da-energia">https://petrobras.com.br/en/jornada-da-energia</a></p>
${GAP}
</div>
`;

await writeFile(OUT, block);
process.stdout.write(`wrote ${OUT} (${block.length} bytes)\n`);
