/**
 * ============================================
 * FILM FUSION - Configuration & Utilities
 * ============================================
 */

// Path detection for local file system
const PATH = window.location.pathname.toLowerCase().replace(/\\/g, "/");
const IN_PAGES = PATH.includes("/pages/");
const BASE = IN_PAGES ? ".." : ".";

// ============================================
// Constants
// ============================================

const CONSTANTS = {
  MAX_PAGES: 500,
  HISTORY_LIMIT: 50,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 3000,
  ITEMS_PER_PAGE: {
    HOME: { landscape: [6, 6, 5, 4, 3], portrait: [4, 3, 2, 2] },
    LIST: { landscape: [14, 12, 10, 8, 6], portrait: [8, 6, 4] },
  },
  BREAKPOINTS: {
    xl: 1400,
    lg: 1200,
    md: 1024,
    sm: 768,
    xs: 480,
  },
};

// API Configuration
const API = {
  KEY: "587c710c3df4f4747c43471c4788cf12",
  BASE: "https://api.themoviedb.org/3",
  IMG: "https://image.tmdb.org/t/p",
};

// Fallback images
const FALLBACK = {
  POSTER: `${BASE}/Images/Logo2.png`,
  BACKDROP: `${BASE}/Images/Logo_colored.png`,
};

// Storage keys
const STORAGE = {
  WATCHLIST: "ff_watchlist",
  USER: "ff_user",
  USERS: "ff_users",
  HISTORY: "ff_history",
  WATCHED: "ff_watched",
  CACHE: "ff_cache",
};

// ============================================
// Utility Functions
// ============================================

// Debounce function
function debounce(fn, delay = CONSTANTS.DEBOUNCE_DELAY) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// Get card count based on screen size (shared across all pages)
function getCardCount(type = "list") {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const isLandscape = width > height;
  const bp = CONSTANTS.BREAKPOINTS;
  const counts =
    CONSTANTS.ITEMS_PER_PAGE[type.toUpperCase()] ||
    CONSTANTS.ITEMS_PER_PAGE.LIST;

  if (isLandscape) {
    const arr = counts.landscape;
    if (width >= bp.xl) return arr[0];
    if (width >= bp.lg) return arr[1];
    if (width >= bp.md) return arr[2];
    if (width >= bp.sm) return arr[3];
    return arr[4] || arr[arr.length - 1];
  }

  const arr = counts.portrait;
  if (width >= bp.md) return arr[0];
  if (width >= bp.sm) return arr[1];
  return arr[2] || arr[arr.length - 1];
}

// ============================================
// API Functions with Caching
// ============================================

function apiUrl(endpoint, params = {}) {
  const url = new URL(`${API.BASE}${endpoint}`);
  url.searchParams.set("api_key", API.KEY);
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== "") url.searchParams.set(k, v);
  });
  return url.toString();
}

function imgUrl(path, size = "w500") {
  return path ? `${API.IMG}/${size}${path}` : FALLBACK.POSTER;
}

// Cache management
function getCache() {
  try {
    const cache = JSON.parse(sessionStorage.getItem(STORAGE.CACHE)) || {};
    // Clean expired entries
    const now = Date.now();
    Object.keys(cache).forEach((key) => {
      if (cache[key].expires < now) delete cache[key];
    });
    return cache;
  } catch {
    return {};
  }
}

function setCache(key, data) {
  try {
    const cache = getCache();
    cache[key] = { data, expires: Date.now() + CONSTANTS.CACHE_DURATION };
    sessionStorage.setItem(STORAGE.CACHE, JSON.stringify(cache));
  } catch {
    // Cache full or disabled
  }
}

function getCachedData(key) {
  const cache = getCache();
  return cache[key]?.data || null;
}

// Fetch with caching
async function fetchApi(url, useCache = true) {
  // Check cache first
  if (useCache) {
    const cached = getCachedData(url);
    if (cached) return cached;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 404) throw new Error("Not found");
      if (res.status === 429)
        throw new Error("Too many requests. Please wait.");
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    if (useCache) setCache(url, data);
    return data;
  } catch (err) {
    console.error("API Error:", err);
    return null;
  }
}

// ============================================
// UI Functions
// ============================================

