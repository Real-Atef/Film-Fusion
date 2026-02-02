/**
 * Film Fusion - Search Page
 */

let page = 1;
let totalPages = 1;
let query = "";

async function doSearch() {
  const grid = document.getElementById("resultsGrid");
  if (!grid) return;

  showSkeleton(grid, getCardCount("list"));

  const [movies, tv] = await Promise.all([
    fetchApi(apiUrl("/search/movie", { query, page })),
    fetchApi(apiUrl("/search/tv", { query, page })),
  ]);

  if (!movies && !tv) {
    showError(grid);
    return;
  }

  totalPages = Math.min(
    Math.max(movies?.total_pages || 1, tv?.total_pages || 1),
    CONSTANTS.MAX_PAGES
  );

  const results = [
    ...(movies?.results || []).map((m) => ({ ...m, type: "movie" })),
    ...(tv?.results || []).map((t) => ({ ...t, type: "tv" })),
  ].sort((a, b) => b.popularity - a.popularity);

  if (results.length === 0) {
    grid.innerHTML =
      '<div class="no-results"><h3>No results</h3><p>Try different keywords</p></div>';
    return;
  }

  grid.innerHTML = "";
  results.forEach((item) => {
    const card = createCard(item, item.type);
    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = item.type === "movie" ? "Movie" : "TV";
    card.querySelector(".card-poster").appendChild(badge);
    grid.appendChild(card);
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
      doSearch();
      scrollTo(0, 0);
    }
  });
  document.getElementById("nextBtn").addEventListener("click", () => {
    if (page < totalPages) {
      page++;
      doSearch();
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

// Debounced search for live search
const handleSearchInput = debounce((value) => {
  if (value.length >= 2) {
    query = value;
    page = 1;
    doSearch();
  }
}, 400);

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(location.search);
  query = params.get("q") || "";

  const input = document.getElementById("searchInput");
  if (input) {
    input.value = query;
    // Add live search
    input.addEventListener("input", (e) => handleSearchInput(e.target.value));
  }

  const title = document.getElementById("searchTitle");
  if (title) title.textContent = query ? `Results for "${query}"` : "Search";

  if (!query) {
    const grid = document.getElementById("resultsGrid");
    if (grid)
      grid.innerHTML =
        '<div class="no-results"><h3>Enter a search term</h3><p>Use the search bar above</p></div>';
    return;
  }

  setupPagination();
  await doSearch();
});
