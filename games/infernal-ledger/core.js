(function (root, factory) {
  const data = typeof module === 'object' && module.exports ? require('./data.js') : root.InfernalData;
  const api = factory(data || {});
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.InfernalCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (DATA) {
  'use strict';

  const CARD_LIBRARY = DATA.CARDS || {};
  const ENEMIES = DATA.ENEMIES || {};
  const BENEFITS = DATA.BENEFITS || [];
  const ACTS = DATA.ACTS || [];

  const RELICS = DATA.RELICS || [];
  const EVENTS = DATA.EVENTS || [];

  function seededRandom(seed) {
    let value = seed >>> 0;
    return () => {
      value += 0x6D2B79F5;
      let out = value;
      out = Math.imul(out ^ (out >>> 15), out | 1);
      out ^= out + Math.imul(out ^ (out >>> 7), out | 61);
      return ((out ^ (out >>> 14)) >>> 0) / 4294967296;
    };
  }

  function eligibleCards({ act = 1, includeStarter = false, includeStatus = false, rarity = null } = {}) {
    return Object.entries(CARD_LIBRARY)
      .filter(([, card]) => includeStarter || card.rarity !== 'starter')
      .filter(([, card]) => includeStatus || card.rarity !== 'status')
      .filter(([, card]) => !card.act || card.act === act)
      .filter(([, card]) => !rarity || card.rarity === rarity)
      .map(([id]) => id);
  }

  function resolveCardDefinition(cardOrId, upgradedOverride) {
    const cardId = typeof cardOrId === 'string' ? cardOrId : cardOrId?.cardId;
    const upgraded = upgradedOverride ?? (typeof cardOrId === 'object' && Boolean(cardOrId?.upgraded));
    const base = CARD_LIBRARY[cardId];
    if (!base) return null;
    const resolved = { ...base };
    if (!upgraded) return resolved;
    for (const [key, value] of Object.entries(base)) {
      if (!key.startsWith('upgraded') || key.length <= 8) continue;
      const target = `${key[8].toLowerCase()}${key.slice(9)}`;
      resolved[target] = value;
    }
    if (base.damage && base.upgradedDamage == null) resolved.damage = base.damage + 3;
    if (base.block && base.upgradedBlock == null) resolved.block = base.block + 3;
    return resolved;
  }

  function hasMeaningfulUpgrade(cardId) {
    const base = resolveCardDefinition(cardId, false);
    const upgraded = resolveCardDefinition(cardId, true);
    if (!base || base.rarity === 'status') return false;
    const keys = new Set([...Object.keys(base), ...Object.keys(upgraded)]);
    return [...keys].some((key) => !key.startsWith('upgraded') && base[key] !== upgraded[key]);
  }

  function resolveCardPlayability(state, card) {
    const definition = resolveCardDefinition(card);
    if (!definition) return { affordable: false, reason: 'Unknown card.', definition: null };
    const combat = state.combat || {};
    const hasPurse = state.relics.some((relic) => relic.id === 'coin_purse');
    const hasLiquidAssets = state.benefits.some((benefit) => benefit.effect === 'liquid');
    const obolDiscount = !combat.obolDiscountUsed ? (hasPurse ? 5 : 0) + (hasLiquidAssets ? 6 : 0) : 0;
    const obolCost = Math.max(0, (definition.obolCost || 0) - obolDiscount);
    const shortage = Math.max(0, (definition.cost || 0) - state.player.energy);
    const debtDiscount = state.relics.some((relic) => relic.id === 'bent_abacus') && !combat.overdraftUsed ? 1 : 0;
    const overdraftDebt = Math.max(0, shortage - debtDiscount);
    const debtRequired = overdraftDebt + (definition.debt || 0);
    const debtCapacity = Math.max(0, state.player.debtLimit - state.player.debt);
    let reason = '';
    if (obolCost > state.player.obols) reason = `Requires ${obolCost} Obols; only ${state.player.obols} available.`;
    else if (debtRequired > debtCapacity) reason = `Soul Debt limit reached. Needs ${debtRequired} capacity; ${debtCapacity} available.`;
    return { affordable: !reason, reason, definition, obolDiscount, obolCost, shortage, debtDiscount, overdraftDebt, debtRequired, debtCapacity };
  }

  function createRun({ seed = Date.now() } = {}) {
    let random = seededRandom(seed);
    let nextInstance = 1;
    const makeCard = (cardId, upgraded = false) => ({ instanceId: nextInstance++, cardId, upgraded });
    const shuffle = (items) => {
      const copy = [...items];
      for (let index = copy.length - 1; index > 0; index -= 1) {
        const target = Math.floor(random() * (index + 1));
        [copy[index], copy[target]] = [copy[target], copy[index]];
      }
      return copy;
    };
    const weightedCards = (count, options = {}) => {
      const weights = { common: 70, uncommon: 25, rare: 5 };
      const pool = eligibleCards({ act: state.act, ...options });
      const selected = [];
      while (pool.length && selected.length < count) {
        const buckets = Object.keys(weights)
          .map((rarity) => ({ rarity, cards: pool.filter((id) => CARD_LIBRARY[id].rarity === rarity), weight: weights[rarity] }))
          .filter((bucket) => bucket.cards.length && (!options.rarity || bucket.rarity === options.rarity));
        if (!buckets.length) break;
        const total = buckets.reduce((sum, bucket) => sum + bucket.weight, 0);
        let roll = random() * total;
        let index = 0;
        for (; index < buckets.length - 1; index += 1) {
          roll -= buckets[index].weight;
          if (roll < 0) break;
        }
        const bucket = buckets[index];
        const id = bucket.cards[Math.floor(random() * bucket.cards.length)];
        selected.push(id);
        pool.splice(pool.indexOf(id), 1);
      }
      return selected;
    };
    const benefitOffer = (act) => shuffle(BENEFITS.filter((benefit) => benefit.act === act && !state.benefits?.some((owned) => owned.id === benefit.id))).slice(0, 3);

    function refreshMapReachability(map) {
      const nodes = [...map.rows.flat(), map.boss];
      const byId = new Map(nodes.map((node) => [node.id, node]));
      const reachable = new Set();
      const queue = [...map.available];
      while (queue.length) {
        const id = queue.shift();
        if (reachable.has(id)) continue;
        reachable.add(id);
        queue.push(...(byId.get(id)?.connections || []));
      }
      map.reachable = [...reachable];
      map.unreachable = nodes.filter((node) => !reachable.has(node.id) && !map.visited.includes(node.id)).map((node) => node.id);
      return map;
    }

    function buildMap(act = 1) {
      const variant = Math.floor(random() * 4);
      const patterns = [
        ['battle', 'event', 'cache'],
        ['event', 'battle'],
        ['battle', 'cache', 'battle'],
        ['contract', 'battle'],
        ['shop', 'battle', 'cache'],
        ['battle', 'event'],
        ['elite', 'battle', 'contract'],
        ['cache', 'battle'],
        ['battle', 'battle', 'event'],
        ['campfire', 'campfire'],
      ];
      const laneTemplates = [
        [[0, 2, 4], [1, 3], [0, 2, 4], [0, 3], [1, 2, 4], [1, 4], [0, 2, 3], [0, 3], [1, 2, 4], [1, 3]],
        [[0, 1, 4], [1, 3], [0, 2, 4], [1, 4], [0, 2, 3], [0, 3], [1, 2, 4], [1, 4], [0, 2, 3], [1, 3]],
        [[0, 2, 3], [1, 4], [0, 2, 4], [0, 3], [1, 2, 4], [1, 3], [0, 2, 3], [0, 4], [1, 2, 4], [1, 3]],
        [[1, 2, 4], [0, 3], [0, 2, 4], [1, 4], [0, 2, 3], [0, 3], [1, 2, 4], [0, 3], [0, 2, 4], [1, 3]],
      ];
      const rows = patterns.map((types, row) => {
        const lanes = laneTemplates[variant][row];
        const rotated = row === 0 ? types : types.map((_, index) => types[(index + variant + row) % types.length]);
        return rotated.map((type, column) => {
          const lane = lanes[column];
          const offset = Math.round((random() - .5) * 5);
          return {
            id: `a${act}n${row}-${column}`, act, row, column, lane, type,
            offset, visualY: 17 + lane * 16.5 + offset, connections: [],
          };
        });
      });
      const boss = { id: `a${act}boss`, act, row: rows.length, column: 0, lane: 2, visualY: 50, type: 'boss', offset: 0, connections: [] };
      const connectBands = (nodes, next) => {
        if (nodes.length === 3 && next.length === 2) return [[0], [0, 1], [1]];
        if (nodes.length === 2 && next.length === 3) return [[0, 1], [1, 2]];
        if (nodes.length === 3 && next.length === 3) return [[0, 1], [1], [1, 2]];
        return [[0], [1]];
      };
      rows.forEach((nodes, rowIndex) => {
        if (rowIndex === rows.length - 1) {
          nodes.forEach((node) => { node.connections = [boss.id]; });
          return;
        }
        const next = rows[rowIndex + 1];
        const connections = connectBands(nodes, next);
        nodes.forEach((node, column) => { node.connections = connections[column].map((target) => next[target].id); });
      });
      return refreshMapReachability({
        act, templateId: `act-${act}-v${variant + 1}`, progress: 0, rows, boss,
        routeRules: { minimumBattles: 5, maximumShops: 1, maximumEvents: 3, lateCampfire: 9 },
        visited: [], visitedEdges: [], available: rows[0].map((node) => node.id),
      });
    }

    const state = {};

    function startingDeck() {
      return [
        ...Array.from({ length: 4 }, () => makeCard('paper_cut')),
        ...Array.from({ length: 4 }, () => makeCard('red_tape')),
        makeCard('creative_accounting'), makeCard('hostile_takeover'),
      ];
    }

    function resetState() {
      Object.assign(state, {
        seed, screen: 'benefit', act: 1, floor: 0, map: null, currentNode: null,
        benefitChoice: [], benefits: [],
        player: { hp: 40, maxHp: 40, block: 0, energy: 3, debt: 0, debtLimit: 2, pendingDebt: 0, obols: 30, weak: 0, vulnerable: 0, bleed: 0, filing: 0, ritual: 0 },
        deck: startingDeck(), relics: [], combat: null, reward: null, shop: null,
        event: null, result: null, outcomeCause: null, lastEnemy: null, log: ['Probation begins.'],
        effects: [],
        stats: { damageDealt: 0, damageReceived: 0, blockGained: 0, cardsPlayed: 0, overdrafts: 0, enemiesDefeated: 0, largestHit: 0 },
      });
      state.benefitChoice = benefitOffer(1);
    }

    function chooseBenefit(id) {
      if (state.screen !== 'benefit') return { kind: 'invalid' };
      const benefit = state.benefitChoice.find((item) => item.id === id);
      if (!benefit) return { kind: 'invalid' };
      state.benefits.push({ ...benefit });
      if (benefit.effect === 'blood') { state.player.maxHp += 6; state.player.hp += 6; }
      if (benefit.effect === 'credit') { state.player.debtLimit = 3; state.player.obols += 15; }
      if (benefit.effect === 'removeStarter') {
        const index = state.deck.findIndex((card) => card.cardId === 'paper_cut');
        if (index >= 0) state.deck.splice(index, 1);
      }
      if (benefit.effect === 'transformStarter') {
        state.deck.filter((card) => card.cardId === 'red_tape').slice(0, 2).forEach((card) => {
          card.cardId = weightedCards(1)[0] || card.cardId; card.upgraded = false;
        });
      }
      if (benefit.effect === 'upgradeStarters') {
        ['paper_cut', 'red_tape'].forEach((cardId) => {
          const card = state.deck.find((item) => item.cardId === cardId && !item.upgraded); if (card) card.upgraded = true;
        });
      }
      if (benefit.effect === 'draftRare') state.deck.push(makeCard('archive_fire'));
      if (benefit.effect === 'hazardPay') {
        state.player.maxHp += 8; state.player.hp += 8;
        state.player.pendingDebt = Math.min(state.player.debtLimit, state.player.pendingDebt + 1);
      }
      if (benefit.effect === 'cashCurse') { state.player.obols += 55; state.deck.push(makeCard('form_66b')); }
      if (benefit.effect === 'removePair') {
        ['paper_cut', 'red_tape'].forEach((cardId) => {
          const index = state.deck.findIndex((card) => card.cardId === cardId); if (index >= 0) state.deck.splice(index, 1);
        });
      }
      if (benefit.effect === 'upgradeForMaxHp') {
        state.player.maxHp = Math.max(1, state.player.maxHp - 4); state.player.hp = Math.min(state.player.hp, state.player.maxHp);
        shuffle(state.deck.filter((card) => !card.upgraded && hasMeaningfulUpgrade(card.cardId))).slice(0, 3).forEach((card) => { card.upgraded = true; });
      }
      if (benefit.effect === 'draftLiability') { state.deck.push(makeCard('unlimited_liability')); state.player.obols += 25; }
      state.benefitChoice = [];
      state.map = buildMap(state.act);
      state.floor = 0;
      state.screen = 'map';
      state.log = [`Act ${state.act}: ${ACTS[state.act - 1]?.name || 'Corporate Limbo'}.`];
      return { kind: 'benefit-chosen', benefitId: id };
    }

    function emit(effect) {
      state.effects.push(effect);
      if (state.effects.length > 24) state.effects.splice(0, state.effects.length - 24);
    }

    function resolvePlayerDeath(cause = 'Unspecified workplace incident') {
      if (state.player.hp > 0) return false;
      const severance = state.relics.find((relic) => relic.id === 'severance_package' && !relic.used);
      if (severance) { severance.used = true; state.player.hp = 1; return false; }
      state.screen = 'outcome'; state.result = 'defeat'; state.outcomeCause = cause;
      emit({ kind: 'dialogue', target: 'player', actor: 'hero', trigger: 'defeat' });
      return true;
    }

    function drainEffects() {
      const effects = state.effects.map((effect) => ({ ...effect }));
      state.effects.length = 0;
      return effects;
    }

    function healPlayer(amount, source = 'heal') {
      const before = state.player.hp;
      state.player.hp = Math.min(state.player.maxHp, state.player.hp + amount);
      const healed = state.player.hp - before;
      if (healed) emit({ kind: 'heal', target: 'player', amount: healed, source, trigger: 'heal' });
      return healed;
    }

    function losePlayerHp(amount, source = 'hp_loss') {
      const before = state.player.hp;
      state.player.hp = Math.max(0, state.player.hp - amount);
      const lost = before - state.player.hp;
      if (lost) {
        state.stats.damageReceived += lost;
        emit({ kind: 'damage', target: 'player', amount: lost, source, trigger: state.player.hp <= state.player.maxHp * .25 ? 'low_hp' : 'hit' });
      }
      if (!state.combat?.resolvingCard) resolvePlayerDeath(source);
      return lost;
    }

    function drawCards(count) {
      const combat = state.combat;
      for (let index = 0; index < count; index += 1) {
        if (!combat.draw.length && combat.discard.length) {
          combat.draw = shuffle(combat.discard);
          combat.discard = [];
        }
        if (!combat.draw.length) break;
        combat.hand.push(combat.draw.pop());
      }
    }

    function enemyFor(type) {
      const act = ACTS[state.act - 1] || ACTS[0];
      if (type === 'boss') return act?.boss || 'manager';
      const tierIndex = state.floor <= 3 ? 0 : state.floor <= 7 ? 1 : 2;
      const pool = type === 'elite'
        ? (act?.elites || ['intern', 'hr'])
        : (act?.battleTiers?.[tierIndex] || act?.battles || ['penitent', 'mouth', 'wretch', 'chair']);
      return pool[Math.floor(random() * pool.length)];
    }

    function intentFor(enemy) {
      const definition = ENEMIES[enemy.enemyId];
      const definitions = enemy.phase === 2 && definition.phaseTwoIntents ? definition.phaseTwoIntents : definition.intents;
      return { ...definitions[enemy.intentIndex % definitions.length] };
    }
    const enemyGimmick = (enemy) => enemy.gimmick || ENEMIES[enemy.enemyId]?.gimmick || null;

    function startCombat(type) {
      const enemyId = enemyFor(type);
      const definition = ENEMIES[enemyId];
      state.player.energy = 3;
      state.player.debt = state.player.pendingDebt || 0;
      if (state.player.debt) emit({ kind: 'debt', target: 'player', amount: state.player.debt, source: 'event', trigger: 'debt' });
      state.player.pendingDebt = 0;
      state.player.block = 0;
      state.player.weak = 0;
      state.player.vulnerable = 0;
      state.player.bleed = 0;
      state.player.filing = 0;
      state.player.ritual = 0;
      state.combat = {
        nodeType: type, turn: 1, draw: shuffle(state.deck.map((card) => ({ ...card }))),
        discard: [], exhaust: [], hand: [], locked: false, overdraftUsed: false, damageThisTurn: 0, streak: 0,
        cardsPlayedThisTurn: 0, generatedObols: 0, obolDiscountUsed: false, painReady: false, hemoglobinUsed: false,
        archiveBenefitUsed: false, resolvingCard: false,
        enemy: { enemyId, name: definition.name, gimmick: definition.gimmick || null, hp: definition.maxHp, maxHp: definition.maxHp, block: 0, weak: 0, vulnerable: 0, bleed: 0, ritual: 0, bribed: 0, strength: 0, phase: 1, intentIndex: 0, intent: null },
      };
      if (state.benefits.some((benefit) => benefit.effect === 'union')) { state.player.block = 6; state.player.filing = 1; }
      if (state.benefits.some((benefit) => benefit.effect === 'filing')) state.player.filing += 2;
      if (state.relics.some((relic) => relic.id === 'filing_cabinet')) state.player.filing += 2;
      if (state.relics.some((relic) => relic.id === 'union_pin')) state.player.block += 4;
      if (state.relics.some((relic) => relic.id === 'interest_waiver')) { state.player.energy = 4; state.player.debt = Math.min(state.player.debtLimit, state.player.debt + 1); }
      state.combat.enemy.intent = intentFor(state.combat.enemy);
      state.lastEnemy = definition.name;
      const openingDraw = 5
        + (state.relics.some((relic) => relic.id === 'employee_minute') ? 1 : 0)
        + (state.benefits.some((benefit) => benefit.effect === 'draw') ? 1 : 0);
      drawCards(openingDraw);
      state.screen = 'combat';
      state.log = [`Encounter: ${definition.name}.`];
      emit({ kind: 'dialogue', target: 'enemy', actor: enemyId, trigger: 'encounter' });
      return { kind: 'combat' };
    }

    function createReward() {
      const ids = weightedCards(3);
      return { cards: ids.map((id) => makeCard(id)), skipped: false };
    }

    function completeCombat() {
      state.stats.enemiesDefeated += 1;
      state.player.block = 0;
      emit({ kind: 'dialogue', target: 'enemy', actor: state.combat.enemy.enemyId, trigger: 'defeat' });
      if (state.combat.nodeType === 'boss') {
        advanceAct();
        return;
      }
      let relicReward = null;
      if (state.combat.nodeType === 'elite') {
        const available = RELICS.filter((relic) => !state.relics.some((owned) => owned.id === relic.id));
        if (available.length) {
          relicReward = { ...available[Math.floor(random() * available.length)] };
          state.relics.push(relicReward);
        }
      }
      const baseObols = state.combat.nodeType === 'elite' ? 40 + Math.floor(random() * 11) : 12 + Math.floor(random() * 7);
      const obols = baseObols * (state.combat.lootMultiplier || 1);
      state.player.obols += obols;
      emit({ kind: 'obols', target: 'player', amount: obols, source: state.combat.enemy.name, trigger: 'loot' });
      if (state.relics.some((relic) => relic.id === 'blood_mug')) healPlayer(2, 'blood_mug');
      if (state.combat.nodeType === 'elite' && state.benefits.some((benefit) => benefit.effect === 'pension')) healPlayer(5, 'Infernal Pension');
      state.reward = createReward(); state.reward.loot = { obols, relic: relicReward };
      state.screen = 'reward';
      state.log.push(`${state.combat.enemy.name} liquidated: +${obols} Obols${relicReward ? ` and ${relicReward.name}` : ''}.`);
      emit({ kind: 'dialogue', target: 'player', actor: 'hero', trigger: 'reward' });
    }

    function applyDamage(amount) {
      amount = Math.ceil(amount * (state.player.vulnerable ? 1.5 : 1));
      const blocked = Math.min(state.player.block, amount);
      state.player.block -= blocked;
      const damage = Math.max(0, amount - blocked);
      const before = state.player.hp;
      state.player.hp = Math.max(0, state.player.hp - damage);
      const received = Math.max(0, before - state.player.hp);
      if (blocked) emit({ kind: 'absorbed', target: 'player', amount: blocked, source: 'block', trigger: 'blocked' });
      if (received) {
        state.stats.damageReceived += received;
        emit({ kind: 'damage', target: 'player', amount: received, source: 'enemy', trigger: state.player.hp <= state.player.maxHp * .25 ? 'low_hp' : 'hit' });
      }
      resolvePlayerDeath(state.combat?.enemy?.intent?.label || state.combat?.enemy?.name || 'Enemy action');
      return received;
    }

    function damageEnemy(amount) {
      const enemy = state.combat.enemy;
      amount = Math.ceil(amount * (enemy.vulnerable ? 1.5 : 1));
      const blocked = Math.min(enemy.block, amount);
      enemy.block -= blocked;
      const damage = Math.min(enemy.hp, Math.max(0, amount - blocked));
      enemy.hp = Math.max(0, enemy.hp - damage);
      state.combat.damageThisTurn += damage;
      if (blocked) emit({ kind: 'absorbed', target: 'enemy', amount: blocked, source: 'block', trigger: 'blocked' });
      if (damage) {
        state.stats.damageDealt += damage;
        state.stats.largestHit = Math.max(state.stats.largestHit, damage);
        emit({ kind: 'damage', target: 'enemy', amount: damage, source: 'card', trigger: damage >= 12 ? 'hard_hit' : 'hit' });
      }
      const enemyDefinition = ENEMIES[enemy.enemyId];
      if (enemyDefinition.phaseTwoIntents && enemy.phase === 1 && enemy.hp <= enemy.maxHp / 2) {
        enemy.phase = 2; enemy.intentIndex = 0; enemy.intent = intentFor(enemy);
        emit({ kind: 'phase', target: 'enemy', trigger: 'phase_two', source: enemy.name });
        state.log.push(enemy.enemyId === 'manager' ? 'The suit tears open. Management was inside.' : 'The Board emerges. Quorum achieved through screaming.');
      }
      if (enemy.hp === 0 && !state.combat.resolvingCard) completeCombat();
    }

    function playCard(index) {
      if (state.screen !== 'combat' || state.combat.locked) return { kind: 'invalid' };
      const card = state.combat.hand[index];
      if (!card) return { kind: 'invalid' };
      const playability = resolveCardPlayability(state, card);
      if (!playability.affordable) return { kind: 'unaffordable' };
      const { definition, obolDiscount, obolCost, shortage, overdraftDebt: debtAdded } = playability;
      state.combat.resolvingCard = true;
      state.player.energy = Math.max(0, state.player.energy - definition.cost);
      if (shortage) { state.combat.overdraftUsed = true; state.stats.overdrafts += 1; }
      if (shortage && state.combat.enemy.enemyId === 'intern') {
        state.combat.enemy.strength += 2;
        emit({ kind: 'dialogue', target: 'enemy', actor: 'intern', trigger: 'gimmick' });
      }
      state.player.debt = Math.min(state.player.debtLimit, state.player.debt + debtAdded + (definition.debt || 0));
      const gainedDebt = debtAdded + (definition.debt || 0);
      if (gainedDebt) emit({ kind: 'debt', target: 'player', amount: gainedDebt, source: definition.name, trigger: shortage ? 'overdraft' : 'debt' });
      if (gainedDebt && enemyGimmick(state.combat.enemy) === 'debtStrength') {
        state.combat.enemy.strength += gainedDebt;
        emit({ kind: 'strength', target: 'enemy', amount: gainedDebt, source: state.combat.enemy.name, trigger: 'gimmick' });
      }
      if (definition.obolCost) {
        state.player.obols -= obolCost;
        if (obolDiscount) state.combat.obolDiscountUsed = true;
      }
      const damage = definition.damage || 0;
      const staplerBonus = card.upgraded && definition.damage && state.relics.some((relic) => relic.id === 'golden_stapler') ? 1 : 0;
      const filingBonus = (definition.filingScale || 0) * state.player.filing
        + (definition.filingSpend && state.player.filing >= definition.filingSpend ? (definition.filingBonus || 0) : 0)
        + (definition.filingSpendAll ? state.player.filing * (definition.filingBonus || 0) : 0);
      const exhaustBonus = definition.exhaustPayoff ? state.combat.exhaust.length * definition.exhaustPayoff : 0;
      const painBonus = state.combat.painReady && damage ? 4 : 0;
      const totalDamage = damage + (definition.debtBonus && state.player.debt ? definition.debtBonus : 0)
        + (definition.debtScale || 0) * state.player.debt + filingBonus + exhaustBonus + state.player.ritual + staplerBonus + painBonus;
      if (painBonus) state.combat.painReady = false;
      if (totalDamage) {
        damageEnemy(Math.ceil(totalDamage * (state.player.weak ? 0.75 : 1)));
        const enemy = state.combat.enemy;
        if (enemy.hp > 0 && enemyGimmick(enemy) === 'landingShield' && !enemy.landingShieldUsed) {
          enemy.landingShieldUsed = true;
          enemy.block += 6;
          emit({ kind: 'block', target: 'enemy', amount: 6, source: enemy.name, trigger: 'gimmick' });
          emit({ kind: 'dialogue', target: 'enemy', actor: enemy.enemyId, trigger: 'gimmick' });
        }
        if (enemy.hp > 0 && enemyGimmick(enemy) === 'copyInjury' && !enemy.copyInjuryUsed) {
          enemy.copyInjuryUsed = true;
          losePlayerHp(3, enemy.name);
          emit({ kind: 'dialogue', target: 'enemy', actor: enemy.enemyId, trigger: 'gimmick' });
        }
      }
      const block = (definition.block || 0) + (definition.exhaustBlock || 0) * state.combat.exhaust.length;
      state.player.block += block;
      if (block) { state.stats.blockGained += block; emit({ kind: 'block', target: 'player', amount: block, source: definition.name, trigger: 'block' }); }
      if (block && enemyGimmick(state.combat.enemy) === 'mirrorBlock') {
        const mirrored = Math.max(1, Math.ceil(block / 2));
        state.combat.enemy.block += mirrored;
        emit({ kind: 'block', target: 'enemy', amount: mirrored, source: state.combat.enemy.name, trigger: 'gimmick' });
      }
      if (definition.reduceDebt) {
        const forgiven = Math.min(state.player.debt, definition.reduceDebt);
        state.player.debt -= forgiven;
        if (forgiven) emit({ kind: 'debt', target: 'player', amount: -forgiven, source: definition.name, trigger: 'debt_forgiven' });
      }
      if (definition.clearDebt) {
        const forgiven = state.player.debt;
        state.player.debt = 0;
        if (forgiven) emit({ kind: 'debt', target: 'player', amount: -forgiven, source: definition.name, trigger: 'debt_forgiven' });
        if (forgiven && state.relics.some((relic) => relic.id === 'debt_collector')) {
          state.player.block += 6; state.stats.blockGained += 6;
          emit({ kind: 'block', target: 'player', amount: 6, source: 'Debt Collector\'s Bell', trigger: 'relic' });
        }
      }
      if (definition.weak && state.combat) {
        state.combat.enemy.weak += definition.weak;
        emit({ kind: 'weak', target: 'enemy', amount: definition.weak, source: definition.name, trigger: 'weak' });
      }
      if (definition.vulnerable && state.combat) {
        state.combat.enemy.vulnerable += definition.vulnerable;
        emit({ kind: 'vulnerable', target: 'enemy', amount: definition.vulnerable, source: definition.name, trigger: 'status' });
      }
      if (definition.ritual) {
        state.player.ritual += definition.ritual;
        emit({ kind: 'ritual', target: 'player', amount: definition.ritual, source: definition.name, trigger: 'status' });
      }
      if (definition.bleed && state.combat) {
        state.combat.enemy.bleed += definition.bleed;
        emit({ kind: 'bleed', target: 'enemy', amount: definition.bleed, source: definition.name, trigger: 'status' });
      }
      if (definition.filing) {
        state.player.filing += definition.filing;
        emit({ kind: 'filing', target: 'player', amount: definition.filing, source: definition.name, trigger: 'status' });
      }
      if (definition.filingSpend && state.player.filing >= definition.filingSpend) state.player.filing -= definition.filingSpend;
      if (definition.filingSpendAll) state.player.filing = 0;
      if (definition.bribe && state.combat) {
        state.combat.enemy.bribed += definition.bribe;
        emit({ kind: 'bribed', target: 'enemy', amount: definition.bribe, source: definition.name, trigger: 'status' });
      }
      const appliesStatus = definition.weak || definition.vulnerable || definition.bleed || definition.bribe || definition.filing || definition.ritual;
      if (appliesStatus && state.benefits.some((benefit) => benefit.effect === 'synergy') && state.combat && !state.combat.synergyUsed) {
        state.combat.synergyUsed = true;
        state.player.ritual += 1;
        emit({ kind: 'ritual', target: 'player', amount: 1, source: 'Hostile Synergy', trigger: 'status' });
      }
      if (definition.vulnerableSelf) {
        state.player.vulnerable += definition.vulnerableSelf;
        emit({ kind: 'vulnerable', target: 'player', amount: definition.vulnerableSelf, source: definition.name, trigger: 'status' });
      }
      if (definition.obols && (!definition.oncePerCombatObols || state.combat.generatedObols === 0)) {
        state.player.obols += definition.obols;
        state.combat.generatedObols += definition.obols;
        emit({ kind: 'obols', target: 'player', amount: definition.obols, source: definition.name, trigger: 'generated' });
      }
      if (definition.heal) healPlayer(definition.heal, definition.name);
      if (definition.selfDamage) {
        const beforeSelfDamage = state.player.hp;
        losePlayerHp(definition.selfDamage, definition.name);
        if (state.combat) state.combat.hpLostThisTurn = (state.combat.hpLostThisTurn || 0) + Math.max(0, beforeSelfDamage - state.player.hp);
        if (state.benefits.some((benefit) => benefit.effect === 'pain')) state.combat.painReady = true;
        if (state.relics.some((relic) => relic.id === 'hemoglobin_stamp') && !state.combat.hemoglobinUsed) {
          healPlayer(1, 'Hemoglobin Stamp'); state.combat.hemoglobinUsed = true;
        }
        if (state.benefits.some((benefit) => benefit.effect === 'blood') && state.combat && !state.combat.bloodBenefitUsed) {
          healPlayer(2, 'Blood Bonus'); state.combat.bloodBenefitUsed = true;
        }
      }
      if (definition.energy) state.player.energy += definition.energy;
      if (definition.bloodHeal && state.combat?.hpLostThisTurn) healPlayer(definition.bloodHeal, definition.name);
      if (definition.exhaust) {
        state.combat?.exhaust.push(card);
        if (state.benefits.some((benefit) => benefit.effect === 'archive') && !state.combat.archiveBenefitUsed) {
          state.combat.archiveBenefitUsed = true;
          state.player.block += 3; state.stats.blockGained += 3;
          emit({ kind: 'block', target: 'player', amount: 3, source: 'Archive Dividend', trigger: 'benefit' });
        }
        if (enemyGimmick(state.combat?.enemy || {}) === 'exhaustBleed') {
          state.player.bleed += 1;
          emit({ kind: 'bleed', target: 'player', amount: 1, source: state.combat.enemy.name, trigger: 'gimmick' });
        }
        if (state.relics.some((relic) => relic.id === 'ash_tray') && state.screen === 'combat') damageEnemy(2);
      }
      if (state.combat) state.combat.hand.splice(index, 1);
      if (state.screen === 'combat' && definition.draw) drawCards(definition.draw);
      if (!definition.exhaust) state.combat?.discard.push(card);
      state.stats.cardsPlayed += 1;
      if (state.combat) {
        state.combat.streak += 1;
        state.combat.cardsPlayedThisTurn = (state.combat.cardsPlayedThisTurn || 0) + 1;
        if (enemyGimmick(state.combat.enemy) === 'thirdCardStrength' && state.combat.cardsPlayedThisTurn % 3 === 0) {
          state.combat.enemy.strength += 2;
          emit({ kind: 'strength', target: 'enemy', amount: 2, source: state.combat.enemy.name, trigger: 'gimmick' });
        }
      }
      state.log.push(`${definition.name} processed.`);
      state.combat.resolvingCard = false;
      if (state.player.hp <= 0 && resolvePlayerDeath(definition.name)) return { kind: 'defeat', cardId: card.cardId };
      if (state.combat.enemy.hp <= 0) {
        completeCombat();
        return { kind: 'victory', cardId: card.cardId };
      }
      return { kind: 'card-played', cardId: card.cardId };
    }

    function endTurn() {
      if (state.screen !== 'combat' || state.combat.locked) return { kind: 'invalid' };
      state.combat.discard.push(...state.combat.hand.splice(0));
      const enemy = state.combat.enemy;
      state.player.weak = Math.max(0, state.player.weak - 1);
      if (state.player.bleed) {
        const bleed = state.player.bleed; state.player.bleed = Math.max(0, state.player.bleed - 1); losePlayerHp(bleed, 'bleed');
        if (state.screen !== 'combat') return { kind: 'defeat' };
      }
      const intent = enemy.intent;
      if (enemy.bleed) {
        const bleed = enemy.bleed; enemy.bleed = Math.max(0, enemy.bleed - 1); damageEnemy(bleed);
        if (state.screen !== 'combat') return { kind: 'victory' };
      }
      if (intent.block) {
        enemy.block += intent.block;
        emit({ kind: 'block', target: 'enemy', amount: intent.block, source: intent.label, trigger: 'block' });
      }
      if (intent.damage && !enemy.bribed) {
        let damage = intent.damage * (intent.hits || 1) + (intent.debtScale || 0) * state.player.debt + enemy.strength;
        if (enemy.enemyId === 'chair') damage += Math.max(0, state.combat.turn - 1) * 2;
        if (enemy.weak) damage = Math.floor(damage * 0.75);
        applyDamage(damage);
      }
      if (intent.damage && enemy.bribed) {
        enemy.bribed = Math.max(0, enemy.bribed - 1);
        emit({ kind: 'bribed', target: 'enemy', amount: -1, source: intent.label, trigger: 'status' });
      }
      const applyPlayerDebuff = (status, amount, kind) => {
        if (!amount) return;
        const immune = state.benefits.some((benefit) => benefit.effect === 'immunity') && !state.combat.immunityUsed;
        if (immune) {
          state.combat.immunityUsed = true;
          emit({ kind: 'immune', target: 'player', amount, source: 'Executive Immunity', trigger: 'status' });
          return;
        }
        state.player[status] += amount;
        emit({ kind, target: 'player', amount, source: intent.label, trigger: 'status' });
      };
      applyPlayerDebuff('weak', intent.weak, 'weak');
      applyPlayerDebuff('vulnerable', intent.vulnerable, 'vulnerable');
      applyPlayerDebuff('bleed', intent.bleed, 'bleed');
      if (intent.ritual) enemy.ritual += intent.ritual;
      if (intent.steal && state.combat.damageThisTurn < 10) {
        const stolen = Math.min(state.player.obols, intent.steal);
        state.player.obols -= stolen;
        if (stolen) emit({ kind: 'dialogue', target: 'enemy', actor: enemy.enemyId, trigger: 'gimmick' });
      }
      if (enemy.enemyId === 'hr') {
        state.combat.discard.push(makeCard('form_66b'));
        emit({ kind: 'dialogue', target: 'enemy', actor: enemy.enemyId, trigger: 'gimmick' });
      }
      if (state.screen !== 'combat') return { kind: 'defeat' };
      state.player.block = 0;
      state.player.energy = Math.max(0, 3 - state.player.debt);
      if (state.player.debt) emit({ kind: 'debt', target: 'player', amount: -state.player.debt, source: 'repayment', trigger: 'debt_repaid' });
      state.player.debt = 0;
      state.player.vulnerable = Math.max(0, state.player.vulnerable - 1);
      enemy.weak = Math.max(0, enemy.weak - 1);
      enemy.vulnerable = Math.max(0, enemy.vulnerable - 1);
      enemy.strength += enemy.ritual || 0;
      enemy.intentIndex += 1;
      enemy.intent = intentFor(enemy);
      enemy.landingShieldUsed = false;
      enemy.copyInjuryUsed = false;
      state.combat.turn += 1;
      state.combat.damageThisTurn = 0;
      state.combat.hpLostThisTurn = 0;
      state.combat.bloodBenefitUsed = false;
      state.combat.hemoglobinUsed = false;
      state.combat.archiveBenefitUsed = false;
      state.combat.cardsPlayedThisTurn = 0;
      state.combat.streak = 0;
      drawCards(5);
      return { kind: 'turn-ended' };
    }

    function createShop() {
      const availableRelics = RELICS.filter((relic) => !state.relics.some((owned) => owned.id === relic.id));
      const cardIds = weightedCards(4);
      const rarityPrices = { common: 38, uncommon: 56, rare: 78 };
      const cards = cardIds.map((id) => {
        const basePrice = rarityPrices[CARD_LIBRARY[id].rarity] + Math.floor(random() * 7) - 3;
        return { ...makeCard(id), basePrice, price: basePrice };
      });
      const relicStock = shuffle(availableRelics).slice(0, 2).map((relic, index) => ({ ...relic, price: 82 + index * 18 }));
      const discount = cards[Math.floor(random() * cards.length)];
      if (discount) discount.price = Math.ceil(discount.price * .65);
      return {
        cards, relics: relicStock, relic: relicStock[0] || null, discountId: discount?.instanceId || null,
        rerollPrice: 24, removePrice: 55, upgradePrice: 65, rerolls: 0,
        removalUsed: false, upgradeUsed: false, merchant: 'acquisitions_imp',
      };
    }

    function advanceAct() {
      const actIndex = ACTS.findIndex((act) => act.id === state.act);
      const nextAct = ACTS[actIndex + 1];
      if (!nextAct) {
        state.screen = 'outcome'; state.result = 'victory'; state.outcomeCause = 'The Board liquidated'; state.log.push('The Board is adjourned. Permanently.');
        emit({ kind: 'dialogue', target: 'player', actor: 'hero', trigger: 'victory' });
        return { kind: 'run-complete' };
      }
      state.act = nextAct.id; state.floor = 0; state.map = null; state.currentNode = null;
      healPlayer(Math.ceil(state.player.maxHp * .35), 'promotion');
      state.benefitChoice = benefitOffer(nextAct.id);
      state.screen = 'benefit'; state.log.push('Promotion processed. Executive access reluctantly granted.');
      emit({ kind: 'phase', target: 'player', trigger: 'promotion', source: `Act ${nextAct.id}` });
      return { kind: 'act-advanced', act: nextAct.id };
    }

    function chooseNode(id) {
      if (state.screen !== 'map') return { kind: 'invalid' };
      if (!state.map.available.includes(id)) return { kind: 'invalid' };
      const node = state.map.rows.flat().find((item) => item.id === id) || (state.map.boss.id === id ? state.map.boss : null);
      if (!node) return { kind: 'invalid' };
      const previous = state.map.visited.at(-1);
      state.currentNode = node; state.floor = node.row + 1; state.map.progress = node.row + 1; state.map.available = [...node.connections];
      state.map.visited.push(node.id);
      if (previous) state.map.visitedEdges.push(`${previous}>${node.id}`);
      refreshMapReachability(state.map);
      if (['battle', 'elite', 'boss'].includes(node.type)) return startCombat(node.type);
      if (node.type === 'shop') { state.shop = createShop(); state.screen = 'shop'; return { kind: 'shop' }; }
      if (node.type === 'campfire') { state.screen = 'campfire'; return { kind: 'campfire' }; }
      if (node.type === 'cache') { state.player.obols += 18; state.reward = createReward(); state.screen = 'reward'; return { kind: 'cache' }; }
      if (node.type === 'contract') { state.player.obols += 35; state.player.pendingDebt = Math.min(state.player.debtLimit, state.player.pendingDebt + 1); state.reward = createReward(); state.screen = 'reward'; return { kind: 'contract' }; }
      state.event = createEvent();
      state.screen = 'event'; return { kind: 'event' };
    }

    function returnToMap() { state.screen = 'map'; state.currentNode = null; }
    function chooseReward(instanceId) {
      if (state.screen !== 'reward') return { kind: 'invalid' };
      const card = state.reward.cards.find((item) => item.instanceId === instanceId);
      if (card) state.deck.push({ ...card });
      returnToMap(); return { kind: card ? 'reward-chosen' : 'skipped' };
    }
    function chooseEvent(id) {
      if (state.screen !== 'event') return { kind: 'invalid' };
      const choice = state.event.choices.find((item) => item.id === id);
      if (!choice) return { kind: 'invalid' };
      const hpCosts = { bloodMoney: 5, cardForBlood: 4, relicForBlood: 7 };
      const hpCost = hpCosts[choice.effect] || 0;
      if (hpCost && state.player.hp <= hpCost) {
        const reason = `Requires ${hpCost} HP and at least 1 HP remaining.`;
        state.event.error = reason;
        return { kind: 'unaffordable', reason };
      }
      if (choice.effect === 'healForObols' && state.player.obols < 25) return { kind: 'unaffordable', reason: 'Requires 25 Obols.' };
      if (choice.effect === 'purgeCurse' && !state.deck.some((card) => card.cardId === 'form_66b')) return { kind: 'unaffordable', reason: 'No Form 66-B to sell.' };
      delete state.event.error;
      if (choice.effect === 'bloodMoney') { losePlayerHp(5, 'event'); state.player.obols += 45; }
      else if (choice.effect === 'debtHeal') { healPlayer(6, 'event'); state.player.pendingDebt = 1; }
      else if (choice.effect === 'cardForBlood') { losePlayerHp(4, 'event'); state.deck.push(makeCard(weightedCards(1)[0])); }
      else if (choice.effect === 'smallMoney') state.player.obols += 18;
      else if (choice.effect === 'bigHeal') healPlayer(9, 'event');
      else if (choice.effect === 'mediumMoney') state.player.obols += 32;
      else if (choice.effect === 'absolveDebt') { state.player.pendingDebt = 0; healPlayer(4, 'event'); }
      else if (choice.effect === 'upgradeRandom') {
        const candidates = state.deck.filter((card) => !card.upgraded && hasMeaningfulUpgrade(card.cardId));
        const card = shuffle(candidates)[0]; if (card) card.upgraded = true;
      }
      else if (choice.effect === 'filingMoney') state.player.obols += 28;
      else if (choice.effect === 'mediumHeal') healPlayer(7, 'event');
      else if (choice.effect === 'relicForBlood') {
        losePlayerHp(7, 'event');
        const available = RELICS.filter((relic) => !state.relics.some((owned) => owned.id === relic.id));
        const relic = shuffle(available)[0]; if (relic) state.relics.push({ ...relic });
      }
      else if (choice.effect === 'safeMoney') state.player.obols += 24;
      else if (choice.effect === 'maxHpDebt') { state.player.maxHp += 4; state.player.hp += 4; state.player.pendingDebt = Math.min(state.player.debtLimit, state.player.pendingDebt + 1); }
      else if (choice.effect === 'executiveHeal') healPlayer(10, 'event');
      else if (choice.effect === 'buyRare') {
        if (state.player.obols < 20) return { kind: 'unaffordable' };
        state.player.obols -= 20; const cardId = weightedCards(1, { rarity: 'rare' })[0]; if (cardId) state.deck.push(makeCard(cardId));
      }
      else if (choice.effect === 'reportGhost') state.player.obols += 30;
      else if (choice.effect === 'removeStarter') {
        const index = state.deck.findIndex((card) => ['paper_cut', 'red_tape'].includes(card.cardId)); if (index >= 0) state.deck.splice(index, 1);
      }
      else if (choice.effect === 'curseForObols') { state.deck.push(makeCard('form_66b')); state.player.obols += 42; }
      else if (choice.effect === 'transformStarter') {
        const card = state.deck.find((item) => ['paper_cut', 'red_tape'].includes(item.cardId));
        if (card) { card.cardId = weightedCards(1)[0] || card.cardId; card.upgraded = false; }
      }
      else if (choice.effect === 'rareForMaxHp') {
        state.player.maxHp = Math.max(1, state.player.maxHp - 3); state.player.hp = Math.min(state.player.hp, state.player.maxHp);
        const cardId = weightedCards(1, { rarity: 'rare' })[0]; if (cardId) state.deck.push(makeCard(cardId));
      }
      else if (choice.effect === 'auditLottery') {
        if (random() < .2) losePlayerHp(12, 'Benefits Roulette'); else state.player.obols += 60;
      }
      else if (choice.effect === 'maxHpForCurse') { state.player.maxHp += 6; state.player.hp += 6; state.deck.push(makeCard('form_66b')); }
      else if (choice.effect === 'upgradeStarter') {
        const card = state.deck.find((item) => ['paper_cut', 'red_tape'].includes(item.cardId) && !item.upgraded); if (card) card.upgraded = true;
        losePlayerHp(6, 'Compliance Tattoo');
      }
      else if (choice.effect === 'ambush') {
        state.event = null; const result = startCombat('battle'); state.combat.lootMultiplier = 2; return { ...result, kind: 'event-combat' };
      }
      else if (choice.effect === 'forcedFine') state.player.obols = Math.max(0, state.player.obols - 28);
      else if (choice.effect === 'healForObols') { state.player.obols -= 25; healPlayer(16, 'Sick-Day Jar'); }
      else if (choice.effect === 'moneyDebt') { state.player.obols += 35; state.player.pendingDebt = Math.min(state.player.debtLimit, state.player.pendingDebt + 1); }
      else if (choice.effect === 'purgeCurse') {
        const index = state.deck.findIndex((card) => card.cardId === 'form_66b'); state.deck.splice(index, 1); state.player.obols += 20;
      }
      else if (choice.effect === 'relicForDebt') {
        const available = RELICS.filter((relic) => !state.relics.some((owned) => owned.id === relic.id));
        const relic = shuffle(available)[0]; if (relic) state.relics.push({ ...relic });
        state.player.pendingDebt = Math.min(state.player.debtLimit, state.player.pendingDebt + 1);
      }
      else if (choice.effect === 'maxHpForMoney') {
        state.player.maxHp = Math.max(1, state.player.maxHp - 5); state.player.hp = Math.min(state.player.hp, state.player.maxHp); state.player.obols += 75;
      }
      else if (choice.effect === 'debtForUpgrades') {
        state.player.pendingDebt = Math.min(state.player.debtLimit, state.player.pendingDebt + 2);
        shuffle(state.deck.filter((card) => !card.upgraded && hasMeaningfulUpgrade(card.cardId))).slice(0, 3).forEach((card) => { card.upgraded = true; });
      }
      else if (choice.effect === 'parachuteGamble') {
        if (random() < .5) {
          const available = RELICS.filter((relic) => !state.relics.some((owned) => owned.id === relic.id));
          const relic = shuffle(available)[0]; if (relic) state.relics.push({ ...relic });
        } else losePlayerHp(10, 'Parachute Test');
      }
      else if (choice.effect === 'fullHealForCurses') {
        healPlayer(state.player.maxHp, 'Compulsory Wellness'); state.deck.push(makeCard('form_66b'), makeCard('form_66b'));
      }
      else if (choice.effect === 'bloodRemove') {
        losePlayerHp(8, 'Wellness Refusal');
        const index = state.deck.findIndex((card) => ['paper_cut', 'red_tape'].includes(card.cardId)); if (index >= 0) state.deck.splice(index, 1);
      }
      if (state.screen === 'outcome' || state.result === 'defeat') return { kind: 'event-defeat' };
      returnToMap(); return { kind: 'event-chosen' };
    }
    function createEvent(index) {
      if (Number.isInteger(index)) return JSON.parse(JSON.stringify(EVENTS[index % EVENTS.length]));
      const pool = EVENTS.filter((event) => !event.act || event.act === state.act);
      return JSON.parse(JSON.stringify(pool[Math.floor(random() * pool.length)]));
    }
    function buy(instanceId) {
      if (state.screen !== 'shop') return { kind: 'invalid' };
      const relic = state.shop.relics?.find((item) => item.id === instanceId) || (state.shop.relic?.id === instanceId ? state.shop.relic : null);
      if (relic) {
        if (relic.sold || state.player.obols < relic.price || state.relics.some((item) => item.id === relic.id)) return { kind: 'unaffordable' };
        state.player.obols -= relic.price; relic.sold = true;
        state.relics.push({ id: relic.id, name: relic.name, text: relic.text });
        return { kind: 'relic-bought' };
      }
      const card = state.shop.cards.find((item) => item.instanceId === instanceId && !item.sold);
      if (!card || state.player.obols < card.price) return { kind: 'unaffordable' };
      state.player.obols -= card.price; card.sold = true;
      state.deck.push({ instanceId: card.instanceId, cardId: card.cardId, upgraded: card.upgraded });
      return { kind: 'bought' };
    }
    function removeCard(instanceId) {
      if (state.screen !== 'shop' || state.shop.removalUsed || state.player.obols < state.shop.removePrice || state.deck.length <= 5) return { kind: 'unaffordable' };
      const index = state.deck.findIndex((card) => card.instanceId === instanceId);
      if (index < 0) return { kind: 'invalid' };
      state.player.obols -= state.shop.removePrice;
      state.deck.splice(index, 1);
      state.shop.removalUsed = true;
      return { kind: 'card-removed' };
    }
    function upgradeCard(instanceId) {
      if (state.screen !== 'shop' || state.shop.upgradeUsed || state.player.obols < state.shop.upgradePrice) return { kind: 'unaffordable' };
      const card = state.deck.find((item) => item.instanceId === instanceId && !item.upgraded && hasMeaningfulUpgrade(item.cardId));
      if (!card) return { kind: 'invalid' };
      state.player.obols -= state.shop.upgradePrice; card.upgraded = true; state.shop.upgradeUsed = true;
      return { kind: 'card-upgraded' };
    }
    function rerollShop() {
      if (state.screen !== 'shop' || state.player.obols < state.shop.rerollPrice) return { kind: 'unaffordable' };
      state.player.obols -= state.shop.rerollPrice; state.shop.rerolls += 1; state.shop.rerollPrice += 12;
      const replacement = createShop();
      state.shop.cards = replacement.cards; state.shop.relics = replacement.relics; state.shop.relic = state.shop.relics[0] || null; state.shop.discountId = replacement.discountId;
      return { kind: 'rerolled' };
    }
    function campfire(action, instanceId) {
      if (state.screen !== 'campfire') return { kind: 'invalid' };
      if (action === 'heal') healPlayer(Math.ceil(state.player.maxHp * 0.3), 'campfire');
      else {
        const card = state.deck.find((item) => item.instanceId === instanceId && !item.upgraded && hasMeaningfulUpgrade(item.cardId))
          || state.deck.find((item) => !item.upgraded && hasMeaningfulUpgrade(item.cardId));
        if (card) card.upgraded = true;
      }
      returnToMap(); return { kind: 'campfire-complete' };
    }
    function leaveShop() { if (state.screen === 'shop') returnToMap(); }
    function restart(nextSeed = Date.now()) { seed = nextSeed; random = seededRandom(seed); nextInstance = 1; resetState(); return state; }
    function setStateForTest(patch) { Object.assign(state, JSON.parse(JSON.stringify(patch))); return state; }
    function startBossForTest() {
      if (!state.map) state.map = buildMap(state.act);
      state.currentNode = state.map.boss; state.map.progress = state.map.rows.length + 1;
      return startCombat('boss');
    }

    resetState();
    return {
      state, chooseBenefit, advanceAct, chooseNode, playCard, endTurn, chooseReward, chooseEvent, buy, removeCard, upgradeCard, rerollShop, campfire,
      leaveShop, restart, setStateForTest, drainEffects, createShopForTest: createShop,
      startBossForTest, damageEnemyForTest: damageEnemy, createEventForTest: createEvent, createRewardForTest: createReward, buildMapForTest: buildMap,
    };
  }

  return { createRun, CARD_LIBRARY, ENEMIES, RELICS, EVENTS, BENEFITS, ACTS, eligibleCards, resolveCardDefinition, resolveCardPlayability, hasMeaningfulUpgrade };
});
