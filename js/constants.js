/* ========= GAME STATES ========= */
const GAME_STATE = {
  MENU: "menu",
  PLAYING: "playing",
  GAMEOVER: "gameover"
};

/* ========= CONSTANTS (defaults preserved) ========= */

const CONFIG_DEFAULTS = {
  baseRadius: 800, // meters
  minSpeed: 2500,
  maxSpeed: 8000,
  accel: 2500,
  turnRate: 140,
  emojiRotationOffset: -45,

  missileLifetime: 5.5,       // seconds
  missileHitRadius: 200,    // meters
  missileRotationOffset: -45,

  lockBeepDistance: 5000,
  lockBeepCooldown: 0.7,

  targetRadius: 800,       // meters
  radarHitRadius: 800,     // meters

  radarRangeOnMinimap: 8000
};

/* radar types (ranges doubled as in your current code) */
const RADAR_TYPES = [
  { size: "small",  range: 3500,  emoji: "📡", scale: 1 },
  { size: "medium", range: 5000,  emoji: "📡", scale: 1.5 },
  { size: "big",  range: 7500, emoji: "📡", scale: 2 }
];

const SIZE_STATS = {
  small:  { hp: 1, scale: 1.5 },
  medium: { hp: 2, scale: 2 },
  big:    { hp: 3, scale: 2.5 }
};

const FIRE_SCALE_BY_SIZE = {
  small: 1.2,
  medium: 2,
  big: 2.5
};

const SCORE_RULES = {
  radar: 80,
  bombRemaining: 15,
  stealthPenalty: 30
};
