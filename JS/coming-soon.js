/**
 * Film Fusion - Coming Soon Page
 */

let page = 1;
let totalPages = 1;
let mediaType = "movie";
let selectedMonth = "";

async function loadUpcoming() {
  const grid = document.getElementById("upcomingGrid");
  if (!grid) return;

  showSkeleton(grid, getCardCount("list"));

  const today = new Date().toISOString().split("T")[0];
  const params = { page };

  if (mediaType === "movie") {
    params["primary_release_date.gte"] = today;
    params.sort_by = "primary_release_date.asc";
  } else {
    params["first_air_date.gte"] = today;
    params.sort_by = "first_air_date.asc";
  }

  if (selectedMonth) {
    const [year, month] = selectedMonth.split("-");
    const startDate = `${year}-${month}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${month}-${String(lastDay).padStart(2, "0")}`;

    if (mediaType === "movie") {
      params["primary_release_date.gte"] = startDate;
      params["primary_release_date.lte"] = endDate;
    } else {
      params["first_air_date.gte"] = startDate;
      params["first_air_date.lte"] = endDate;
    }
  }

  const endpoint = mediaType === "movie" ? "/discover/movie" : "/discover/tv";
  const data = await fetchApi(apiUrl(endpoint, params));

  if (!data?.results) {
    showError(grid);
    return;
  }

  totalPages = Math.min(data.total_pages, CONSTANTS.MAX_PAGES);

  if (data.results.length === 0) {
    grid.innerHTML =
      '<div class="no-results"><h3>No upcoming releases found</h3></div>';
    return;
  }

  grid.innerHTML = "";
  data.results.forEach((item) => {
    const card = createCard(item, mediaType);
    const date =
      mediaType === "movie" ? item.release_date : item.first_air_date;
    if (date) {
      const badge = document.createElement("span");
      badge.className = "release-badge";
      badge.textContent = formatDate(date);
      card.querySelector(".card-poster").appendChild(badge);
    }
    grid.appendChild(card);
  });

  updatePagination();
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function setupMonthFilter() {
  const select = document.getElementById("monthFilter");
  if (!select) return;

  const today = new Date();
  for (let i = 0; i < 12; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    const label = date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    select.innerHTML += `<option value="${value}">${label}</option>`;
  }
}

function setupPagination() {
  const container = document.getElementById("pagination");
  if (!container) return;

  container.innerHTML = `
    <button class="page-btn" id="prevBtn" aria-label="Previous page">← Previous</button>
    <span class="page-info" id="pageInfo">Page 1</span>
    <button class="page-btn" id="nextBtn" aria-label="Next page">Next →</button>
  `;

  document.getElementById("prevBtn").addEventListener("click", () => {
    if (page > 1) {
      page--;
      loadUpcoming();
      scrollTo(0, 0);
    }
  });
  document.getElementById("nextBtn").addEventListener("click", () => {
    if (page < totalPages) {
      page++;
      loadUpcoming();
      scrollTo(0, 0);
    }
  });
}

function updatePagination() {
  const prev = document.getElementById("prevBtn");
  const next = document.getElementById("nextBtn");
  const info = document.getElementById("pageInfo");

  if (prev) prev.disabled = page === 1;
  if (next) next.disabled = page >= totalPages;
  if (info) info.textContent = `Page ${page} of ${totalPages}`;
}

function setupFilters() {
  document.getElementById("mediaType")?.addEventListener("change", (e) => {
    mediaType = e.target.value;
    page = 1;
    loadUpcoming();
  });

  document.getElementById("monthFilter")?.addEventListener("change", (e) => {
    selectedMonth = e.target.value;
    page = 1;
    loadUpcoming();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupMonthFilter();
  setupFilters();
  setupPagination();
  loadUpcoming();
});
