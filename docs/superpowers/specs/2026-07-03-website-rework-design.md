# Website Rework Design: Pseudonymous Project Archive

Date: 2026-07-03
Site: `pat.network`
Status: Approved for implementation planning

## Goal

Rework the current personal website into a clean, pseudonymous project archive. The site should feel like a curated record of experiments, tools, demos, and build history rather than a conventional recruiter portfolio.

The primary audience is Pat. The site should be enjoyable to revisit, easy to update, and still polished enough for external visitors who discover it through GitHub or shared links.

## Hard Privacy Constraints

The website must not leak Pat's private identity or employment context.

Required constraints:

- Use only the public identity `Pat`, `xVc323`, and `pat.network`.
- Do not include a real full name anywhere in visible copy, metadata, alt text, comments, docs intended for publication, or structured data.
- Do not include employer names, company names, client names, internal project names, office/location hints tied to employment, or any identifying work details.
- Project descriptions must describe the artifact and capability, not the organization or professional context where similar work happened.
- Contact options should prefer GitHub and the website domain. Do not add a personal email or company email unless Pat explicitly asks later.
- Do not expose hidden utility pages in the main navigation.
- Existing real-estate pages may remain available by direct URL, but the homepage should not frame them as private life or professional affiliation.
- Page metadata and README text should follow the same privacy rules as visible UI.

## Chosen Direction

Use a **clean gallery highlights → chronological archive** structure.

This was chosen over:

1. **Minimal clean portfolio** — readable, but too static and conventional.
2. **Full lab/dashboard** — distinctive, but more complex and less elegant for a static GitHub Pages site.

The chosen direction balances readability, personality, and long-term maintainability. It gives the homepage an immediate visual anchor through featured work, then turns the rest of the page into a living build log.

## Content Strategy

### Homepage Message

The homepage should position the site as a personal archive of builds. Suggested copy direction:

- Primary headline: “Pat’s project archive” or “Selected experiments, tools, and things I made.”
- Supporting text: short, factual, and non-corporate. Emphasize AI tools, automation, web experiments, utilities, and creative side projects.
- Avoid language such as “business-tech strategist”, “enterprise”, “at my company”, or employer-specific experience.

### Primary Sections

1. **Hero**
   - Minimal intro.
   - Public identity only: Pat / xVc323.
   - One-line description of the archive.
   - Primary actions: view featured work, open GitHub.

2. **Featured Gallery**
   - 3–4 strongest artifacts.
   - Use visual cards with concise descriptions.
   - Each card should link to GitHub, live demo, or direct page if available.
   - Candidate featured projects from the current site:
     - QuizForge AI
     - OmniDocs
     - RaspAI or PDF2txt
     - Strudel/music experiment if it supports the desired personality

3. **Chronological Archive**
   - Dated build-log style list.
   - Entries should be concise and easy to scan.
   - Start with current known projects and experiments, ordered newest first where dates are known.
   - Include hidden utilities such as immo pages only as low-emphasis archive entries or omit them from the homepage if privacy feels uncertain.

4. **About**
   - Short pseudonymous blurb.
   - Focus on interests and making things, not employment history.
   - Tone: clear, calm, slightly personal.

5. **Contact / Links**
   - GitHub profile.
   - Site URL.
   - Optional project links.
   - No contact form unless it can actually send messages without misleading users. If no backend exists, remove the fake form and use links instead.

## Navigation

Use minimal navigation:

- Featured
- Archive
- About
- GitHub

Do not include the real-estate pages in the main nav. Keep `immo.html` and `immoidf.html` reachable by direct URL unless later removed intentionally.

## Visual Design

Style direction: clean gallery.

Characteristics:

- Light-first editorial feel.
- Strong typography and generous spacing.
- Card-based featured project gallery.
- Restrained accent color.
- Subtle dark mode is acceptable if it does not add clutter.
- Avoid floating technology icons, excessive motion, and gimmicky hero animations.
- Prefer simple transitions only where they improve polish.

The final UI should feel more like a curated archive or small independent studio site than a template portfolio.

## Technical Design

Keep the site compatible with GitHub Pages free hosting.

Implementation constraints:

- Use plain static HTML/CSS/JavaScript.
- Do not add a framework or build step for this rework.
- Keep `CNAME` unchanged for `pat.network`.
- Preserve existing direct URLs unless intentionally removed later.
- Structure the archive markup so entries can later migrate to JSON, Markdown, or a static generator.
- Avoid new dependencies unless explicitly requested.

Potential file responsibilities:

- `index.html`: homepage structure and content.
- `styles.css`: visual system, layout, responsive behavior, theme variables if kept.
- `script.js`: minimal interactivity such as mobile nav, smooth scrolling, optional theme toggle.
- `favicon.svg`: update only if needed for the new identity.
- `README.md`: update to match the pseudonymous archive positioning and privacy constraints.

## Existing Page Treatment

### `index.html`

Rework entirely around the new archive structure. Remove or replace:

- Corporate portfolio framing.
- Skills matrix if it reads like a resume.
- Fake contact form behavior.
- Floating tech-icon hero clutter.
- Any copy that implies real employer context.

### `immo.html` and `immoidf.html`

Keep these pages available by direct URL. Do not put them in the main navigation. If referenced in the archive, describe them generically as real-estate data experiments or omit them from the homepage if the content feels too personal.

### `README.md`

Update to a short, privacy-safe description of the site as Pat's pseudonymous project archive.

## Accessibility and Responsiveness

The rework should maintain or improve baseline accessibility:

- Semantic landmarks: header, nav, main, section, footer.
- Keyboard-accessible links and buttons.
- Sufficient color contrast in light and dark modes.
- Responsive layout for mobile, tablet, and desktop.
- Respect reduced-motion preferences for animations.
- Meaningful link text and labels.

## Testing and Verification

Before completion, verify:

- The site works as static files without a build step.
- `index.html` loads without console errors.
- Navigation anchors scroll to the correct sections.
- External links open as intended.
- Mobile navigation works if retained.
- No real full name, employer, company, client, or private work identifiers appear in public-facing files.
- Existing direct pages still load if preserved.
- Git status contains only intentional changes.

Suggested commands/checks:

- Run a local static server and inspect the page in a browser.
- Search for forbidden identity/company terms once known or suspected.
- Search for generic risky terms such as `company`, `employer`, `client`, and old corporate phrasing.
- Use browser console inspection for JavaScript errors.

## Future Migration Path

The first implementation should stay static and simple. Later, the archive can move to:

- `archive.json` loaded by JavaScript.
- Markdown files converted by a static site generator.
- A small GitHub Actions flow for automatic archive generation.

Do not add those now unless the static approach becomes painful.
