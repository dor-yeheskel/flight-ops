/* ========= GAME OVER / VICTORY ========= */

function gameOverHandler() {
  currentState = GAME_STATE.GAMEOVER;
  const title = document.getElementById("endTitle");
  title.textContent = "MISSION FAILED";
  title.className = "end-fail";


  const destroyed =
    (levelToData[state.levelId].targetLocations?.length || 0)
    - entities.remainingTargets;

  document.getElementById("endSubtitle").innerHTML = `
    Destroyed ${destroyed} targets — ${entities.remainingTargets} left 🤦‍♂️
  `;

  const btn = document.getElementById("primaryActionBtn");
  btn.textContent = "Retry";
  btn.onclick = () => restartLevel();

  endScreenEl.style.display = "flex";
  endScreenEl.focus();
}

function goToMenu() {
  if (state.levelId) localStorage.setItem("lastPlayedLevel", state.levelId);

  state.gameStarted = false;
  state.gameOver = false;
  currentState = GAME_STATE.MENU;

  endScreenEl.style.display = "none";
  introEl.style.display = "flex";

  // highlight selected level in progress table
  const rows = document.querySelectorAll(".progressRow:not(.header)");
  rows.forEach((row, i) => {
    row.classList.toggle("selected", levelOrder[i] === state.levelId);
  });

}

function victoryHandler() {
  state.gameOver = true;
  currentState = GAME_STATE.GAMEOVER;
  playSound("victory");
  const levelId = state.levelId;
  const nextIndex = state.levelIndex + 1;
  const nextLevel = levelOrder[nextIndex];

  // ===== SCORE =====
  const breakdown = calculateScoreBreakdown();
  const score = breakdown.total;
  const rank = getRank(score);

  // ===== SAVE PROGRESS =====
  const prev = progress.scores[levelId];

  const newScore = {
    score,
    rank,
    destroyedTargets: levelToData[levelId].targetLocations?.length ?? 0,
    destroyedRadars: state.destroyedRadars,

    bombsUsed: state.maxBombs - state.bombs,
    bombsRemaining: state.bombs,

    stealthUsed: state.maxStealth - state.stealthUses,
    stealthRemaining: state.stealthUses
  };

  const radar = state.destroyedRadars;
  const bombs = state.bombs;
  const stealth = state.stealthUses;
  const total = breakdown.total;


  let isNewRecord = false;

  if (!prev) {
    progress.scores[levelId] = newScore;
  } else if (newScore.score > prev.score) {
    progress.scores[levelId] = newScore;
    isNewRecord = true;
  }

  if (isNewRecord) {
    document.getElementById("endSubtitle").innerHTML += `
      <div style="margin-top:10px; color:#00ff88;">
        🏆 NEW RECORD
      </div>
    `;
  } else if (prev) {
    document.getElementById("endSubtitle").innerHTML += `
      <div style="opacity:0.6; margin-top:10px;">
        Best: ${prev.score}
      </div>
    `;
  }
  
  progress.unlockedLevels ||= [];
  if (nextLevel && !progress.unlockedLevels.includes(nextLevel)) {
    progress.unlockedLevels.push(nextLevel);
  }
  progress.unlockedCount = Math.max(
    progress.unlockedCount,
    progress.unlockedLevels.length + 1
  );


  saveProgress(progress);
  localStorage.setItem("lastPlayedLevel", state.levelId);
  renderProgressTable();

  // ===== UI =====
  const title = document.getElementById("endTitle");
  title.textContent = "MISSION COMPLETE 🎉";
  title.className = "end-win";


  document.getElementById("endSubtitle").innerHTML = `
    <div id="scoreBreakdown">

      <div class="scoreRow">
        <span>Radar destroyed</span>
        <span id="radarCount">0</span>
      </div>

      <div class="scoreRow">
        <span>Bombs remaining</span>
        <span id="bombsCount">0</span>
      </div>

      <div class="scoreRow" id="stealthRow">
        <span>Stealth used</span>
        <span id="stealthCount">0</span>
      </div>

      <hr class="scoreDivider">

      <div class="finalScore">
        <span>Final Score</span>
        <span id="finalScore">0</span>
      </div>

      <div id="rankDisplay"></div>
    </div>


  `;

  if (isNewRecord) {
    document.getElementById("endSubtitle").innerHTML += `
      <div style="margin-top:10px; color:#00ff88; font-weight:600;">
        🏆 NEW RECORD
      </div>
    `;
  }

  const radarEl = document.getElementById("radarCount");
  const bombsEl = document.getElementById("bombsCount");
  const stealthEl = document.getElementById("stealthCount");
  const finalEl = document.getElementById("finalScore");
  const rankEl = document.getElementById("rankDisplay");

  // reset
  radarEl.textContent = "0";
  bombsEl.textContent = "0";
  stealthEl.textContent = "0";
  finalEl.textContent = "0";

  // hide stealth if 0
  if (stealth === 0) {
    document.getElementById("stealthRow").style.display = "none";
  }

  setTimeout(() => animateNumber(radarEl, 0, radar), 200);
  setTimeout(() => animateNumber(bombsEl, 0, bombs), 800);
  if (stealth > 0) {
    setTimeout(() => animateNumber(stealthEl, 0, stealth), 1200);
  }

  setTimeout(() => {
    animateNumber(finalEl, 0, total, 900);
  }, 1700);

  setTimeout(() => {
    rankEl.style.display = "block";
    rankEl.style.opacity = "1";
    rankEl.textContent = getRank(total);
  }, 2600);



  const btn = document.getElementById("primaryActionBtn");

  if (nextLevel) {
    btn.textContent = "▶ NEXT LEVEL";
    btn.onclick = () => {
      loadLevel(nextLevel);
      startGame();
    };
  } else {
    btn.textContent = "▶ BACK TO MENU";
    btn.onclick = () => goToMenu();
  }

  endScreenEl.style.display = "flex";
  endScreenEl.focus();
}
