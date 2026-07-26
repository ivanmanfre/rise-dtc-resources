#!/usr/bin/env node
/**
 * RISE DTC tools hub — formula test runner.
 *
 *   node tools/tests/run-tests.mjs            # normal
 *   node tools/tests/run-tests.mjs --verbose  # print every assertion
 *
 * Loads BOTH formula families (uniteco + adsemail) and BOTH vector files.
 * A missing family is SKIPPED loudly, not silently ignored, so this runner is
 * safe to run while a sibling family is still being written.
 *
 * Numeric match rule (per the spec's rounding contract: "all arithmetic in full
 * float, round only the displayed value"):
 *   an expected number passes if EITHER
 *     (a) |actual - expected| <= 1e-6                    -> raw / pre-rounding
 *     (b) round_half_up(actual, 2) === expected          -> money / x / ratio 2dp
 *     (c) round_half_up(actual, 1) === expected          -> percent / points / months 1dp
 * Strings, booleans and nulls must match exactly.
 */

import { createRequire } from 'node:module';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const HERE = dirname(fileURLToPath(import.meta.url));
const TOOLS_DIR = join(HERE, '..');

const VERBOSE = process.argv.includes('--verbose') || process.argv.includes('-v');

const FAMILIES = [
  { name: 'uniteco', formulas: join(TOOLS_DIR, 'assets', 'formulas-uniteco.js'), vectors: join(HERE, 'vectors-uniteco.json') },
  { name: 'adsemail', formulas: join(TOOLS_DIR, 'assets', 'formulas-adsemail.js'), vectors: join(HERE, 'vectors-adsemail.json') }
];

const EPS_RAW = 1e-6;
const EPS_ROUND = 1e-9;

/* ------------------------------------------------------------------ helpers */

// Round-half-away-from-zero, matching the reference Python verifier.
function roundHalfUp(x, dp) {
  const f = Math.pow(10, dp);
  return x >= 0
    ? Math.floor(x * f + 0.5) / f
    : -(Math.floor(-x * f + 0.5) / f);
}

function isNum(v) { return typeof v === 'number' && Number.isFinite(v); }

function numericMatch(actual, expected) {
  if (!isNum(actual)) return { ok: false, mode: null };
  if (Math.abs(actual - expected) <= EPS_RAW) return { ok: true, mode: 'raw' };
  if (Math.abs(roundHalfUp(actual, 2) - expected) <= EPS_ROUND) return { ok: true, mode: '2dp' };
  if (Math.abs(roundHalfUp(actual, 1) - expected) <= EPS_ROUND) return { ok: true, mode: '1dp' };
  return { ok: false, mode: null };
}

