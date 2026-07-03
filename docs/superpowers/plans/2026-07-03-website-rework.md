# Website Rework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `pat.network` into a clean, pseudonymous project archive for Pat while preserving GitHub Pages compatibility and hidden direct utility pages.

**Architecture:** Keep the site as plain static HTML/CSS/JS. Replace the homepage with a light-first gallery and chronological archive, remove resume/corporate framing, and add a Node-based validation script that enforces privacy and static-site integrity before manual/browser checks.

**Tech Stack:** Static HTML, CSS custom properties, vanilla JavaScript, Node.js built-ins for validation, Python static server for smoke testing, GitHub Pages.

---

## File Structure and Responsibilities

- Create: `.gitignore` — prevents local workflow artifacts such as `.superpowers/` from being committed.
- Create: `scripts/validate-site.js` — dependency-free validation for required files, homepage anchors, internal links, and privacy-risk strings.
- Modify: `index.html` — complete homepage rewrite into pseudonymous project archive.
- Modify: `styles.css` — complete visual system rewrite for the clean gallery/archive direction.
- Modify: `script.js` — replace portfolio-era interactions with minimal navigation behavior.
- Modify: `README.md` — update public repo description to match the privacy-safe archive positioning.
- Preserve: `CNAME`, `favicon.svg`, `immo.html`, `immoidf.html`, `immoidf-data.json` — keep GitHub Pages domain and existing direct utility pages available.

## Task 1: Add repo hygiene and validation harness

**Files:**
- Create: `.gitignore`
- Create: `scripts/validate-site.js`

- [ ] **Step 1: Create `.gitignore` for local agent artifacts**

Write this exact file:

```gitignore
# Local agent/workflow artifacts
.superpowers/
.omx/

# OS/editor noise
.DS_Store
```

- [ ] **Step 2: Create the static-site validation script**

Create `scripts/validate-site.js` with this exact content:

```javascript
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
```

- [ ] **Step 3: Run validation and verify it fails against the old site**

Run:

```bash
node scripts/validate-site.js
```

Expected: FAIL. The output should include at least one old-homepage privacy or legacy framing failure, such as `Business-Tech`, `AI Enthusiast`, `contactForm`, `fonts.googleapis.com`, or `cdnjs.cloudflare.com`.

- [ ] **Step 4: Commit the validation harness**

Run:

```bash
git add .gitignore scripts/validate-site.js
git commit -m "Protect the pseudonymous archive boundary" \
  -m "Constraint: The public site must avoid real identity and employment-context leakage.\nConstraint: The site remains static and dependency-free for GitHub Pages.\nRejected: Manual-only privacy review | Easy to miss old portfolio strings during a full rewrite.\nConfidence: high\nScope-risk: narrow\nDirective: Keep validation checks conservative when adding public copy or links.\nTested: node scripts/validate-site.js fails on the pre-rework homepage as expected.\nNot-tested: Final homepage; later tasks replace the legacy content."
```

## Task 2: Replace the homepage with the archive structure

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Replace `index.html` completely**

