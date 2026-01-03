/* ========= UI & PROGRESS ========= */

function renderProgressTable() {
  const el = document.getElementById("progressTable");

  let html = `
    <div class="progressRow header">
      <div>Level</div>
      <div>Rank</div>
      <div>Score</div>
    </div>
  `;

  for (let i = 0; i < levelOrder.length; i++) {
    const id = levelOrder[i];
    const lvl = levelToData[id];
    const data = progress.scores[id];
    const unlocked = i < progress.unlockedCount;

    html += `
      <div class="progressRow ${unlocked ? "" : "locked"}">
        <div>${lvl.displayName}</div>
        <div>
          ${unlocked && data ? data.rank : "🔒"}
        </div>
        <div>
          ${unlocked && data ? data.score : "🔒"}
        </div>
      </div>
    `;
  }

  el.innerHTML = html;
}



function moveMenuSelection(dir) {
  const opts = Array.from(levelSelectEl.options);
  if (!opts.length) return;

  let i = levelSelectEl.selectedIndex;
  if (i < 0) i = 0;

  for (let tries = 0; tries < opts.length; tries++) {
    i = (i + dir + opts.length) % opts.length;
    if (!opts[i].disabled) {
      levelSelectEl.selectedIndex = i;
      levelSelectEl.dispatchEvent(new Event("change", { bubbles: true }));
      return;
    }
  }
}

function updateHUD() {
  setHUDValue("hud-bombs", state.bombs);
  setHUDValue("hud-stealth", state.stealthUses);
  setHUDValue("hud-targets", entities.remainingTargets);
}

function setHUDValue(id, value) {
  const el = document.getElementById(id);
  if (!el) return;

  el.textContent = value;
  el.style.color = "";
  if (id === "hud-targets" && value === 0) {
    el.style.color = "#7CFFB2";
  }
  if (
    value === 0 &&
    (id === "hud-bombs" || id === "hud-stealth")
  ) {
    el.classList.add("hud-zero");
  } else {
    el.classList.remove("hud-zero");
  }


  el.classList.remove("bump");
  void el.offsetWidth; // force reflow
  el.classList.add("bump");

}

function animateNumber(el, from, to, duration = 600) {
  const start = performance.now();

  function step(t) {
    const p = Math.min(1, (t - start) / duration);
    const value = Math.floor(from + (to - from) * p);
    el.textContent = value;
    if (p < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}
