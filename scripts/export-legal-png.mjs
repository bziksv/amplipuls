#!/usr/bin/env node
/**
 * Export legal documents as PNG from src/data/legal/*.html
 * Usage: node scripts/export-legal-png.mjs
 */
import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'public', 'upload');
const EXPORT_DIR = join(ROOT, 'public', 'legal-export');
const PORT = 4173;
const BASE = `http://127.0.0.1:${PORT}`;

const DOCS = [
  {
    source: 'personal-data-processing.html',
    slug: 'politics',
    file: 'politics-amplipuls.png',
    title: 'Политика обработки персональных данных',
  },
  {
    source: 'consent.html',
    slug: 'consent',
    file: 'soglasie-pdn-amplipuls.png',
    title: 'Согласие на обработку персональных данных',
  },
  {
    source: 'cookie-policy.html',
    slug: 'cookies',
    file: 'cookies-amplipuls.png',
    title: 'Политика использования cookie-файлов',
  },
  {
    source: 'recommendation.html',
    slug: 'recommendation',
    file: 'rules-recomendation-amplipuls.png',
    title: 'Правила применения рекомендательных технологий',
  },
];

function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tick = async () => {
      try {
        const res = await fetch(url);
        if (res.ok) return resolve();
      } catch {
        // retry
      }
      if (Date.now() - start > timeoutMs) {
        return reject(new Error(`Server did not start at ${url}`));
      }
      setTimeout(tick, 250);
    };
    tick();
  });
}

async function buildExportPages() {
  await mkdir(EXPORT_DIR, { recursive: true });

  for (const doc of DOCS) {
    const content = await readFile(join(ROOT, 'src/data/legal', doc.source), 'utf8');
    const html = `<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${doc.title}</title>
    <link rel="stylesheet" href="/css/fonts.css" />
    <link rel="stylesheet" href="/css/legal.css" />
  </head>
  <body class="legal-body">
    <article class="legal-page">
      <h1 class="legal-page__title">${doc.title}</h1>
      <div class="legal-doc">${content}</div>
    </article>
  </body>
</html>
`;
    await writeFile(join(EXPORT_DIR, `${doc.slug}.html`), html, 'utf8');
  }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  await buildExportPages();

  const server = spawn('npx', ['--yes', 'serve', 'public', '-l', String(PORT)], {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let serverLog = '';
  server.stdout.on('data', (chunk) => {
    serverLog += chunk.toString();
  });
  server.stderr.on('data', (chunk) => {
    serverLog += chunk.toString();
  });

  try {
    await waitForServer(`${BASE}/`);

    const browser = await chromium.launch();
    const page = await browser.newPage({
      viewport: { width: 1100, height: 900 },
      deviceScaleFactor: 2,
    });

    await page.addStyleTag({
      content: `
        body.legal-body { padding: 0 !important; }
        .legal-page { border: none !important; border-radius: 0 !important; }
      `,
    });

    for (const doc of DOCS) {
      const url = `${BASE}/legal-export/${doc.slug}.html`;
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForSelector('.legal-doc');
      await page.evaluate(async () => {
        if (document.fonts?.ready) await document.fonts.ready;
      });

      const outPath = join(OUT_DIR, doc.file);
      await page.screenshot({ path: outPath, fullPage: true, type: 'png' });
      console.log(`✓ ${doc.file}`);
    }

    await browser.close();

    console.log('\nГотово:');
    for (const doc of DOCS) {
      console.log(`- ${doc.title}: /upload/${doc.file}`);
      console.log(`  https://amplipuls.su/upload/${doc.file}`);
    }
  } finally {
    server.kill('SIGTERM');
    if (server.exitCode === null) {
      await new Promise((resolve) => server.once('exit', resolve));
    }
    if (server.exitCode && server.exitCode !== 0 && server.signal !== 'SIGTERM') {
      console.error(serverLog);
      process.exit(server.exitCode ?? 1);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
