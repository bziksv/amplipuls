#!/usr/bin/env node
/**
 * Migration script: downloads assets from amplipuls.su and prepares static site files.
 */
import { mkdir, writeFile, readFile, access } from 'node:fs/promises';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PUBLIC = join(ROOT, 'public');
const BASE_URL = 'https://amplipuls.su';

async function ensureDir(path) {
  await mkdir(path, { recursive: true });
}

async function download(url, destPath) {
  try {
    await access(destPath);
    return false; // already exists
  } catch {
    // continue
  }
  await ensureDir(dirname(destPath));
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed ${url}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(destPath, buf);
  return true;
}

function cleanPath(urlPath) {
  return urlPath.split('?')[0].split('#')[0];
}

function localPath(urlPath) {
  const clean = cleanPath(urlPath);
  if (clean.startsWith('/bitrix/templates/ranx-landing/')) {
    return join(PUBLIC, clean.replace('/bitrix/templates/ranx-landing/', ''));
  }
  if (clean.startsWith('/upload/')) {
    return join(PUBLIC, clean.slice(1));
  }
  if (clean.startsWith('/bitrix/')) {
    return join(PUBLIC, 'bitrix', clean.replace('/bitrix/', ''));
  }
  return join(PUBLIC, clean.replace(/^\//, ''));
}

function rewriteUrl(urlPath) {
  const clean = cleanPath(urlPath);
  if (clean.startsWith('/bitrix/templates/ranx-landing/')) {
    return clean.replace('/bitrix/templates/ranx-landing/', '/');
  }
  return clean;
}

async function main() {
  console.log('Fetching homepage...');
  const htmlRes = await fetch(BASE_URL + '/');
  const html = await htmlRes.text();

  // Extract asset URLs
  const assetPatterns = [
    /(?:src|href|data-src|data-lazy|xlink:href)=["'](\/[^"']+)["']/gi,
    /url\(["']?(\/[^"')]+)["']?\)/gi,
  ];

  const assets = new Set();
  for (const pattern of assetPatterns) {
    let m;
    while ((m = pattern.exec(html)) !== null) {
      const p = m[1];
      if (p.match(/\.(css|js|png|jpe?g|gif|webp|svg|ico|pdf|woff2?|ttf|eot)(\?|$)/i)) {
        assets.add(cleanPath(p));
      }
    }
  }

  // Add CSS files from head
  assets.add('/bitrix/cache/css/s1/ranx-landing/template_68e1023b4a95c00156f3535714c3b273/template_68e1023b4a95c00156f3535714c3b273_v1.css');
  assets.add('/bitrix/cache/css/s1/ranx-landing/page_35bf5371bd90ba5c17312e8b6519e529/page_35bf5371bd90ba5c17312e8b6519e529_v1.css');

  console.log(`Downloading ${assets.size} assets...`);
  let downloaded = 0;
  for (const asset of assets) {
    const dest = localPath(asset);
    const url = BASE_URL + asset;
    try {
      if (await download(url, dest)) downloaded++;
    } catch (e) {
      console.warn(`  SKIP: ${asset} - ${e.message}`);
    }
  }
  console.log(`Downloaded ${downloaded} new files`);

  // Copy CSS to src/styles
  const stylesDir = join(ROOT, 'src', 'styles');
  await ensureDir(stylesDir);
  const templateCss = await readFile(join(PUBLIC, 'bitrix/cache/css/s1/ranx-landing/template_68e1023b4a95c00156f3535714c3b273/template_68e1023b4a95c00156f3535714c3b273_v1.css'));
  const pageCss = await readFile(join(PUBLIC, 'bitrix/cache/css/s1/ranx-landing/page_35bf5371bd90ba5c17312e8b6519e529/page_35bf5371bd90ba5c17312e8b6519e529_v1.css'));
  await writeFile(join(stylesDir, 'template.css'), templateCss);
  await writeFile(join(stylesDir, 'page.css'), pageCss);

  // Extract and clean body HTML
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (!bodyMatch) throw new Error('No body found');

  let body = bodyMatch[1];

  // Remove all script tags
  body = body.replace(/<script[\s\S]*?<\/script>/gi, '');

  // Remove Bitrix hidden inputs
  body = body.replace(/<input[^>]*name="sessid"[^>]*>/gi, '');
  body = body.replace(/<input[^>]*name="FORM_CODE"[^>]*>/gi, '');

  // Rewrite asset paths
  body = body.replace(/(?:src|href|data-src|data-lazy)=["'](\/[^"']+)["']/gi, (match, p) => {
    return match.replace(p, rewriteUrl(p));
  });
  body = body.replace(/xlink:href=["'](\/[^"']+)["']/gi, (match, p) => {
    const rewritten = rewriteUrl(p);
    const withFragment = rewritten.match(/\.svg$/i) ? rewritten + '#main' : rewritten;
    return match.replace(p, withFragment);
  });

  // Extract inline styles from head
  const inlineStyles = [];
  const styleMatches = html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi);
  for (const m of styleMatches) {
    inlineStyles.push(m[1]);
  }

  // Extract body class and attributes
  const bodyTag = html.match(/<body([^>]*)>/i);
  const bodyAttrs = bodyTag ? bodyTag[1] : '';

  await ensureDir(join(ROOT, 'src', 'data'));
  await writeFile(join(ROOT, 'src', 'data', 'body.html'), body);
  await writeFile(join(ROOT, 'src', 'data', 'body-attrs.txt'), bodyAttrs);
  await writeFile(join(ROOT, 'src', 'data', 'inline-styles.css'), inlineStyles.join('\n'));

  // Extract inline body scripts (sliders, masks, metrics)
  const bodyScripts = [...body.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
  const keepScripts = bodyScripts.filter((s) => {
    const t = s.trim();
    return t && !t.includes('ymaps.ready') && !t.includes('mc.yandex.ru/metrika');
  });
  await writeFile(
    join(ROOT, 'public', 'js', 'inline-blocks.js'),
    keepScripts.map((s) => s.trim()).join('\n\n')
  );

  // Extract title and meta
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1] || '';
  const favicon = '/assets/img/favicon.ico';
  await writeFile(join(ROOT, 'src', 'data', 'meta.json'), JSON.stringify({ title, favicon }, null, 2));

  console.log('Migration complete!');
  console.log(`  Body HTML: ${body.length} chars`);
  console.log(`  Inline styles: ${inlineStyles.length} blocks`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
