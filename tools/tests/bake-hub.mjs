/**
 * Bakes the hub tool list and the sitemap from the two sources of truth:
 *   tools/assets/tools-config.js   (order, title, promise, gate)
 *   tools/assets/schematics.js     (the 25 drawings and their captions)
 *
 * The hub tool list is STATIC markup in tools/index.html, not JS-rendered, so
 * the page reads with scripts off and a search crawler sees 25 links. This
 * script is how that markup stays honest: it rewrites only the regions between
 *   <!-- BAKE:wall-<family> -->  ...  <!-- /BAKE:wall-<family> -->
 * and leaves every other line of index.html alone. Re-run it after any change
 * to tools-config.js or schematics.js. Never hand-edit a tile.
 *
 *   node tools/tests/bake-hub.mjs            writes index.html + sitemap.xml
 *   node tools/tests/bake-hub.mjs --check    exits 1 if either is stale
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TOOLS = path.resolve(HERE, '..');
const CHECK = process.argv.includes('--check');

/* ---------------------------------------------------------------- sources */
const sandbox = { window: {}, document: { readyState: 'complete', querySelectorAll: () => [], querySelector: () => ({}), body: {}, addEventListener: () => {} } };
function load(file) {
  const src = fs.readFileSync(path.join(TOOLS, 'assets', file), 'utf8');
  new Function('window', 'document', 'globalThis', src)(sandbox.window, sandbox.document, sandbox.window);
}
load('tools-config.js');
load('schematics.js');
const CFG = sandbox.window.RISE_TOOLS_CONFIG;
const SCH = sandbox.window.RiseSchematics.all;

/* ------------------------------------------------------------ tile layout */
/* Anchors are the tiles that break the grid: a double-width plate, or an ink
   plate on a light band. Two per family, so a reader never scans six identical
   shells in a row. The two model-run tools are always anchors. */
const WIDE = new Set(['true-profit-per-order', 'ltv-cac-payback', 'mer-calculator', 'ad-copy-generator', 'email-roi-calculator', 'subject-line-grader']);
const INK = new Set(['ltv-cac-payback']);
const AI = new Set(['ad-copy-generator', 'subject-line-grader']);
const TAG = {
  'true-profit-per-order': ['', 'Start here'],
  'blended-roas-calculator': [' is-new', 'New'],
  'ad-copy-generator': [' is-run', 'Email to run &middot; AI'],
  'subject-line-grader': [' is-run', 'Email to run &middot; AI']
};
const FAMILIES = ['uniteco', 'ads', 'email'];
const STAMP = ['a', 'b', 'c'];

/* The Claude pack pages are hand-owned HTML under tools/claude/<slug>/ and are
   deliberately NOT in tools-config.js: they have no gate engine, no formulas
   and no place in the 25-tool numbering. The sitemap is still owned entirely
   by this script, so the nine URLs are listed here and appended after the
   calculators. Adding a tenth page means adding its slug to this list. */
const PACK_PAGES = [
  'margin-interrogation',
  'fit-promise-audit',
  'promo-calendar',
  'return-note-miner',
  'creative-referee',
  'size-curve-planner',
  'returns-audit-20',
  'ads-paying-15',
  'price-a-drop-30'
];

/* The ChatGPT editions of the same nine items live under tools/gpt/<slug>/,
   hand-owned HTML like the Claude pages. Same rule: adding one means adding
   its slug here. */
