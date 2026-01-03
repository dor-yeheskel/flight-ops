/* ========= LEVEL LOADING ========= */

async function loadLevels() {
    const index = await fetch("assets/levels/index.json").then(r => r.json());

    window.LEVELS = {};

    for (const id of index.levels) {
      const level = await fetch(`assets/levels/${id}.json`).then(r => r.json());
      window.LEVELS[id] = level;
    }
}

  
function resetLayersAndEntities() {
  layerTargets.clearLayers();
  layerRadars.clearLayers();
  layerBombs.clearLayers();
  layerMissiles.clearLayers();
  layerFx.clearLayers();

  entities.targets = [];
  entities.radars = [];
  entities.bombs = [];
  entities.missiles = [];
  entities.remainingTargets = 0;

  state.missileCounter = 0;
  state.lastLockBeep = -999;
  state.destroyedRadars = 0;
  state.refueled = false;

  state.stealthActive = false;
  state.stealthTimer = 0;

  state.keys = {};
}

function applyLevelConfig(levelId) {
  const lvl = levelToData[levelId];

  state.levelId = levelId;
  state.levelIndex = levelOrder.indexOf(levelId);

  // === START POSITION ===
  const start = lvl.start || lvl.base || { lat: 31.5085, lng: 34.4538 };

  state.lat = start.lat;
  state.lng = start.lng;
  state.heading = start.heading ?? 0;

  // === BASE (OPTIONAL) ===
  if (lvl.base) {
    state.base = { ...lvl.base };
    state.hasBase = true;
  } else {
    state.base = null;
    state.hasBase = false;
  }


  state.baseRadius = CONFIG_DEFAULTS.baseRadius;

  state.maxBombs = (lvl.limits?.maxBombs ?? 10);
  state.maxStealth = (lvl.limits?.maxStealth ?? 2);

  // defaults preserved if not overridden
  const rockets = lvl.rocketsConfig || {};
  state.rocketSpeed = (rockets.rocketSpeed ?? 28000);
  state.rocketFreq = (rockets.rocketFreq ?? 1.0);
  state.smartRocketsEvery = (rockets.smartRocketsEvery ?? 5);
  state.smartRocketSpeedFactor = (rockets.smartRocketSpeedFactor ?? 0.5);


  state.lat = start.lat;
  state.lng = start.lng;
  state.heading = start.heading ?? 0;

  state.speed = CONFIG_DEFAULTS.minSpeed + 500;

  state.bombs = state.maxBombs;
  state.stealthUses = state.maxStealth;

  if (hudLevelEl) {
    hudLevelEl.textContent = lvl.displayName;
  }
}

function spawnBase() {
  if (baseMarker) {
    map.removeLayer(baseMarker);
    baseMarker = null;
  }
  if (!state.hasBase) return;

  baseMarker = L.marker([state.base.lat, state.base.lng], {
    icon: L.divIcon({
      html: "🔧",
      className: "base",
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    })
  }).addTo(layerUi);
}


function spawnTargetsForLevel(levelId) {
  const lvl = levelToData[levelId];

  if (!Array.isArray(lvl.targetLocations)) {
    entities.remainingTargets = 0;
    return;
  }

  for (const p of lvl.targetLocations) {
    addTarget(p);
  }

  entities.remainingTargets = entities.targets.length;
}


function addTarget(target) {
  const size = target.size || "small";
  const stats = SIZE_STATS[size || "medium"] || SIZE_STATS.medium;

  const marker = L.marker([target.lat, target.lng], {
    icon: L.divIcon({
      html: `<div style="font-size:${32 * stats.scale}px">${target.emoji || "🏭"}</div>`,
      className: "",
      iconSize: [60, 60],
      iconAnchor: [30, 50]
    })
  }).addTo(layerTargets);

  entities.targets.push({
    ...target,
    hp: stats.hp,
    maxHp: stats.hp,
    size,
    marker,
    fire: null
  });
}