Write this exact content to `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pat — Project Archive</title>
  <meta name="description" content="A pseudonymous archive of projects, experiments, tools, and demos by Pat.">
  <meta name="theme-color" content="#f7f3eb">
  <link rel="icon" type="image/svg+xml" href="favicon.svg">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>

  <header class="site-header">
    <nav class="nav" aria-label="Primary navigation">
      <a class="brand" href="#top" aria-label="pat.network home">
        <span class="brand-mark">p</span>
        <span class="brand-text">pat.network</span>
      </a>

      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-menu">
        <span class="sr-only">Toggle navigation</span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </button>

      <div class="nav-menu" id="nav-menu">
        <a href="#featured">Featured</a>
        <a href="#archive">Archive</a>
        <a href="#about">About</a>
        <a href="https://github.com/xVc323" target="_blank" rel="noopener">GitHub</a>
      </div>
    </nav>
  </header>

  <main id="main">
    <section class="hero" id="top" aria-labelledby="hero-title">
      <div class="container hero-grid">
        <div class="hero-copy">
          <p class="eyebrow">Pat · project archive</p>
          <h1 id="hero-title">Selected experiments, tools, and things I made.</h1>
          <p class="hero-text">
            A clean, pseudonymous build log for AI utilities, automation helpers,
            web experiments, and small side quests living on pat.network.
          </p>
          <div class="hero-actions" aria-label="Primary actions">
            <a class="button primary" href="#featured">View featured work</a>
            <a class="button secondary" href="https://github.com/xVc323" target="_blank" rel="noopener">Open GitHub</a>
          </div>
        </div>

        <aside class="archive-card" aria-label="Archive summary">
          <div class="archive-card-topline">Static / public / evolving</div>
          <p class="archive-card-title">A small web shelf for projects worth remembering.</p>
          <dl class="quick-stats">
            <div>
              <dt>Format</dt>
              <dd>GitHub Pages</dd>
            </div>
            <div>
              <dt>Identity</dt>
              <dd>Pat</dd>
            </div>
            <div>
              <dt>Focus</dt>
              <dd>Builds over biography</dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>

    <section class="section" id="featured" aria-labelledby="featured-title">
      <div class="container section-heading">
        <p class="eyebrow">Featured</p>
        <h2 id="featured-title">A few artifacts from the shelf.</h2>
        <p>
          These are the entries that best capture the site: practical tools,
          AI experiments, and small systems that turned into something usable.
        </p>
      </div>

      <div class="container project-grid">
        <article class="project-card feature-card">
          <div class="card-meta">AI app</div>
          <h3>QuizForge AI</h3>
          <p>Turns source material into quiz-style learning flows with an AI-assisted generation pipeline.</p>
          <ul class="tag-list" aria-label="QuizForge tags">
            <li>Python</li>
            <li>Streamlit</li>
            <li>AI</li>
          </ul>
          <div class="card-links">
            <a href="https://quizforge-ai.streamlit.app/" target="_blank" rel="noopener">Live demo</a>
            <a href="https://github.com/xVc323/quizforge" target="_blank" rel="noopener">Source</a>
          </div>
        </article>

        <article class="project-card feature-card">
          <div class="card-meta">Document tool</div>
          <h3>OmniDocs</h3>
          <p>A document-focused experiment for making files easier to inspect, transform, and reason about.</p>
          <ul class="tag-list" aria-label="OmniDocs tags">
            <li>Documents</li>
            <li>Automation</li>
            <li>Web</li>
          </ul>
          <div class="card-links">
            <a href="https://omnidocs.pat.network" target="_blank" rel="noopener">Live site</a>
            <a href="https://github.com/xVc323/omnidocs" target="_blank" rel="noopener">Source</a>
          </div>
        </article>

        <article class="project-card feature-card">
          <div class="card-meta">Utility</div>
          <h3>PDF2txt</h3>
          <p>A small extraction utility for turning PDF content into plain text that is easier to process.</p>
          <ul class="tag-list" aria-label="PDF2txt tags">
            <li>PDF</li>
            <li>CLI</li>
            <li>Text</li>
          </ul>
          <div class="card-links">
            <a href="https://github.com/xVc323/PDF2txt" target="_blank" rel="noopener">Source</a>
          </div>
        </article>

        <article class="project-card feature-card">
          <div class="card-meta">Developer tool</div>
          <h3>Codebase Merger</h3>
          <p>A helper for collecting project files into a single reviewable context when exploring codebases.</p>
          <ul class="tag-list" aria-label="Codebase Merger tags">
            <li>Code</li>
            <li>Context</li>
            <li>Tooling</li>
          </ul>
          <div class="card-links">
            <a href="https://github.com/xVc323/codebase-merger" target="_blank" rel="noopener">Source</a>
          </div>
        </article>
      </div>
    </section>

    <section class="section archive-section" id="archive" aria-labelledby="archive-title">
      <div class="container section-heading">
        <p class="eyebrow">Archive</p>
        <h2 id="archive-title">Build log, newest first.</h2>
        <p>
          A lightweight timeline for projects, experiments, and useful fragments.
          Dates stay intentionally broad until the archive moves to structured entries.
        </p>
      </div>

      <div class="container timeline" aria-label="Project archive timeline">
        <article class="timeline-item">
          <time datetime="2026">2026</time>
          <div>
            <h3>OmniDocs</h3>
            <p>Document workflow experiment published as a standalone web project.</p>
            <a href="https://omnidocs.pat.network" target="_blank" rel="noopener">Open project</a>
          </div>
        </article>

        <article class="timeline-item">
          <time datetime="2026">2026</time>
          <div>
            <h3>QuizForge AI</h3>
            <p>AI-assisted quiz generation from source material.</p>
            <a href="https://github.com/xVc323/quizforge" target="_blank" rel="noopener">View source</a>
          </div>
        </article>

        <article class="timeline-item">
          <time datetime="2025">2025</time>
          <div>
            <h3>RaspAI</h3>
            <p>Small hardware-and-AI exploration around running useful intelligence close to the edge.</p>
            <a href="https://github.com/xVc323/raspai" target="_blank" rel="noopener">View source</a>
          </div>
        </article>

        <article class="timeline-item">
          <time datetime="2025">2025</time>
          <div>
            <h3>PDF2txt</h3>
            <p>Focused utility for extracting readable text from PDF files.</p>
            <a href="https://github.com/xVc323/PDF2txt" target="_blank" rel="noopener">View source</a>
          </div>
        </article>

        <article class="timeline-item">
          <time datetime="2025">2025</time>
          <div>
            <h3>PopClip Humanizer</h3>
            <p>Micro-tooling experiment for transforming selected text from the desktop.</p>
            <a href="https://github.com/xVc323/popclip-humanizer" target="_blank" rel="noopener">View source</a>
          </div>
        </article>

        <article class="timeline-item">
          <time datetime="2025">2025</time>
          <div>
            <h3>Live music sketch</h3>
            <p>A small creative-code detour using browser-based music tooling.</p>
            <a href="https://strudel.cc/" target="_blank" rel="noopener">Explore Strudel</a>
          </div>
        </article>
      </div>
    </section>

    <section class="section about-section" id="about" aria-labelledby="about-title">
      <div class="container about-grid">
        <div>
          <p class="eyebrow">About</p>
          <h2 id="about-title">Pseudonymous by design.</h2>
        </div>
        <div class="about-copy">
          <p>
            I’m Pat. This site is where I keep a public trail
            of tools, experiments, demos, and odd little builds that are worth keeping online.
          </p>
          <p>
            The point is the work, not a résumé. Some projects are practical, some are playful,
            and some are just snapshots of curiosity that made it far enough to deserve a URL.
          </p>
        </div>
      </div>
    </section>

    <section class="section contact-section" id="contact" aria-labelledby="contact-title">
      <div class="container contact-card">
        <div>
          <p class="eyebrow">Links</p>
          <h2 id="contact-title">Find the source trail.</h2>
          <p>GitHub is the best place to follow or inspect the projects behind this archive.</p>
        </div>
        <div class="contact-links" aria-label="Contact and profile links">
          <a class="button primary" href="https://github.com/xVc323" target="_blank" rel="noopener">GitHub</a>
          <a class="button secondary" href="https://pat.network">pat.network</a>
        </div>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="container footer-inner">
      <p>© <span id="year">2026</span> Pat. Built as static files.</p>
      <a href="#top">Back to top</a>
    </div>
  </footer>

  <script src="script.js"></script>
</body>
</html>
```

