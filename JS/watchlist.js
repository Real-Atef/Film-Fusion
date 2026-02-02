/**
 * Film Fusion - Watchlist Page
 * Tabs: Want to Watch, Watched, History
 */

let currentTab = "watchlist";

// Render watchlist (want to watch)
function renderWatchlist() {
  const grid = document.getElementById("watchlistGrid");
  const empty = document.getElementById("watchlistEmpty");
  const count = document.getElementById("watchlistCount");
  if (!grid) return;

  const list = getWatchlist();

  if (count)
    count.textContent = `${list.length} item${list.length !== 1 ? "s" : ""}`;

  if (list.length === 0) {
    grid.style.display = "none";
    if (empty) empty.style.display = "flex";
    return;
  }

  grid.style.display = "grid";
  if (empty) empty.style.display = "none";
  grid.innerHTML = "";

  list.forEach((item) => {
    grid.appendChild(createWatchlistCard(item, "watchlist"));
  });
}

// Render watched list
function renderWatched() {
  const grid = document.getElementById("watchedGrid");
  const empty = document.getElementById("watchedEmpty");
  const count = document.getElementById("watchedCount");
  if (!grid) return;

  const list = getWatched();

  if (count)
    count.textContent = `${list.length} item${list.length !== 1 ? "s" : ""}`;

  if (list.length === 0) {
    grid.style.display = "none";
    if (empty) empty.style.display = "flex";
    return;
  }

  grid.style.display = "grid";
  if (empty) empty.style.display = "none";
  grid.innerHTML = "";

  list.forEach((item) => {
    grid.appendChild(createWatchlistCard(item, "watched"));
  });
}

// Render history
function renderHistory() {
  const grid = document.getElementById("historyGrid");
  const empty = document.getElementById("historyEmpty");
  if (!grid) return;

  const list = getHistory();

  if (list.length === 0) {
    grid.style.display = "none";
    if (empty) empty.style.display = "flex";
    return;
  }

  grid.style.display = "grid";
  if (empty) empty.style.display = "none";
  grid.innerHTML = "";

  list.forEach((item) => {
    const card = createWatchlistCard(item, "history");
    // Add date badge
    if (item.date) {
      const date = new Date(item.date);
      const badge = document.createElement("span");
      badge.className = "date-badge";
      badge.textContent = date.toLocaleDateString();
      card.querySelector(".card-poster").appendChild(badge);
    }
    grid.appendChild(card);
  });
}

// Create card for watchlist/watched/history
function createWatchlistCard(item, listType) {
  const card = document.createElement("a");
  card.href = `./Description.html?id=${item.id}&type=${item.type}`;
  card.className = "card";
  card.id = `${listType}-${item.id}-${item.type}`;

  const isInWatchlist = inWatchlist(item.id, item.type);
  const isWatchedItem = isWatched(item.id, item.type);

  card.innerHTML = `
    <div class="card-poster">
      <img src="${imgUrl(item.poster)}" alt="${
    item.title
  }" loading="lazy" onerror="this.src='${FALLBACK.POSTER}'">
      <span class="badge">${item.type === "movie" ? "Movie" : "TV"}</span>
      <div class="card-actions">
        <button class="action-btn watchlist-action ${
          isInWatchlist ? "active" : ""
        }" title="${
    isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"
  }">
          <span>${isInWatchlist ? "♥" : "♡"}</span>
        </button>
        <button class="action-btn watched-action ${
          isWatchedItem ? "active" : ""
        }" title="${isWatchedItem ? "Mark as Unwatched" : "Mark as Watched"}">
          <span>${isWatchedItem ? "✓" : "○"}</span>
        </button>
        ${
          listType !== "history"
            ? `<button class="action-btn remove-action" title="Remove"><span>✕</span></button>`
            : ""
        }
      </div>
      <div class="card-overlay">
        <span class="card-title">${item.title}</span>
      </div>
    </div>
  `;

  // Watchlist toggle
  card.querySelector(".watchlist-action")?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWatchlist(item.id, item.type)) {
      removeFromWatchlist(item.id, item.type);
    } else {
      addToWatchlist(item);
    }
    renderAll();
  });

  // Watched toggle
  card.querySelector(".watched-action")?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWatched(item.id, item.type, item.title, item.poster);
    renderAll();
  });

  // Remove button
  card.querySelector(".remove-action")?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (listType === "watchlist") {
      removeFromWatchlist(item.id, item.type);
    } else if (listType === "watched") {
      toggleWatched(item.id, item.type, item.title, item.poster);
    }
    animateRemove(card, listType);
  });

  return card;
}

function animateRemove(card, listType) {
  card.style.animation = "fadeOut 0.3s ease forwards";
  setTimeout(() => {
    card.remove();
    renderAll();
  }, 300);
}

function renderAll() {
  renderWatchlist();
  renderWatched();
  renderHistory();
}

// Tab switching
function setupTabs() {
  const tabs = document.querySelectorAll(".tab");
  const contents = document.querySelectorAll(".tab-content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const tabId = tab.dataset.tab;

      tabs.forEach((t) => t.classList.remove("active"));
      contents.forEach((c) => c.classList.remove("active"));

      tab.classList.add("active");
      document.getElementById(`${tabId}Section`).classList.add("active");

      currentTab = tabId;
    });
  });
}

// Clear history
function setupClearHistory() {
  const btn = document.getElementById("clearHistoryBtn");
  if (btn) {
    btn.addEventListener("click", () => {
      if (confirm("Clear all viewing history?")) {
        clearHistory();
        renderHistory();
        showToast("History cleared");
      }
    });
  }
}

// Styles
const style = document.createElement("style");
style.textContent = `@keyframes fadeOut { to { opacity: 0; transform: scale(0.9); } }`;
document.head.appendChild(style);

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  setupTabs();
  setupClearHistory();
  renderAll();
});
