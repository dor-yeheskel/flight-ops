/* ======== Levels Memory ======== */
const STORAGE_KEY = "flight_game_progress_v1";
const SOUND_KEY = "flight_game_sound";
const THEME_KEY = "flight_game_theme";
let soundEnabled = localStorage.getItem(SOUND_KEY) !== "off";

/* ======== Theme ======== */
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const isDark = saved !== "light";
  document.documentElement.classList.toggle("theme-dark", isDark);
  updateThemeUI();
}

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle("theme-dark");
  localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  updateThemeUI();
}

function updateThemeUI() {
  const btn = document.getElementById("themeBtn");
  if (!btn) return;
  const isDark = document.documentElement.classList.contains("theme-dark");
  btn.textContent = isDark ? "☀️" : "🌙";
}

function loadProgress() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.removeItem("lastPlayedLevel");
    return {
      unlockedCount: 1,
      scores: {}
    };
  }
  return JSON.parse(raw);
}

function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

let progress = loadProgress();