- [ ] **Step 2: Run validation and verify remaining expected failures**

Run:

```bash
node scripts/validate-site.js
```

Expected: FAIL only because `README.md` still contains old portfolio wording. The output should no longer report `index.html` failures for external font dependencies, fake contact form, or old corporate title strings.

- [ ] **Step 3: Commit the homepage rewrite**

Run:

```bash
git add index.html
git commit -m "Reframe the homepage around the project archive" \
  -m "Constraint: The site must stay pseudonymous and static for GitHub Pages.\nRejected: Resume-style homepage | It conflicts with the owner-first archive goal and privacy boundary.\nConfidence: high\nScope-risk: moderate\nDirective: Keep hidden utility pages off the main navigation unless Pat explicitly asks to feature them.\nTested: node scripts/validate-site.js now clears homepage-specific legacy failures and leaves README cleanup for the next content task.\nNot-tested: Visual browser layout; CSS and smoke checks follow."
```

## Task 3: Replace the visual system

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Replace `styles.css` completely**

Write this exact content to `styles.css`:

```css
:root {
  color-scheme: light;
  --bg: #f7f3eb;
  --surface: #fffaf1;
  --surface-strong: #ffffff;
  --text: #181612;
  --muted: #6f675c;
  --line: rgba(24, 22, 18, 0.12);
  --accent: #8b5cf6;
  --accent-strong: #5b21b6;
  --shadow: 0 24px 70px rgba(48, 36, 18, 0.12);
  --radius-lg: 28px;
  --radius-md: 18px;
  --radius-sm: 12px;
  --container: 1120px;
}

@media (prefers-color-scheme: dark) {
  :root {
    color-scheme: dark;
    --bg: #11100e;
    --surface: #191714;
    --surface-strong: #211f1b;
    --text: #f8f1e7;
    --muted: #b9ad9d;
    --line: rgba(248, 241, 231, 0.14);
    --accent: #c4b5fd;
    --accent-strong: #ddd6fe;
    --shadow: 0 24px 70px rgba(0, 0, 0, 0.34);
  }
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(139, 92, 246, 0.12), transparent 34rem),
    linear-gradient(180deg, var(--bg), var(--bg));
  color: var(--text);
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  line-height: 1.6;
  text-rendering: optimizeLegibility;
}

body.nav-open {
  overflow: hidden;
}

img,
svg {
  max-width: 100%;
}

a {
  color: inherit;
  text-decoration-thickness: 0.08em;
  text-underline-offset: 0.18em;
}

a:hover {
  color: var(--accent-strong);
}

button,
a {
  -webkit-tap-highlight-color: transparent;
}

.container {
  width: min(100% - 2rem, var(--container));
  margin-inline: auto;
}

.skip-link {
  position: fixed;
  left: 1rem;
  top: 1rem;
  transform: translateY(-160%);
  z-index: 20;
  border-radius: 999px;
  background: var(--text);
  color: var(--bg);
  padding: 0.7rem 1rem;
  transition: transform 180ms ease;
}

.skip-link:focus {
  transform: translateY(0);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.site-header {
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid var(--line);
  background: color-mix(in srgb, var(--bg) 88%, transparent);
  backdrop-filter: blur(18px);
}

.nav {
  width: min(100% - 2rem, var(--container));
  min-height: 72px;
  margin-inline: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  font-weight: 800;
  text-decoration: none;
  letter-spacing: -0.03em;
}

.brand-mark {
  width: 2.25rem;
  height: 2.25rem;
  display: grid;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 50%;
  background: var(--surface-strong);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  color: var(--accent-strong);
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  color: var(--muted);
  font-size: 0.95rem;
}

.nav-menu a {
  text-decoration: none;
}

.nav-toggle {
  display: none;
  width: 2.75rem;
  height: 2.75rem;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--surface-strong);
  color: var(--text);
  cursor: pointer;
}

.nav-toggle span[aria-hidden="true"] {
  display: block;
  width: 1.1rem;
  height: 2px;
  margin: 0.23rem auto;
  background: currentColor;
  border-radius: 999px;
}

.hero {
  padding: clamp(5rem, 9vw, 8rem) 0 clamp(3rem, 7vw, 6rem);
}

.hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(280px, 0.85fr);
  gap: clamp(2rem, 5vw, 4.5rem);
  align-items: center;
}

.eyebrow {
  margin: 0 0 0.85rem;
  color: var(--accent-strong);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

h1,
h2,
h3,
p {
  margin-top: 0;
}

h1 {
  max-width: 11ch;
  margin-bottom: 1.25rem;
  font-size: clamp(3.4rem, 10vw, 7.9rem);
  line-height: 0.88;
  letter-spacing: -0.085em;
}

h2 {
  max-width: 12ch;
  margin-bottom: 1rem;
  font-size: clamp(2.15rem, 5vw, 4.8rem);
  line-height: 0.95;
  letter-spacing: -0.06em;
}

h3 {
  margin-bottom: 0.65rem;
  font-size: 1.35rem;
  line-height: 1.1;
  letter-spacing: -0.035em;
}

.hero-text,
.section-heading p,
.about-copy,
.contact-card p {
  max-width: 68ch;
  color: var(--muted);
  font-size: clamp(1.02rem, 2vw, 1.2rem);
}

.hero-actions,
.contact-links,
.card-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  align-items: center;
}

.hero-actions {
  margin-top: 2rem;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 3rem;
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 0.8rem 1.15rem;
  font-weight: 800;
  text-decoration: none;
  transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;
}

.button:hover {
  transform: translateY(-2px);
}

.button.primary {
  background: var(--text);
  color: var(--bg);
  border-color: var(--text);
}

.button.secondary {
  background: var(--surface-strong);
}

.archive-card,
.project-card,
.contact-card {
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--surface) 88%, transparent);
  box-shadow: var(--shadow);
}

.archive-card {
  padding: clamp(1.4rem, 3vw, 2rem);
}

.archive-card-topline,
.card-meta {
  margin-bottom: 1rem;
  color: var(--muted);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.archive-card-title {
  margin-bottom: 2rem;
  font-size: clamp(1.7rem, 3vw, 2.45rem);
  font-weight: 850;
  line-height: 1.02;
  letter-spacing: -0.055em;
}

.quick-stats {
  display: grid;
  gap: 1rem;
  margin: 0;
}

.quick-stats div {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  border-top: 1px solid var(--line);
  padding-top: 1rem;
}

.quick-stats dt {
  color: var(--muted);
}

.quick-stats dd {
  margin: 0;
  font-weight: 800;
  text-align: right;
}

.section {
  padding: clamp(3rem, 7vw, 6rem) 0;
}

.section-heading {
  margin-bottom: 2rem;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.project-card {
  min-height: 24rem;
  padding: 1.35rem;
  display: flex;
  flex-direction: column;
  transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
}

.project-card:hover {
  transform: translateY(-4px);
  border-color: color-mix(in srgb, var(--accent) 45%, var(--line));
}

.project-card p {
  color: var(--muted);
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: auto 0 1.25rem;
  padding: 0;
  list-style: none;
}

.tag-list li {
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--surface-strong);
  padding: 0.35rem 0.65rem;
  color: var(--muted);
  font-size: 0.82rem;
  font-weight: 700;
}

.card-links a,
.timeline-item a,
.footer a {
  color: var(--accent-strong);
  font-weight: 800;
}

.archive-section {
  border-block: 1px solid var(--line);
  background: color-mix(in srgb, var(--surface) 42%, transparent);
}

.timeline {
  display: grid;
  gap: 0.85rem;
}

.timeline-item {
  display: grid;
  grid-template-columns: 7rem minmax(0, 1fr);
  gap: 1.25rem;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface-strong);
  padding: 1.2rem;
}

.timeline-item time {
  color: var(--accent-strong);
  font-weight: 900;
}

.timeline-item h3 {
  margin-bottom: 0.35rem;
}

.timeline-item p {
  margin-bottom: 0.65rem;
  color: var(--muted);
}

.about-grid {
  display: grid;
  grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
  gap: clamp(2rem, 5vw, 5rem);
}

.about-copy p:last-child,
.contact-card p:last-child,
.footer p {
  margin-bottom: 0;
}

.contact-card {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  align-items: center;
  padding: clamp(1.4rem, 4vw, 2.2rem);
}

.footer {
  padding: 2rem 0;
  color: var(--muted);
}

.footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-top: 1px solid var(--line);
  padding-top: 1.25rem;
}

@media (max-width: 980px) {
  .hero-grid,
  .about-grid {
    grid-template-columns: 1fr;
  }

  .project-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .nav-toggle {
    display: inline-grid;
    place-items: center;
  }

  .nav-menu {
    position: fixed;
    inset: 72px 1rem auto 1rem;
    display: none;
    flex-direction: column;
    align-items: stretch;
    border: 1px solid var(--line);
    border-radius: var(--radius-md);
    background: var(--surface-strong);
    padding: 0.8rem;
    box-shadow: var(--shadow);
  }

  body.nav-open .nav-menu {
    display: flex;
  }

  .nav-menu a {
    border-radius: var(--radius-sm);
    padding: 0.85rem 1rem;
  }

  .nav-menu a:hover {
    background: color-mix(in srgb, var(--accent) 10%, transparent);
  }

  .project-grid,
  .timeline-item,
  .contact-card,
  .footer-inner {
    grid-template-columns: 1fr;
  }

  .project-grid {
    display: grid;
  }

  .contact-card,
  .footer-inner {
    align-items: flex-start;
  }

  .timeline-item {
    gap: 0.35rem;
  }
}

@media (max-width: 520px) {
  .container,
  .nav {
    width: min(100% - 1.25rem, var(--container));
  }

  .hero {
    padding-top: 3.5rem;
  }

  h1 {
    font-size: clamp(3rem, 18vw, 4.6rem);
  }

  .project-card {
    min-height: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

- [ ] **Step 2: Run validation after CSS replacement**

Run:

```bash
node scripts/validate-site.js
```

Expected: FAIL only because `README.md` still contains old public positioning.

- [ ] **Step 3: Commit the visual system**

Run:

```bash
git add styles.css
git commit -m "Give the archive a clean gallery visual system" \
  -m "Constraint: No framework or external asset dependency should be introduced.\nRejected: Floating technology icon hero | It made the page feel like a template portfolio instead of a clean archive.\nConfidence: high\nScope-risk: moderate\nDirective: Preserve readable spacing and reduced-motion support when extending the visual system.\nTested: node scripts/validate-site.js still only reports the known README cleanup failure.\nNot-tested: Browser rendering across viewport sizes; smoke checks follow."
