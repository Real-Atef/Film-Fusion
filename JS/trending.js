/**
 * Film Fusion - Trending Page
 */

let page = 1;
let totalPages = 1;
let timeWindow = "day";
let mediaType = "all";

async function loadTrending() {
  const grid = document.getElementById("trendingGrid");
  if (!grid) return;

  showSkeleton(grid, getCardCount("list"));

  const endpoint =
    mediaType === "all"
      ? `/trending/all/${timeWindow}`
      : `/trending/${mediaType}/${timeWindow}`;

  const data = await fetchApi(apiUrl(endpoint, { page }));

  if (!data?.results) {
    showError(grid);
    return;
  }

  totalPages = Math.min(data.total_pages, CONSTANTS.MAX_PAGES);

  grid.innerHTML = "";
  data.results.forEach((item) => {
    if (item.media_type === "person") return;
    const type = item.media_type === "tv" ? "tv" : "movie";
    grid.appendChild(createCard(item, type));
  });

  updatePagination();
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
      loadTrending();
      scrollTo(0, 0);
    }
  });
  document.getElementById("nextBtn").addEventListener("click", () => {
    if (page < totalPages) {
      page++;
      loadTrending();
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
  document.getElementById("timeWindow")?.addEventListener("change", (e) => {
    timeWindow = e.target.value;
    page = 1;
    loadTrending();
  });

  document.getElementById("mediaType")?.addEventListener("change", (e) => {
    mediaType = e.target.value;
    page = 1;
    loadTrending();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupFilters();
  setupPagination();
  loadTrending();
});
