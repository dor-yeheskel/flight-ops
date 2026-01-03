/* ========= SCORING ========= */

function calculateScoreBreakdown() {
  const radarScore =
    state.destroyedRadars * SCORE_RULES.radar;

  const bombsScore =
    state.bombs * SCORE_RULES.bombRemaining;

  const stealthUsed =
    state.maxStealth - state.stealthUses;

  const stealthPenalty =
    stealthUsed * SCORE_RULES.stealthPenalty;

  const total = Math.max(
    50,
    radarScore + bombsScore - stealthPenalty
  );

  return {
    radarScore,
    bombsScore,
    stealthPenalty,
    total
  };
}

function getMaxScore() {
  return (
    entities.radars.length * SCORE_RULES.radar +
    state.maxBombs * SCORE_RULES.bombRemaining
  );
}


function getRank(score) {
  const maxScore = getMaxScore();
  const ratio = score / Math.max(1, maxScore);

  if (ratio >= 0.9) return "🥇 Gold";
  if (ratio >= 0.7) return "🥈 Silver";
  return "🥉 Bronze";
}