```

## Task 4: Replace legacy JavaScript with minimal behavior

**Files:**
- Modify: `script.js`

- [ ] **Step 1: Replace `script.js` completely**

Write this exact content to `script.js`:

```javascript
(() => {
  const body = document.body;
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const year = document.getElementById('year');

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  if (navToggle && navMenu) {
    const closeMenu = () => {
      body.classList.remove('nav-open');
      navToggle.setAttribute('aria-expanded', 'false');
    };

    navToggle.addEventListener('click', () => {
      const isOpen = body.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navMenu.addEventListener('click', (event) => {
      if (event.target instanceof HTMLAnchorElement) closeMenu();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });
  }
})();
```

- [ ] **Step 2: Run validation after JavaScript replacement**

Run:

```bash
node scripts/validate-site.js
```

Expected: FAIL only because `README.md` still contains old public positioning.

- [ ] **Step 3: Commit the JavaScript simplification**

Run:

```bash
git add script.js
git commit -m "Keep homepage interactivity minimal and static-safe" \
  -m "Constraint: GitHub Pages deployment should not require a build step or runtime service.\nRejected: Simulated contact form and animation-heavy scripts | They created misleading behavior and unnecessary complexity.\nConfidence: high\nScope-risk: narrow\nDirective: Add JavaScript only for behavior that cannot be achieved cleanly with HTML and CSS.\nTested: node scripts/validate-site.js still only reports the known README cleanup failure.\nNot-tested: Browser event behavior; smoke checks follow."
```

## Task 5: Update public documentation and pass validation

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace `README.md` completely**

Write this exact content to `README.md`:

```markdown
# pat.network

Pseudonymous project archive for Pat.

This is a static GitHub Pages site for experiments, tools, demos, and small web artifacts. The public site is intentionally focused on builds rather than biography.

## Privacy boundary

- Public identity: Pat / pat.network.
- No real full name.
- No private workplace or organization details.
- Some utility pages remain available by direct URL and are intentionally kept out of the main navigation.
```

- [ ] **Step 2: Run validation and verify it passes**

Run:

```bash
node scripts/validate-site.js
```

Expected: PASS with exactly:

```text
Site validation passed.
```

- [ ] **Step 3: Commit documentation cleanup**

Run:

```bash
git add README.md
git commit -m "Align the public README with the archive identity" \
  -m "Constraint: Repository documentation is public-facing metadata for the site.\nRejected: Portfolio wording | It preserved the old professional framing and conflicted with the privacy boundary.\nConfidence: high\nScope-risk: narrow\nDirective: Treat README copy as part of the public identity surface.\nTested: node scripts/validate-site.js passes.\nNot-tested: Browser rendering; smoke checks follow."
```

## Task 6: Run static and browser smoke checks

**Files:**
- No code changes expected. Modify only if a check reveals a defect.

- [ ] **Step 1: Confirm the working tree contains only intentional tracked changes**

Run:

```bash
git status --short --branch
```

Expected: branch may be ahead of `origin/main`; no unstaged tracked changes. `.superpowers/` must not appear because `.gitignore` now ignores it.

- [ ] **Step 2: Run validation again from a clean command**

Run:

```bash
node scripts/validate-site.js
```

Expected:

```text
Site validation passed.
```

- [ ] **Step 3: Start a local static server**

Run:

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

Expected: server starts and prints a message containing `Serving HTTP on 127.0.0.1 port 4173`. Keep it running for the next checks.

- [ ] **Step 4: Verify key pages are served**

In another shell, run:

```bash
python3 - <<'PY'
from urllib.request import urlopen
for path in ['/', '/index.html', '/immo.html', '/immoidf.html']:
    with urlopen(f'http://127.0.0.1:4173{path}', timeout=10) as response:
        body = response.read().decode('utf-8', errors='replace')
        assert response.status == 200, path
        assert '<html' in body.lower(), path
        print(f'OK {path} {len(body)} bytes')
PY
```

Expected: four `OK` lines.

- [ ] **Step 5: Inspect the homepage in a browser**

Open:

```text
http://127.0.0.1:4173/
```

Check these exact outcomes:

- Header shows `pat.network`.
- Main hero says `Selected experiments, tools, and things I made.`
- Main navigation contains `Featured`, `Archive`, `About`, and `GitHub`.
- No main navigation link points to `immo.html` or `immoidf.html`.
- Featured cards render as a grid on desktop.
- Archive entries render as a vertical timeline.
- Mobile width shows a toggle button and the menu can open and close.
- Browser console has no JavaScript errors.

- [ ] **Step 6: Stop the static server**

Stop the `python3 -m http.server` process with `Ctrl+C`.

- [ ] **Step 7: Commit any smoke-test fixes if needed**

If Step 5 required fixes, run validation again and commit the exact fixed files with a Lore commit. If no fixes were needed, do not create an empty commit.

## Task 7: Final privacy and diff review

**Files:**
- No code changes expected. Modify only if a check reveals a defect.

- [ ] **Step 1: Run final validation**

Run:

```bash
node scripts/validate-site.js
```

Expected:

```text
Site validation passed.
```

- [ ] **Step 2: Search public landing files for legacy public-positioning terms**

Run:

```bash
grep -RInE 'Business-Tech|AI Enthusiast|Strategist|enterprise|employer|company|client|LinkedIn|Salesforce|ServiceNow|SAP|contactForm|fonts\.googleapis\.com|cdnjs\.cloudflare\.com' index.html README.md script.js styles.css || true
```

Expected: no output.

- [ ] **Step 3: Review the implementation diff**

Run:

```bash
git diff origin/main...HEAD -- index.html styles.css script.js README.md .gitignore scripts/validate-site.js docs/superpowers/specs/2026-07-03-website-rework-design.md docs/superpowers/plans/2026-07-03-website-rework.md
```

Expected: diff shows only the approved spec, this implementation plan, the static validation harness, homepage rewrite, visual rewrite, minimal script, README update, and `.gitignore`.

- [ ] **Step 4: Confirm final status**

Run:

```bash
git status --short --branch
```

Expected: branch is ahead of `origin/main`; no unstaged tracked changes and no accidental untracked public artifacts.

- [ ] **Step 5: Prepare final report**

Report:

- Commits created.
- Files changed.
- Validation commands and outputs.
- Privacy checks performed.
- Any remaining risk, especially broad project dates or direct utility pages that still exist off-nav.
