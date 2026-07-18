(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.InfernalContent = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const CARD_ORDER = [
    'paper_cut', 'red_tape', 'creative_accounting', 'hostile_takeover', 'compound_interest',
    'expense_imp', 'compliance_training', 'blood_from_stone', 'audit_trail', 'hostile_workplace',
    'loophole', 'soul_foreclosure', 'golden_parachute', 'mandatory_fun', 'severance',
    'fiscal_exorcism', 'creative_void', 'final_notice', 'late_fee', 'soul_audit',
    'imp_tern', 'noncompete', 'expense_claim', 'redline', 'bad_faith',
    'liquidation', 'demonic_synergy', 'paper_trail', 'form_66b',
  ];
  const CARD_ART = Object.fromEntries(CARD_ORDER.map((id, index) => [id, { column: index % 5, row: Math.floor(index / 5) }]));
  const EXTRA_CARD_ORDER = [
    'filing_frenzy', 'shred_notice', 'paper_dragon', 'archive_fire', 'blood_salary', 'paid_in_exposure',
    'sick_leave', 'refinancing', 'predatory_apr', 'hostile_merger', 'golden_handshake', 'bribe_fate',
    'insider_trading', 'synergy_tax', 'severance_claw', 'executive_order', 'write_off', 'unlimited_liability',
  ];
  EXTRA_CARD_ORDER.forEach((id, index) => { CARD_ART[id] = { column: index % 6, row: Math.floor(index / 6), atlas: 2, columns: 6, rows: 3 }; });

  // Cell-relative alpha bounds from the source atlas. Presentation may add
  // destination padding, but must never subtract from these source bounds.
  const ACTOR_CROPS = {
    demon: { x: 53, y: 28, width: 229, height: 287 },
    demonAttack: { x: 26, y: 48, width: 316, height: 259 },
    penitent: { x: 44, y: 22, width: 312, height: 324 },
    mouth: { x: 52, y: 25, width: 258, height: 285 },
    wretch: { x: 31, y: 38, width: 235, height: 266 },
    chair: { x: 39, y: 25, width: 267, height: 290 },
    intern: { x: 27, y: 6, width: 329, height: 311 },
    hr: { x: 37, y: 25, width: 284, height: 296 },
    manager: { x: 52, y: 7, width: 245, height: 323 },
    managerPhase2: { x: 6, y: 7, width: 301, height: 336 },
    event: { x: 6, y: 7, width: 350, height: 313 },
    cardBack: { x: 81, y: 27, width: 193, height: 293 },
    late_fee_ghoul: { x: 48, y: 46, width: 753, height: 799 },
    redundancy_clone: { x: 34, y: 49, width: 783, height: 792 },
    claim_eater: { x: 27, y: 17, width: 321, height: 323 },
    carbon_copy: { x: 24, y: 22, width: 327, height: 318 },
    benefits_larva: { x: 23, y: 61, width: 321, height: 279 },
    merger_mimic: { x: 13, y: 20, width: 308, height: 327 },
    compliance_seraph: { x: 25, y: 13, width: 325, height: 349 },
    // Right and bottom cell edges contain detached bleed from adjacent sprites.
    parachute_knight: { x: 8, y: 1, width: 324, height: 325 },
    synergy_hydra: { x: 0, y: 15, width: 323, height: 347 },
    burnout_oracle: { x: 5, y: 6, width: 337, height: 356 },
    consultant: { x: 58, y: 0, width: 304, height: 332 },
    vp_knives: { x: 0, y: 0, width: 362, height: 337 },
    // Last 32 px contain detached bleed from the neighboring phase-two cell.
    eternal_vp: { x: 0, y: 0, width: 330, height: 329 },
    eternal_vp_phase2: { x: 0, y: 0, width: 330, height: 324 },
  };

  const ACTOR_FACING = Object.fromEntries(Object.keys(ACTOR_CROPS).map((id) => [id, 'left']));
  Object.assign(ACTOR_FACING, {
    demon: 'right', demonAttack: 'right', event: 'front', cardBack: 'front',
    mouth: 'front', chair: 'front', hr: 'front', wretch: 'right', manager: 'right',
    claim_eater: 'front', carbon_copy: 'front', benefits_larva: 'front', merger_mimic: 'front',
    synergy_hydra: 'front', burnout_oracle: 'front', eternal_vp_phase2: 'front',
  });

  // The generated 4×3 atlas gives every relic a unique silhouette. The seal
  // remains useful at small sizes and for non-visual identification.
  const RELIC_PRESENTATION = {
    bent_abacus: { art: 0, sigil: '∑' },
    debt_collector: { art: 1, sigil: '§' },
    coin_purse: { art: 2, sigil: '¢' },
    employee_minute: { art: 3, sigil: 'Ⅰ' },
    union_pin: { art: 4, sigil: '⚒' },
    blood_mug: { art: 5, sigil: '†' },
    hemoglobin_stamp: { art: 6, sigil: '♥' },
    ash_tray: { art: 7, sigil: '※' },
    golden_stapler: { art: 8, sigil: '‡' },
    filing_cabinet: { art: 9, sigil: '▤' },
    severance_package: { art: 10, sigil: '×' },
    interest_waiver: { art: 11, sigil: '%' },
  };

  const BARKS = {
    hero: {
      encounter: ['Right. Another networking opportunity.', 'Please form one orderly nightmare.'],
      attack: ['Filed under: blunt force.', 'Consider this actionable feedback.'],
      hard_hit: ['That meeting could have been an email.', 'Aggressive accounting!'],
      overdraft: ['Future me can afford this.', 'Put it on the soul card.'],
      debt_repaid: ['Debt settled. Dignity pending.', 'My soul has insufficient funds.'],
      debt_forgiven: ['Accounting miracle. Do not investigate.', 'Debt forgiven. Trauma retained.'],
      block: ['Protected by policy-shaped cowardice.', 'A shield made of plausible deniability.'],
      weak: ['A strongly worded debuff.', 'Morale adjusted downward.'],
      low_hp: ['Do demons get sick leave?', 'I may be approaching work-life balance.'],
      reward: ['Compensation? In this economy?', 'Three cards. Zero dental.'],
      streak: ['Paperwork combo!', 'Synergy detected. Everybody panic.'],
      victory: ['I have become the meeting.', 'Promoted beyond my incompetence.'],
      defeat: ['Please delete my browser history.', 'Mark me absent. Permanently.'],
      default: ['This feels legally infernal.'],
    },
    penitent: { encounter: ['Staples build character.'], attack: ['Please hold still for binding.'], hard_hit: ['That was not in the handbook!'], defeat: ['Unstapled… at last.'] },
    mouth: { encounter: ['WELCOME TO COMPLIANCE.'], attack: ['Clause seven tastes delicious.'], hard_hit: ['Your tone violates policy!'], defeat: ['Complaint… acknowledged…'] },
    wretch: { encounter: ['Your obols look unmonitored.'], attack: ['This is a routine embezzlement.'], gimmick: ['Receipts are for mortals.'], hard_hit: ['Audit interference!'], defeat: ['Books… uncooked…'] },
    chair: { encounter: ['Please, take a seat. Me.'], attack: ['Quarterly scuttle!'], gimmick: ['Every leg is billable.'], hard_hit: ['Furniture abuse!'], defeat: ['Ergonomics… wins…'] },
    intern: { encounter: ['I am paid in exposure.'], attack: ['I learned this on day one.'], gimmick: ['Overtime makes me stronger!'], hard_hit: ['Can I log this as mentorship?'], defeat: ['My internship… converted…'] },
    hr: { encounter: ['This conversation is confidential.'], attack: ['Your culture fit is bleeding.'], gimmick: ['Please complete Form 66-B.'], hard_hit: ['That feedback was insufficiently anonymous!'], defeat: ['We will circle… back…'] },
    manager: { encounter: ['My door is always closed.'], attack: ['Let us align on your suffering.'], hard_hit: ['Who approved that damage?'], phase_two: ['Fine. I will remove the human suit.'], defeat: ['You are… management material…'] },
    claim_eater: { encounter: ['Claim denied. Applicant consumed.'], gimmick: ['Receipt missing. Limb forfeited.'], defeat: ['Appeal… accepted…'] },
    carbon_copy: { encounter: ['One of us is redundant.'], gimmick: ['CC: everyone in Hell.'], defeat: ['Original… unavailable…'] },
    benefits_larva: { encounter: ['Coverage begins after death.'], gimmick: ['That condition was pre-existing.'], defeat: ['Dental… still excluded…'] },
    late_fee_ghoul: { encounter: ['Your balance survived you.'], gimmick: ['Interest has teeth.'], defeat: ['Account… closed…'] },
    merger_mimic: { encounter: ['Your department looks edible.'], gimmick: ['Assets assimilated.'], defeat: ['Deal… collapsed…'] },
    compliance_seraph: { encounter: ['BE NOT AFRAID. SIGN HERE.'], gimmick: ['Blessed are the compliant.'], defeat: ['Clause… rescinded…'] },
    parachute_knight: { encounter: ['I fail upward. You simply fail.'], gimmick: ['My landing is contractually soft.'], defeat: ['Package… revoked…'] },
    synergy_hydra: { encounter: ['Let us align our headcount.'], gimmick: ['Every head owns the meeting.'], defeat: ['Silos… restored…'] },
    burnout_oracle: { encounter: ['I forecast mandatory exhaustion.'], gimmick: ['The deadline has already happened.'], defeat: ['Out… of office…'] },
    redundancy_clone: { encounter: ['Two employees entered. One salary leaves.'], gimmick: ['Your role has been duplicated downward.'], defeat: ['Original… retained…'] },
    consultant: { encounter: ['I charge by the wound.'], gimmick: ['Best practice: more knives.'], defeat: ['Invoice… outstanding…'] },
    vp_knives: { encounter: ['We must make difficult cuts.'], gimmick: ['Your role has been streamlined.'], defeat: ['Costs… insufficiently cut…'] },
    eternal_vp: { encounter: ['Growth without end. Employment without exit.'], phase_two: ['The Board will now speak simultaneously.'], gimmick: ['Your soul missed quarterly guidance.'], defeat: ['Shareholder… value… zero…'] },
  };

  function lineFor(trigger, actor = 'hero', index = 0) {
    const actorLines = BARKS[actor] || BARKS.hero;
    const lines = actorLines[trigger] || actorLines.attack || BARKS.hero[trigger] || BARKS.hero.default;
    return lines[Math.abs(index) % lines.length];
  }

  const ICON_PATHS = {
    battle: 'm5 4 6 6-2 2-6-6V4h2Zm14 0v2l-6 6-2-2 6-6h2ZM8 13l3 3-4 4H4v-3l4-4Zm8 0 4 4v3h-3l-4-4 3-3Z',
    elite: 'm12 2 3 4 5 1-2 5 2 5-5 1-3 4-3-4-5-1 2-5-2-5 5-1 3-4Zm-3 8v5h2v-2h2v2h2v-5h-2v1h-2v-1H9Z',
    event: 'M12 2a8 8 0 0 1 5 14l-3 2H10l-3-2a8 8 0 0 1 5-14Zm0 3c-2 0-4 1-4 3h3c0-1 2-1 2 0 0 2-3 2-3 5h3c0-2 3-2 3-5 0-2-2-3-4-3Zm-2 14h4v3h-4v-3Z',
    shop: 'M4 3h16l2 5-2 3v10H4V11L2 8l2-5Zm2 9v6h5v-5h5v5h2v-6a4 4 0 0 1-3-1 4 4 0 0 1-6 0 4 4 0 0 1-3 1Z',
    campfire: 'M13 2c2 4-1 5 1 8 1-2 3-3 3-5 4 5 5 12 0 16H7C1 16 5 9 10 6c0 3 0 4 2 5 2-3-1-5 1-9Zm-1 11c-3 2-3 5 0 6 3-1 3-4 0-6Z',
    cache: 'M3 7h18v14H3V7Zm2-4h14l2 3H3l2-3Zm5 7v3H7v2h3v3h4v-3h3v-2h-3v-3h-4Z',
    contract: 'M5 2h11l3 3v17H5V2Zm3 5h8V5h-2V3H8v4Zm0 4h8V9H8v2Zm0 4h5v-2H8v2Zm7 4 5-5 2 2-5 5h-2v-2Z',
    boss: 'm3 6 5 4 4-7 4 7 5-4-2 13H5L3 6Zm4 11h10l1-6-3 3-3-5-3 5-3-3 1 6Z',
    strength: 'm5 3 7 7-2 2-7-7V3h2Zm14 0v2l-7 7-2-2 7-7h2ZM8 13l3 3-4 5H3v-4l5-4Zm8 0 5 4v4h-4l-5-5 4-3Z',
    ritual: 'm12 1 2 7 7-2-5 6 5 6-7-2-2 7-2-7-7 2 5-6-5-6 7 2 2-7Z',
    filing: 'M3 4h7l2 2h9v15H3V4Zm4 6v2h10v-2H7Zm0 4v2h8v-2H7Z',
    bribed: 'M4 7h16v12H4V7Zm3 3v6h10v-6H7Zm5-8 5 4H7l5-4Zm0 9a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z',
    weak: 'M10 3h4v10l4-4 3 3-9 9-9-9 3-3 4 4V3Z',
    vulnerable: 'm12 2 10 10-10 10L2 12 12 2Zm0 5-5 5 5 5 5-5-5-5Z',
    bleed: 'M12 2c2 5 7 9 7 14a7 7 0 0 1-14 0c0-5 5-9 7-14Zm-4 14c0 2 2 4 4 4v-3c-1 0-2-1-2-2l-2 1Z',
    debt: 'M15 4c-1-2-5-2-6 0-2 4 7 3 6 7-1 3-5 3-7 1l-2 2c1 2 3 3 5 3v3h3v-3c3-1 5-3 4-6-1-5-8-4-6-7 1-1 3 0 4 1l2-2-3-2v3Z',
    'pending-debt': 'M6 2h12v4c0 3-2 5-4 6 2 1 4 3 4 6v4H6v-4c0-3 2-5 4-6-2-1-4-3-4-6V2Zm3 3v1c0 2 1 3 3 4 2-1 3-2 3-4V5H9Zm3 9c-2 1-3 2-3 4v1h6v-1c0-2-1-3-3-4Z',
    passive: 'M12 2 4 5v6c0 5 3 9 8 11 5-2 8-6 8-11V5l-8-3Zm0 4 4 2v4c0 3-2 5-4 6-2-1-4-3-4-6V8l4-2Z',
    deck: 'M5 3h13v16H5V3Zm3 3v10h7V6H8ZM2 6h2v15h12v2H2V6Z',
    draw: 'M3 4h12v16H3V4Zm3 3v10h6V7H6Zm11 1 5 4-5 4v-3h-4v-2h4V8Z',
    discard: 'M5 4h12v4h-2V6H7v12h8v-2h2v4H5V4Zm9 5 7 3-7 3v-2h-4v-2h4V9Z',
    exhaust: 'M5 3h14l-1 19H6L5 3Zm3 4 1 11h6l1-11H8Zm3-5h2v5h-2V2Zm-6 2 2-2 3 5-2 1-3-4Zm14 0-3 4-2-1 3-5 2 2Z',
  };
  function iconMarkup(id, className = 'infernal-icon') {
    const path = ICON_PATHS[id] || ICON_PATHS.event;
    const safeClass = String(className).replace(/[^a-z0-9_-]/gi, '');
    return `<svg class="${safeClass}" aria-hidden="true" viewBox="0 0 24 24" focusable="false"><path d="${path}"></path></svg>`;
  }

  return { CARD_ART, CARD_ORDER, ACTOR_CROPS, ACTOR_FACING, RELIC_PRESENTATION, BARKS, lineFor, iconMarkup };
});
