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

  return { CARD_ART, CARD_ORDER, ACTOR_CROPS, ACTOR_FACING, RELIC_PRESENTATION, BARKS, lineFor };
});
