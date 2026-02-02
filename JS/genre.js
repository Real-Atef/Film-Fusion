/**
 * Film Fusion - Genre Page
 */

let page = 1;
let totalPages = 1;
let genreId = "";
let genreName = "";
let mediaType = "movie";
let sortBy = "popularity.desc";
let year = "";

async function loadGenreName() {
  // Fetch genre name from API instead of hardcoding
  const endpoint =
    mediaType === "movie" ? "/genre/movie/list" : "/genre/tv/list";
  const data = await fetchApi(apiUrl(endpoint));
  if (data?.genres) {
    const genre = data.genres.find((g) => g.id === parseInt(genreId));
    if (genre) genreName = genre.name;
  }
}

async function loadGenre() {
  const grid = document.getElementById("genreGrid");
  const titleEl = document.getElementById("pageTitle");
  if (!grid) return;

  showSkeleton(grid, getCardCount("list"));

  const params = {
    page,
    with_genres: genreId,
    sort_by: sortBy,
  };

  if (year) {
    if (mediaType === "movie") {
      params.primary_release_year = year;
    } else {
      params.first_air_date_year = year;
    }
  }

  const endpoint = mediaType === "movie" ? "/discover/movie" : "/discover/tv";
  const data = await fetchApi(apiUrl(endpoint, params));

  if (!data?.results) {
    showError(grid);
    return;
  }

  totalPages = Math.min(data.total_pages, CONSTANTS.MAX_PAGES);

  if (titleEl) {
    const typeLabel = mediaType === "movie" ? "Movies" : "TV Shows";
    titleEl.textContent = `${genreName} ${typeLabel}`;
    document.title = `${genreName} ${typeLabel} - Film Fusion`;
  }

  if (data.results.length === 0) {
    grid.innerHTML =
      '<div class="no-results"><h3>No results found</h3><p>Try different filters</p></div>';
    return;
  }

  grid.innerHTML = "";
  data.results.forEach((item) => {
    grid.appendChild(createCard(item, mediaType));
  });

  updatePagination();
}

function setupYearFilter() {
  const select = document.getElementById("yearFilter");
  if (!select) return;

  const currentYear = new Date().getFullYear();
  for (let y = currentYear; y >= 1950; y--) {
    select.innerHTML += `<option value="${y}">${y}</option>`;
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
      loadGenre();
      scrollTo(0, 0);
    }
  });
  document.getElementById("nextBtn").addEventListener("click", () => {
    if (page < totalPages) {
      page++;
      loadGenre();
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
  document.getElementById("sortFilter")?.addEventListener("change", (e) => {
    sortBy = e.target.value;
    if (mediaType === "tv") {
      sortBy = sortBy.replace("primary_release_date", "first_air_date");
    }
    page = 1;
    loadGenre();
  });

  document.getElementById("yearFilter")?.addEventListener("change", (e) => {
    year = e.target.value;
    page = 1;
    loadGenre();
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(location.search);
  genreId = params.get("id") || "";
  mediaType = params.get("type") || "movie";

  if (!genreId) {
    document.getElementById("pageTitle").textContent = "No genre selected";
    return;
  }

  await loadGenreName();
  setupYearFilter();
  setupFilters();
  setupPagination();
  loadGenre();
});