function spawnRadarsForLevel(levelId) {
  const lvl = levelToData[levelId];
  entities.radars.length = 0;

  // explicit radar locations
  if (Array.isArray(lvl.radarLocations)) {
    for (const r of lvl.radarLocations)
      addRadar({
        lat: r.lat,
        lng: r.lng,
        size: r.size,
        rocketSpeed: r.rocketSpeed,
        rocketFreq: r.rocketFreq,
        smartRocketsEvery: r.smartRocketsEvery,
        smartRocketSpeedFactor: r.smartRocketSpeedFactor
      });
    return;
  }

  // current behavior: radars near each target, random type
  for (const t of entities.targets) {
    const type = RADAR_TYPES[Math.floor(Math.random() * RADAR_TYPES.length)];
    const offset = (type.range * 0.4) / 111000;
    const lat = t.lat + (Math.random() - 0.5) * offset;
    const lng = t.lng + (Math.random() - 0.5) * offset;
    addRadar(lat, lng, type);
  }

}


function applyDamage(entity, dmg) {
  entity.hp -= dmg;

  // צור אש רק פעם אחת
  if (!entity.fire) {
    const fireScale = FIRE_SCALE_BY_SIZE[entity.size || "medium"];
    entity.fire = fireEffect(entity, fireScale);
  }

  if (entity.hp <= 0) {
    if (entity.fire) {
      setTimeout(() => {
        layerFx.removeLayer(entity.fire);
        entity.fire = null;
      }, 4000);
    }
    return true; // destroyed
  }

  return false; // still alive
}


function addRadar(cfg) {
  const type = radarSizeToType(cfg.size);
  const stats = SIZE_STATS[cfg.size || "medium"] || SIZE_STATS.medium;

  const marker = L.marker([cfg.lat, cfg.lng], {
    icon: L.divIcon({
      html: `<div style="font-size:${40 * type.scale}px">📡</div>`
    })
  }).addTo(layerRadars);

  const circle = L.circle([cfg.lat, cfg.lng], {
    radius: type.range,
    color: "red",
    fillOpacity: 0.05
  }).addTo(layerRadars);

  entities.radars.push({
    lat: cfg.lat,
    lng: cfg.lng,
    size: cfg.size,
    hp: stats.hp,
    maxHp: stats.hp,
    fire: null,

    range: type.range,
    marker,
    circle,
    alive: true,

    rocketSpeed: cfg.rocketSpeed ?? state.rocketSpeed,
    rocketFreq: cfg.rocketFreq ?? state.rocketFreq,
    smartRocketsEvery: cfg.smartRocketsEvery ?? state.smartRocketsEvery,
    smartRocketSpeedFactor:
      cfg.smartRocketSpeedFactor ?? state.smartRocketSpeedFactor,

    cooldown: 0
  });
}


function setNightMode(on) {
  isNight = on;

  document.body.classList.toggle("night", on);
  if (!on) {
    nightCtx.clearRect(0, 0, nightCanvas.width, nightCanvas.height);
  }
}


function loadLevel(levelId) {
  activeFires.length = 0;
  nightBursts.length = 0;

  if (nightCtx) {
    nightCtx.clearRect(0, 0, nightCanvas.width, nightCanvas.height);
  }
  setNightMode(!!levelToData[levelId].night);
  resetLayersAndEntities();
  nightBursts.length = 0;
  nightCtx.clearRect(0, 0, nightCanvas.width, nightCanvas.height);
  applyLevelConfig(levelId);
  spawnBase();
  spawnTargetsForLevel(levelId);
  spawnRadarsForLevel(levelId);

  // place plane
  planeMarker.setLatLng([state.lat, state.lng]);
  aimMarker.setLatLng([state.lat, state.lng]);

  // map view
  map.setView([state.lat, state.lng], 13, { animate: false });

  // UI state
  endScreenEl.style.display = "none";
  introEl.style.display = "flex";
  state.gameStarted = false;
  state.gameOver = false;

  updateHUD();
}
