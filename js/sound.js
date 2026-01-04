/* ========= SOUND ========= */

const sounds = {
  missile_lock: new Audio("assets/sounds/missile_lock.wav"),
  release_bomb: new Audio("assets/sounds/release_bomb.wav"),
  explode: new Audio("assets/sounds/explode.wav"),
  stealth: new Audio("assets/sounds/stealth.wav"),
  fuel: new Audio("assets/sounds/fuel.wav"),
  rocket_launch: new Audio("assets/sounds/rocket_launch.wav"),
  victory: new Audio("assets/sounds/victory.wav"),
  defeat: new Audio("assets/sounds/defeat.wav"),
  hit: new Audio("assets/sounds/hit.wav"),
  destroyed: new Audio("assets/sounds/destroyed.wav"),
  key_arrow: new Audio("assets/sounds/key_arrow.wav"),
  clicked: new Audio("assets/sounds/clicked.wav"),
};

const V = {
  ui: 0.45,
  fx: 0.65,
  impact: 0.75,
  state: 0.5,
  end: 0.65,
};

sounds.key_arrow.volume = V.ui;
sounds.clicked.volume   = V.ui;

sounds.missile_lock.volume  = V.fx;
sounds.release_bomb.volume  = V.fx;
sounds.rocket_launch.volume = V.fx;
sounds.hit.volume           = V.fx;

sounds.explode.volume   = V.impact;
sounds.destroyed.volume = V.impact;

sounds.stealth.volume = V.state;
sounds.fuel.volume    = V.state;

sounds.victory.volume = V.end;
sounds.defeat.volume  = V.end;

function playSound(name) {
  if (!soundEnabled) return;

  const s = sounds[name];
  if (!s) return;

  try {
    s.pause();
    s.currentTime = 0;
    s.play().catch(() => {});
  } catch {}
}

let muteBtn = null;

function updateMuteUI() {
  if (!muteBtn) return;
  muteBtn.textContent = soundEnabled ? "🔊 Sound" : "🔇 Muted";
}

function toggleMute() {
  soundEnabled = !soundEnabled;
  localStorage.setItem(SOUND_KEY, soundEnabled ? "on" : "off");
  if (!soundEnabled) {
    for (const s of Object.values(sounds)) {
      s.pause();
      s.currentTime = 0;
    }
  }
  updateMuteUI();
}


function togglePause() {
  if (currentState !== GAME_STATE.PLAYING) return;
  state.paused = !state.paused;
  const overlay = document.getElementById("pauseOverlay");
  if (overlay) {
    overlay.innerHTML = "⏸ PAUSED";
    overlay.style.display = state.paused ? "flex" : "none";
  }
}