function show(v) {
  if (v === null) return 'null';
  if (v === undefined) return 'undefined';
  if (typeof v === 'number') return String(Number(v.toPrecision(12)));
  if (typeof v === 'string') return JSON.stringify(v);
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

/* --------------------------------------------------------------- comparison */

// Walks the expected value and pushes one assertion per leaf.
function compare(path, expected, actual, sink) {
  if (expected === null) {
    sink.push({ path, ok: actual === null || actual === undefined, expected, actual, mode: 'null' });
    return;
  }
  if (Array.isArray(expected)) {
    if (!Array.isArray(actual)) {
      sink.push({ path, ok: false, expected: '(array)', actual, mode: 'array' });
      return;
    }
    if (expected.length !== actual.length) {
      sink.push({ path: path + '.length', ok: false, expected: expected.length, actual: actual.length, mode: 'array' });
    }
    expected.forEach((el, i) => compare(`${path}[${i}]`, el, actual[i], sink));
    return;
  }
  if (typeof expected === 'object') {
    if (actual === null || typeof actual !== 'object') {
      sink.push({ path, ok: false, expected: '(object)', actual, mode: 'object' });
      return;
    }
    for (const k of Object.keys(expected)) compare(`${path}.${k}`, expected[k], actual[k], sink);
    return;
  }
  if (typeof expected === 'number') {
    const m = numericMatch(actual, expected);
    sink.push({ path, ok: m.ok, expected, actual, mode: m.mode || 'numeric' });
    return;
  }
  // string / boolean -> exact
  sink.push({ path, ok: actual === expected, expected, actual, mode: typeof expected });
}

/* --------------------------------------------------------------- vector I/O */

// Groups a flat [{slug, name, inputs, expected}, ...] list into per-tool blocks,
// preserving first-seen slug order.
function groupBySlug(rows) {
  const order = [];
  const bySlug = new Map();
  for (const row of rows) {
    const slug = row.slug;
    if (!bySlug.has(slug)) { bySlug.set(slug, []); order.push(slug); }
    bySlug.get(slug).push(row);
  }
  return order.map((slug) => ({ slug, test_vectors: bySlug.get(slug) }));
}

// Accepts, in order of preference:
//   { tools: [ {slug, test_vectors:[...]} ] }   (uniteco shape)
//   [ {slug, test_vectors:[...]} ]              (bare tools array)
//   [ {slug, inputs, expected} ]                (flat vector array)
//   { <slug>: {test_vectors:[...]} }            (slug-keyed map)
function normaliseVectors(doc) {
  if (Array.isArray(doc)) {
    if (!doc.length) return [];
    if (doc.every((r) => r && Array.isArray(r.test_vectors))) return doc;
    if (doc.every((r) => r && r.slug && r.inputs && r.expected)) return groupBySlug(doc);
    return doc;
  }
  if (doc && Array.isArray(doc.tools)) return doc.tools;
  if (doc && Array.isArray(doc.test_vectors)) return groupBySlug(doc.test_vectors);
  if (doc && typeof doc === 'object') {
    return Object.keys(doc)
      .filter((k) => doc[k] && Array.isArray(doc[k].test_vectors))
      .map((k) => ({ slug: doc[k].slug || k, ...doc[k] }));
  }
  return [];
}

/* -------------------------------------------------------------------- main */

let totalAssertions = 0;
let totalFailures = 0;
let totalVectors = 0;
let familiesRun = 0;
const skipped = [];
const failureLines = [];

for (const fam of FAMILIES) {
  const missing = [];
  if (!existsSync(fam.formulas)) missing.push(fam.formulas.replace(TOOLS_DIR, 'tools'));
  if (!existsSync(fam.vectors)) missing.push(fam.vectors.replace(TOOLS_DIR, 'tools'));
  if (missing.length) {
    skipped.push(`SKIP  ${fam.name}: not built yet (missing ${missing.join(' + ')})`);
    continue;
  }

  let lib, doc;
  try {
    lib = require(fam.formulas);
  } catch (err) {
    skipped.push(`SKIP  ${fam.name}: formulas file failed to load — ${err.message}`);
    continue;
  }
  try {
    doc = JSON.parse(readFileSync(fam.vectors, 'utf8'));
  } catch (err) {
    skipped.push(`SKIP  ${fam.name}: vectors file failed to parse — ${err.message}`);
    continue;
  }

  const tools = normaliseVectors(doc);
  if (!tools.length) {
    skipped.push(`SKIP  ${fam.name}: vectors file contained no tools`);
    continue;
  }

  familiesRun++;
  console.log(`\n=== ${fam.name} (${tools.length} tools) ===`);

  for (const tool of tools) {
    const slug = tool.slug;
    const impl = lib[slug];
    const vectors = tool.test_vectors || [];
    let toolAssertions = 0;
    let toolFailures = 0;

    if (!impl || typeof impl.compute !== 'function') {
      totalFailures += 1;
      failureLines.push(`${slug}: NO IMPLEMENTATION — RISE_TOOLS['${slug}'].compute is missing`);
      console.log(`FAIL  ${slug.padEnd(26)} no compute() registered`);
      continue;
    }

    for (const tv of vectors) {
      totalVectors++;
      const sink = [];
      let actual;
      try {
        actual = impl.compute(tv.inputs);
      } catch (err) {
        sink.push({ path: '(threw)', ok: false, expected: '(no throw)', actual: err.message, mode: 'throw' });
        actual = {};
      }
      for (const key of Object.keys(tv.expected)) {
        if (!(key in actual) && sink.length === 0) {
          sink.push({ path: key, ok: false, expected: tv.expected[key], actual: '(output not returned)', mode: 'missing' });
          continue;
        }
        compare(key, tv.expected[key], actual[key], sink);
      }
      for (const a of sink) {
        toolAssertions++;
        if (!a.ok) {
          toolFailures++;
          failureLines.push(
            `${slug} / ${tv.name} / ${a.path}: expected ${show(a.expected)}, got ${show(a.actual)}`
          );
        } else if (VERBOSE) {
          console.log(`      ok  ${slug} / ${tv.name} / ${a.path} = ${show(a.actual)} [${a.mode}]`);
        }
      }
    }

    totalAssertions += toolAssertions;
    totalFailures += toolFailures;
    const status = toolFailures === 0 ? 'PASS' : 'FAIL';
    console.log(
      `${status}  ${slug.padEnd(26)} ${String(vectors.length).padStart(2)} vectors, ` +
      `${String(toolAssertions).padStart(3)} assertions` +
      (toolFailures ? `, ${toolFailures} FAILED` : '')
    );
  }
}

if (skipped.length) {
  console.log('');
  for (const s of skipped) console.log(s);
}

if (failureLines.length) {
  console.log('\n--- failures ---');
  for (const l of failureLines) console.log('  ' + l);
}

console.log(
  `\nTOTAL: ${totalAssertions} assertions, ${totalFailures} failures ` +
  `(${totalVectors} vectors across ${familiesRun} famil${familiesRun === 1 ? 'y' : 'ies'})`
);

if (familiesRun === 0) {
  console.log('ERROR: no formula family could be loaded.');
  process.exit(1);
}
process.exit(totalFailures === 0 ? 0 : 1);
