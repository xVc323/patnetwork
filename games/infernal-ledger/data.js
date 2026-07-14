(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.InfernalData = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const CARDS = {
    paper_cut: { name: 'Paper Cut', cost: 1, damage: 6, upgradedDamage: 9, rarity: 'starter', text: 'Deal 6 damage.' },
    red_tape: { name: 'Red Tape', cost: 1, block: 5, upgradedBlock: 8, rarity: 'starter', text: 'Gain 5 Block.' },
    creative_accounting: { name: 'Creative Accounting', cost: 0, energy: 1, debt: 1, upgradedDebt: 0, rarity: 'starter', text: 'Gain 1 Hellfire. Gain 1 Debt.' },
    hostile_takeover: { name: 'Hostile Takeover', cost: 2, damage: 12, debtBonus: 4, rarity: 'starter', text: 'Deal 12 damage. +4 with Debt.' },
    compound_interest: { name: 'Compound Interest', cost: 1, damage: 5, debtScale: 5, rarity: 'common', text: 'Deal 5 damage, +5 per Debt.' },
    expense_imp: { name: 'Expense the Intern', cost: 1, damage: 8, draw: 1, rarity: 'common', text: 'Deal 8. Draw 1.' },
    compliance_training: { name: 'Compliance Training', cost: 1, block: 7, reduceDebt: 1, rarity: 'common', text: 'Gain 7 Block. Reduce Debt by 1.' },
    blood_from_stone: { name: 'Blood From Stone', cost: 2, damage: 16, rarity: 'common', text: 'Deal 16 damage.' },
    audit_trail: { name: 'Audit Trail', cost: 0, block: 3, draw: 1, rarity: 'common', text: 'Gain 3 Block. Draw 1.' },
    hostile_workplace: { name: 'Hostile Workplace', cost: 1, weak: 2, upgradedWeak: 3, rarity: 'common', text: 'Apply 2 Weak.' },
    loophole: { name: 'Loophole', cost: 1, upgradedCost: 0, clearDebt: true, draw: 1, exhaust: true, rarity: 'uncommon', text: 'Clear all Debt. Draw 1. Exhaust.' },
    soul_foreclosure: { name: 'Soul Foreclosure', cost: 2, damage: 10, debtScale: 8, rarity: 'uncommon', text: 'Deal 10, +8 per Debt.' },
    golden_parachute: { name: 'Golden Parachute', cost: 2, block: 15, rarity: 'uncommon', text: 'Gain 15 Block.' },
    mandatory_fun: { name: 'Mandatory Fun', cost: 1, damage: 4, block: 6, rarity: 'uncommon', text: 'Deal 4. Gain 6 Block.' },
    severance: { name: 'Severance', cost: 1, damage: 11, selfDamage: 2, rarity: 'uncommon', text: 'Deal 11. Lose 2 HP.' },
    fiscal_exorcism: { name: 'Fiscal Exorcism', cost: 2, damage: 20, clearDebt: true, rarity: 'rare', text: 'Deal 20. Clear all Debt.' },
    creative_void: { name: 'Creative Void', cost: 0, energy: 2, debt: 2, upgradedDebt: 1, draw: 2, exhaust: true, rarity: 'rare', text: 'Gain 2 Hellfire, 2 Debt. Draw 2. Exhaust.' },
    final_notice: { name: 'Final Notice', cost: 3, damage: 30, rarity: 'rare', text: 'Deal 30 damage.' },
    late_fee: { name: 'Late Fee', cost: 0, damage: 3, debtScale: 3, rarity: 'common', text: 'Deal 3, +3 per Debt.' },
    soul_audit: { name: 'Soul Audit', cost: 1, damage: 7, draw: 1, rarity: 'common', text: 'Deal 7. Draw 1.' },
    imp_tern: { name: 'Imp-tern', cost: 1, block: 4, energy: 1, rarity: 'common', text: 'Gain 4 Block and 1 Hellfire.' },
    noncompete: { name: 'Non-Compete', cost: 1, weak: 1, block: 5, rarity: 'common', text: 'Apply 1 Weak. Gain 5 Block.' },
    expense_claim: { name: 'Expense Claim', cost: 0, draw: 2, upgradedDraw: 3, debt: 1, rarity: 'uncommon', text: 'Draw 2. Gain 1 Debt.' },
    redline: { name: 'Redline', cost: 1, damage: 9, selfDamage: 1, rarity: 'uncommon', text: 'Deal 9. Lose 1 HP.' },
    bad_faith: { name: 'Bad Faith Estimate', cost: 2, damage: 13, block: 7, rarity: 'uncommon', text: 'Deal 13. Gain 7 Block.' },
    liquidation: { name: 'Liquidation Event', cost: 2, damage: 22, debt: 1, rarity: 'rare', text: 'Deal 22. Gain 1 Debt.' },
    demonic_synergy: { name: 'Demonic Synergy', cost: 1, damage: 6, block: 6, draw: 1, rarity: 'rare', text: 'Deal 6. Gain 6 Block. Draw 1.' },
    paper_trail: { name: 'Paper Trail', cost: 0, block: 5, draw: 1, exhaust: true, rarity: 'common', text: 'Gain 5 Block. Draw 1. Exhaust.' },
    form_66b: { name: 'Form 66-B', cost: 99, rarity: 'status', text: 'Unplayable. Proof of workplace culture.' },
    filing_frenzy: { name: 'Filing Frenzy', cost: 1, damage: 5, filing: 2, rarity: 'common', act: 1, text: 'Deal 5. File 2.' },
    shred_notice: { name: 'Shred Notice', cost: 1, damage: 8, filingSpend: 2, filingBonus: 8, rarity: 'uncommon', act: 1, text: 'Deal 8. Spend 2 Filing for +8.' },
    paper_dragon: { name: 'Paper Dragon', cost: 2, block: 10, filing: 3, rarity: 'uncommon', act: 1, text: 'Gain 10 Block. File 3.' },
    archive_fire: { name: 'Archive Fire', cost: 1, damage: 6, exhaustPayoff: 6, exhaust: true, rarity: 'rare', act: 1, text: 'Deal 6 damage, +6 per Exhausted card. Exhaust.' },
    blood_salary: { name: 'Blood Salary', cost: 0, selfDamage: 3, upgradedSelfDamage: 2, energy: 2, rarity: 'common', act: 1, text: 'Lose 3 HP. Gain 2 Hellfire.' },
    paid_in_exposure: { name: 'Paid in Exposure', cost: 1, damage: 9, bloodHeal: 2, rarity: 'common', act: 1, text: 'Deal 9. Recover 2 HP if HP was lost this turn.' },
    sick_leave: { name: 'Sick Leave', cost: 1, block: 7, exhaustBlock: 2, heal: 3, exhaust: true, rarity: 'uncommon', act: 1, text: 'Gain 7 Block, +2 per Exhausted card. Heal 3. Exhaust.' },
    refinancing: { name: 'Refinancing', cost: 0, clearDebt: true, draw: 2, upgradedDraw: 3, exhaust: true, rarity: 'uncommon', act: 1, text: 'Clear all Debt. Draw 2. Exhaust.' },
    predatory_apr: { name: 'Predatory APR', cost: 1, ritual: 2, upgradedRitual: 3, debt: 1, rarity: 'rare', act: 1, text: 'Gain 2 Ritual and 1 Debt.' },
    hostile_merger: { name: 'Hostile Merger', cost: 2, damage: 14, vulnerable: 2, rarity: 'uncommon', act: 2, text: 'Deal 14. Apply 2 Vulnerable.' },
    golden_handshake: { name: 'Golden Handshake', cost: 1, block: 9, obols: 8, oncePerCombatObols: true, rarity: 'common', act: 2, text: 'Gain 9 Block. Once per combat, gain 8 Obols.' },
    bribe_fate: { name: 'Bribe Fate', cost: 1, obolCost: 12, upgradedObolCost: 8, bribe: 1, draw: 1, rarity: 'uncommon', act: 2, text: 'Pay 12 Obols. Cancel enemy attack damage. Draw 1.' },
    insider_trading: { name: 'Insider Trading', cost: 0, obolCost: 8, upgradedObolCost: 4, energy: 1, draw: 1, rarity: 'common', act: 2, text: 'Pay 8 Obols. Gain 1 Hellfire. Draw 1.' },
    synergy_tax: { name: 'Synergy Tax', cost: 1, damage: 7, filingScale: 2, rarity: 'common', act: 2, text: 'Deal 7, +2 per Filing.' },
    severance_claw: { name: 'Severance Claw', cost: 2, damage: 18, bleed: 3, selfDamage: 2, rarity: 'rare', act: 2, text: 'Deal 18. Apply 3 Bleed. Lose 2 HP.' },
    executive_order: { name: 'Executive Order', cost: 2, ritual: 3, block: 8, rarity: 'rare', act: 2, text: 'Gain 3 Ritual and 8 Block.' },
    write_off: { name: 'Write-Off', cost: 1, damage: 10, filingSpendAll: true, filingBonus: 3, rarity: 'uncommon', act: 2, text: 'Deal 10, +3 per Filing. Clear Filing.' },
    unlimited_liability: { name: 'Unlimited Liability', cost: 3, damage: 34, debt: 2, vulnerableSelf: 2, rarity: 'rare', act: 2, text: 'Deal 34. Gain 2 Debt and 2 Vulnerable.' },
  };

  const ENEMIES = {
    penitent: { name: 'The Stapled Penitent', maxHp: 34, intents: [{ label: 'Staple', damage: 7 }, { label: 'Self-Filing', block: 6 }] },
    mouth: { name: 'Mouth of Compliance', maxHp: 38, intents: [{ label: 'Recite Policy', damage: 6, weak: 1 }, { label: 'Consume Complaint', damage: 10 }] },
    wretch: { name: 'Ledger Wretch', maxHp: 42, intents: [{ label: 'Embezzle', damage: 7, steal: 5 }, { label: 'Cook Books', block: 8 }] },
    chair: { name: 'Chair With Too Many Legs', maxHp: 46, intents: [{ label: 'Quarterly Scuttle', damage: 4, hits: 2 }, { label: 'Sit On You', damage: 13 }] },
    intern: { name: 'The Unpaid Intern', maxHp: 62, elite: true, intents: [{ label: 'Gain Experience', damage: 10 }, { label: 'Work Weekend', damage: 15 }] },
    hr: { name: 'Human Resources', maxHp: 68, elite: true, intents: [{ label: 'Mandatory Meeting', damage: 9, weak: 1 }, { label: 'Culture Fit', damage: 16 }] },
    manager: { name: 'Regional Manager of the Damned', maxHp: 110, boss: true, intents: [{ label: 'Performance Review', damage: 12, weak: 1 }, { label: 'Circle Back', damage: 18 }], phaseTwoIntents: [{ label: 'Compounding Interest', damage: 10, debtScale: 3 }, { label: 'Hostile Restructure', damage: 8, hits: 2 }] },
    claim_eater: { name: 'Claim Eater', maxHp: 44, act: 1, intents: [{ label: 'Reject Claim', damage: 8, category: 'attack' }, { label: 'Missing Receipt', weak: 1, block: 6, category: 'debuff' }] },
    carbon_copy: { name: 'Carbon Copy', maxHp: 39, act: 1, intents: [{ label: 'Duplicate Injury', damage: 5, hits: 2, category: 'attack' }, { label: 'Triplicate', ritual: 2, category: 'special' }] },
    benefits_larva: { name: 'Benefits Larva', maxHp: 48, act: 1, intents: [{ label: 'Dental Exclusion', damage: 9, bleed: 2, category: 'debuff' }, { label: 'Pupate', block: 9, category: 'defense' }] },
    late_fee_ghoul: { name: 'Late-Fee Ghoul', maxHp: 45, act: 1, intents: [{ label: 'Compound Bite', damage: 7, debtScale: 2, category: 'attack' }, { label: 'Past Due', vulnerable: 1, category: 'debuff' }] },
    merger_mimic: { name: 'Merger Mimic', maxHp: 58, act: 2, gimmick: 'mirrorBlock', intents: [{ label: 'Absorb Department', damage: 12, category: 'attack' }, { label: 'Asset Shield', block: 12, category: 'defense' }] },
    compliance_seraph: { name: 'Compliance Seraph', maxHp: 54, act: 2, gimmick: 'debtStrength', intents: [{ label: 'Terms and Wings', damage: 8, weak: 2, category: 'debuff' }, { label: 'Sacred Clause', ritual: 2, category: 'special' }] },
    parachute_knight: { name: 'Golden-Parachute Knight', maxHp: 64, act: 2, gimmick: 'landingShield', intents: [{ label: 'Soft Landing', block: 14, category: 'defense' }, { label: 'Golden Impact', damage: 16, category: 'attack' }] },
    synergy_hydra: { name: 'Synergy Hydra', maxHp: 72, act: 2, gimmick: 'thirdCardStrength', intents: [{ label: 'Cross-Functional Bite', damage: 5, hits: 3, category: 'attack' }, { label: 'Grow Headcount', ritual: 3, category: 'special' }] },
    burnout_oracle: { name: 'Burnout Oracle', maxHp: 76, act: 2, gimmick: 'exhaustBleed', intents: [{ label: 'Forecast Exhaustion', damage: 11, bleed: 2, category: 'debuff' }, { label: 'Quarterly Vision', block: 10, category: 'defense' }] },
    redundancy_clone: { name: 'Redundancy Clone', maxHp: 72, act: 2, gimmick: 'copyInjury', intents: [{ label: 'Duplicate Role', damage: 6, hits: 2, category: 'attack' }, { label: 'Eliminate Original', weak: 1, ritual: 1, category: 'debuff' }] },
    consultant: { name: 'The Outside Consultant', maxHp: 86, elite: true, act: 2, intents: [{ label: 'Billable Hour', damage: 14, category: 'attack' }, { label: 'Best Practice', ritual: 3, block: 8, category: 'special' }] },
    vp_knives: { name: 'Vice President of Knives', maxHp: 92, elite: true, act: 2, intents: [{ label: 'Cut Costs', damage: 7, hits: 3, category: 'attack' }, { label: 'Lean Operation', vulnerable: 2, category: 'debuff' }] },
    eternal_vp: { name: 'Vice-President of Eternal Growth', maxHp: 145, boss: true, act: 2, intents: [{ label: 'Infinite Forecast', damage: 16, category: 'attack' }, { label: 'Acquire Soul', damage: 10, debtScale: 4, category: 'special' }], phaseTwoIntents: [{ label: 'Board Vote', damage: 9, hits: 2, category: 'attack' }, { label: 'Compound Everything', ritual: 4, block: 14, category: 'special' }] },
  };

  const BENEFITS = [
    { id: 'union_dues', act: 1, name: 'Union Dues', text: 'Start combat with 6 Block and 1 Filing.', effect: 'union' },
    { id: 'blood_bonus', act: 1, name: 'Blood Bonus', text: '+6 maximum HP. Heal 2 after self-damage once per turn.', effect: 'blood' },
    { id: 'predatory_credit', act: 1, name: 'Predatory Credit', text: 'Soul Debt limit becomes 3. Start with 15 Obols.', effect: 'credit' },
    { id: 'iron_filing', act: 1, name: 'Iron Filing Cabinet', text: 'Start each combat with 2 additional Filing.', effect: 'filing' },
    { id: 'pain_clause', act: 1, name: 'Pain Clause', text: 'After losing HP on your turn, your next attack deals +4.', effect: 'pain' },
    { id: 'archive_dividend', act: 1, name: 'Archive Dividend', text: 'First card Exhausted each turn grants 3 Block.', effect: 'archive' },
    { id: 'golden_handcuffs', act: 2, name: 'Golden Handcuffs', text: 'Draw one extra card on turn one.', effect: 'draw' },
    { id: 'hostile_synergy', act: 2, name: 'Hostile Synergy', text: 'First status applied each combat also grants 1 Ritual.', effect: 'synergy' },
    { id: 'executive_immunity', act: 2, name: 'Executive Immunity', text: 'Prevent the first debuff in each combat.', effect: 'immunity' },
    { id: 'liquid_assets', act: 2, name: 'Liquid Assets', text: 'First Obol cost each combat is reduced by 6.', effect: 'liquid' },
    { id: 'infernal_pension', act: 2, name: 'Infernal Pension', text: 'Heal 5 HP after defeating an elite.', effect: 'pension' },
  ];

  const ACTS = [
    { id: 1, name: 'Probation & Collections', subtitle: 'Accounts Receivable Beneath Hell', palette: 'collections', boss: 'manager', battles: ['penitent', 'mouth', 'wretch', 'chair', 'claim_eater', 'carbon_copy', 'benefits_larva', 'late_fee_ghoul'], battleTiers: [['penitent', 'mouth', 'wretch'], ['chair', 'claim_eater', 'carbon_copy'], ['benefits_larva', 'late_fee_ghoul']], elites: ['intern', 'hr'] },
    { id: 2, name: 'Mergers & Damnation', subtitle: 'The Executive Tower', palette: 'executive', boss: 'eternal_vp', battles: ['merger_mimic', 'compliance_seraph', 'parachute_knight', 'synergy_hydra', 'burnout_oracle', 'redundancy_clone'], battleTiers: [['merger_mimic', 'compliance_seraph'], ['parachute_knight', 'synergy_hydra'], ['burnout_oracle', 'redundancy_clone']], elites: ['consultant', 'vp_knives'] },
  ];

  const RELICS = [
    { id: 'bent_abacus', name: 'Bent Abacus', text: 'First Overdraft each combat creates 1 less Debt.' },
    { id: 'employee_minute', name: 'Employee of the Minute', text: 'Draw 1 extra card on turn one.' },
    { id: 'blood_mug', name: 'Mug of Lukewarm Blood', text: 'Heal 2 after battle.' },
    { id: 'golden_stapler', name: 'Golden Stapler', text: 'Upgraded attacks deal +1.' },
    { id: 'severance_package', name: 'Severance Package', text: 'Survive lethal damage once.' },
    { id: 'debt_collector', name: 'Debt Collector\'s Bell', text: 'Clearing Debt grants 6 Block.' },
    { id: 'filing_cabinet', name: 'Portable Filing Cabinet', text: 'Start combat with 2 Filing.' },
    { id: 'hemoglobin_stamp', name: 'Hemoglobin Stamp', text: 'First self-damage each turn heals 1 HP afterward.' },
    { id: 'ash_tray', name: 'Executive Ash Tray', text: 'Exhausting a card deals 2 damage.' },
    { id: 'coin_purse', name: 'Screaming Coin Purse', text: 'First Obol cost each combat is reduced by 5.' },
    { id: 'interest_waiver', name: 'Interest Waiver', text: 'Start combat with 4 Hellfire and 1 Debt.' },
    { id: 'union_pin', name: 'Union Pin Through the Heart', text: 'Start combat with 4 Block.' },
  ];

  const EVENTS = [
    { act: 1, title: 'The Expense Report That Breathes', body: 'It requests a signature in a language made of teeth.', choices: [{ id: 'sign', label: 'Sign in blood', detail: 'Lose 5 HP. Gain 45 obols.', effect: 'bloodMoney' }, { id: 'reject', label: 'Return to sender', detail: 'Heal 6 HP. Start next combat with 1 Debt.', effect: 'debtHeal' }] },
    { act: 1, title: 'The Elevator of Moral Descent', body: 'Every button says “Lower Management.”', choices: [{ id: 'descend', label: 'Press all buttons', detail: 'Gain a random card. Lose 4 HP.', effect: 'cardForBlood' }, { id: 'stairs', label: 'Take the screaming stairs', detail: 'Gain 18 obols.', effect: 'smallMoney' }] },
    { title: 'A Skeleton Awaiting Approval', body: 'Its request is only four centuries overdue.', choices: [{ id: 'approve', label: 'Approve retroactively', detail: 'Heal 9 HP.', effect: 'bigHeal' }, { id: 'deny', label: 'Request more evidence', detail: 'Gain 32 obols. Feel nothing.', effect: 'mediumMoney' }] },
    { act: 1, title: 'The Shredder Confessional', body: 'It whispers every secret it has eaten.', choices: [{ id: 'confess', label: 'Confess your liabilities', detail: 'Clear pending Debt. Heal 4 HP.', effect: 'absolveDebt' }, { id: 'feed', label: 'Feed it a promotion', detail: 'Upgrade a random card.', effect: 'upgradeRandom' }] },
    { act: 1, title: 'The Filing Crypt', body: 'Shelves descend farther than theology permits.', choices: [{ id: 'index', label: 'Index the dead', detail: 'Gain 28 Obols.', effect: 'filingMoney' }, { id: 'leave', label: 'Respect retention policy', detail: 'Heal 7 HP.', effect: 'mediumHeal' }] },
    { act: 2, title: 'Hostile Acquisition Chapel', body: 'A relic waits where the altar should be.', choices: [{ id: 'acquire', label: 'Pay in blood', detail: 'Lose 7 HP. Gain a relic.', effect: 'relicForBlood' }, { id: 'decline', label: 'Cite antitrust law', detail: 'Gain 24 Obols.', effect: 'safeMoney' }] },
    { act: 2, title: 'The Boardroom Without Doors', body: 'The chairs vote before you sit.', choices: [{ id: 'vote', label: 'Vote yourself larger', detail: 'Gain 4 max HP and 1 pending Debt.', effect: 'maxHpDebt' }, { id: 'abstain', label: 'Abstain loudly', detail: 'Heal 10 HP.', effect: 'executiveHeal' }] },
    { act: 2, title: 'Insider Trading Séance', body: 'Tomorrow\'s prices speak through a dead broker.', choices: [{ id: 'listen', label: 'Buy the whisper', detail: 'Lose 20 Obols. Gain a rare card.', effect: 'buyRare' }, { id: 'report', label: 'Report the ghost', detail: 'Gain 30 Obols.', effect: 'reportGhost' }] },
  ];

  return { CARDS, ENEMIES, RELICS, EVENTS, BENEFITS, ACTS };
});
