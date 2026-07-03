#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));

const failures = [];
const requiredFiles = [
  'CNAME',
  'README.md',
  'favicon.svg',
  'index.html',
  'script.js',
  'styles.css',
  'immo.html',
  'immoidf.html',
  'immoidf-data.json',
];

for (const file of requiredFiles) {
  if (!exists(file)) failures.push(`Missing required file: ${file}`);
}

if (exists('CNAME')) {
  const cname = read('CNAME').trim();
  if (cname !== 'pat.network') failures.push(`CNAME must remain pat.network, got: ${cname}`);
}

// Direct utility pages are intentionally preserved as legacy/off-nav public URLs.
// Keep the landing surface strict while treating those direct pages as explicit
// exceptions unless Pat asks to rework or publish them in the main archive.
const scannedFiles = ['index.html', 'README.md', 'script.js', 'styles.css'];
const forbiddenPatterns = [
  { pattern: /Business-Tech/gi, reason: 'old corporate title' },
  { pattern: /AI Enthusiast/gi, reason: 'old portfolio framing' },
  { pattern: /Strategist/gi, reason: 'resume-style title' },
  { pattern: /\benterprise\b/gi, reason: 'employment-context hint' },
  { pattern: /\bemployer\b/gi, reason: 'employment-context hint' },
  { pattern: /\bcompany\b/gi, reason: 'employment-context hint' },
  { pattern: /\bclient\b/gi, reason: 'employment-context hint' },
  { pattern: /\bLinkedIn\b/gi, reason: 'identity-expansion link' },
  { pattern: /\bSalesforce\b/gi, reason: 'work-platform hint' },
  { pattern: /\bServiceNow\b/gi, reason: 'work-platform hint' },
  { pattern: /\bSAP\b/gi, reason: 'work-platform hint' },
  { pattern: /fonts\.googleapis\.com/gi, reason: 'external font dependency' },
  { pattern: /cdnjs\.cloudflare\.com/gi, reason: 'external icon dependency' },
  { pattern: /contactForm/g, reason: 'nonfunctional legacy contact form' },
];

for (const file of scannedFiles) {
  if (!exists(file)) continue;
  const text = read(file);
  for (const { pattern, reason } of forbiddenPatterns) {
    const matches = text.match(pattern);
    if (matches) failures.push(`${file} contains ${reason}: ${matches[0]}`);
  }
}

if (exists('index.html')) {
  const html = read('index.html');
  const requiredSections = ['featured', 'archive', 'about', 'contact'];

  for (const id of requiredSections) {
    const sectionPattern = new RegExp(`id=["']${id}["']`);
    if (!sectionPattern.test(html)) failures.push(`index.html missing #${id} section`);
  }

  if (!/Pat/.test(html)) failures.push('index.html must use the public identity Pat');
  if (!/pat\.network/.test(html)) failures.push('index.html must mention pat.network');

  const htmlWithoutHrefTargets = html.replace(/href=["'][^"']*["']/g, 'href=""');
  if (/xVc323/i.test(htmlWithoutHrefTargets)) {
    failures.push('index.html must not expose xVc323 in visible or metadata copy');
  }
  if (/<form\b/i.test(html)) failures.push('index.html must not include a fake/nonfunctional contact form');

  const anchorTargets = new Set(
    [...html.matchAll(/id=["']([^"']+)["']/g)].map((match) => match[1])
  );
  for (const match of html.matchAll(/href=["']#([^"']+)["']/g)) {
    const target = match[1];
    if (!anchorTargets.has(target)) failures.push(`Broken in-page anchor: #${target}`);
  }

  for (const match of html.matchAll(/href=["']([^"']+\.html)(?:#[^"']*)?["']/g)) {
    const localFile = match[1];
    if (!exists(localFile)) failures.push(`Broken local HTML link: ${localFile}`);
  }
}

if (failures.length) {
  console.error('Site validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Site validation passed.');
