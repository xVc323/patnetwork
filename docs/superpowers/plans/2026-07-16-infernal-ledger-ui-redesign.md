# Infernal Ledger UI Redesign Implementation Plan

> Execute in this session because the user explicitly requested plan plus implementation.

## Goal

Deliver the full `ideas.md` UI pass with a non-overlapping combined HP/Hellfire frame and a clear, original braided map whose available choices are explicit.

### Task 1: Lock the new contracts with failing tests

**Files:**
- Modify: `scripts/test-infernal-core.js`
- Modify: `scripts/test-infernal-browser.mjs`

1. Assert ten route rows plus one boss, ordered lanes, 2–3 nodes per row, incoming coverage, and zero crossing edge pairs.
2. Assert map option badges, full risk/reward copy, SVG node sprites, and highlighted incoming routes.
3. Assert HP/resource regions have zero geometric intersection and resource labels fit at desktop, portrait, and short landscape sizes.
4. Assert SVG icons on statuses and piles, relic artwork/effect labels, rarity frames, and visible damage/card effects.
5. Run both suites and record the expected failures.

### Task 2: Build the icon system

**Files:**
- Create: `games/infernal-ledger/assets/infernal-icons.svg`
- Modify: `games/infernal-ledger/content.js`
- Modify: `games/infernal-ledger/game.js`

1. Add symbols for encounter types, statuses, deck, draw, discard, and exhaust.
2. Add an allowlisted SVG helper.
3. Replace text glyphs and unrelated atlas crops with the correct symbols.

### Task 3: Replace the combat HUD component

**Files:**
- Modify: `index.html`
- Modify: `games/infernal-ledger/game.js`
- Modify: `styles.css`

1. Introduce one framed player-vitals grid with a wide HP module and a dedicated resource module.
2. Render one round Hellfire gauge plus separate full Hellfire and Soul Debt labels/values.
3. Remove all resource-over-health absolute positioning and the redundant HP orb.
4. Add responsive layouts that preserve text and geometry.

### Task 4: Build the braided route map

**Files:**
- Modify: `games/infernal-ledger/core.js`
- Modify: `games/infernal-ledger/game.js`
- Modify: `styles.css`

1. Generate ten seeded, ordered two/three-node route bands and one boss.
2. Connect adjacent bands with non-crossing one/two-choice patterns and guarantee every target is reachable.
3. Render restrained curved paths, correct current-option highlighting, numbered badges, and explicit risk/reward copy.
4. Keep mobile scrolling/centering and keyboard focus behavior.

### Task 5: Complete remaining ideas

**Files:**
- Modify: `games/infernal-ledger/game.js`
- Modify: `styles.css`

1. Keep Draw left and Exhaust right with icons and pile inspection.
2. Make card and damage/heal animations visibly render.
3. Differentiate common, uncommon, and rare card frames.
4. Render relic artwork with name/effect inspection.

### Task 6: Verify and refine

1. Run `node scripts/test-infernal-core.js`.
2. Run `node scripts/test-infernal-browser.mjs`.
3. Run `node scripts/validate-site.js`.
4. Inspect desktop, portrait, and short-landscape screenshots and console output.
5. Run `git diff --check`; fix every regression before reporting completion.

