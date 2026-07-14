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
  'games/infernal-ledger/data.js',
  'games/infernal-ledger/core.js',
  'games/infernal-ledger/content.js',
  'games/infernal-ledger/game.js',
  'games/infernal-ledger/assets/sprite-atlas.png',
  'games/infernal-ledger/assets/card-atlas.png',
  'games/infernal-ledger/assets/act2-sprite-atlas.png',
  'games/infernal-ledger/assets/extra-enemy-atlas.png',
  'games/infernal-ledger/assets/card-atlas-2.png',
  'games/infernal-ledger/assets/relic-atlas-v2.png',
  'games/infernal-ledger/assets/combat-hud-orb.png',
  'games/infernal-ledger/assets/combat-hud-plate.png',
  'games/infernal-ledger/assets/combat-hud-plaque.png',
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
  if (!/wanna play a little game\?/i.test(html)) failures.push('index.html missing game invitation');
  if (!/id=["']infernal-modal["'][^>]*role=["']dialog["']/i.test(html)) {
    failures.push('Infernal modal must use dialog semantics');
  }
  if (!/id=["']infernal-canvas["']/i.test(html)) failures.push('index.html missing infernal canvas');
  if (!/src=["']games\/infernal-ledger\/data\.js\?/.test(html)) failures.push('index.html missing versioned infernal data script');
  if (!/src=["']games\/infernal-ledger\/core\.js\?/.test(html)) failures.push('index.html missing versioned infernal core script');
  if (!/src=["']games\/infernal-ledger\/content\.js\?/.test(html)) failures.push('index.html missing versioned infernal content script');
  if (!/src=["']games\/infernal-ledger\/game\.js\?/.test(html)) failures.push('index.html missing versioned infernal game script');

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

if (exists('games/infernal-ledger/content.js')) {
  const { CARD_LIBRARY } = require(path.join(root, 'games/infernal-ledger/core.js'));
  const { CARD_ART, ACTOR_CROPS, RELIC_PRESENTATION, lineFor } = require(path.join(root, 'games/infernal-ledger/content.js'));
  const cardIds = Object.keys(CARD_LIBRARY);
  if (cardIds.some((id) => !CARD_ART[id])) failures.push('Every Infernal card must have unique art coordinates');
  const actTwoActors = ['claim_eater', 'carbon_copy', 'benefits_larva', 'merger_mimic', 'compliance_seraph', 'parachute_knight', 'synergy_hydra', 'burnout_oracle', 'consultant', 'vp_knives', 'eternal_vp', 'eternal_vp_phase2'];
  if (!ACTOR_CROPS || actTwoActors.some((id) => !ACTOR_CROPS[id])) failures.push('Every Act 2 actor must have safe crop metadata');
  else if (actTwoActors.some((id) => {
    const crop = ACTOR_CROPS[id];
    return crop.x < 0 || crop.y < 0 || crop.width <= 0 || crop.height <= 0 || crop.x + crop.width > 362 || crop.y + crop.height > 362;
  })) failures.push('Act 2 actor crop metadata must stay inside its 362px atlas cell');
  const relicIds = require(path.join(root, 'games/infernal-ledger/data.js')).RELICS.map((relic) => relic.id);
  if (!RELIC_PRESENTATION || relicIds.some((id) => !RELIC_PRESENTATION[id])) failures.push('Every Infernal relic must have presentation metadata');
  else if (new Set(relicIds.map((id) => `${RELIC_PRESENTATION[id].art}:${RELIC_PRESENTATION[id].sigil}`)).size !== relicIds.length) {
    failures.push('Every Infernal relic must have an immediately distinct art and sigil signature');
  }
  const coordinates = cardIds.map((id) => `${CARD_ART[id]?.atlas || 1}:${CARD_ART[id]?.column}:${CARD_ART[id]?.row}`);
  if (new Set(coordinates).size !== cardIds.length) failures.push('Infernal card art coordinates must be unique');
  if (!lineFor('overdraft', 'hero', 0)) failures.push('Infernal dialogue must return deterministic hero lines');
  if (!lineFor('attack', 'manager', 0)) failures.push('Infernal dialogue must return deterministic enemy lines');
}

if (failures.length) {
  console.error('Site validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Site validation passed.');