const GPT_PACK_PAGES = PACK_PAGES.slice();

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function tile(slug) {
  const c = CFG[slug];
  const s = SCH[slug];
  if (!s) throw new Error('no schematic for ' + slug);
  /* an ink tile carries .on-ink so its schematic inverts to white strokes.
     Without it the drawing is ink on ink and only the gold answer survives. */
  const dark = INK.has(slug) || AI.has(slug);
  const cls = ['tile', WIDE.has(slug) ? 'wide' : '', INK.has(slug) ? 'ink' : '', AI.has(slug) ? 'is-ai' : '', dark ? 'on-ink' : '']
    .filter(Boolean).join(' ');
  const stamp = STAMP[(Number(c.order) - 1) % 3];
  const t = TAG[slug];
  const tag = t ? `<span class="t-tag${t[0]}">${t[1]}</span>` : '';
  return [
    `      <a class="${cls}" href="./${slug}/">`,
    `        <span class="t-fig" data-grid="${stamp}" data-sch="${slug}">${s.svg}</span>`,
    `        <span class="t-body">`,
    `          <span class="t-top"><span class="numeral t-n light">${c.order}</span>${tag}</span>`,
    `          <span class="t-name">${esc(c.title)}</span>`,
    `          <span class="t-promise">${esc(c.promise)}</span>`,
    `          <span class="t-cap">${esc(s.cap)}</span>`,
    `        </span>`,
    `      </a>`
  ].join('\n');
}

function wall(family) {
  return Object.keys(CFG)
    .filter((s) => CFG[s].family === family)
    .sort((a, b) => Number(CFG[a].order) - Number(CFG[b].order))
    .map(tile)
    .join('\n\n');
}

/* ------------------------------------------------------------------ write */
const hubPath = path.join(TOOLS, 'index.html');
let hub = fs.readFileSync(hubPath, 'utf8');
let baked = hub;
for (const fam of FAMILIES) {
  const open = `<!-- BAKE:wall-${fam} -->`;
  const close = `<!-- /BAKE:wall-${fam} -->`;
  const re = new RegExp(open.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[\\s\\S]*?' + close.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (!re.test(baked)) throw new Error('missing bake markers for ' + fam);
  baked = baked.replace(re, open + '\n' + wall(fam) + '\n      ' + close);
}

const slugs = Object.keys(CFG).sort((a, b) => Number(CFG[a].order) - Number(CFG[b].order));
const today = '2026-07-26';
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  '  <url>',
  '    <loc>https://resources.risedtc.com/tools/</loc>',
  `    <lastmod>${today}</lastmod>`,
  '    <changefreq>monthly</changefreq>',
  '    <priority>1.0</priority>',
  '  </url>',
  ...slugs.flatMap((s) => ([
    '  <url>',
    `    <loc>https://resources.risedtc.com/tools/${s}/</loc>`,
    `    <lastmod>${today}</lastmod>`,
    '    <changefreq>monthly</changefreq>',
    '    <priority>0.8</priority>',
    '  </url>'
  ])),
  ...PACK_PAGES.flatMap((s) => ([
    '  <url>',
    `    <loc>https://resources.risedtc.com/tools/claude/${s}/</loc>`,
    `    <lastmod>${today}</lastmod>`,
    '    <changefreq>monthly</changefreq>',
    '    <priority>0.7</priority>',
    '  </url>'
  ])),
  ...GPT_PACK_PAGES.flatMap((s) => ([
    '  <url>',
    `    <loc>https://resources.risedtc.com/tools/gpt/${s}/</loc>`,
    `    <lastmod>2026-08-05</lastmod>`,
    '    <changefreq>monthly</changefreq>',
    '    <priority>0.7</priority>',
    '  </url>'
  ])),
  '</urlset>',
  ''
].join('\n');

const smPath = path.join(TOOLS, 'sitemap.xml');
if (CHECK) {
  const smNow = fs.existsSync(smPath) ? fs.readFileSync(smPath, 'utf8') : '';
  const stale = baked !== hub || sitemap !== smNow;
  console.log(stale ? 'STALE: re-run node tools/tests/bake-hub.mjs' : 'bake is current');
  process.exit(stale ? 1 : 0);
}
fs.writeFileSync(hubPath, baked);
fs.writeFileSync(smPath, sitemap);
console.log('baked ' + slugs.length + ' tiles into index.html, ' +
  (slugs.length + PACK_PAGES.length + GPT_PACK_PAGES.length + 1) + ' urls into sitemap.xml');
