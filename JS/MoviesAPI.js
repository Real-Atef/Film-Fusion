/**
 * Film Fusion - Movies Page
 */

let page = 1;
let totalPages = 1;
let cachedResults = [];
let isLoading = false;

const filters = {
  genre: "",
  year: "",
  rating: "",
  language: "",
  sort: "popularity.desc",
};

// Build filter UI
async function buildFilters() {
  const bar = document.getElementById("filterBar");
  if (!bar) return;

  bar.innerHTML = `
    <div class="filters-row">
      <select id="genreFilter" class="filter-select" aria-label="Filter by genre">
        <option value="">All Genres</option>
      </select>
      <select id="yearFilter" class="filter-select" aria-label="Filter by year">
        <option value="">All Years</option>
      </select>
      <select id="ratingFilter" class="filter-select" aria-label="Filter by rating">
        <option value="">All Ratings</option>
        <option value="9">9+ Stars</option>
        <option value="8">8+ Stars</option>
        <option value="7">7+ Stars</option>
        <option value="6">6+ Stars</option>
        <option value="5">5+ Stars</option>
      </select>
      <select id="languageFilter" class="filter-select" aria-label="Filter by language">
        <option value="">All Languages</option>
        <option value="en">English</option>
        <option value="es">Spanish</option>
        <option value="fr">French</option>
        <option value="de">German</option>
        <option value="ja">Japanese</option>
        <option value="ko">Korean</option>
        <option value="zh">Chinese</option>
        <option value="hi">Hindi</option>
        <option value="ar">Arabic</option>
      </select>
      <select id="sortFilter" class="filter-select" aria-label="Sort by">
        <option value="popularity.desc">Most Popular</option>
        <option value="popularity.asc">Least Popular</option>
        <option value="vote_average.desc">Highest Rated</option>
        <option value="vote_average.asc">Lowest Rated</option>
        <option value="primary_release_date.desc">Newest First</option>
        <option value="primary_release_date.asc">Oldest First</option>
        <option value="title.asc">A-Z</option>
        <option value="title.desc">Z-A</option>
      </select>
    </div>
  `;

  const genreData = await fetchApi(apiUrl("/genre/movie/list"));
  const genreSelect = document.getElementById("genreFilter");
  if (genreData?.genres) {
    genreData.genres.forEach((g) => {
      genreSelect.innerHTML += `<option value="${g.id}">${g.name}</option>`;
    });
  }

  const yearSelect = document.getElementById("yearFilter");
  const currentYear = new Date().getFullYear();
  for (let y = currentYear; y >= 1950; y--) {
    yearSelect.innerHTML += `<option value="${y}">${y}</option>`;
  }

  [
    "genreFilter",
    "yearFilter",
    "ratingFilter",
    "languageFilter",
    "sortFilter",
  ].forEach((id) => {
    document.getElementById(id).addEventListener("change", (e) => {
      const key = id.replace("Filter", "");
      filters[key === "sort" ? "sort" : key] = e.target.value;
      page = 1;
      loadMovies();
    });
  });
}

async function loadMovies() {
  const grid = document.getElementById("moviesGrid");
  if (!grid || isLoading) return;

  isLoading = true;
  showSkeleton(grid, getCardCount("list"));

  const params = { page, sort_by: filters.sort };
  if (filters.genre) params.with_genres = filters.genre;
  if (filters.year) params.primary_release_year = filters.year;
  if (filters.rating) params["vote_average.gte"] = filters.rating;
  if (filters.language) params.with_original_language = filters.language;

  const data = await fetchApi(apiUrl("/discover/movie", params));
  isLoading = false;

  if (!data?.results) {
    showError(grid);
    return;
  }

  cachedResults = data.results;
  totalPages = Math.min(data.total_pages, CONSTANTS.MAX_PAGES);

  if (data.results.length === 0) {
    grid.innerHTML =
      '<div class="no-results"><h3>No movies found</h3><p>Try different filters</p></div>';
    return;
  }

  renderMovies();
  updatePagination();
}

function renderMovies() {
  const grid = document.getElementById("moviesGrid");
  if (!grid || cachedResults.length === 0) return;

  grid.innerHTML = "";
  cachedResults.slice(0, getCardCount("list")).forEach((movie) => {
    grid.appendChild(createCard(movie, "movie"));
  });
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
      loadMovies();
      scrollTo(0, 0);
    }
  });
  document.getElementById("nextBtn").addEventListener("click", () => {
    if (page < totalPages) {
      page++;
      loadMovies();
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

const handleResize = debounce(renderMovies, 150);

document.addEventListener("DOMContentLoaded", async () => {
  await buildFilters();
  setupPagination();
  await loadMovies();
});

window.addEventListener("resize", handleResize);
window.addEventListener("orientationchange", handleResize);
