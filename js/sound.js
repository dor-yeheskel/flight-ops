/* ========= SOUND ========= */

const sounds = {
  jet_acceleration: new Audio("assets/sounds/jet_acceleration.wav"),
  jet_deceleration: new Audio("assets/sounds/jet_deceleration.wav"),
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
  jet: 0.3,
  jetSpeed: 0.25,
  ui: 0.95,
  ui_clicked: 0.55,
  fx: 0.55,
  impact: 0.55,
  state: 0.5,
  end: 0.85,
};

sounds.jet_acceleration.volume = V.jetSpeed;
sounds.jet_acceleration.loop = true;
sounds.jet_deceleration.volume = V.jetSpeed;
sounds.jet_deceleration.loop = true;

sounds.key_arrow.volume = V.ui;
sounds.clicked.volume   = V.ui_clicked;

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

let jetContext = null;
let jetBuffer = null;
let jetGain = null;
let jetSource = null;
let jetLoading = null;
let jetOffset = 0;
let jetStartedAt = 0;

function stopJetSound(reset = true) {
  if (jetSource) {
    if (!reset) jetOffset = (jetContext.currentTime - jetStartedAt) % jetBuffer.duration;
    jetSource.stop();
    jetSource.disconnect();
    jetSource = null;
  }
  if (reset) jetOffset = 0;
}

function updateJetSound() {
  if (!soundEnabled || state.paused) {
    stopJetSound(false);
    return;
  }
  if (!state.gameStarted || state.gameOver || currentState !== GAME_STATE.PLAYING) {
    stopJetSound();
    return;
  }
  if (jetSource) return;

  if (!jetLoading) {
    jetLoading = (async () => {
      jetContext = new AudioContext();
      const response = await fetch("assets/sounds/jet.wav");
      if (!response.ok) throw new Error(`Jet audio: ${response.status}`);
      const decoded = await jetContext.decodeAudioData(await response.arrayBuffer());
      const overlap = Math.min(Math.round(decoded.sampleRate * 0.15), Math.floor(decoded.length / 4));
      jetBuffer = jetContext.createBuffer(decoded.numberOfChannels, decoded.length - overlap, decoded.sampleRate);

      for (let channel = 0; channel < decoded.numberOfChannels; channel++) {
        const original = decoded.getChannelData(channel);
        const seamless = jetBuffer.getChannelData(channel);
        seamless.set(original.subarray(0, seamless.length));
        for (let i = 0; i < overlap; i++) {
          const blend = (i + 1) / (overlap + 1);
          seamless[i] = original[decoded.length - overlap + i] * (1 - blend) + original[i] * blend;
        }
      }

      jetGain = jetContext.createGain();
      jetGain.gain.value = V.jet;
      jetGain.connect(jetContext.destination);
      updateJetSound();
    })().catch(error => console.warn("Jet ambience unavailable", error));
    return;
  }
  if (!jetBuffer) return;

  jetContext.resume().catch(() => {});
  jetSource = jetContext.createBufferSource();
  jetSource.buffer = jetBuffer;
  jetSource.loop = true;
  jetSource.connect(jetGain);
  jetStartedAt = jetContext.currentTime - jetOffset;
  jetSource.start(0, jetOffset);
}

function updateSpeedSound() {
  const active = soundEnabled && state.gameStarted && !state.gameOver &&
    !state.paused && currentState === GAME_STATE.PLAYING;
  const direction = active && state.keys["ArrowUp"] && !state.keys["ArrowDown"] &&
    state.speed < CONFIG_DEFAULTS.maxSpeed ? "jet_acceleration" :
    active && state.keys["ArrowDown"] && !state.keys["ArrowUp"] &&
    state.speed > CONFIG_DEFAULTS.minSpeed ? "jet_deceleration" : null;

  for (const name of ["jet_acceleration", "jet_deceleration"]) {
    const sound = sounds[name];
    if (name === direction) {
      if (sound.paused) sound.play().catch(() => {});
    } else {
      sound.pause();
      sound.currentTime = 0;
      sound._wasMutedWhilePlaying = false;
      sound._wasPausedByGame = false;
    }
  }
}

let muteBtn = null;

function updateMuteUI() {
  if (!muteBtn) return;
  muteBtn.textContent = soundEnabled ? "🔊" : "🔇";
}

function toggleMute() {
  soundEnabled = !soundEnabled;
  localStorage.setItem(SOUND_KEY, soundEnabled ? "on" : "off");
  if (!soundEnabled) {
    stopJetSound(false);
    updateSpeedSound();
    for (const s of Object.values(sounds)) {
      if (!s.paused && !s.ended) {
        s._wasMutedWhilePlaying = true;
        s.pause();
      }
    }
  } else {
    for (const s of Object.values(sounds)) {
      if (s._wasMutedWhilePlaying) {
        s._wasMutedWhilePlaying = false;
        s.play().catch(() => {});
      }
    }
    updateSpeedSound();
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

  if (state.paused) {
    stopJetSound(false);
    updateSpeedSound();
    // Pause all currently playing audio
    for (const s of Object.values(sounds)) {
      if (!s.paused && !s.ended) {
        s._wasPausedByGame = true;
        s.pause();
      }
    }
  } else {
    // Resume audio that was paused by the game
    for (const s of Object.values(sounds)) {
      if (s._wasPausedByGame) {
        s._wasPausedByGame = false;
        s.play().catch(() => {});
      }
    }
    updateSpeedSound();
  }
}

function stopAllSounds({ fade = false, duration = 1200 } = {}) {
  stopJetSound();
  for (const sound of [sounds.jet_acceleration, sounds.jet_deceleration]) {
    sound.pause();
    sound.currentTime = 0;
    sound._wasMutedWhilePlaying = false;
    sound._wasPausedByGame = false;
  }
  const now = performance.now();

  for (const s of Object.values(sounds)) {

    // ensure base volume
    if (typeof s._baseVolume !== "number" || !isFinite(s._baseVolume)) {
      s._baseVolume = isFinite(s.volume) ? s.volume : 1;
    }

    // not playing → just reset
    if (s.paused || s.ended || s.currentTime === 0) {
      s.pause();
      s.currentTime = 0;
      s.volume = s._baseVolume;
      s._fading = false;
      continue;
    }

    if (!fade) {
      s.pause();
      s.currentTime = 0;
      s.volume = s._baseVolume;
      s._fading = false;
      continue;
    }

    if (s._fading) continue;
    s._fading = true;

    const start = now;
    const base = s._baseVolume;

    function step(t) {
      const p = Math.min(1, (t - start) / duration);
      s.volume = base * (1 - p);

      if (p < 1) {
        requestAnimationFrame(step);
      } else {
        s.pause();
        s.currentTime = 0;
        s.volume = base;
        s._fading = false;
      }
    }

    requestAnimationFrame(step);
  }
}
