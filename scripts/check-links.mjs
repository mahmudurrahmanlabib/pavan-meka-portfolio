// Checks every link and asset in the built site. Run `npm run build` first.
// Exits with code 1 if anything is broken.

import { readFile, readdir, stat } from 'node:fs/promises';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
// Sites that block automated requests; a non-2xx from them is a warning, not a failure.
const BOT_WALLED = ['linkedin.com'];

const broken = [];
const warnings = [];
const external = new Map();

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(path)));
    else out.push(path);
  }
  return out;
}

const exists = (path) =>
  stat(path).then(
    (s) => s.isFile(),
    () => false,
  );

async function resolveLocal(fromFile, url) {
  const clean = decodeURI(url.split(/[?#]/)[0]);
  let path = clean.startsWith('/') ? join(DIST, clean) : join(dirname(fromFile), clean);
  if (clean.endsWith('/') || clean === '') path = join(path, 'index.html');
  if (await exists(path)) return path;
  if (!extname(path)) {
    for (const candidate of [`${path}.html`, join(path, 'index.html')]) {
      if (await exists(candidate)) return candidate;
    }
  }
  return null;
}

const idsIn = (html) => new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));

const files = await walk(DIST);
const pages = files.filter((f) => f.endsWith('.html'));
const styles = files.filter((f) => f.endsWith('.css'));
let checked = 0;

for (const page of pages) {
  const html = await readFile(page, 'utf8');
  const ids = idsIn(html);
  const where = relative(DIST, page);

  const refs = [...html.matchAll(/\s(href|src)="([^"]*)"/g)].map((m) => [m[1], m[2]]);
  for (const [, set] of html.matchAll(/\ssrcset="([^"]*)"/g)) {
    for (const candidate of set.split(',')) refs.push(['srcset', candidate.trim().split(/\s+/)[0]]);
  }

  for (const [attr, url] of refs) {
    checked++;
    if (url === '' || url === '#') broken.push(`${where}: empty ${attr}`);
    else if (url.startsWith('#')) {
      if (!ids.has(url.slice(1))) broken.push(`${where}: ${url} has no matching id`);
    } else if (url.startsWith('mailto:')) {
      if (!/^mailto:[^@\s]+@[^@\s]+\.[^@\s]+$/.test(url)) broken.push(`${where}: bad ${url}`);
    } else if (/^https?:\/\//.test(url)) {
      external.set(url, where);
    } else if (!/^(tel|data):/.test(url)) {
      const target = await resolveLocal(page, url);
      if (!target) broken.push(`${where}: ${url} not found in dist/`);
      else if (url.includes('#') && target.endsWith('.html')) {
        const hash = url.split('#')[1];
        if (hash && !idsIn(await readFile(target, 'utf8')).has(hash)) broken.push(`${where}: ${url} has no matching id`);
      }
    }
  }
}

for (const sheet of styles) {
  const css = await readFile(sheet, 'utf8');
  for (const [, raw] of css.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
    if (/^(data:|https?:|#)/.test(raw)) continue;
    checked++;
    if (!(await resolveLocal(sheet, raw))) broken.push(`${relative(DIST, sheet)}: ${raw} not found in dist/`);
  }
}

for (const [url, where] of external) {
  checked++;
  const walled = BOT_WALLED.some((host) => new URL(url).hostname.endsWith(host));
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(10_000),
      headers: { 'user-agent': 'Mozilla/5.0 (link check)' },
    });
    if (res.ok) continue;
    const note = `${where}: ${url} returned ${res.status}`;
    if (walled || [403, 429].includes(res.status)) warnings.push(`${note} (site blocks bots; open it in a browser to confirm)`);
    else broken.push(note);
  } catch (err) {
    warnings.push(`${where}: ${url} could not be reached (${err.cause?.code ?? err.name})`);
  }
}

console.log(`Checked ${checked} links and assets across ${pages.length} page(s).`);
for (const w of warnings) console.log(`  warn  ${w}`);
for (const b of broken) console.log(`  FAIL  ${b}`);
if (broken.length) process.exit(1);
if (!warnings.length) console.log('  All good.');
