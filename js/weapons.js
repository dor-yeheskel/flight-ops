/* ========= BOMBS ========= */

function getBombImpactPoint() {
  const t = state.speed / CONFIG_DEFAULTS.accel;
  const dist = 0.5 * (state.speed / 3.6) * t;
  return move(state.lat, state.lng, state.heading, dist);
}

function dropBomb() {
  if (state.gameOver || !state.gameStarted) return;
  if (state.maxBombs <= 0) return;
  if (state.bombs <= 0) return;

  playSound("release_bomb");
  state.bombs--;
  updateHUD();

  const bomb = {
    lat: state.lat,
    lng: state.lng,
    heading: state.heading,
    speed: state.speed,
    marker: L.marker([state.lat, state.lng], {
      icon: L.divIcon({ html: "💣", className: "bomb" })
    }).addTo(layerBombs)
  };

  entities.bombs.push(bomb);
}

function explodeBomb(bomb) {
  layerBombs.removeLayer(bomb.marker);

  let hitSomething = false;
  let destroySomething = false;

  explosionEffect(bomb.lat, bomb.lng);

  // ===== unified damage logic (targets + radars) =====
  function checkHit(entity, radius) {
    const d = distance(bomb, entity);

    let dmg = 0;
    if (d < radius * 0.4) dmg = 1.5;
    else if (d < radius * 0.7) dmg = 1;

    if (dmg > 0) {
      hitSomething = true;
      const destroyed = applyDamage(entity, dmg);
      if (destroyed) destroySomething = true;
      return destroyed;
    }
    return false;
  }

  // targets
  for (let i = entities.targets.length - 1; i >= 0; i--) {
    const t = entities.targets[i];

    if (checkHit(t, CONFIG_DEFAULTS.targetRadius)) {
      layerTargets.removeLayer(t.marker);
      entities.targets.splice(i, 1);
      entities.remainingTargets--;

      if (entities.remainingTargets <= 0 && !state.gameOver) {
        state.gameOver = true;
        setTimeout(() => victoryHandler(), 600);
      }
    }
  }

  // radars
  for (let i = entities.radars.length - 1; i >= 0; i--) {
    const r = entities.radars[i];
    if (!r.alive) continue;

    if (checkHit(r, CONFIG_DEFAULTS.radarHitRadius)) {
      r.alive = false;
      state.destroyedRadars++;
      layerRadars.removeLayer(r.marker);
      layerRadars.removeLayer(r.circle);
    }
  }
  // 🔊 סאונד
  playSound("explode");
  if (destroySomething) {
    playSound("destroyed");   // 💥 נהרס
  } else if (hitSomething) {
    playSound("hit");         // 🔫 רק פגיעה
  }
}

/* ========= MISSILES ========= */

function launchMissile(radar) {
  state.missileCounter++;
  playSound("rocket_launch");

  const smartEnabled =
    radar.smartRocketsEvery &&
    radar.smartRocketsEvery > 0;

  const isSmart = smartEnabled
    ? (state.missileCounter % radar.smartRocketsEvery === 0)
    : false;

  const speed = isSmart
    ? radar.rocketSpeed * radar.smartRocketSpeedFactor
    : radar.rocketSpeed;

  const missile = {
    lat: radar.lat,
    lng: radar.lng,
    heading: bearing(radar.lat, radar.lng, state.lat, state.lng),
    smart: isSmart,
    speed,
    life: CONFIG_DEFAULTS.missileLifetime,
    lockBeeped: false,
    lockLost: false,
    marker: L.marker([radar.lat, radar.lng], {
      icon: L.divIcon({
        html: `<div class="missile">🚀</div>`,
        className: "",
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      })
    }).addTo(layerMissiles)
  };

  entities.missiles.push(missile);
}
