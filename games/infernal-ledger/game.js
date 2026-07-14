(() => {
  'use strict';
  if (!window.InfernalCore || !window.InfernalContent) throw new Error('Infernal game modules failed to load');

  const modal = document.getElementById('infernal-modal');
  const invite = document.getElementById('game-invite');
  const shell = modal?.querySelector('.infernal-shell');
  const canvas = document.getElementById('infernal-canvas');
  const context = canvas?.getContext('2d');
  const intro = document.getElementById('infernal-intro');
  const mapScreen = document.getElementById('infernal-map');
  const combatScreen = document.getElementById('infernal-combat');
  const choiceScreen = document.getElementById('infernal-choice');
  const outcomeScreen = document.getElementById('infernal-outcome');
  const hand = document.getElementById('infernal-hand');
  const intent = document.getElementById('infernal-intent');
  const combatBark = document.getElementById('infernal-combat-bark');
  const narrative = document.getElementById('infernal-narrative');
  const narrativePortrait = document.getElementById('infernal-narrative-portrait');
  const narrativeRole = document.getElementById('infernal-narrative-role');
  const narrativeSpeaker = document.getElementById('infernal-narrative-speaker');
  const narrativeCopy = document.getElementById('infernal-narrative-copy');
  const narrativeNext = document.getElementById('infernal-narrative-next');
  const hud = document.getElementById('infernal-hud');
  const effectStatus = document.getElementById('infernal-effect-status');
  const cardStatus = document.getElementById('infernal-card-status');
  const log = document.getElementById('infernal-log');
  const relics = document.getElementById('infernal-relics');
  const closeButton = document.getElementById('infernal-close');
  const fullscreenButton = document.getElementById('infernal-fullscreen');
  const startButton = document.getElementById('infernal-start');
  const endTurnButton = document.getElementById('infernal-end-turn');
  const playerHp = document.getElementById('infernal-player-hp');
  const playerHpText = document.getElementById('infernal-player-hp-text');
  const playerBlock = document.getElementById('infernal-player-block');
  const enemyHp = document.getElementById('infernal-enemy-hp');
  const enemyHpText = document.getElementById('infernal-enemy-hp-text');
  const enemyBlock = document.getElementById('infernal-enemy-block');
  const enemyName = document.getElementById('infernal-enemy-name');
  const playerStatuses = document.getElementById('infernal-player-statuses');
  const enemyStatuses = document.getElementById('infernal-enemy-statuses');
  const resourceTokens = document.getElementById('infernal-resource-tokens');
  const statusDetail = document.getElementById('infernal-status-detail');
  const deckButton = document.getElementById('infernal-deck-toggle');
  const deckDrawer = document.getElementById('infernal-deck-drawer');
  const deckClose = document.getElementById('infernal-deck-close');
  const pileTabs = document.getElementById('infernal-pile-tabs');
  const deckList = document.getElementById('infernal-deck-list');
  const tutorialTitle = document.getElementById('infernal-tutorial-title');
  const tutorialCopy = document.getElementById('infernal-tutorial-copy');
  const tutorialProgress = document.getElementById('infernal-tutorial-progress');
  const tutorialBack = document.getElementById('infernal-tutorial-back');
  const tutorialSkip = document.getElementById('infernal-tutorial-skip');
  const tutorialNext = document.getElementById('infernal-tutorial-next');
  if (!modal || !invite || !shell || !canvas || !context || !intro || !mapScreen
    || !combatScreen || !choiceScreen || !outcomeScreen || !hand || !intent || !combatBark || !narrative
    || !narrativePortrait || !narrativeRole || !narrativeSpeaker || !narrativeCopy || !narrativeNext
    || !hud || !effectStatus || !cardStatus || !log || !relics || !closeButton || !startButton || !endTurnButton
    || !playerHp || !playerHpText || !playerBlock || !enemyHp || !enemyHpText || !enemyBlock || !enemyName
    || !playerStatuses || !enemyStatuses || !resourceTokens || !statusDetail
    || !deckButton || !deckDrawer || !deckClose || !pileTabs || !deckList || !tutorialTitle || !tutorialCopy
    || !tutorialProgress || !tutorialBack || !tutorialSkip || !tutorialNext) return;

  const { CARD_LIBRARY, ENEMIES, resolveCardDefinition, resolveCardPlayability } = window.InfernalCore;
  const { CARD_ART, ACTOR_CROPS, ACTOR_FACING, RELIC_PRESENTATION, lineFor } = window.InfernalContent;
  const ATLAS = {
    demon: [0, 0], demonAttack: [1, 0], penitent: [2, 0], mouth: [3, 0],
    wretch: [0, 1], chair: [1, 1], intern: [2, 1], hr: [3, 1],
    manager: [0, 2], managerPhase2: [1, 2], event: [2, 2], cardBack: [3, 2],
  };
  const ACT2_ATLAS = {
    claim_eater: [0, 0], carbon_copy: [1, 0], benefits_larva: [2, 0], merger_mimic: [3, 0],
    compliance_seraph: [0, 1], parachute_knight: [1, 1], synergy_hydra: [2, 1], burnout_oracle: [3, 1],
    consultant: [0, 2], vp_knives: [1, 2], eternal_vp: [2, 2], eternal_vp_phase2: [3, 2],
  };
  const EXTRA_ATLAS = { late_fee_ghoul: [0, 0], redundancy_clone: [1, 0] };
  const atlas = new Image();
  atlas.src = 'games/infernal-ledger/assets/sprite-atlas.png';
  atlas.addEventListener('load', () => render());
  const act2Atlas = new Image();
  act2Atlas.src = 'games/infernal-ledger/assets/act2-sprite-atlas.png';
  act2Atlas.addEventListener('load', () => render());
  const extraAtlas = new Image();
  extraAtlas.src = 'games/infernal-ledger/assets/extra-enemy-atlas.png';
  extraAtlas.addEventListener('load', () => render());

  let run = null;
  let previousFocus = null;
  let selectedCard = 0;
  let armedTouchCard = null;
  let armedTouchTimer = 0;
  let animation = null;
  let animationFrame = 0;
  let ambientFrame = 0;
  let lastAmbientPaint = 0;
  let lastFrame = 0;
  let visualEffects = [];
  let currentBark = null;
  let queuedBarks = [];
  let barkIndex = 0;
  let dialogueClock = 0;
  let lastDialogueClock = -Infinity;
  let tutorialStep = 0;
  let selectedRewardId = null;
  let pendingPermanent = null;
  let deckOpen = false;
  let deckOpener = null;
  let selectedPile = 'deck';
  let mapResizeFrame = 0;
  let runStartedAt = 0;
  let lastRenderedScreen = 'intro';
  let narrativeState = null;
  const seenNarratives = new Set();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const glossaryTooltip = document.createElement('div');
  glossaryTooltip.id = 'infernal-glossary-tooltip';
  glossaryTooltip.className = 'infernal-glossary-tooltip';
  glossaryTooltip.setAttribute('role', 'tooltip');
  glossaryTooltip.hidden = true;
  shell.appendChild(glossaryTooltip);

  const NARRATIVE_SCENES = {
    opening: [
      { actor: 'hero', speaker: 'Minor Demon', role: 'NEW HIRE · ETERNAL ACCOUNTS', copy: 'Probation. One corporate ladder. Two departments of Hell. What could be legally survivable?' },
      { actor: 'morrow', speaker: 'Morrow', role: 'UNION REPRESENTATIVE · DECEASED', copy: 'I cannot stop Hell from exploiting you. I can, however, make it document the exploitation in triplicate.' },
      { actor: 'morrow', speaker: 'Morrow', role: 'LOCAL 666 · CASE OFFICER', copy: 'Choose a package. Read enemy intent. And remember: Soul Debt is tomorrow’s mana wearing handcuffs.' },
    ],
    promotion: [
      { actor: 'morrow', speaker: 'Morrow', role: 'PROMOTION WITNESS', copy: 'Act Two. Executive access, sharper monsters, and a dress code composed mostly of knives.' },
      { actor: 'hero', speaker: 'Minor Demon', role: 'ASSISTANT TO THE ASSISTANT MANAGER', copy: 'So the promotion is real?' },
      { actor: 'morrow', speaker: 'Morrow', role: 'UNION REPRESENTATIVE · DECEASED', copy: 'The workload is real. The promotion is a decorative noun.' },
    ],
    board: [
      { actor: 'morrow', speaker: 'Morrow', role: 'FINAL GRIEVANCE OFFICER', copy: 'The Executive is ahead. Its health plan covers neither health nor plans.' },
      { actor: 'hero', speaker: 'Minor Demon', role: 'HOSTILE SUCCESSION CANDIDATE', copy: 'Good. I brought an actionable restructuring proposal.' },
    ],
  };

  function setNarrativeVisibility(open) {
    narrative.hidden = !open;
    [canvas, mapScreen, combatScreen, choiceScreen, outcomeScreen].forEach((surface) => { surface.inert = open; });
  }

  function renderNarrative() {
    const line = narrativeState && NARRATIVE_SCENES[narrativeState.scene]?.[narrativeState.index];
    setNarrativeVisibility(Boolean(line));
    if (!line) return;
    narrative.dataset.actor = line.actor;
    narrativePortrait.dataset.speaker = line.actor;
    narrativeRole.textContent = line.role;
    narrativeSpeaker.textContent = line.speaker;
    narrativeCopy.textContent = line.copy;
    narrativeNext.textContent = narrativeState.index === NARRATIVE_SCENES[narrativeState.scene].length - 1 ? 'Proceed under protest' : 'Continue';
    narrativeNext.focus({ preventScroll: true });
  }

  function openNarrative(scene) {
    if (!NARRATIVE_SCENES[scene] || seenNarratives.has(scene)) return;
    seenNarratives.add(scene);
    narrativeState = { scene, index: 0 };
    renderNarrative();
  }

  function advanceNarrative() {
    if (!narrativeState) return;
    narrativeState.index += 1;
    if (narrativeState.index >= NARRATIVE_SCENES[narrativeState.scene].length) {
      narrativeState = null; setNarrativeVisibility(false);
      const target = run?.state.screen === 'combat' ? canvas : choiceScreen.querySelector('#infernal-choice-title') || mapScreen.querySelector('.infernal-map-node.available');
      target?.focus({ preventScroll: true });
      return;
    }
    renderNarrative();
  }

  function showGlossaryTooltip(keyword) {
    const position = () => {
      const rect = keyword.getBoundingClientRect();
      const margin = 12;
      const halfWidth = Math.min(135, window.innerWidth * .42);
      glossaryTooltip.style.left = `${Math.max(margin + halfWidth, Math.min(window.innerWidth - margin - halfWidth, rect.left + rect.width / 2))}px`;
      glossaryTooltip.style.top = `${Math.max(56, rect.top - 9)}px`;
    };
    glossaryTooltip.textContent = keyword.dataset.tooltip || keyword.title || '';
    glossaryTooltip.hidden = !glossaryTooltip.textContent;
    position();
    requestAnimationFrame(position);
  }

  shell.addEventListener('pointerover', (event) => {
    const keyword = event.target.closest?.('.infernal-keyword');
    if (keyword) showGlossaryTooltip(keyword);
  });
  shell.addEventListener('pointerout', (event) => {
    const card = event.target.closest?.('.infernal-card');
    const keyword = event.target.closest?.('.infernal-keyword');
    if ((card && !card.contains(event.relatedTarget)) || (keyword && !card && !keyword.contains(event.relatedTarget))) glossaryTooltip.hidden = true;
  });
  shell.addEventListener('focusin', (event) => {
    const keyword = event.target.matches?.('.infernal-keyword') ? event.target : event.target.matches?.('.infernal-card') ? event.target.querySelector('.infernal-keyword') : null;
    if (keyword) showGlossaryTooltip(keyword);
  });
  shell.addEventListener('focusout', (event) => { if (event.target.matches?.('.infernal-keyword, .infernal-card')) glossaryTooltip.hidden = true; });
  shell.addEventListener('click', (event) => {
    const keyword = event.target.closest?.('.infernal-keyword');
    if (!keyword) return;
    event.preventDefault(); event.stopPropagation(); showGlossaryTooltip(keyword);
  }, true);
  shell.addEventListener('keydown', (event) => {
    const keyword = event.target.closest?.('.infernal-keyword');
    if (!keyword || !['Enter', ' '].includes(event.key)) return;
    event.preventDefault(); event.stopPropagation(); showGlossaryTooltip(keyword);
  }, true);

  function enemyShouldMirror(enemy) {
    const spriteKey = enemy.enemyId === 'manager' && enemy.phase === 2 ? 'managerPhase2'
      : enemy.enemyId === 'eternal_vp' && enemy.phase === 2 ? 'eternal_vp_phase2'
        : (ENEMIES[enemy.enemyId]?.sprite || enemy.enemyId);
    return ACTOR_FACING[spriteKey] === 'right';
  }

  const TUTORIAL = [
    { title: 'Read the fine print.', copy: 'Enemy intent shows exactly what comes next. Spend Hellfire to play cards, then end your turn.' },
    { title: 'Borrow against eternity.', copy: 'Hellfire is your mana. Short on it? Overdraft anyway. Each Soul Debt removes one Hellfire next turn, then clears. Two Debt is the normal limit.' },
    { title: 'Hide behind paperwork.', copy: 'Block absorbs incoming damage, then disappears at the end of the enemy turn. Blue shields show exact Block.' },
    { title: 'Keyboard, clavier, claws.', copy: 'Click cards once. On touch, tap once to inspect and double-tap the same card to play. Use arrows or A/Q and D to select, Enter/Space to play, E to end turn, F for fullscreen.' },
  ];
  const STATUS_DEFINITIONS = {
    strength: { icon: '⚔', name: 'Strength', text: 'Adds {amount} damage to every enemy attack.', polarity: 'positive' },
    ritual: { icon: '✦', name: 'Ritual', text: 'Adds {amount} damage to every card attack this combat.', polarity: 'positive' },
    filing: { icon: '▤', name: 'Filing', text: 'Stored paperwork consumed by Filing cards.', polarity: 'resource' },
    bribed: { icon: '₵', name: 'Bribed', text: 'Cancels the next enemy attack damage.', polarity: 'negative' },
    weak: { icon: '↓', name: 'Weak', text: 'Deals 25% less attack damage.', polarity: 'negative' },
    vulnerable: { icon: '◇', name: 'Vulnerable', text: 'Takes 50% more attack damage.', polarity: 'negative' },
    bleed: { icon: '†', name: 'Bleed', text: 'Loses HP at turn end, then decreases by 1.', polarity: 'negative' },
    debt: { icon: '§', name: 'Soul Debt', text: 'Removes {amount} Hellfire next turn, then clears.', polarity: 'negative' },
    pendingDebt: { icon: '⌛', name: 'Pending Debt', text: 'Becomes Soul Debt at the next combat.', polarity: 'negative' },
  };
  const ENEMY_GIMMICK_DEFINITIONS = {
    mirrorBlock: { name: 'Asset Assimilation', text: 'Copies half the Block you gain.', icon: '◈' },
    debtStrength: { name: 'Predatory Covenant', text: 'Gains Strength whenever you gain Soul Debt.', icon: '§' },
    landingShield: { name: 'Golden Parachute', text: 'After your first damaging card each turn, gains 6 Block.', icon: '⬡' },
    thirdCardStrength: { name: 'Headcount Growth', text: 'Gains 2 Strength after every third card you play.', icon: 'Ⅲ' },
    exhaustBleed: { name: 'Burnout Forecast', text: 'Whenever you Exhaust a card, you gain 1 Bleed.', icon: '†' },
    copyInjury: { name: 'Duplicate Injury', text: 'After your first damaging card each turn, you lose 3 HP directly.', icon: 'Ⅱ' },
  };
  const KEYWORD_DEFINITIONS = {
    'Soul Debt': 'Borrowed mana. Each point removes 1 Hellfire next turn, then clears.',
    Damage: 'Removes HP after Block and other defenses are resolved.',
    Debt: 'Soul Debt: each point removes 1 Hellfire next turn, then clears.',
    Hellfire: 'Mana spent to play cards. Normally refills to 3 each turn, minus Soul Debt.',
    Overdraft: 'Play without enough Hellfire by gaining Soul Debt.',
    Block: 'Absorbs damage, then disappears after the enemy turn.',
    Weak: 'Deals 25% less attack damage.',
    Vulnerable: 'Takes 50% more attack damage.',
    Bleed: 'Loses HP at turn end, then decreases by 1.',
    Filing: 'Stored paperwork consumed by Filing cards.',
    Ritual: 'Adds attack power for this combat.',
    Bribed: 'Cancels the next enemy attack damage.',
    Exhausted: 'Already Exhausted cards empower certain effects this combat.',
    Exhaust: 'Removes this card from combat after use.',
    Obols: 'Infernal currency earned from fights and spent in shops.',
  };
  const BENEFIT_DETAILS = {
    union: { icon: '⚒', art: 4, department: 'Collective Damnation', clause: 'Stable opening defense', risk: 'Requires paperwork' },
    blood: { icon: '♥', art: 5, department: 'Vital Asset Extraction', clause: 'More HP · self-harm synergy', risk: 'Blood remains company property' },
    credit: { icon: '§', art: 1, department: 'Predatory Treasury', clause: 'More Debt capacity · 15 Obols', risk: 'Tomorrow becomes smaller' },
    filing: { icon: '▤', art: 9, department: 'Records & Retention', clause: 'More Filing at combat start', risk: 'Cabinet knows your address' },
    pain: { icon: '†', art: 6, department: 'Workplace Wellness', clause: 'Pain funds the next attack', risk: 'Claims automatically denied' },
    archive: { icon: '※', art: 7, department: 'Destructive Retention', clause: 'Exhaust creates Block', risk: 'Evidence becomes breathable smoke' },
    draw: { icon: 'Ⅰ', art: 3, department: 'Executive Filing', clause: 'Extra opening card', risk: 'Inbox expands accordingly' },
    synergy: { icon: '∑', art: 0, department: 'Cross-Functional Torment', clause: 'Status creates Ritual', risk: 'Teamwork now contagious' },
    immunity: { icon: '◇', art: 11, department: 'Executive Privilege', clause: 'First debuff prevented', risk: 'Ethics waiver permanent' },
    liquid: { icon: '¢', art: 2, department: 'Liquid Assets', clause: 'First Obol cost reduced', risk: 'Purse remains carnivorous' },
    pension: { icon: '×', art: 10, department: 'Post-Mortem Benefits', clause: 'Elite kills restore HP', risk: 'Vesting begins after death' },
    removeStarter: { icon: '⌫', art: 10, department: 'Severance Processing', clause: 'Remove starter paperwork', risk: 'Personal effects incinerated' },
    transformStarter: { icon: '↻', art: 8, department: 'Lateral Reassignment', clause: 'Transform a starter card', risk: 'Role description may develop teeth' },
    upgradeStarters: { icon: '↑', art: 3, department: 'Accelerated Promotion', clause: 'Upgrade starter cards', risk: 'Expectations rise faster than pay' },
    draftRare: { icon: '★', art: 0, department: 'Executive Sampling', clause: 'Begin with a rare card', risk: 'Sample remains legally binding' },
    hazardPay: { icon: '☣', art: 11, department: 'Occupational Hazards', clause: 'More maximum HP', risk: 'Debt begins immediately' },
    cashCurse: { icon: '¤', art: 2, department: 'Payroll Advances', clause: 'Start richer', risk: 'Repayment follows you home' },
    removePair: { icon: '✂', art: 9, department: 'Board Cleanup', clause: 'Remove two starter cards', risk: 'Redundancies may include organs' },
    upgradeForMaxHp: { icon: '⇧', art: 4, department: 'Golden Restructure', clause: 'Upgrade cards for maximum HP', risk: 'Growth is measured in scar tissue' },
    draftLiability: { icon: '⚖', art: 7, department: 'Executive Liability', clause: 'Draft a powerful obligation', risk: 'Indemnity explicitly excluded' },
  };

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  }

  const KEYWORD_CLASSES = {
    damage: 'damage', block: 'block', weak: 'status', vulnerable: 'status', bleed: 'status', debt: 'status', 'soul debt': 'status',
    hellfire: 'resource', obols: 'resource', filing: 'resource', ritual: 'resource', bribed: 'special', exhaust: 'special', exhausted: 'special', overdraft: 'special',
  };
  const SEMANTIC_TERM_PATTERN = /(?:deal(?:s)?|take(?:s)?|lose(?:s)?)?\s*\+?\d+(?:\s*[,+]\s*\+?\d+\s+with\s+Debt)?\s+(?:attack\s+)?damage(?:\s*\(\d+\s+hits\))?|(?:gain(?:s)?|\+)?\s*\d+\s+Block|(?:heal(?:s)?|restore(?:s)?)\s+\d+\s+HP|(?:gain(?:s)?|apply|applies|add|adds)?\s*\d+\s+(?:Debt|Weak|Vulnerable|Bleed)|(?:gain(?:s)?|lose(?:s)?|spend|pay|start\s+with)?\s*\d+\s+(?:Hellfire|Obols?|Filing|Ritual)/gi;

  function enrichKeywords(value, interactive = true) {
    const pattern = new RegExp(`\\b(${Object.keys(KEYWORD_DEFINITIONS).map((keyword) => keyword.replace(' ', '\\s+')).join('|')})\\b`, 'gi');
    return escapeHtml(value).replace(pattern, (match) => {
      const definition = Object.entries(KEYWORD_DEFINITIONS).find(([keyword]) => keyword.toLowerCase() === match.toLowerCase().replace(/\s+/g, ' '))?.[1];
      const label = `${match}: ${definition || ''}`;
      const semanticClass = KEYWORD_CLASSES[match.toLowerCase().replace(/\s+/g, ' ')];
      if (!interactive) return `<span class="infernal-keyword-static${semanticClass ? ` infernal-keyword-${semanticClass}` : ''}">${match}</span>`;
      return `<span class="infernal-keyword${semanticClass ? ` infernal-keyword-${semanticClass}` : ''}" role="button" tabindex="0" aria-label="${escapeHtml(label)}" title="${escapeHtml(definition || '')}" data-tooltip="${escapeHtml(definition || '')}">${match}</span>`;
    });
  }

  function semanticTermClass(value) {
    if (/damage/i.test(value)) return 'damage';
    if (/Block/i.test(value)) return 'block';
    if (/heal|restore/i.test(value)) return 'heal';
    if (/Debt|Weak|Vulnerable|Bleed/i.test(value)) return 'status';
    return 'resource';
  }

  function enrichTerms(value, { interactive = true } = {}) {
    const source = String(value);
    const matches = [...source.matchAll(new RegExp(SEMANTIC_TERM_PATTERN.source, 'gi'))];
    if (!matches.length) return enrichKeywords(source, interactive);
    let cursor = 0;
    return matches.map((match) => {
      const prefix = enrichKeywords(source.slice(cursor, match.index), interactive);
      cursor = match.index + match[0].length;
      const type = semanticTermClass(match[0]);
      return `${prefix}<strong class="infernal-semantic-term infernal-term-${type}">${enrichKeywords(match[0], interactive)}</strong>`;
    }).join('') + enrichKeywords(source.slice(cursor), interactive);
  }

  function statusEntries(actor, target = 'player') {
    return Object.entries(STATUS_DEFINITIONS)
      .map(([id, definition]) => {
        const amount = Number(actor?.[id] || 0);
        const text = id === 'ritual' && target === 'enemy'
          ? `Adds ${amount} Strength after each enemy action.`
          : definition.text.replaceAll('{amount}', String(amount));
        return { id, name: definition.name, amount, polarity: definition.polarity, text };
      })
      .filter((status) => status.amount > 0);
  }

  function showStatusDetail(name, amount, text) {
    statusDetail.hidden = false;
    statusDetail.innerHTML = `<strong>${escapeHtml(name)}${amount == null ? '' : ` ${amount}`}</strong><span>${escapeHtml(text)}</span>`;
    effectStatus.textContent = `${name}${amount == null ? '' : ` ${amount}`}. ${text}`;
  }

  function renderStatuses(container, actor, target = 'player') {
    container.innerHTML = '';
    statusEntries(actor, target).forEach(({ id, name, amount, polarity, text }) => {
      const definition = STATUS_DEFINITIONS[id];
      const button = document.createElement('button'); button.type = 'button'; button.className = `infernal-status-chip status-${id}`;
      button.dataset.status = id; button.dataset.polarity = polarity; button.setAttribute('aria-label', `${name}: ${amount}. ${text}`);
      button.innerHTML = `<span aria-hidden="true">${definition.icon}</span><strong>${amount}</strong>`;
      button.addEventListener('click', () => showStatusDetail(definition.name, amount, text));
      container.appendChild(button);
    });
  }

  function renderEnemyGimmick(container, enemy) {
    const gimmick = ENEMY_GIMMICK_DEFINITIONS[enemy?.gimmick];
    if (!gimmick) return;
    const button = document.createElement('button'); button.type = 'button'; button.className = 'infernal-status-chip infernal-gimmick-chip';
    button.dataset.gimmick = enemy.gimmick; button.dataset.polarity = 'negative';
    button.setAttribute('aria-label', `${gimmick.name}. ${gimmick.text}`);
    button.title = gimmick.text;
    button.innerHTML = `<span aria-hidden="true">${gimmick.icon}</span><strong>PASSIVE</strong>`;
    button.addEventListener('click', () => showStatusDetail(gimmick.name, null, gimmick.text));
    container.appendChild(button);
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    const width = Math.max(1, Math.round(rect.width * ratio));
    const height = Math.max(1, Math.round(rect.height * ratio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width; canvas.height = height; context.imageSmoothingEnabled = false;
    }
    renderCanvas();
  }

  function combatComposition() {
    const width = canvas.width;
    const height = canvas.height;
    const portrait = window.innerWidth <= 760 && window.innerHeight > 540;
    const shortLandscape = window.innerHeight <= 540;
    if (shortLandscape) {
      const heroSize = Math.min(height * .62, width * .31);
      const enemySize = Math.min(height * .68, width * .33);
      return {
        mode: 'short-landscape',
        hero: { x: width * .04, y: height * .27, size: heroSize },
        enemy: { x: width * .67, y: height * .28, size: enemySize },
        enemyHudSafeBottom: height * .26,
      };
    }
    if (portrait) {
      const heroSize = Math.min(height * .34, width * .38);
      const enemySize = Math.min(height * .36, width * .42);
      return {
        mode: 'portrait',
        hero: { x: width * .04, y: height * .36, size: heroSize },
        enemy: { x: width * .56, y: height * .34, size: enemySize },
        enemyHudSafeBottom: height * .31,
      };
    }
    const heroSize = Math.min(height * .58, width * .39);
    const enemySize = Math.min(height * .66, width * .43);
    return {
      mode: 'desktop',
      hero: { x: width * .05, y: height * .2, size: heroSize },
      enemy: { x: width * .56, y: height * .28, size: enemySize },
      enemyHudSafeBottom: height * .27,
    };
  }

  function handleWindowResize() {
    resizeCanvas();
    if (run?.state.screen !== 'map') return;
    if (mapResizeFrame) cancelAnimationFrame(mapResizeFrame);
    mapResizeFrame = requestAnimationFrame(() => { mapResizeFrame = 0; renderMap(); });
  }

  function sprite(key, x, y, width, height, flip = false) {
    const alternate = Boolean(ACT2_ATLAS[key]);
    const extra = Boolean(EXTRA_ATLAS[key]);
    const source = extra ? extraAtlas : alternate ? act2Atlas : atlas;
    if (!source.complete || !source.naturalWidth) return;
    const [column, row] = (extra ? EXTRA_ATLAS[key] : alternate ? ACT2_ATLAS[key] : ATLAS[key]) || ATLAS.demon;
    const cellWidth = source.naturalWidth / (extra ? 2 : 4);
    const cellHeight = source.naturalHeight / (extra ? 1 : 3);
    const crop = ACTOR_CROPS[key] || { x: 0, y: 0, width: cellWidth, height: cellHeight };
    const sourceX = column * cellWidth + crop.x;
    const sourceY = row * cellHeight + crop.y;
    const fit = Math.min(width / crop.width, height / crop.height);
    const drawWidth = crop.width * fit;
    const drawHeight = crop.height * fit;
    let drawX = x + (width - drawWidth) / 2;
    const drawY = y + height - drawHeight;
    context.save();
    if (flip) { context.translate(drawX + drawWidth, 0); context.scale(-1, 1); drawX = 0; }
    context.drawImage(source, sourceX, sourceY, crop.width, crop.height, Math.round(drawX), Math.round(drawY), Math.round(drawWidth), Math.round(drawHeight));
    context.restore();
  }

  function breathingSprite(key, x, y, size, flip = false, phaseOffset = 0) {
    const breathing = !reducedMotion.matches && !animation;
    const lift = breathing ? Math.round(Math.sin(performance.now() / 720 + phaseOffset) * 2) : 0;
    sprite(key, x, y + lift, size, size, flip);
  }

  function drawBackdrop() {
    const width = canvas.width;
    const height = canvas.height;
    const executive = run?.state.act === 2;
    const gradient = context.createRadialGradient(width * .66, height * .38, 10, width * .55, height * .45, width * .75);
    gradient.addColorStop(0, executive ? '#3a253f' : '#3a1712');
    gradient.addColorStop(.45, executive ? '#18101d' : '#170e0b');
    gradient.addColorStop(1, '#070605');
    context.fillStyle = gradient; context.fillRect(0, 0, width, height);
    context.fillStyle = 'rgba(218,170,86,.06)';
    for (let index = 0; index < 45; index += 1) {
      const x = ((index * 977) % 997) / 997 * width;
      const y = ((index * 613) % 991) / 991 * height;
      context.fillRect(Math.floor(x), Math.floor(y), Math.max(1, width / 700), Math.max(1, width / 700));
    }
    context.fillStyle = 'rgba(0,0,0,.42)'; context.fillRect(0, height * .68, width, height * .32);
    if (executive) {
      context.fillStyle = 'rgba(210,168,76,.08)';
      for (let tower = 0; tower < 9; tower += 1) {
        const towerWidth = width * (.055 + (tower % 3) * .012);
        const towerHeight = height * (.16 + (tower % 4) * .055);
        context.fillRect(width * (.04 + tower * .115), height * .68 - towerHeight, towerWidth, towerHeight);
      }
    }
  }

  function renderCanvas() {
    drawBackdrop();
    if (!run) {
      const size = Math.min(canvas.height * .66, canvas.width * .48);
      sprite('demon', canvas.width * .08, canvas.height - size * .92, size, size);
      return;
    }
    const state = run.state;
    if (state.screen === 'combat' && state.combat) {
      const composition = combatComposition();
      const enemy = state.combat.enemy;
      const motion = animation ? Math.sin((1 - animation.remaining / animation.duration) * Math.PI) : 0;
      const attackShift = animation?.type === 'attack' && animation.target === 'enemy' ? motion * canvas.width * .05 : 0;
      const enemyLunge = animation?.type === 'enemy-attack' ? -motion * canvas.width * .055 : 0;
      const heroHitShift = ['hit', 'enemy-attack'].includes(animation?.type) && animation.target === 'player' ? Math.sin(animation.remaining) * 8 : 0;
      const heroSize = composition.hero.size;
      const enemySize = composition.enemy.size;
      breathingSprite(animation?.type === 'attack' ? 'demonAttack' : 'demon', composition.hero.x + attackShift + heroHitShift, composition.hero.y, heroSize);
      const enemyKey = enemy.enemyId === 'manager' && enemy.phase === 2 ? 'managerPhase2'
        : enemy.enemyId === 'eternal_vp' && enemy.phase === 2 ? 'eternal_vp_phase2' : (ENEMIES[enemy.enemyId]?.sprite || enemy.enemyId);
      const attackImpact = animation?.type === 'attack' && animation.target === 'enemy' && animation.remaining < animation.duration * .62;
      const hitShift = (animation?.type === 'hit' && animation.target === 'enemy') || attackImpact ? Math.sin(animation.remaining) * 8 : 0;
      const mirrorEnemy = enemyShouldMirror(enemy);
      breathingSprite(enemyKey, composition.enemy.x + enemyLunge + hitShift, composition.enemy.y, enemySize, mirrorEnemy, Math.PI);
      drawActionFx(composition);
      if (animation?.type === 'hit' || animation?.type === 'enemy-attack' || attackImpact) {
        const flashX = animation.target === 'enemy' ? composition.enemy.x : composition.hero.x;
        const flashWidth = animation.target === 'enemy' ? enemySize : heroSize;
        context.fillStyle = `rgba(255,104,72,${Math.min(.3, animation.remaining / animation.duration * .3)})`;
        context.fillRect(flashX, canvas.height * .12, flashWidth, canvas.height * .48);
      }
    } else if (state.screen === 'event') {
      const size = Math.min(canvas.height * .75, canvas.width * .52);
      sprite('event', canvas.width * .53, canvas.height * .08, size, size);
    } else if (state.screen === 'outcome') {
      sprite(state.result === 'victory' ? 'managerPhase2' : 'demon', canvas.width * .25, canvas.height * .03, canvas.height * .82, canvas.height * .82);
    } else if (state.screen !== 'map') {
      const size = Math.min(canvas.height * .5, canvas.width * .24);
      sprite('demon', canvas.width * .01, canvas.height - size * 1.05, size, size);
    }
    drawVisualEffects();
  }

  function drawActionFx(composition) {
    if (!animation || reducedMotion.matches) return;
    const progress = 1 - animation.remaining / animation.duration;
    const pulse = Math.sin(progress * Math.PI);
    const hero = { x: composition.hero.x + composition.hero.size * .58, y: composition.hero.y + composition.hero.size * .48 };
    const enemy = { x: composition.enemy.x + composition.enemy.size * .46, y: composition.enemy.y + composition.enemy.size * .48 };
    const effects = animation.effectKinds || [];
    context.save();
    context.globalAlpha = Math.max(0, pulse * .86);
    context.lineCap = 'round';
    if (animation.type === 'attack' || animation.type === 'enemy-attack') {
      const from = animation.type === 'attack' ? hero : enemy;
      const to = animation.type === 'attack' ? enemy : hero;
      context.strokeStyle = animation.type === 'attack' ? '#ff8a65' : '#d65369';
      context.shadowColor = context.strokeStyle; context.shadowBlur = canvas.width * .014;
      context.lineWidth = Math.max(3, canvas.width / 260);
      for (let slash = -1; slash <= 1; slash += 1) {
        const offset = slash * canvas.height * .025;
        context.beginPath();
        context.moveTo(from.x + (to.x - from.x) * Math.max(0, progress - .22), from.y + offset);
        context.lineTo(from.x + (to.x - from.x) * Math.min(1, progress + .28), to.y + offset - slash * 9);
        context.stroke();
      }
      context.beginPath(); context.arc(to.x, to.y, composition.enemy.size * .08 * pulse, 0, Math.PI * 2); context.stroke();
    } else if (animation.type === 'card' || animation.type === 'enemy-card') {
      const origin = animation.type === 'card' ? hero : enemy;
      const color = effects.includes('block') ? '#8bd8f2' : effects.some((kind) => ['weak', 'vulnerable', 'bleed', 'debt'].includes(kind)) ? '#d39aef' : '#f2cc67';
      context.strokeStyle = color; context.shadowColor = color; context.shadowBlur = canvas.width * .012;
      context.lineWidth = Math.max(2, canvas.width / 360);
      for (let ring = 1; ring <= 3; ring += 1) {
        context.beginPath(); context.arc(origin.x, origin.y, composition.hero.size * (.04 + ring * .045) * (1 + progress), 0, Math.PI * 2); context.stroke();
      }
      for (let ray = 0; ray < 8; ray += 1) {
        const angle = ray / 8 * Math.PI * 2 + progress;
        const radius = composition.hero.size * .23;
        context.fillStyle = color; context.fillRect(origin.x + Math.cos(angle) * radius, origin.y + Math.sin(angle) * radius, 4, 4);
      }
    }
    context.restore();
  }

  const EFFECT_COLORS = { damage: '#ff5b4d', block: '#79c9e8', absorbed: '#79c9e8', heal: '#75d487', debt: '#f39a4d', obols: '#f1c75b', weak: '#be86e8', vulnerable: '#d47e9a', bleed: '#d95454', filing: '#e0bd62', ritual: '#dca1f0', bribed: '#d9b64e', immune: '#87d0d8', phase: '#f0c45e' };
  function effectLabel(effect) {
    if (effect.kind === 'damage') return `-${effect.amount}`;
    if (effect.kind === 'block') return `+${effect.amount} BLOCK`;
    if (effect.kind === 'absorbed') return `${effect.amount} BLOCKED`;
    if (effect.kind === 'heal') return `+${effect.amount} HP`;
    if (effect.kind === 'debt') return `${effect.amount > 0 ? '+' : ''}${effect.amount} DEBT`;
    if (effect.kind === 'obols') return `+${effect.amount} OBOLS`;
    if (effect.kind === 'weak') return `+${effect.amount} WEAK`;
    if (['vulnerable', 'bleed', 'filing', 'ritual', 'bribed'].includes(effect.kind)) return `${effect.amount > 0 ? '+' : ''}${effect.amount} ${effect.kind.toUpperCase()}`;
    if (effect.kind === 'immune') return 'IMMUNE';
    return effect.kind === 'phase' ? 'PHASE II' : '';
  }

  function drawVisualEffects() {
    visualEffects.forEach((effect, index) => {
      const progress = 1 - effect.remaining / effect.duration;
      const baseX = effect.target === 'enemy' ? canvas.width * .74 : canvas.width * .23;
      const baseY = effect.target === 'enemy' ? canvas.height * .29 : canvas.height * .35;
      const rise = reducedMotion.matches ? 0 : progress * canvas.height * .1;
      context.save();
      context.globalAlpha = Math.min(1, effect.remaining / 180);
      context.fillStyle = EFFECT_COLORS[effect.kind] || '#f4e3c1';
      context.strokeStyle = '#130907'; context.lineWidth = Math.max(2, canvas.width / 500);
      context.font = `900 ${Math.max(17, canvas.width / 38)}px ui-monospace`;
      context.textAlign = 'center';
      const label = effectLabel(effect);
      context.strokeText(label, baseX + index * 8, baseY - rise);
      context.fillText(label, baseX + index * 8, baseY - rise);
      if (effect.kind === 'damage' && !reducedMotion.matches) {
        for (let particle = 0; particle < 6; particle += 1) {
          const spread = (particle - 2.5) * canvas.width * .009 * progress;
          context.fillRect(baseX + spread, baseY + particle % 2 * 8 - rise * .6, 4, 4);
        }
      }
      context.restore();
    });
  }

  const BARK_PRIORITY = { encounter: 3, phase_two: 5, promotion: 5, defeat: 4, victory: 5, gimmick: 3, low_hp: 4, reward: 1 };
  function showBark(trigger, actor = 'hero', priority = BARK_PRIORITY[trigger] || 2) {
    currentBark = { actor, trigger, priority, text: lineFor(trigger, actor, barkIndex), remaining: 3500 };
    lastDialogueClock = dialogueClock;
    barkIndex += 1;
    updateBarkPresentation();
  }

  function enqueueBark(trigger, actor = 'hero') {
    const priority = BARK_PRIORITY[trigger] || 2;
    if (currentBark) {
      if (priority > currentBark.priority) showBark(trigger, actor, priority);
      return;
    }
    if (priority < 3 && dialogueClock - lastDialogueClock < 5000) return;
    showBark(trigger, actor, priority);
  }

  function updateBarkPresentation() {
    const inCombat = currentBark && run?.state.screen === 'combat';
    const compactLandscape = window.matchMedia('(max-height: 540px)').matches;
    combatBark.hidden = !inCombat || compactLandscape;
    const speaker = currentBark?.actor === 'hero' ? 'MINOR DEMON' : (run?.state.combat?.enemy.name || String(currentBark?.actor || '').replaceAll('_', ' '));
    combatBark.innerHTML = inCombat ? `<small class="infernal-bark-speaker">${speaker}</small><span class="infernal-bark-copy">${currentBark.text}</span>` : '';
    combatBark.classList.toggle('hero', Boolean(inCombat && currentBark.actor === 'hero'));
    combatBark.classList.toggle('enemy', Boolean(inCombat && currentBark.actor !== 'hero'));
    const logCue = currentBark && (run?.state.screen !== 'combat' || compactLandscape);
    if (run) log.textContent = logCue ? `${compactLandscape && inCombat ? 'DIALOGUE · ' : ''}${currentBark.text}` : (run.state.log.at(-1) || 'No irregularities reported.');
    log.classList.toggle('bark', Boolean(logCue));
  }

  function queueEffects(effects) {
    if (!effects.length) return;
    const duration = reducedMotion.matches ? 350 : 850;
    visualEffects.push(...effects.filter((effect) => effect.kind !== 'dialogue').map((effect, index) => ({ ...effect, duration: duration + index * 80, remaining: duration + index * 80 })));
    const announcements = effects.filter((effect) => effect.kind !== 'dialogue').map((effect) => {
      const target = effect.target === 'enemy' ? 'Enemy' : 'Hero';
      if (effect.kind === 'damage') return `${target} takes ${effect.amount} damage`;
      if (effect.kind === 'block') return `${target} gains ${effect.amount} Block`;
      if (effect.kind === 'absorbed') return `${target} blocks ${effect.amount} damage`;
      if (effect.kind === 'heal') return `${target} heals ${effect.amount} HP`;
      if (effect.kind === 'debt') return `${Math.abs(effect.amount)} Debt ${effect.amount < 0 ? 'repaid' : 'gained'}`;
      if (effect.kind === 'obols') return `${effect.amount} Obols gained`;
      if (effect.kind === 'weak') return `${target} gains ${effect.amount} Weak`;
      if (['vulnerable', 'bleed', 'filing', 'ritual', 'bribed'].includes(effect.kind)) return `${target} ${effect.amount < 0 ? 'loses' : 'gains'} ${Math.abs(effect.amount)} ${effect.kind}`;
      if (effect.kind === 'immune') return `${target} prevents ${effect.amount} status`;
      if (effect.kind === 'phase') return 'Boss enters phase two';
      return '';
    }).filter(Boolean);
    effectStatus.textContent = [...new Set(announcements)].join('. ');
    const dialogues = effects.filter((effect) => effect.kind === 'dialogue');
    dialogues.forEach((dialogue) => enqueueBark(dialogue.trigger, dialogue.actor || (dialogue.target === 'enemy' ? run.state.combat?.enemy.enemyId : 'hero')));
    const featuredPhase = effects.findLast((effect) => effect.kind === 'phase');
    if (!dialogues.length && featuredPhase) enqueueBark(featuredPhase.trigger, run.state.combat?.enemy.enemyId || 'hero');
    if (!animationFrame) animationFrame = requestAnimationFrame(animationLoop);
  }

  function consumeEffects() {
    const effects = run?.drainEffects?.() || [];
    queueEffects(effects);
    return effects;
  }

  function setScreen(screen) {
    mapScreen.hidden = screen !== 'map';
    combatScreen.hidden = screen !== 'combat';
    choiceScreen.hidden = !['benefit', 'reward', 'event', 'shop', 'campfire'].includes(screen);
    outcomeScreen.hidden = screen !== 'outcome';
  }

  function renderHud() {
    if (!run) { hud.innerHTML = '<span>Awaiting employee number…</span>'; return; }
    const { player, deck, map } = run.state;
    const streak = run.state.screen === 'combat' ? `<span id="infernal-streak">STREAK <strong>${run.state.combat.streak}</strong></span>` : '';
    const floorTotal = map ? map.rows.length + 1 : 0;
    const floor = map ? `${Math.min(map.progress + 1, floorTotal)}/${floorTotal}` : 'PROMOTION';
    const combatSummary = `<span>ACT <strong>${run.state.act}/2</strong></span><span>OBOLS <strong>${player.obols}</strong></span><span>DECK <strong>${deck.length}</strong></span><span>FLOOR <strong>${floor}</strong></span>${streak}`;
    const runSummary = `<span>ACT <strong>${run.state.act}/2</strong></span><span>HP <strong>${player.hp}/${player.maxHp}</strong></span><span>OBOLS <strong>${player.obols}</strong></span><span>MANA · HELLFIRE <strong>${player.energy}</strong></span><span class="debt">SOUL DEBT <strong>${player.debt}/${player.debtLimit}</strong></span><span>DECK <strong>${deck.length}</strong></span><span>FLOOR <strong>${floor}</strong></span>`;
    hud.innerHTML = run.state.screen === 'combat' ? combatSummary : runSummary;
    const companyBenefits = [...run.state.benefits.map((item) => item.name), ...run.state.relics.map((item) => item.name)];
    relics.textContent = companyBenefits.length ? companyBenefits.join(' · ') : 'NO COMPANY BENEFITS';
    const outsideCombatBark = currentBark && run.state.screen !== 'combat';
    log.textContent = outsideCombatBark ? currentBark.text : (run.state.log.at(-1) || 'No irregularities reported.');
    log.classList.toggle('bark', Boolean(outsideCombatBark));
  }

  function renderTutorial() {
    const page = TUTORIAL[tutorialStep];
    tutorialTitle.textContent = page.title;
    tutorialCopy.textContent = page.copy;
    tutorialProgress.setAttribute('aria-label', `Tutorial step ${tutorialStep + 1} of ${TUTORIAL.length}`);
    tutorialProgress.innerHTML = `<strong>STEP ${tutorialStep + 1} / ${TUTORIAL.length}</strong><span>${TUTORIAL.map((_, index) => `<i class="infernal-tutorial-dot${index === tutorialStep ? ' active' : ''}" aria-hidden="true"></i>`).join('')}</span>`;
    tutorialBack.disabled = tutorialStep === 0;
    tutorialNext.hidden = tutorialStep === TUTORIAL.length - 1;
    startButton.hidden = tutorialStep !== TUTORIAL.length - 1;
  }

  function groupCards(cards) {
    const groups = new Map();
    cards.forEach((card) => {
      const key = `${card.cardId}:${card.upgraded}`;
      const group = groups.get(key) || { ...card, count: 0 };
      group.count += 1; groups.set(key, group);
    });
    return [...groups.values()];
  }

  function renderDeckDrawer() {
    deckDrawer.hidden = !deckOpen;
    if (!deckOpen || !run) return;
    const inCombat = run.state.screen === 'combat';
    if (!inCombat) selectedPile = 'deck';
    const piles = {
      deck: run.state.deck,
      draw: inCombat ? run.state.combat.draw : [],
      discard: inCombat ? run.state.combat.discard : [],
      exhaust: inCombat ? run.state.combat.exhaust : [],
    };
    pileTabs.hidden = !inCombat;
    pileTabs.innerHTML = inCombat ? Object.entries(piles).map(([id, cards]) => `<button type="button" class="infernal-pile-tab${selectedPile === id ? ' active' : ''}" data-pile="${id}"><span>${id}</span><strong>${cards.length}</strong></button>`).join('') : '';
    pileTabs.querySelectorAll('.infernal-pile-tab').forEach((button) => button.addEventListener('click', () => { selectedPile = button.dataset.pile; renderDeckDrawer(); }));
    const visibleCards = piles[selectedPile] || piles.deck;
    deckDrawer.querySelector('#infernal-deck-title').textContent = inCombat ? `${selectedPile[0].toUpperCase()}${selectedPile.slice(1)} pile` : 'Current deck';
    deckList.innerHTML = '';
    groupCards(visibleCards).forEach((card) => {
      const definition = CARD_LIBRARY[card.cardId];
      const entry = document.createElement('article'); entry.className = 'infernal-deck-entry';
      setCardArt(entry, card.cardId);
      entry.innerHTML = `<div class="infernal-deck-thumb"></div><div><strong>${card.count}× ${definition.name}${card.upgraded ? '+' : ''}</strong><small>${definition.cost} Hellfire · ${enrichTerms(cardTerms(card))}</small></div>`;
      deckList.appendChild(entry);
    });
    if (!visibleCards.length) deckList.innerHTML = `<p class="infernal-empty-pile">NO CARDS FILED UNDER ${selectedPile.toUpperCase()}.</p>`;
  }

  function openDeck() {
    if (!run) return;
    deckOpener = document.activeElement; deckOpen = true;
    [...shell.children].filter((child) => child !== deckDrawer).forEach((child) => { child.inert = true; });
    renderDeckDrawer(); deckClose.focus();
  }

  function closeDeck() {
    deckOpen = false;
    [...shell.children].forEach((child) => { child.inert = false; });
    renderDeckDrawer(); deckOpener?.focus();
  }

  const NODE_META = {
    battle: { icon: '×', label: 'Battle', detail: 'Standard risk' },
    elite: { icon: '♟', label: 'Elite', detail: 'Relic + Obols' },
    event: { icon: '?', label: 'Event', detail: 'Unknown clause' },
    shop: { icon: '₵', label: 'Shop', detail: 'Spend Obols' },
    campfire: { icon: '♨', label: 'Break', detail: 'Rest / upgrade' },
    cache: { icon: '◆', label: 'Cache', detail: 'Assets inside' },
    contract: { icon: '✒', label: 'Contract', detail: 'Debt / reward' },
    boss: { icon: '♛', label: 'Executive', detail: 'Act review' },
  };
  const FLOOR_LABELS = {
    1: ['INTAKE', 'CLAIMS', 'REVIEW', 'LEGAL', 'BENEFITS', 'COLLECTION', 'COMPLIANCE', 'AUDIT', 'SEVERANCE', 'FINAL NOTICE', 'PROMOTION'],
    2: ['LOBBY', 'SYNERGY', 'STRATEGY', 'M&A', 'OFFSITE', 'BOARD PACK', 'GOVERNANCE', 'C-SUITE', 'SUCCESSION', 'QUORUM', 'PARTNERSHIP'],
  };
  function setCardArt(element, cardId) {
    const art = CARD_ART[cardId];
    if (!art) return;
    if (art.atlas === 2) {
      element.classList.add('card-atlas-2');
      element.style.setProperty('--card-art-x-2', `${art.column / Math.max(1, art.columns - 1) * 100}%`);
      element.style.setProperty('--card-art-y-2', `${art.row / Math.max(1, art.rows - 1) * 100}%`);
      return;
    }
    element.style.setProperty('--card-art-x', `${art.column * -20}%`);
    element.style.setProperty('--card-art-y', `${(art.row + .5) * (-100 / 6)}%`);
  }
  function cardTerms(card, playability = null) {
    const definition = resolveCardDefinition(card);
    const damage = definition.damage;
    const block = definition.block;
    const parts = [];
    if (damage) parts.push(`Deal ${damage}${definition.debtScale ? `, +${definition.debtScale} per Debt` : ''}${definition.debtBonus ? `, +${definition.debtBonus} with Debt` : ''}${definition.exhaustPayoff ? `, +${definition.exhaustPayoff} per Exhausted card` : ''} damage.`);
    if (block) parts.push(`Gain ${block} Block.`);
    if (definition.energy) parts.push(`Gain ${definition.energy} Hellfire.`);
    if (definition.debt) parts.push(`Gain ${definition.debt} Debt.`);
    if (definition.reduceDebt) parts.push(`Reduce Debt by ${definition.reduceDebt}.`);
    if (definition.draw) parts.push(`Draw ${definition.draw}.`);
    if (definition.weak) parts.push(`Apply ${definition.weak} Weak.`);
    if (definition.vulnerable) parts.push(`Apply ${definition.vulnerable} Vulnerable.`);
    if (definition.ritual) parts.push(`Gain ${definition.ritual} Ritual.`);
    if (definition.bleed) parts.push(`Apply ${definition.bleed} Bleed.`);
    if (definition.filing) parts.push(`Gain ${definition.filing} Filing.`);
    if (definition.filingSpend) parts.push(`Spend ${definition.filingSpend} Filing for +${definition.filingBonus || 0} damage.`);
    if (definition.filingSpendAll) parts.push(`Spend all Filing for +${definition.filingBonus || 0} each.`);
    if (definition.bribe) parts.push('Cancel the next enemy attack.');
    if (definition.obolCost) {
      const effectiveObolCost = playability?.obolCost;
      parts.push(effectiveObolCost != null && effectiveObolCost !== definition.obolCost
        ? `Pay ${definition.obolCost} → ${effectiveObolCost} Obols.`
        : `Pay ${definition.obolCost} Obols.`);
    }
    if (definition.obols) parts.push(`Gain ${definition.obols} Obols.`);
    if (definition.heal) parts.push(`Heal ${definition.heal} HP.`);
    if (definition.bloodHeal) parts.push(`Heal ${definition.bloodHeal} HP if HP was lost this turn.`);
    if (definition.vulnerableSelf) parts.push(`Gain ${definition.vulnerableSelf} Vulnerable.`);
    if (definition.selfDamage) parts.push(`Lose ${definition.selfDamage} HP.`);
    if (definition.exhaust) parts.push('Exhaust.');
    return parts.join(' ') || definition.text;
  }

  function invalidCardReason(card) {
    return resolveCardPlayability(run.state, card).reason;
  }

  function announceInvalidCard(button, reason) {
    selectedCard = Number(button.dataset.cardIndex);
    const card = run.state.combat.hand[selectedCard];
    cardStatus.textContent = `Cannot play ${CARD_LIBRARY[card.cardId].name}. ${reason}`;
    effectStatus.textContent = cardStatus.textContent;
    statusDetail.hidden = false;
    statusDetail.innerHTML = `<strong>CLAUSE REJECTED</strong><span>${escapeHtml(reason)}</span>`;
    button.classList.remove('invalid-feedback');
    requestAnimationFrame(() => button.classList.add('invalid-feedback'));
  }

  function cardOverdraftDebt(card) {
    return resolveCardPlayability(run.state, card).overdraftDebt;
  }

  function renderMap() {
    mapScreen.innerHTML = '';
    const heading = document.createElement('header'); heading.className = 'infernal-map-heading';
    const floorCount = run.state.map.rows.length + 1;
    const mapProgress = Math.min(100, (run.state.map.progress / run.state.map.rows.length) * 100);
    heading.innerHTML = `<div><p>ACT ${run.state.act} · CORPORATE LADDER</p><h3 id="infernal-map-title">${window.InfernalCore.ACTS[run.state.act - 1]?.name || 'Infernal Administration'}</h3></div><div class="infernal-map-progress"><span>FILE ${String(run.state.map.progress + 1).padStart(2, '0')} / ${floorCount}</span><i style="--map-progress:${mapProgress}%"></i><small>DRAG · SWIPE · FOLLOW THE LIT ROUTES</small></div>`;
    mapScreen.setAttribute('aria-labelledby', 'infernal-map-title');
    const state = run.state;
    const allRows = [...state.map.rows, [state.map.boss]];
    const railWidth = allRows.length * 176;
    let mapGestureMoved = false;
    const paths = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    paths.classList.add('infernal-map-paths'); paths.setAttribute('aria-hidden', 'true'); paths.style.setProperty('--map-rail-width', `${railWidth}px`);
    const grid = document.createElement('div'); grid.className = 'infernal-map-grid'; grid.style.setProperty('--map-rail-width', `${railWidth}px`); grid.style.setProperty('--map-columns', allRows.length);
    allRows.forEach((row, rowIndex) => {
      const column = document.createElement('div'); column.className = 'infernal-map-column';
      column.classList.toggle('boss-column', rowIndex === allRows.length - 1);
      const floorLabel = document.createElement('div'); floorLabel.className = 'infernal-map-floor-label';
      floorLabel.innerHTML = `<span>${rowIndex === allRows.length - 1 ? '★' : String(rowIndex + 1).padStart(2, '0')}</span><small>${FLOOR_LABELS[state.act]?.[rowIndex] || `FLOOR ${rowIndex + 1}`}</small>`;
      column.appendChild(floorLabel);
      row.forEach((node, nodeIndex) => {
        const meta = NODE_META[node.type] || NODE_META.event;
        const button = document.createElement('button');
        button.type = 'button'; button.className = `infernal-map-node type-${node.type}`; button.dataset.nodeId = node.id;
        button.dataset.nodeKind = node.type;
        button.dataset.lane = node.lane ?? 'boss';
        button.style.setProperty('--map-offset', `${(node.offset || 0) * 7}px`);
        button.style.setProperty('--node-y', `${row.length === 1 ? 52 : 14 + nodeIndex * (72 / Math.max(1, row.length - 1))}%`);
        button.innerHTML = `<span class="infernal-map-node-icon" aria-hidden="true">${meta.icon}</span><span class="infernal-map-node-copy"><strong>${meta.label}</strong><small>${meta.detail}</small></span>`;
        button.setAttribute('aria-label', `${meta.label}. ${meta.detail}. Floor ${rowIndex + 1}.`);
        const available = state.map.available.includes(node.id);
        button.disabled = !available; button.classList.toggle('available', available);
        button.classList.toggle('reachable', state.map.reachable.includes(node.id));
        button.classList.toggle('unreachable', state.map.unreachable.includes(node.id));
        button.classList.toggle('visited', state.map.visited.includes(node.id));
        button.addEventListener('click', () => {
          if (mapGestureMoved) return;
          chooseNode(node.id); canvas.focus();
        });
        column.appendChild(button);
      });
      grid.appendChild(column);
    });
    const markerColumn = grid.children[Math.min(state.map.progress, grid.children.length - 1)];
    const currentMarker = document.createElement('div'); currentMarker.className = 'infernal-map-current-marker'; currentMarker.setAttribute('aria-label', `Current floor ${state.map.progress + 1}`); currentMarker.textContent = 'YOU ARE HERE';
    markerColumn?.appendChild(currentMarker);
    const scroll = document.createElement('div'); scroll.className = 'infernal-map-scroll';
    scroll.append(paths, grid);
    const startAffordance = document.createElement('div'); startAffordance.className = 'infernal-map-scroll-affordance start'; startAffordance.setAttribute('aria-hidden', 'true');
    const endAffordance = document.createElement('div'); endAffordance.className = 'infernal-map-scroll-affordance end'; endAffordance.setAttribute('aria-hidden', 'true');
    const legend = document.createElement('div'); legend.className = 'infernal-map-legend';
    legend.innerHTML = '<span><i class="available"></i>AVAILABLE FILE</span><span><i></i>FUTURE REVIEW</span><span><b>♟</b>ELITE · BONUS RELIC</span><small>Choose one connected file. Transfers between departments are forbidden.</small>';
    mapScreen.append(heading, scroll, startAffordance, endAffordance, legend);
    const pathRect = paths.getBoundingClientRect();
    paths.setAttribute('viewBox', `0 0 ${pathRect.width} ${pathRect.height}`);
    state.map.rows.flat().forEach((node) => node.connections.forEach((targetId) => {
      const sourceNode = grid.querySelector(`[data-node-id="${node.id}"]`);
      const targetNode = grid.querySelector(`[data-node-id="${targetId}"]`);
      if (!sourceNode || !targetNode) return;
      const sourceRect = sourceNode.getBoundingClientRect();
      const targetRect = targetNode.getBoundingClientRect();
      const start = { x: sourceRect.right - pathRect.left, y: sourceRect.top + sourceRect.height / 2 - pathRect.top };
      const end = { x: targetRect.left - pathRect.left, y: targetRect.top + targetRect.height / 2 - pathRect.top };
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const middle = (start.x + end.x) / 2;
      path.setAttribute('d', `M ${start.x} ${start.y} C ${middle} ${start.y}, ${middle} ${end.y}, ${end.x} ${end.y}`);
      path.dataset.from = node.id; path.dataset.to = targetId; path.classList.add('infernal-map-path');
      path.dataset.edgeTrimmed = 'true'; path.dataset.sourceX = sourceRect.left + sourceRect.width / 2 - pathRect.left; path.dataset.targetX = targetRect.left + targetRect.width / 2 - pathRect.left;
      path.dataset.renderStartX = start.x; path.dataset.renderEndX = end.x;
      path.classList.toggle('traversed', state.map.visitedEdges.includes(`${node.id}>${targetId}`));
      path.classList.toggle('available', state.map.available.includes(node.id));
      path.classList.toggle('future', state.map.reachable.includes(node.id) && !path.classList.contains('available') && !path.classList.contains('traversed'));
      path.classList.toggle('impossible', state.map.unreachable.includes(node.id) || state.map.unreachable.includes(targetId));
      paths.appendChild(path);
      if (path.classList.contains('available') || path.classList.contains('traversed')) {
        [start, end].forEach((point) => {
          const anchor = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          anchor.setAttribute('cx', point.x); anchor.setAttribute('cy', point.y); anchor.setAttribute('r', '3.2');
          anchor.classList.add('infernal-map-anchor');
          if (path.classList.contains('available')) anchor.classList.add('available');
          if (path.classList.contains('traversed')) anchor.classList.add('traversed');
          paths.appendChild(anchor);
        });
      }
    }));
    const updateScrollAffordances = () => {
      startAffordance.dataset.visible = String(scroll.scrollLeft > 8);
      endAffordance.dataset.visible = String(scroll.scrollLeft + scroll.clientWidth < scroll.scrollWidth - 8);
    };
    scroll.addEventListener('scroll', updateScrollAffordances, { passive: true });
    let dragStartX = 0;
    let dragStartScroll = 0;
    let dragging = false;
    scroll.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      dragging = true; mapGestureMoved = false; dragStartX = event.clientX; dragStartScroll = scroll.scrollLeft;
    });
    scroll.addEventListener('pointermove', (event) => {
      if (!dragging) return;
      const delta = event.clientX - dragStartX;
      if (Math.abs(delta) > 6 && !mapGestureMoved) {
        mapGestureMoved = true; scroll.classList.add('dragging'); scroll.setPointerCapture(event.pointerId);
      }
      scroll.scrollLeft = dragStartScroll - delta;
    });
    const finishDrag = (event) => {
      if (!dragging) return;
      dragging = false; scroll.classList.remove('dragging');
      if (scroll.hasPointerCapture(event.pointerId)) scroll.releasePointerCapture(event.pointerId);
      if (mapGestureMoved) window.setTimeout(() => { mapGestureMoved = false; }, 0);
    };
    scroll.addEventListener('pointerup', finishDrag);
    scroll.addEventListener('pointercancel', finishDrag);
    scroll.addEventListener('wheel', (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault(); scroll.scrollLeft += event.deltaY;
    }, { passive: false });
    grid.querySelectorAll('.infernal-map-node').forEach((node) => {
      const preview = (active) => paths.querySelectorAll(`[data-from="${node.dataset.nodeId}"]`).forEach((path) => path.classList.toggle('preview', active));
      node.addEventListener('pointerenter', () => preview(true));
      node.addEventListener('pointerleave', () => preview(false));
      node.addEventListener('focus', () => preview(true));
      node.addEventListener('blur', () => preview(false));
    });
    const choices = [...grid.querySelectorAll('.infernal-map-node.available')];
    if (choices.length && state.map.progress > 0) {
      const center = choices.reduce((sum, node) => sum + node.parentElement.offsetLeft + node.offsetLeft, 0) / choices.length;
      scroll.scrollLeft = Math.max(0, Math.min(scroll.scrollWidth - scroll.clientWidth, center - scroll.clientWidth / 2));
    }
    updateScrollAffordances();
  }

  function cardElement(card, index) {
    const definition = resolveCardDefinition(card);
    const button = document.createElement('button');
    const playability = resolveCardPlayability(run.state, card);
    const affordable = playability.affordable;
    const overdraftDebt = affordable ? cardOverdraftDebt(card) : 0;
    button.type = 'button'; button.className = `infernal-card ${definition.rarity}`;
    setCardArt(button, card.cardId);
    const invalidReason = affordable ? '' : invalidCardReason(card);
    button.classList.toggle('unaffordable', !affordable); button.classList.toggle('selected', index === selectedCard);
    button.dataset.cardIndex = index; button.id = `infernal-combat-card-${card.instanceId}`;
    button.setAttribute('aria-selected', String(index === selectedCard));
    button.setAttribute('aria-disabled', String(!affordable));
    if (invalidReason) button.setAttribute('aria-description', invalidReason);
    const text = cardTerms(card, playability);
    button.innerHTML = `<span class="infernal-card-cost">${definition.cost}</span>${overdraftDebt ? `<span class="infernal-card-overdraft">OVERDRAFT<br>+${overdraftDebt} DEBT</span>` : ''}<h4>${definition.name}${card.upgraded ? '+' : ''}</h4><div class="infernal-card-art"></div><p>${enrichTerms(text)}</p><span class="infernal-card-rarity">${definition.rarity}</span>`;
    if (overdraftDebt) button.setAttribute('aria-label', `${definition.name}. Costs ${definition.cost} Hellfire. Overdraft adds ${overdraftDebt} Soul Debt. ${text}`);
    button.addEventListener('click', () => {
      if (!affordable) { announceInvalidCard(button, invalidReason); return; }
      if (window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 760) {
        if (!isTouchCardArmed(card)) {
          clearArmedTouchCard(); selectedCard = index; renderCombat({ preserveTouchArm: true }); armTouchCard(card); return;
        }
      }
      clearArmedTouchCard(); playCard(index);
    });
    return button;
  }

  function clearArmedTouchCard() {
    if (armedTouchTimer) clearTimeout(armedTouchTimer);
    armedTouchTimer = 0; armedTouchCard = null;
  }

  function armTouchCard(card) {
    const instanceId = card.instanceId;
    armedTouchCard = { instanceId, expiresAt: performance.now() + 1500 };
    armedTouchTimer = window.setTimeout(() => {
      if (armedTouchCard?.instanceId !== instanceId) return;
      clearArmedTouchCard();
      if (run?.state.screen === 'combat') renderCombat({ preserveTouchArm: true });
    }, 1500);
  }

  function isTouchCardArmed(card) {
    if (!armedTouchCard || armedTouchCard.instanceId !== card.instanceId) return false;
    if (performance.now() <= armedTouchCard.expiresAt) return true;
    clearArmedTouchCard(); return false;
  }

  function renderCombat({ preserveTouchArm = false } = {}) {
    if (!preserveTouchArm) clearArmedTouchCard();
    const state = run.state;
    statusDetail.hidden = true;
    const enemy = state.combat.enemy;
    const enemyIntent = enemy.intent;
    playerHp.setAttribute('aria-valuemax', state.player.maxHp);
    playerHp.setAttribute('aria-valuenow', state.player.hp);
    playerHp.style.setProperty('--health', `${state.player.hp / state.player.maxHp * 100}%`);
    playerHpText.textContent = `${state.player.hp}/${state.player.maxHp}`;
    playerBlock.textContent = state.player.block;
    playerBlock.classList.toggle('active', state.player.block > 0);
    enemyHp.setAttribute('aria-valuemax', enemy.maxHp);
    enemyHp.setAttribute('aria-valuenow', enemy.hp);
    enemyHp.style.setProperty('--health', `${enemy.hp / enemy.maxHp * 100}%`);
    enemyHpText.textContent = `${enemy.hp}/${enemy.maxHp}`;
    enemyBlock.textContent = enemy.block;
    enemyBlock.classList.toggle('active', enemy.block > 0);
    enemyName.textContent = enemy.name;
    renderStatuses(playerStatuses, state.player, 'player');
    renderStatuses(enemyStatuses, enemy, 'enemy');
    renderEnemyGimmick(enemyStatuses, enemy);
    const hpFill = Math.max(0, Math.min(100, state.player.hp / state.player.maxHp * 100));
    const manaFill = Math.max(0, Math.min(100, state.player.energy / 3 * 100));
    resourceTokens.innerHTML = `<div class="infernal-resource-orb infernal-hp-orb" style="--orb-fill:${hpFill}%" role="group" aria-label="Health: ${state.player.hp} of ${state.player.maxHp}"><span class="infernal-orb-frame" aria-hidden="true"></span><small>HP</small><strong>${state.player.hp}/${state.player.maxHp}</strong></div><div class="infernal-resource-orb infernal-mana-orb${state.player.debt ? ' has-debt' : ''}" style="--orb-fill:${manaFill}%" role="group" aria-label="Hellfire mana: ${state.player.energy}. Soul Debt: ${state.player.debt} of ${state.player.debtLimit}" title="Each Soul Debt removes 1 Hellfire next turn, then clears."><span class="infernal-orb-frame" aria-hidden="true"></span><i aria-hidden="true"></i><small>HELLFIRE<em>MANA</em></small><strong>${state.player.energy}/3</strong><span class="infernal-orb-debt">DEBT ${state.player.debt}/${state.player.debtLimit}</span></div>`;
    let damage = enemyIntent.damage ? enemyIntent.damage * (enemyIntent.hits || 1) + (enemyIntent.debtScale || 0) * state.player.debt + enemy.strength : 0;
    if (enemy.enemyId === 'chair') damage += Math.max(0, state.combat.turn - 1) * 2;
    if (enemy.weak) damage = Math.floor(damage * .75);
    const details = [];
    if (damage) details.push(`${damage} damage${enemyIntent.hits ? ` (${enemyIntent.hits} hits)` : ''}`);
    if (enemyIntent.block) details.push(`+${enemyIntent.block} block`);
    if (enemyIntent.weak) details.push(`applies ${enemyIntent.weak} Weak`);
    if (enemyIntent.steal) details.push(`steals ${enemyIntent.steal} obols unless dealt 10 damage`);
    if (enemy.enemyId === 'intern' && enemy.strength) details.push(`+${enemy.strength} overtime strength`);
    intent.innerHTML = `<strong class="infernal-intent-label">${escapeHtml(enemyIntent.label)}</strong><br><span class="infernal-intent-effects">${enrichTerms(details.join(' · '))}</span>`;
    intent.setAttribute('aria-label', `${enemyIntent.label}. ${details.join('. ')}`);
    intent.dataset.category = enemyIntent.category || (damage ? 'attack' : enemyIntent.block ? 'defense' : (enemyIntent.weak || enemyIntent.vulnerable || enemyIntent.bleed) ? 'debuff' : 'special');
    updateBarkPresentation();
    hand.innerHTML = '';
    selectedCard = Math.min(selectedCard, Math.max(0, state.combat.hand.length - 1));
    state.combat.hand.forEach((card, index) => hand.appendChild(cardElement(card, index)));
    const active = state.combat.hand[selectedCard];
    cardStatus.textContent = active ? `Selected card ${selectedCard + 1} of ${state.combat.hand.length}: ${CARD_LIBRARY[active.cardId].name}. ${cardTerms(active, resolveCardPlayability(run.state, active))}` : 'No cards in hand.';
  }

  function choiceButton(label, detail, callback, disabled = false) {
    const button = document.createElement('button'); button.type = 'button'; button.disabled = disabled;
    button.innerHTML = `${escapeHtml(label)}${detail ? `<small>${enrichTerms(detail, { interactive: false })}</small>` : ''}`; button.addEventListener('click', callback); return button;
  }

  function rewardCardElement(card) {
    const definition = CARD_LIBRARY[card.cardId];
    const button = document.createElement('button');
    button.type = 'button'; button.className = `infernal-card infernal-reward-card ${definition.rarity}`;
    button.classList.toggle('selected', selectedRewardId === card.instanceId);
    setCardArt(button, card.cardId);
    button.innerHTML = `<span class="infernal-card-cost">${definition.cost}</span><h4>${definition.name}</h4><div class="infernal-card-art"></div><p>${enrichTerms(cardTerms(card))}</p><span class="infernal-card-rarity">${definition.rarity}</span>`;
    button.addEventListener('click', () => {
      const scrollTop = choiceScreen.scrollTop;
      const rewardScroll = choiceScreen.querySelector('.infernal-reward-grid')?.scrollLeft || 0;
      selectedRewardId = card.instanceId; renderChoice();
      choiceScreen.scrollTop = scrollTop;
      const grid = choiceScreen.querySelector('.infernal-reward-grid'); if (grid) grid.scrollLeft = rewardScroll;
      choiceScreen.querySelector(`[data-reward-id="${card.instanceId}"]`)?.focus({ preventScroll: true });
    });
    button.dataset.rewardId = card.instanceId;
    return button;
  }

  function shopCardElement(card) {
    const definition = CARD_LIBRARY[card.cardId];
    const button = document.createElement('button');
    const discounted = card.instanceId === run.state.shop.discountId;
    button.type = 'button'; button.className = `infernal-card infernal-shop-card ${definition.rarity}`;
    button.disabled = card.sold;
    button.setAttribute('aria-disabled', String(card.sold || run.state.player.obols < card.price));
    button.setAttribute('aria-pressed', String(pendingPermanent?.type === 'shop-card' && pendingPermanent.id === card.instanceId));
    button.dataset.shopItem = card.instanceId;
    button.classList.toggle('discounted', discounted);
    button.classList.toggle('selected', pendingPermanent?.type === 'shop-card' && pendingPermanent.id === card.instanceId);
    setCardArt(button, card.cardId);
    button.innerHTML = `<span class="infernal-card-cost">${definition.cost}</span><span class="infernal-shop-price">${card.sold ? 'SOLD' : `${card.price} OBOLS`}</span>${discounted ? '<span class="infernal-shop-sale">INFERNAL SALE</span>' : ''}<h4>${escapeHtml(definition.name)}</h4><div class="infernal-card-art"></div><p>${enrichTerms(cardTerms(card))}</p><span class="infernal-card-rarity">${definition.rarity}</span>`;
    button.addEventListener('click', () => selectPermanent({ screen: 'shop', type: 'shop-card', id: card.instanceId }));
    return button;
  }

  function upgradeComparison(card) {
    return `<span><small>CURRENT</small>${enrichTerms(cardTerms(card))}</span><b aria-hidden="true">›</b><span><small>UPGRADED</small>${enrichTerms(cardTerms({ ...card, upgraded: true }))}</span>`;
  }

  function campUpgradeElement(card) {
    const definition = CARD_LIBRARY[card.cardId];
    const wrapper = document.createElement('article'); wrapper.className = 'infernal-camp-upgrade-card';
    const button = document.createElement('button'); button.type = 'button'; button.className = `infernal-card ${definition.rarity}`;
    const selected = pendingPermanent?.type === 'camp-upgrade' && pendingPermanent.id === card.instanceId;
    button.classList.toggle('selected', selected); button.setAttribute('aria-pressed', String(selected));
    setCardArt(button, card.cardId);
    button.innerHTML = `<span class="infernal-card-cost">${definition.cost}</span><h4>${escapeHtml(definition.name)}+</h4><div class="infernal-card-art"></div><p>${enrichTerms(cardTerms({ ...card, upgraded: true }))}</p><span class="infernal-card-rarity">UPGRADE</span>`;
    button.addEventListener('click', () => selectPermanent({ screen: 'campfire', type: 'camp-upgrade', id: card.instanceId }));
    const comparison = document.createElement('div'); comparison.className = 'infernal-upgrade-comparison'; comparison.innerHTML = upgradeComparison(card);
    wrapper.append(button, comparison); return wrapper;
  }

  function confirmReward() {
    if (!selectedRewardId) return;
    run.chooseReward(selectedRewardId); selectedRewardId = null; render();
  }

  function selectPermanent(selection) {
    pendingPermanent = selection;
    renderChoice();
    choiceScreen.querySelector('[aria-pressed="true"]')?.focus({ preventScroll: true });
  }

  function confirmPermanent() {
    if (!pendingPermanent || pendingPermanent.screen !== run.state.screen) return;
    const selection = pendingPermanent;
    let result = { kind: 'invalid' };
    if (selection.type === 'benefit') result = run.chooseBenefit(selection.id);
    else if (selection.type === 'shop-card' || selection.type === 'shop-relic') result = run.buy(selection.id);
    else if (selection.type === 'remove') result = run.removeCard(selection.id);
    else if (selection.type === 'upgrade') result = run.upgradeCard(selection.id);
    else if (selection.type === 'reroll') result = run.rerollShop();
    else if (selection.type === 'camp-heal') result = run.campfire('heal');
    else if (selection.type === 'camp-upgrade') result = run.campfire('upgrade', selection.id);
    else if (selection.type === 'event-choice') result = run.chooseEvent(selection.id);
    if (result.kind !== 'unaffordable' && result.kind !== 'invalid') pendingPermanent = null;
    consumeEffects(); render();
  }

  function permanentDetail(title, terms, action, cost = null, disabled = false, comparison = '') {
    const panel = document.createElement('section'); panel.className = 'infernal-permanent-detail'; panel.setAttribute('aria-live', 'polite');
    panel.innerHTML = `<div><small>SELECTED CLAUSE</small><strong>${escapeHtml(title)}</strong><p>${enrichTerms(terms)}</p>${comparison}</div>`;
    const confirm = choiceButton(action, cost === null ? 'This decision is permanent.' : `${cost} Obols will be deducted.`, confirmPermanent, disabled);
    confirm.id = 'infernal-permanent-confirm'; panel.appendChild(confirm); return panel;
  }

  function groupedDeckCards(cards) {
    const groups = new Map();
    cards.forEach((card) => {
      const key = `${card.cardId}:${card.upgraded}`;
      const group = groups.get(key) || { card, cards: [] };
      group.cards.push(card); groups.set(key, group);
    });
    return [...groups.values()];
  }

  function renderChoice() {
    const state = run.state;
    choiceScreen.classList.toggle('reward-mode', state.screen === 'reward');
    choiceScreen.classList.toggle('benefit-mode', state.screen === 'benefit');
    choiceScreen.classList.toggle('shop-mode', state.screen === 'shop');
    choiceScreen.classList.toggle('camp-mode', state.screen === 'campfire');
    choiceScreen.innerHTML = '';
    const eyebrow = document.createElement('p'); eyebrow.className = 'eyebrow';
    const title = document.createElement('h3'); title.id = 'infernal-choice-title'; title.tabIndex = -1; choiceScreen.setAttribute('aria-labelledby', title.id); const body = document.createElement('p');
    const list = document.createElement('div'); list.className = 'infernal-choice-list';
    let leading = null; let trailing = null;
    if (state.screen === 'benefit') {
      if (pendingPermanent?.screen !== 'benefit') pendingPermanent = null;
      eyebrow.textContent = state.act === 1 ? 'ONBOARDING PACKAGE' : 'PROMOTION PACKAGE';
      title.textContent = state.act === 1 ? 'Choose your infernal onboarding package' : 'Choose your executive package';
      body.textContent = state.act === 1
        ? 'Passive protection, deck surgery, illicit promotion or predatory advance. One signature reshapes the run.'
        : 'Middle management survived you. Select a permanent clause or restructure the deck before climbing higher.';
      state.benefitChoice.forEach((benefit, index) => {
        const detail = BENEFIT_DETAILS[benefit.effect] || { icon: '§', art: 1, department: 'Infernal Benefits', clause: 'Permanent benefit', risk: 'Terms subject to torment' };
        const button = document.createElement('button'); button.type = 'button'; button.className = 'infernal-benefit-dossier'; button.dataset.benefitId = benefit.id;
        const selected = pendingPermanent?.type === 'benefit' && pendingPermanent.id === benefit.id;
        button.classList.toggle('selected', selected); button.setAttribute('aria-pressed', String(selected));
        const benefitX = (detail.art % 4) / 3 * 100;
        const benefitY = Math.floor(detail.art / 4) / 2 * 100;
        button.innerHTML = `<span class="infernal-benefit-header"><span class="infernal-benefit-kind">${escapeHtml((benefit.kind || 'passive').toUpperCase())}</span><span class="infernal-benefit-file">EMP-${String(index + 1).padStart(3, '0')}</span></span><span class="infernal-benefit-sigil" aria-hidden="true" style="--benefit-x:${benefitX}%;--benefit-y:${benefitY}%"><b>${detail.icon}</b></span><small>${escapeHtml(detail.department)}</small><strong>${escapeHtml(benefit.name)}</strong><p>${enrichTerms(benefit.text)}</p><span class="infernal-benefit-clause"><b>CLAUSE</b>${escapeHtml(detail.clause)}</span><span class="infernal-benefit-risk"><b>FINE PRINT</b>${escapeHtml(detail.risk)}</span>`;
        button.addEventListener('click', () => selectPermanent({ screen: 'benefit', type: 'benefit', id: benefit.id })); list.appendChild(button);
      });
      trailing = document.createElement('div');
      if (pendingPermanent) {
        const benefit = state.benefitChoice.find((item) => item.id === pendingPermanent.id);
        trailing.appendChild(permanentDetail(benefit.name, benefit.text, 'SIGN BENEFIT'));
      }
      const footer = document.createElement('footer'); footer.className = 'infernal-benefit-footer';
      footer.innerHTML = '<span>ONE SIGNATURE</span><i></i><span>PERMANENT CLAUSE</span><i></i><span>NO APPEALS</span>';
      trailing.appendChild(footer);
    } else if (state.screen === 'reward') {
      if (!state.reward.cards.some((card) => card.instanceId === selectedRewardId)) selectedRewardId = null;
      eyebrow.textContent = 'APPROVED COMPENSATION'; title.textContent = 'Choose one card'; body.textContent = selectedRewardId ? 'Selected. Confirm the clause, or inspect another.' : 'Inspect one benefit. Management insists this is generous.';
      if (state.reward.loot) {
        leading = document.createElement('div'); leading.className = 'infernal-loot-banner';
        leading.innerHTML = `<strong>+${state.reward.loot.obols} OBOLS</strong><span>${state.reward.loot.relic ? `ELITE BONUS · ${state.reward.loot.relic.name}` : 'HOSTILE ASSETS RECOVERED'}</span>`;
      }
      list.classList.add('infernal-reward-grid');
      state.reward.cards.forEach((card) => list.appendChild(rewardCardElement(card)));
      const rewardDetail = document.createElement('div'); rewardDetail.className = 'infernal-reward-detail';
      if (selectedRewardId) {
        const selected = state.reward.cards.find((card) => card.instanceId === selectedRewardId);
        const definition = CARD_LIBRARY[selected.cardId];
        const deckSummary = groupCards(state.deck).map((card) => `${card.count}× ${CARD_LIBRARY[card.cardId].name}${card.upgraded ? '+' : ''}`).join(' · ');
        rewardDetail.innerHTML = `<div><small>UPGRADED PREVIEW</small><strong>${definition.name}+</strong><p>${enrichTerms(cardTerms({ ...selected, upgraded: true }))}</p></div><div><small>CURRENT DECK</small><p>${deckSummary}</p></div>`;
      } else {
        rewardDetail.innerHTML = '<div><small>UPGRADED PREVIEW</small><p>Select a card to inspect its promotion.</p></div><div><small>CURRENT DECK</small><p>Your filing cabinet remains unchanged.</p></div>';
      }
      const actions = document.createElement('div'); actions.className = 'infernal-reward-actions';
      actions.appendChild(choiceButton('Confirm selection', selectedRewardId ? `Add ${CARD_LIBRARY[state.reward.cards.find((card) => card.instanceId === selectedRewardId).cardId].name} to deck.` : 'Inspect a card first.', confirmReward, !selectedRewardId));
      actions.lastChild.id = 'infernal-reward-confirm';
      const skip = choiceButton('Skip compensation', 'A bold display of poor judgment.', () => { run.chooseReward(null); selectedRewardId = null; render(); });
      skip.id = 'infernal-reward-skip'; actions.appendChild(skip);
      const rewardFooter = document.createElement('div'); rewardFooter.className = 'infernal-reward-footer';
      rewardFooter.append(rewardDetail, actions); trailing = rewardFooter;
    } else if (state.screen === 'event') {
      if (pendingPermanent?.screen !== 'event') pendingPermanent = null;
      eyebrow.textContent = 'UNSCHEDULED PAPERWORK'; title.textContent = state.event.title; body.textContent = state.event.body;
      const permanentEffects = new Set([
        'cardForBlood', 'upgradeRandom', 'relicForBlood', 'maxHpDebt', 'buyRare',
        'removeStarter', 'curseForObols', 'transformStarter', 'rareForMaxHp', 'auditLottery', 'maxHpForCurse', 'upgradeStarter',
        'ambush', 'forcedFine', 'purgeCurse', 'relicForDebt', 'maxHpForMoney', 'debtForUpgrades', 'parachuteGamble', 'fullHealForCurses', 'bloodRemove',
      ]);
      state.event.choices.forEach((item) => {
        const missingRareFunds = item.effect === 'buyRare' && state.player.obols < 20;
        const missingHealFunds = item.effect === 'healForObols' && state.player.obols < 25;
        const missingCurse = item.effect === 'purgeCurse' && !state.deck.some((card) => card.cardId === 'form_66b');
        const unaffordable = missingRareFunds || missingHealFunds || missingCurse;
        const selected = pendingPermanent?.type === 'event-choice' && pendingPermanent.id === item.id;
        const reason = missingRareFunds ? `Requires 20 Obols; only ${state.player.obols} available.`
          : missingHealFunds ? `Requires 25 Obols; only ${state.player.obols} available.` : missingCurse ? 'No Form 66-B is available to sell.' : '';
        const detail = unaffordable ? `${item.detail} ${reason}` : item.detail;
        const button = choiceButton(item.label, detail, () => {
          if (permanentEffects.has(item.effect)) selectPermanent({ screen: 'event', type: 'event-choice', id: item.id });
          else { run.chooseEvent(item.id); consumeEffects(); render(); }
        }, unaffordable);
        button.dataset.eventChoice = item.id;
        button.setAttribute('aria-pressed', String(selected));
        button.classList.toggle('selected', selected);
        list.appendChild(button);
      });
      if (pendingPermanent?.type === 'event-choice') {
        const choice = state.event.choices.find((item) => item.id === pendingPermanent.id);
        trailing = document.createElement('div');
        trailing.appendChild(permanentDetail(choice.label, choice.detail, choice.effect === 'buyRare' ? 'BUY RARE CARD' : 'CONFIRM DECISION', choice.effect === 'buyRare' ? 20 : null));
      }
    } else if (state.screen === 'shop') {
      if (pendingPermanent?.screen !== 'shop') pendingPermanent = null;
      eyebrow.textContent = 'ACQUISITIONS & DISPOSALS'; title.textContent = 'The Company Store'; body.textContent = `${state.player.obols} obols available. All sales spiritually binding.`;
      list.classList.add('infernal-shop');
      const merchant = document.createElement('div'); merchant.className = 'infernal-shop-merchant';
      merchant.innerHTML = '<span aria-hidden="true"></span><div><small>ACQUISITIONS IMP</small><strong>“No refunds. Reincarnation counts as store credit.”</strong></div>';
      const cardsColumn = document.createElement('section'); cardsColumn.className = 'infernal-shop-column infernal-shop-card-column'; cardsColumn.innerHTML = '<h4>Cards</h4>';
      const cardStock = document.createElement('div'); cardStock.className = 'infernal-shop-stock';
      state.shop.cards.forEach((card) => cardStock.appendChild(shopCardElement(card)));
      cardsColumn.appendChild(cardStock);
      const relicColumn = document.createElement('section'); relicColumn.className = 'infernal-shop-column'; relicColumn.innerHTML = '<h4>Relics</h4>';
      (state.shop.relics || [state.shop.relic].filter(Boolean)).forEach((shopRelic) => {
        const button = choiceButton(`${shopRelic.name} — ${shopRelic.price} obols`, shopRelic.text, () => selectPermanent({ screen: 'shop', type: 'shop-relic', id: shopRelic.id }), shopRelic.sold);
        const selected = pendingPermanent?.type === 'shop-relic' && pendingPermanent.id === shopRelic.id;
        button.setAttribute('aria-disabled', String(shopRelic.sold || state.player.obols < shopRelic.price));
        button.setAttribute('aria-pressed', String(selected)); button.classList.toggle('selected', selected);
        const presentation = RELIC_PRESENTATION[shopRelic.id] || { art: 0, sigil: '?' };
        const art = document.createElement('span'); art.className = 'infernal-relic-art'; art.setAttribute('aria-hidden', 'true');
        art.style.setProperty('--relic-x', `${(presentation.art % 4) / 3 * 100}%`);
        art.style.setProperty('--relic-y', `${Math.floor(presentation.art / 4) / 2 * 100}%`);
        art.dataset.sigil = presentation.sigil;
        button.prepend(art); button.classList.add('infernal-relic-item');
        button.dataset.shopItem = shopRelic.id; relicColumn.appendChild(button);
      });
      const services = document.createElement('section'); services.className = 'infernal-shop-column infernal-shop-services'; services.innerHTML = '<h4>Services</h4>';
      const removals = document.createElement('div'); removals.className = 'infernal-shop-service-group'; removals.dataset.service = 'remove'; removals.innerHTML = '<h5>SHRED A CARD</h5>';
      groupedDeckCards(state.deck).forEach(({ card, cards }) => {
        const selected = pendingPermanent?.type === 'remove' && cards.some((item) => item.instanceId === pendingPermanent.id);
        const button = choiceButton(`Shred ${CARD_LIBRARY[card.cardId].name}${card.upgraded ? '+' : ''} — ${state.shop.removePrice}`, 'Remove one copy permanently.', () => selectPermanent({ screen: 'shop', type: 'remove', id: cards[0].instanceId }), state.shop.removalUsed || state.deck.length <= 5);
        button.dataset.serviceCard = card.cardId; button.dataset.count = cards.length;
        button.setAttribute('aria-disabled', String(button.disabled || state.player.obols < state.shop.removePrice));
        button.setAttribute('aria-pressed', String(selected)); button.classList.toggle('selected', selected);
        const count = document.createElement('span'); count.className = 'infernal-service-count'; count.textContent = `×${cards.length}`; button.prepend(count); removals.appendChild(button);
      });
      const promotions = document.createElement('div'); promotions.className = 'infernal-shop-service-group'; promotions.dataset.service = 'upgrade'; promotions.innerHTML = '<h5>PROMOTE A CARD</h5>';
      groupedDeckCards(state.deck.filter((card) => !card.upgraded)).forEach(({ card, cards }) => {
        const selected = pendingPermanent?.type === 'upgrade' && cards.some((item) => item.instanceId === pendingPermanent.id);
        const button = choiceButton(`Promote ${CARD_LIBRARY[card.cardId].name} — ${state.shop.upgradePrice}`, '', () => selectPermanent({ screen: 'shop', type: 'upgrade', id: cards[0].instanceId }), state.shop.upgradeUsed);
        button.dataset.serviceCard = card.cardId; button.dataset.count = cards.length;
        button.setAttribute('aria-disabled', String(button.disabled || state.player.obols < state.shop.upgradePrice));
        button.setAttribute('aria-pressed', String(selected)); button.classList.toggle('selected', selected);
        const count = document.createElement('span'); count.className = 'infernal-service-count'; count.textContent = `×${cards.length}`; button.prepend(count);
        const comparison = document.createElement('span'); comparison.className = 'infernal-upgrade-comparison'; comparison.innerHTML = upgradeComparison(card); button.appendChild(comparison); promotions.appendChild(button);
      });
      services.append(removals, promotions);
      const reroll = choiceButton(`Reroll inventory — ${state.shop.rerollPrice}`, 'The shelves scream and rearrange.', () => selectPermanent({ screen: 'shop', type: 'reroll', id: 'reroll' }));
      reroll.setAttribute('aria-disabled', String(state.player.obols < state.shop.rerollPrice));
      reroll.setAttribute('aria-pressed', String(pendingPermanent?.type === 'reroll')); reroll.classList.toggle('selected', pendingPermanent?.type === 'reroll');
      reroll.dataset.shopAction = 'reroll'; services.appendChild(reroll);
      const leave = choiceButton('EXIT THE COMPANY STORE', 'Keep the receipt. It screams when audited.', () => { run.leaveShop(); render(); });
      leave.dataset.shopAction = 'leave'; leave.classList.add('infernal-shop-exit');
      list.append(merchant, cardsColumn, relicColumn, services);
      if (pendingPermanent) {
        let selectedTitle = ''; let selectedTerms = ''; let selectedCost = null; let action = 'CONFIRM'; let comparison = ''; let disabled = false;
        if (pendingPermanent.type === 'shop-card') {
          const card = state.shop.cards.find((item) => item.instanceId === pendingPermanent.id); const definition = CARD_LIBRARY[card.cardId];
          selectedTitle = definition.name; selectedTerms = cardTerms(card); selectedCost = card.price; action = 'BUY CARD'; disabled = state.player.obols < card.price;
        } else if (pendingPermanent.type === 'shop-relic') {
          const shopRelic = (state.shop.relics || [state.shop.relic].filter(Boolean)).find((item) => item.id === pendingPermanent.id);
          selectedTitle = shopRelic.name; selectedTerms = shopRelic.text; selectedCost = shopRelic.price; action = 'BUY RELIC'; disabled = state.player.obols < shopRelic.price;
        } else if (pendingPermanent.type === 'remove') {
          const card = state.deck.find((item) => item.instanceId === pendingPermanent.id); selectedTitle = `Shred ${CARD_LIBRARY[card.cardId].name}`; selectedTerms = `Remove one copy permanently. Deck becomes ${state.deck.length - 1} cards.`; selectedCost = state.shop.removePrice; action = 'REMOVE CARD'; disabled = state.player.obols < selectedCost || state.shop.removalUsed || state.deck.length <= 5;
        } else if (pendingPermanent.type === 'upgrade') {
          const card = state.deck.find((item) => item.instanceId === pendingPermanent.id); selectedTitle = `Promote ${CARD_LIBRARY[card.cardId].name}`; selectedTerms = 'Apply this promotion permanently.'; selectedCost = state.shop.upgradePrice; action = 'PROMOTE CARD'; comparison = `<div class="infernal-upgrade-comparison">${upgradeComparison(card)}</div>`; disabled = state.player.obols < selectedCost || state.shop.upgradeUsed;
        } else {
          selectedTitle = 'Reroll inventory'; selectedTerms = 'Replace every unsold card and relic offer.'; selectedCost = state.shop.rerollPrice; action = 'REROLL'; disabled = state.player.obols < selectedCost;
        }
        list.appendChild(permanentDetail(selectedTitle, selectedTerms, action, selectedCost, disabled, comparison));
      }
      list.appendChild(leave);
    } else {
      if (pendingPermanent?.screen !== 'campfire') pendingPermanent = null;
      eyebrow.textContent = 'MANDATORY BREAK'; title.textContent = 'A fire that whispers salaries'; body.textContent = 'Rest, or improve one clause in your employment contract.';
      list.classList.add('infernal-camp');
      const rest = choiceButton('REST BY THE FIRE', 'Recover 30% maximum HP.', () => selectPermanent({ screen: 'campfire', type: 'camp-heal', id: 'heal' }));
      rest.setAttribute('aria-pressed', String(pendingPermanent?.type === 'camp-heal')); rest.classList.toggle('selected', pendingPermanent?.type === 'camp-heal');
      rest.dataset.campAction = 'rest'; rest.classList.add('infernal-camp-rest'); list.appendChild(rest);
      const upgrades = document.createElement('div'); upgrades.className = 'infernal-camp-upgrades';
      state.deck.filter((card) => !card.upgraded).forEach((card) => upgrades.appendChild(campUpgradeElement(card)));
      list.appendChild(upgrades);
      if (pendingPermanent?.type === 'camp-heal') list.appendChild(permanentDetail('Rest by the fire', 'Recover 30% maximum HP and leave this floor.', 'REST NOW'));
      else if (pendingPermanent?.type === 'camp-upgrade') {
        const card = state.deck.find((item) => item.instanceId === pendingPermanent.id);
        list.appendChild(permanentDetail(`Promote ${CARD_LIBRARY[card.cardId].name}`, 'Apply this promotion permanently and leave this floor.', 'PROMOTE CARD', null, false, `<div class="infernal-upgrade-comparison">${upgradeComparison(card)}</div>`));
      }
    }
    choiceScreen.append(eyebrow, title, body);
    if (leading) choiceScreen.appendChild(leading);
    choiceScreen.appendChild(list);
    if (trailing) choiceScreen.appendChild(trailing);
  }

  function renderOutcome() {
    const victory = run.state.result === 'victory';
    const stats = run.state.stats;
    const joke = victory
      ? stats.overdrafts ? 'Promoted on borrowed soul. Standard leadership track.' : 'Debt-free management. Deeply suspicious.'
      : stats.blockGained > stats.damageReceived ? 'Excellent paperwork. Unfortunate mortality.' : 'Your remains have been filed alphabetically.';
    const audit = [
      ['Damage dealt', stats.damageDealt], ['Damage taken', stats.damageReceived], ['Block gained', stats.blockGained],
      ['Files / fiends', `${stats.cardsPlayed} / ${stats.enemiesDefeated}`], ['Overdrafts', stats.overdrafts], ['Biggest hit', stats.largestHit],
    ];
    const efficiency = Math.max(0, stats.damageDealt - stats.damageReceived + stats.enemiesDefeated * 8 - stats.overdrafts * 3);
    const grade = victory ? (efficiency >= 120 ? 'S' : efficiency >= 70 ? 'A' : 'B') : (stats.enemiesDefeated >= 5 ? 'D' : 'F');
    const outcome = outcomeSummary();
    const dossierRows = [
      ['Cause', outcome.cause], ['Last enemy', outcome.lastEnemy], ['Act / floor', outcome.actFloor], ['Seed', outcome.seed], ['Duration', outcome.duration],
      ['Deck', outcome.deck], ['Benefits', outcome.benefits], ['Relics', outcome.relics], ['Build recap', outcome.build],
    ];
    outcomeScreen.setAttribute('aria-labelledby', 'infernal-outcome-title');
    outcomeScreen.innerHTML = `<div class="infernal-audit-head"><div><p class="eyebrow">${victory ? 'ANNUAL REVIEW COMPLETE' : 'EMPLOYMENT STATUS UPDATED'}</p><h3 id="infernal-outcome-title" tabindex="-1">${victory ? 'Management liquidated.' : 'Probation eternal.'}</h3></div><div class="infernal-audit-grade" aria-label="Audit grade ${grade}"><small>AUDIT GRADE</small><strong>${grade}</strong><span>${victory ? 'PROMOTABLE THREAT' : 'REHIRE AS FURNITURE'}</span></div></div><p class="infernal-audit-summary">${joke}</p><div class="infernal-audit-rule"><span>DEPARTMENT OF ETERNAL ACCOUNTS</span><b>${victory ? 'ASSETS SEIZED' : 'SOUL SEIZED'}</b></div><div class="infernal-run-stats" id="infernal-run-stats">${audit.map(([label, value], index) => `<div class="infernal-stat" data-rank="${index + 1}"><small>${label}</small><strong>${value}</strong></div>`).join('')}</div><section class="infernal-outcome-dossier" aria-label="Run dossier"><h4>BUILD RECAP · FORM 66-B</h4>${dossierRows.map(([label, value]) => `<div><small>${label}</small><p>${escapeHtml(value)}</p></div>`).join('')}</section><div class="infernal-audit-verdict"><span class="infernal-audit-seal" aria-hidden="true">${victory ? '✓' : '×'}</span><div><small>FINAL VERDICT · FORM 66-D</small><strong>${victory ? 'Promotion approved under extreme duress.' : 'Termination denied. Employment continues post-mortem.'}</strong><p>Filed, witnessed, and legally regrettable.</p></div></div><div class="infernal-outcome-actions"><button type="button" id="infernal-restart">Begin another audit<small>New file · new liabilities</small></button><button type="button" id="infernal-return">Return to website<small>Clock out before it notices</small></button></div>`;
    outcomeScreen.querySelector('#infernal-restart').addEventListener('click', () => startRun(Date.now()));
    outcomeScreen.querySelector('#infernal-return').addEventListener('click', closeGame);
  }

  function outcomeSummary() {
    if (!run) return null;
    const seconds = Math.max(0, Math.floor((performance.now() - runStartedAt) / 1000));
    const deck = groupCards(run.state.deck).map((card) => `${card.count}× ${CARD_LIBRARY[card.cardId].name}${card.upgraded ? '+' : ''}`).join(' · ') || 'No cards filed';
    const benefits = run.state.benefits.map((item) => item.name).join(' · ') || 'None signed';
    const ownedRelics = run.state.relics.map((item) => item.name).join(' · ') || 'None acquired';
    const upgraded = run.state.deck.filter((card) => card.upgraded).length;
    return {
      cause: run.state.outcomeCause || (run.state.result === 'victory' ? 'The Board liquidated' : 'Unspecified workplace incident'),
      lastEnemy: run.state.lastEnemy || run.state.combat?.enemy?.name || 'No enemy recorded',
      actFloor: `Act ${run.state.act} · Floor ${run.state.floor}`,
      seed: String(run.state.seed),
      duration: `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`,
      deck, benefits, relics: ownedRelics,
      build: `${run.state.deck.length} cards · ${upgraded} promoted · ${run.state.benefits.length} benefits · ${run.state.relics.length} relics`,
    };
  }

  function render() {
    glossaryTooltip.hidden = true;
    if (!run) { renderHud(); renderCanvas(); return; }
    if (run.state.screen === 'outcome' && narrativeState) { narrativeState = null; setNarrativeVisibility(false); }
    if (pendingPermanent && pendingPermanent.screen !== run.state.screen) pendingPermanent = null;
    const hadGameFocus = modal.contains(document.activeElement);
    const screenChanged = lastRenderedScreen !== run.state.screen;
    if (screenChanged) clearArmedTouchCard();
    shell.dataset.act = run.state.act; setScreen(run.state.screen); renderHud(); renderCanvas();
    const deckAllowed = Boolean(run);
    deckButton.hidden = !deckAllowed;
    renderDeckDrawer();
    if (run.state.screen === 'map') renderMap();
    else if (run.state.screen === 'combat') renderCombat();
    else if (['benefit', 'reward', 'event', 'shop', 'campfire'].includes(run.state.screen)) renderChoice();
    else if (run.state.screen === 'outcome') renderOutcome();
    if (screenChanged && ['benefit', 'reward', 'event', 'shop', 'campfire'].includes(run.state.screen)) choiceScreen.querySelector('#infernal-choice-title')?.focus({ preventScroll: true });
    else if (screenChanged && run.state.screen === 'outcome') outcomeScreen.querySelector('#infernal-outcome-title')?.focus({ preventScroll: true });
    else if (screenChanged && run.state.screen === 'map') mapScreen.querySelector('.infernal-map-node.available')?.focus({ preventScroll: true });
    else if (hadGameFocus && (document.activeElement === document.body || !modal.contains(document.activeElement))) {
      const target = run.state.screen === 'map'
        ? mapScreen.querySelector('.infernal-map-node.available')
        : run.state.screen === 'combat' ? canvas : modal.querySelector('.infernal-screen:not([hidden]) button');
      target?.focus({ preventScroll: true });
    }
    lastRenderedScreen = run.state.screen;
    if (run.state.act === 2 && run.state.screen === 'benefit') openNarrative('promotion');
  }

  function settleAnimation(milliseconds) {
    dialogueClock += milliseconds;
    if (animation) {
      animation.remaining = Math.max(0, animation.remaining - milliseconds);
      if (!animation.remaining) animation = null;
    }
    visualEffects.forEach((effect) => { effect.remaining = Math.max(0, effect.remaining - milliseconds); });
    visualEffects = visualEffects.filter((effect) => effect.remaining > 0);
    if (currentBark) {
      currentBark.remaining = Math.max(0, currentBark.remaining - milliseconds);
      if (!currentBark.remaining) {
        currentBark = null;
        const next = queuedBarks.shift();
        if (next) showBark(next.trigger, next.actor);
      }
    }
    updateBarkPresentation();
    renderCanvas();
  }

  function animationLoop(now) {
    if (!animation && !visualEffects.length && !currentBark) { animationFrame = 0; lastFrame = 0; return; }
    const delta = lastFrame ? now - lastFrame : 0; lastFrame = now; settleAnimation(delta);
    animationFrame = animation || visualEffects.length || currentBark ? requestAnimationFrame(animationLoop) : 0;
  }

  function ambientLoop(now) {
    if (modal.hidden || reducedMotion.matches) { ambientFrame = 0; return; }
    const breathingVisible = run?.state.screen === 'combat' && !animationFrame;
    if (breathingVisible && (!lastAmbientPaint || now - lastAmbientPaint >= 33)) { renderCanvas(); lastAmbientPaint = now; }
    ambientFrame = requestAnimationFrame(ambientLoop);
  }

  function startAmbientMotion() {
    if (!ambientFrame && !reducedMotion.matches) ambientFrame = requestAnimationFrame(ambientLoop);
  }

  function animate(type, duration = 180, target = null, metadata = {}) {
    if (reducedMotion.matches) { animation = null; renderCanvas(); return; }
    animation = { type, target, duration, remaining: duration, ...metadata };
    if (!animationFrame) animationFrame = requestAnimationFrame(animationLoop);
  }

  function settlePendingFeedback() {
    if (!animation && (visualEffects.length || currentBark || queuedBarks.length)) {
      visualEffects = []; currentBark = null; queuedBarks = []; updateBarkPresentation();
    }
  }

  function playCard(index) {
    if (!run || animation) return { kind: 'invalid' };
    settlePendingFeedback();
    const card = run.state.combat?.hand[index];
    const result = run.playCard(index);
    if (result.kind === 'card-played' || result.kind === 'victory') {
      selectedCard = 0;
      const effects = consumeEffects();
      if (result.kind === 'victory') {
        animation = null;
        render();
        return result;
      }
      const cardAttacks = Boolean(card && resolveCardDefinition(card).damage);
      animate(cardAttacks ? 'attack' : 'card', cardAttacks ? 280 : 240, cardAttacks ? 'enemy' : 'player', { cardId: card?.cardId, effectKinds: effects.map((effect) => effect.kind) });
      render();
    } else if (result.kind === 'unaffordable' && card) {
      const button = hand.querySelector(`[data-card-index="${index}"]`);
      if (button) announceInvalidCard(button, invalidCardReason(card));
    }
    return result;
  }

  function chooseNode(id) {
    const result = run.chooseNode(id);
    consumeEffects(); render();
    if (run.state.screen === 'combat' && run.state.combat?.nodeType === 'boss') openNarrative('board');
    return result;
  }

  function endTurn() {
    if (!run || animation) return { kind: 'invalid' };
    settlePendingFeedback();
    const result = run.endTurn();
    const effects = consumeEffects();
    if (effects.some((effect) => effect.kind === 'damage' && effect.target === 'player')) animate('enemy-attack', 300, 'player', { effectKinds: effects.map((effect) => effect.kind) });
    else if (effects.some((effect) => effect.target === 'player' || effect.target === 'enemy')) animate('enemy-card', 240, 'player', { effectKinds: effects.map((effect) => effect.kind) });
    render(); return result;
  }

  function startRun(seed = Date.now()) {
    run = window.InfernalCore.createRun({ seed }); intro.hidden = true; selectedCard = 0; selectedRewardId = null; pendingPermanent = null; deckOpen = false; selectedPile = 'deck';
    if (animationFrame) cancelAnimationFrame(animationFrame);
    animation = null; animationFrame = 0; lastFrame = 0; visualEffects = []; currentBark = null; queuedBarks = [];
    clearArmedTouchCard(); barkIndex = 0; dialogueClock = 0; lastDialogueClock = -Infinity; runStartedAt = performance.now(); effectStatus.textContent = ''; updateBarkPresentation();
    seenNarratives.clear(); narrativeState = null; setNarrativeVisibility(false);
    [...shell.children].forEach((child) => { child.inert = false; });
    render(); openNarrative('opening'); if (run.state.screen === 'combat') canvas.focus(); return run.state;
  }
  function openGame() {
    previousFocus = document.activeElement; modal.hidden = false; document.body.classList.add('game-open');
    intro.hidden = Boolean(run); if (!run) { tutorialStep = 0; renderTutorial(); } render(); startAmbientMotion(); closeButton.focus(); requestAnimationFrame(resizeCanvas);
  }
  function closeGame() {
    modal.hidden = true; document.body.classList.remove('game-open');
    glossaryTooltip.hidden = true; setNarrativeVisibility(false); narrativeState = null; clearArmedTouchCard();
    if (ambientFrame) cancelAnimationFrame(ambientFrame); ambientFrame = 0; lastAmbientPaint = 0;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    previousFocus?.focus();
  }
  async function toggleFullscreen() {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await shell.requestFullscreen(); }
    catch (_error) { effectStatus.textContent = 'Fullscreen unavailable. Browser denied the request.'; fullscreenButton.classList.add('fullscreen-failed'); }
  }

  function syncFullscreenState() {
    const active = document.fullscreenElement === shell;
    fullscreenButton.setAttribute('aria-pressed', String(active));
    fullscreenButton.setAttribute('aria-label', active ? 'Exit fullscreen' : 'Enter fullscreen');
    if (active) fullscreenButton.classList.remove('fullscreen-failed');
  }

  function visibleFocusables() {
    const root = deckOpen ? deckDrawer : modal;
    return [...root.querySelectorAll('button:not(:disabled), canvas[tabindex], .infernal-keyword[tabindex="0"]')].filter((item) => item.getClientRects().length);
  }
  function hasInteractiveFocus(target) {
    return Boolean(target?.closest?.('button, a[href], input, select, textarea, [contenteditable="true"], [role="button"]'));
  }
  document.addEventListener('keydown', (event) => {
    if (modal.hidden || document.hidden) return;
    if (event.key === 'Escape') { event.preventDefault(); if (deckOpen) closeDeck(); else if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); else closeGame(); return; }
    if (event.key === 'Tab') {
      const items = visibleFocusables(); const first = items[0]; const last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      return;
    }
    if (hasInteractiveFocus(event.target)) return;
    if (event.key.toLowerCase() === 'f') { event.preventDefault(); toggleFullscreen(); return; }
    if (event.key.toLowerCase() === 'k' && run) { event.preventDefault(); if (deckOpen) closeDeck(); else openDeck(); return; }
    if (event.target !== canvas) return;
    if (!run || run.state.screen !== 'combat' || animation) return;
    const key = event.key.toLowerCase();
    if (['arrowleft', 'a', 'q'].includes(key)) { event.preventDefault(); selectedCard = Math.max(0, selectedCard - 1); renderCombat(); }
    else if (['arrowright', 'd'].includes(key)) { event.preventDefault(); selectedCard = Math.min(run.state.combat.hand.length - 1, selectedCard + 1); renderCombat(); }
    else if (key === 'enter' || key === ' ') { event.preventDefault(); playCard(selectedCard); }
    else if (key === 'e') { event.preventDefault(); endTurn(); }
  });

  invite.addEventListener('click', openGame); startButton.addEventListener('click', () => startRun());
  tutorialBack.addEventListener('click', () => { tutorialStep = Math.max(0, tutorialStep - 1); renderTutorial(); tutorialBack.focus(); });
  tutorialNext.addEventListener('click', () => { tutorialStep = Math.min(TUTORIAL.length - 1, tutorialStep + 1); renderTutorial(); (tutorialStep === TUTORIAL.length - 1 ? startButton : tutorialNext).focus(); });
  tutorialSkip.addEventListener('click', () => startRun());
  deckButton.addEventListener('click', openDeck); deckClose.addEventListener('click', closeDeck);
  closeButton.addEventListener('click', closeGame); fullscreenButton.addEventListener('click', toggleFullscreen);
  endTurnButton.addEventListener('click', endTurn); window.addEventListener('resize', handleWindowResize);
  hand.addEventListener('scroll', clearArmedTouchCard, { passive: true });
  choiceScreen.addEventListener('scroll', clearArmedTouchCard, { passive: true });
  window.addEventListener('blur', clearArmedTouchCard);
  document.addEventListener('visibilitychange', () => { if (document.hidden) clearArmedTouchCard(); });
  modal.addEventListener('focusout', (event) => { if (!modal.contains(event.relatedTarget)) clearArmedTouchCard(); });
  document.addEventListener('fullscreenchange', syncFullscreenState); syncFullscreenState();
  new ResizeObserver(resizeCanvas).observe(canvas);

  window.render_game_to_text = () => JSON.stringify({
    coordinateSystem: 'DOM card/map controls over responsive canvas stage', overlayOpen: !modal.hidden,
    screen: intro.hidden ? (run?.state.screen || 'inactive') : 'intro', animation,
    ambientMotion: !modal.hidden && !reducedMotion.matches && run?.state.screen === 'combat',
    activeEffects: visualEffects.map(({ kind, target, amount, remaining }) => ({ kind, target, amount, remaining })),
    pendingCoreEffects: run ? run.state.effects.map((effect) => ({ ...effect })) : [],
    bark: currentBark ? { actor: currentBark.actor, trigger: currentBark.trigger, text: currentBark.text } : null,
    tutorial: intro.hidden ? null : { step: tutorialStep, total: TUTORIAL.length },
    selectedRewardId,
    pendingPermanent,
    deckOpen,
    inspectedPile: deckOpen ? selectedPile : null,
    ...(run ? {
      act: run.state.act,
      actTheme: window.InfernalCore.ACTS[run.state.act - 1]?.palette || 'collections',
      benefits: run.state.benefits,
      mapProgress: run.state.map?.progress || 0,
        availableNodes: run.state.screen === 'map' ? [...run.state.map.rows.flat(), run.state.map.boss].filter((node) => run.state.map.available.includes(node.id)).map(({ id, type }) => ({ id, type })) : [],
      player: run.state.player, deckSize: run.state.deck.length, relics: run.state.relics,
      loot: run.state.screen === 'reward' ? run.state.reward.loot || null : null,
      statuses: {
        player: statusEntries(run.state.player),
        enemy: run.state.combat && run.state.screen === 'combat' ? statusEntries(run.state.combat.enemy) : [],
      },
      combat: run.state.combat && run.state.screen === 'combat' ? {
        turn: run.state.combat.turn, hand: run.state.combat.hand.map((card, index) => ({ index, ...card, ...resolveCardDefinition(card) })),
        draw: run.state.combat.draw.length, discard: run.state.combat.discard.length, exhaust: run.state.combat.exhaust.length,
        enemy: run.state.combat.enemy, enemyFacesHero: true, enemySpriteMirrored: enemyShouldMirror(run.state.combat.enemy), composition: combatComposition(),
      } : null,
      choices: run.state.screen === 'benefit' ? run.state.benefitChoice.map(({ id, name, text }) => ({ id, label: name, detail: text, disabled: false }))
        : run.state.screen === 'reward' ? [...run.state.reward.cards.map((card) => ({ id: card.instanceId, label: CARD_LIBRARY[card.cardId].name, disabled: false })), { id: null, label: 'Skip compensation', disabled: false }]
        : run.state.screen === 'event' ? run.state.event.choices.map(({ id, label, detail }) => ({ id, label, detail }))
          : run.state.screen === 'shop' ? [
            ...run.state.shop.cards.filter((card) => !card.sold).map((card) => ({ id: card.instanceId, label: CARD_LIBRARY[card.cardId].name, price: card.price, disabled: run.state.player.obols < card.price })),
            ...(run.state.shop.relics || [run.state.shop.relic].filter(Boolean)).filter((item) => !item.sold).map((item) => ({ id: item.id, label: item.name, price: item.price, disabled: run.state.player.obols < item.price })),
            ...run.state.deck.map((card) => ({ id: `remove:${card.instanceId}`, label: `Shred ${CARD_LIBRARY[card.cardId].name}`, price: run.state.shop.removePrice, disabled: run.state.shop.removalUsed || run.state.player.obols < run.state.shop.removePrice || run.state.deck.length <= 5 })),
            ...run.state.deck.filter((card) => !card.upgraded).map((card) => ({ id: `upgrade:${card.instanceId}`, label: `Promote ${CARD_LIBRARY[card.cardId].name}`, price: run.state.shop.upgradePrice, disabled: run.state.shop.upgradeUsed || run.state.player.obols < run.state.shop.upgradePrice })),
            { id: 'reroll', label: 'Reroll inventory', price: run.state.shop.rerollPrice, disabled: run.state.player.obols < run.state.shop.rerollPrice },
            { id: 'leave', label: 'Leave shop', disabled: false },
          ] : run.state.screen === 'campfire' ? [{ id: 'heal', label: 'Rest', disabled: false }, ...run.state.deck.filter((card) => !card.upgraded).map((card) => ({ id: `upgrade:${card.instanceId}`, label: `Upgrade ${CARD_LIBRARY[card.cardId].name}`, disabled: false }))] : [],
      result: run.state.result,
      stats: run.state.stats,
      outcome: run.state.screen === 'outcome' ? outcomeSummary() : null,
    } : {}),
  });
  window.advanceTime = (milliseconds) => { settleAnimation(milliseconds); render(); };
  window.__infernalTest = {
    open: openGame, start: startRun, playCard, endTurn,
    relicArt: { ...RELIC_PRESENTATION },
    actorCrops: { ...ACTOR_CROPS },
    actorFacing: { ...ACTOR_FACING },
    selectNode: chooseNode,
    choose(id) {
      let result;
      if (run.state.screen === 'benefit') result = run.chooseBenefit(id);
      else if (run.state.screen === 'reward') result = run.chooseReward(id);
      else if (run.state.screen === 'event') result = run.chooseEvent(id);
      else if (run.state.screen === 'shop') {
        if (id === 'reroll') result = run.rerollShop();
        else if (id === 'leave') result = run.leaveShop();
        else if (String(id).startsWith('remove:')) result = run.removeCard(Number(String(id).slice(7)));
        else if (String(id).startsWith('upgrade:')) result = run.upgradeCard(Number(String(id).slice(8)));
        else result = run.buy(id);
      }
      consumeEffects(); render(); return result;
    },
    close: closeGame, render,
    get run() { return run; },
  };

  narrativeNext.addEventListener('click', advanceNarrative);
  renderTutorial(); renderHud(); renderCanvas();
})();
