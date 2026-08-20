/*
 * Transform the block-sample content pages:
 *   1. Replace the placeholder `hero` section (only there to push content clear
 *      of the fixed header) with a `spacer` block sized for that top clearance.
 *   2. Wrap the demonstrated sample block with `spacer` gaps so it has breathing
 *      room from the heading/description above and the page end below.
 *
 * Sample pages are section-structured .plain.html (one top-level <div> per EDS
 * section). This edits them programmatically rather than by hand. Idempotent:
 * re-running detects the already-swapped spacer and makes no further changes.
 *
 * Run: node tools/samples/add-spacers.mjs
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const DIR = 'content/drafts/block-samples';

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

// top clearance replacing the hero (desktop header 152px, mobile 56px)
const TOP = spacer('180px', '170px', '96px');
// gap around the sample
const GAP = spacer('48px', null, '40px');

const SAMPLE_BLOCK = /^\s*<div class="(cards|banner-notice|columns|featured-news|slider-cards|hero)\b/;

function splitSections(text) {
  // sections are delimited by column-0 <div> ... </div>
  const lines = text.replace(/\n$/, '').split('\n');
  const sections = [];
  let cur = null;
  let depth = 0;
  lines.forEach((line) => {
    if (line === '<div>' && depth === 0) { cur = [line]; depth = 1; return; }
    if (cur) {
      cur.push(line);
      if (line === '<div>' || /^<div\b/.test(line)) depth += 0; // col-0 only tracked below
    }
    // track balance only for the outermost boundary via exact col-0 tags
    if (cur && line === '</div>' ) {
      // a col-0 close ends the section
      sections.push(cur.join('\n'));
      cur = null; depth = 0;
    }
  });
  return sections;
}

function transform(text) {
  const sections = splitSections(text);
  if (!sections.length) return null; // e.g. single-line diagonal-split page — skip

  const out = [];
  let swappedHero = false;
  sections.forEach((sec) => {
    const isHeroPlaceholder = /class="hero"/.test(sec) && !/diagonal-split/.test(sec);
    if (isHeroPlaceholder && !swappedHero) {
      out.push(`<div>\n${TOP}\n</div>`);
      swappedHero = true;
      return;
    }
    // content section: wrap the sample block with gap spacers
    const lines = sec.split('\n');
    const blockIdx = lines.findIndex((l) => SAMPLE_BLOCK.test(l));
    if (blockIdx > 0 && !/class="spacer"/.test(sec)) {
      const closeIdx = lines.length - 1; // section close is last line; block is the last child
      const next = [
        ...lines.slice(0, blockIdx),
        GAP,
        ...lines.slice(blockIdx, closeIdx),
        GAP,
        lines[closeIdx],
      ];
      out.push(next.join('\n'));
      return;
    }
    out.push(sec);
  });
  return `${out.join('\n')}\n`;
}

const files = (await readdir(DIR)).filter((f) => f.endsWith('.plain.html'));
let changed = 0;
for (const f of files) {
  const path = join(DIR, f);
  const text = await readFile(path, 'utf8');
  if (/class="spacer"/.test(text)) { process.stdout.write(`skip (already has spacer): ${f}\n`); continue; }
  const next = transform(text);
  if (!next || next === text) { process.stdout.write(`skip (no change): ${f}\n`); continue; }
  await writeFile(path, next);
  changed += 1;
  process.stdout.write(`updated: ${f}\n`);
}
process.stdout.write(`\nDone. ${changed} file(s) updated.\n`);