function showLoading(el) {
  const container = typeof el === "string" ? document.querySelector(el) : el;
  if (container) {
    container.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        <p>Loading...</p>
      </div>
    `;
  }
}

function showSkeleton(el, count = 6) {
  const container = typeof el === "string" ? document.querySelector(el) : el;
  if (container) {
    container.innerHTML = Array(count)
      .fill(
        `
      <div class="skeleton-card">
        <div class="skeleton-poster"></div>
        <div class="skeleton-title"></div>
      </div>
    `
      )
      .join("");
  }
}

function hideLoading(el) {
  const container = typeof el === "string" ? document.querySelector(el) : el;
  const loader = container?.querySelector(".loading, .skeleton-card");
  if (loader) loader.parentElement.innerHTML = "";
}

function showError(el, msg = "Something went wrong. Please try again.") {
  const container = typeof el === "string" ? document.querySelector(el) : el;
  if (container) {
    container.innerHTML = `
      <div class="error-state">
        <p>${msg}</p>
        <button class="btn btn-secondary" onclick="location.reload()">Try Again</button>
      </div>
    `;
  }
}

function showToast(msg, type = "success") {
  document.querySelectorAll(".toast").forEach((t) => t.remove());
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), CONSTANTS.TOAST_DURATION);
}

function confirm(msg) {
  return window.confirm(msg);
}

// Button loading state
function setButtonLoading(btn, loading) {
  if (loading) {
    btn.dataset.originalText = btn.textContent;
    btn.disabled = true;
    btn.innerHTML = '<span class="btn-spinner"></span>';
  } else {
    btn.disabled = false;
    btn.textContent = btn.dataset.originalText || btn.textContent;
  }
}

// ============================================
// Watchlist Functions
// ============================================

function getWatchlist() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE.WATCHLIST)) || [];
  } catch {
    return [];
  }
}

function saveWatchlist(list) {
  localStorage.setItem(STORAGE.WATCHLIST, JSON.stringify(list));
}

function addToWatchlist(item) {
  const list = getWatchlist();
  if (!list.some((i) => i.id === item.id && i.type === item.type)) {
    list.push({
      id: item.id,
      type: item.type,
      title: item.title,
      poster: item.poster,
    });
    saveWatchlist(list);
    showToast("Added to watchlist");
    return true;
  }
  return false;
}

function removeFromWatchlist(id, type) {
  const list = getWatchlist().filter((i) => !(i.id === id && i.type === type));
  saveWatchlist(list);
  showToast("Removed from watchlist");
}

function inWatchlist(id, type) {
  return getWatchlist().some((i) => i.id === id && i.type === type);
}

// ============================================
// Auth Functions
// ============================================

function getUser() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE.USER));
  } catch {
    return null;
  }
}

function isLoggedIn() {
  return getUser() !== null;
}

function logout() {
  sessionStorage.removeItem(STORAGE.USER);
  window.location.href = getHomePath();
}

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE.USERS)) || [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE.USERS, JSON.stringify(users));
}

// ============================================
// Navigation Functions
// ============================================

function getPagesPath() {
  return IN_PAGES ? "." : "./Pages";
}

function getHomePath() {
  return `${BASE}/Home.html`;
}

function updateNav() {
  const profileEl = document.querySelector(".profile-btn");
  if (!profileEl) return;

  const user = getUser();
  if (user) {
    profileEl.outerHTML = `
      <div class="user-menu">
        <span class="user-name">${user.firstName}</span>
        <div class="dropdown">
          <a href="${getPagesPath()}/watchlist.html">My Watchlist</a>
          <a href="#" onclick="logout(); return false;">Sign Out</a>
        </div>
      </div>
    `;
  }
}

// ============================================
// Card Creation
// ============================================

function createCard(item, type) {
  const title = item.title || item.name;
  const inList = inWatchlist(item.id, type);

  const card = document.createElement("a");
  card.href = `${getPagesPath()}/Description.html?id=${item.id}&type=${type}`;
  card.className = "card";
  card.innerHTML = `
    <div class="card-poster">
      <img src="${imgUrl(
        item.poster_path
      )}" alt="${title}" loading="lazy" onerror="this.src='${FALLBACK.POSTER}'">
      <button class="watchlist-btn ${inList ? "active" : ""}" data-id="${
    item.id
  }" data-type="${type}" data-title="${title.replace(
    /"/g,
    "&quot;"
  )}" data-poster="${item.poster_path || ""}" aria-label="${
    inList ? "Remove from" : "Add to"
  } watchlist">
        <span class="heart">${inList ? "♥" : "♡"}</span>
      </button>
      <div class="card-overlay">
        <span class="card-title">${title}</span>
      </div>
    </div>
  `;

  card
    .querySelector(".watchlist-btn")
    .addEventListener("click", handleWatchlistClick);
  return card;
}

function handleWatchlistClick(e) {
  e.preventDefault();
  e.stopPropagation();

  const btn = e.currentTarget;
  const id = parseInt(btn.dataset.id);
  const type = btn.dataset.type;
  const title = btn.dataset.title;
  const poster = btn.dataset.poster;
  const heart = btn.querySelector(".heart");

  if (inWatchlist(id, type)) {
    removeFromWatchlist(id, type);
    btn.classList.remove("active");
    heart.textContent = "♡";
    btn.setAttribute("aria-label", "Add to watchlist");
  } else {
    addToWatchlist({ id, type, title, poster });
    btn.classList.add("active");
    heart.textContent = "♥";
    btn.setAttribute("aria-label", "Remove from watchlist");
  }
}

// ============================================
// Watch History Functions
// ============================================

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE.HISTORY)) || [];
  } catch {
    return [];
  }
}

function addToHistory(item) {
  let history = getHistory();
  history = history.filter((i) => !(i.id === item.id && i.type === item.type));
  history.unshift({
    id: item.id,
    type: item.type,
    title: item.title,
    poster: item.poster,
    date: Date.now(),
  });
  history = history.slice(0, CONSTANTS.HISTORY_LIMIT);
  localStorage.setItem(STORAGE.HISTORY, JSON.stringify(history));
}

function clearHistory() {
  localStorage.removeItem(STORAGE.HISTORY);
}

// ============================================
// Watched Status Functions
// ============================================

function getWatched() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE.WATCHED)) || [];
  } catch {
    return [];
  }
}

function isWatched(id, type) {
  return getWatched().some((i) => i.id === id && i.type === type);
}

function toggleWatched(id, type, title, poster) {
  let watched = getWatched();
  if (isWatched(id, type)) {
    watched = watched.filter((i) => !(i.id === id && i.type === type));
    showToast("Removed from watched");
  } else {
    watched.push({ id, type, title, poster });
    showToast("Marked as watched");
  }
  localStorage.setItem(STORAGE.WATCHED, JSON.stringify(watched));
  return isWatched(id, type);
}

// ============================================
// Initialize
// ============================================

document.addEventListener("DOMContentLoaded", updateNav);
