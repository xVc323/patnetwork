# Infernal Ledger UI Redesign

## Intent

Replace the rejected combat HUD and linear-looking map with two purpose-built interfaces that stay readable on desktop, portrait mobile, and short landscape screens. Apply every item in `games/infernal-ledger/ideas.md` without adding runtime dependencies.

## Combat HUD

The player HUD is one new framed component with two real columns:

- a wide HP rail filled inside the grey frame;
- a dedicated Hellfire/Soul Debt module on the right, containing one round Hellfire gauge plus full labels and values.

The resource module participates in grid layout. It is never absolutely positioned over the HP rail. The HP value appears once; the redundant HP orb is removed. At narrow widths the same component keeps both regions side by side with smaller dimensions, then may stack only when required to preserve full `HELLFIRE` and `SOUL DEBT` text.

Draw and Exhaust controls anchor to the lower left and lower right of combat. Card flight and damage/heal feedback receive visible DOM effects in addition to canvas rendering. Common, uncommon, and rare cards use distinct frames, accents, and badges.

## Icon system and relics

A code-native SVG symbol sheet supplies consistent icons for map nodes, statuses, deck, draw, discard, and exhaust. This avoids reusing unrelated relic artwork and remains sharp at every scale. The relic list uses the existing relic atlas, exposes each relic name and full effect, and stays keyboard/touch inspectable.

## Map

The route is a seeded braided river, not a straight Mermaid diagram and not random spaghetti:

- ten encounter floors plus one boss;
- alternating two- and three-node bands with ordered, visibly shifting lanes;
- one or two forward links per node, generated so links never invert or cross;
- restrained seeded bends make the trace original without hiding direction;
- only legal next choices receive strong emphasis.

Each available choice shows an option number, an original node sprite, the encounter type, and a short explicit risk/reward line. Future nodes remain visible but subdued. Paths into current options are highlighted, so the player can immediately associate each card with its route.

## Responsive contract

- No intersection between the HP region and the resource region.
- `HELLFIRE` and `SOUL DEBT` never clip or ellipsize.
- Available map choices remain readable and reachable by horizontal touch scrolling.
- Desktop, portrait mobile, and short landscape preserve the same information hierarchy.

## Verification contract

Core tests prove map size, lane ordering, target reachability, deterministic variation, and absence of crossing edges. Browser tests prove HUD geometry, text fit, option clarity, sprite usage, pile/relic affordances, rarity styling, and visible combat effects at desktop and mobile sizes. Site validation and diff checks close the pass.

