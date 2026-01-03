/* ========= START / NAV ========= */

function startGame() {
  document.activeElement.blur();
  introEl.style.display = "none";
  endScreenEl.style.display = "none";

  state.gameStarted = true;
  state.gameOver = false;
  currentState = GAME_STATE.PLAYING;
}

function restartLevel() {
  document.activeElement.blur();
  loadLevel(state.levelId);
  startGame();
}


function nextLevel() {
  const nextIndex = Math.min(levelOrder.length - 1, state.levelIndex + 1);
  loadLevel(levelOrder[nextIndex]);
}

/* intro UI */
function populateLevelSelect() {
  levelSelectEl.innerHTML = "";

  for (let i = 0; i < levelOrder.length; i++) {
    const id = levelOrder[i];
    const opt = document.createElement("option");

    opt.value = id;
    opt.textContent = levelToData[id].displayName;

    if (i >= progress.unlockedCount) {
      opt.disabled = true;
      opt.textContent += " 🔒";
    }

    levelSelectEl.appendChild(opt);
  }

  levelSelectEl.value = levelOrder[0];

  hudLevelEl.textContent =
    levelToData[levelSelectEl.value].displayName;
}

/* ========= BOOT ========= */

window.addEventListener('DOMContentLoaded', async function() {
  await loadLevels();
  levelToData = window.LEVELS;
  levelOrder = Object.keys(window.LEVELS);

  // Initialize all UI element references
  hudLevelEl = document.getElementById("levelTitle");
  spdEl = document.getElementById("spd");
  bombsEl = document.getElementById("bombs");
  targetsEl = document.getElementById("targets");
  stealthEl = document.getElementById("stealth");
  
  introEl = document.getElementById("intro");
  endScreenEl = document.getElementById("endScreen");
  
  endRankEl = document.getElementById("endRank");
  endScoreEl = document.getElementById("endScore");
  endStealthEl = document.getElementById("endStealth");
  endBombsEl = document.getElementById("endBombs");
  endRadarsEl = document.getElementById("endRadars");
  
  levelSelectEl = document.getElementById("levelSelect");
  startBtn = document.getElementById("startBtn");

  muteBtn = document.getElementById("muteBtn");
  updateMuteUI();

  
  // Create plane marker now that map exists
  planeIcon = L.divIcon({
    html: `<div id="plane" class="plane">✈️</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    className: ""
  });

  planeMarker = L.marker([state.lat, state.lng], {
    icon: planeIcon,
    pane: "planePane"
  }).addTo(map);
  
  renderProgressTable();
  populateLevelSelect();
  progress.unlockedCount = Math.max(
    1,
    Math.min(progress.unlockedCount || 1, levelOrder.length)
  );
  
  startBtn.addEventListener("click", () => {
    loadLevel(levelSelectEl.value);
    startGame();
  });

  window.addEventListener("beforeunload", () => {
    if (state.levelId) {
      localStorage.setItem("lastPlayedLevel", state.levelId);
    }
  });
  
  requestAnimationFrame(loop);
});