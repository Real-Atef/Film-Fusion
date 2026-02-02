/**
 * Film Fusion - Home Page
 */

let slideIndex = 0;
let slideTimer = null;

// Slideshow
async function initSlideshow() {
  const container = document.getElementById("slideshow");
  if (!container) return;

  const data = await fetchApi(apiUrl("/movie/popular"));
  if (!data?.results) return;

  data.results.slice(0, 8).forEach((movie, i) => {
    if (!movie.backdrop_path) return;
    const slide = document.createElement("div");
    slide.className = `slide ${i === 0 ? "active" : ""}`;
    slide.innerHTML = `<img src="${imgUrl(
      movie.backdrop_path,
      "w1280"
    )}" alt="${movie.title}" loading="${
      i === 0 ? "eager" : "lazy"
    }" onerror="this.src='${FALLBACK.BACKDROP}'">`;
    container.appendChild(slide);
  });

  const slides = container.querySelectorAll(".slide");
  if (slides.length > 1) {
    slideTimer = setInterval(() => {
      slides[slideIndex].classList.remove("active");
      slideIndex = (slideIndex + 1) % slides.length;
      slides[slideIndex].classList.add("active");
    }, 4000);
  }
}

// Store fetched data for resize
const sectionData = {};

// Load section
async function loadSection(endpoint, sectionId, type) {
  const grid = document.querySelector(`#${sectionId} .cards-grid`);
  if (!grid) return;

  if (!sectionData[sectionId]) {
    showSkeleton(grid, getCardCount("home"));
    const data = await fetchApi(apiUrl(endpoint));
    if (!data?.results) {
      showError(grid);
      return;
    }
    sectionData[sectionId] = { results: data.results, type };
  }

  renderSection(sectionId);
}

// Render section with current card count
function renderSection(sectionId) {
  const grid = document.querySelector(`#${sectionId} .cards-grid`);
  if (!grid || !sectionData[sectionId]) return;

  const { results, type } = sectionData[sectionId];
  const count = getCardCount("home");

  grid.innerHTML = "";
  results.slice(0, count).forEach((item) => {
    grid.appendChild(createCard(item, type));
  });
}

// Re-render all sections on resize (debounced)
const handleResize = debounce(() => {
  if (sectionData["trending"]) renderTrending();
  Object.keys(sectionData)
    .filter((k) => k !== "trending")
    .forEach(renderSection);
}, 150);

// Load trending (mixed movies and TV)
async function loadTrending() {
  const grid = document.querySelector("#trending .cards-grid");
  if (!grid) return;

  if (!sectionData["trending"]) {
    showSkeleton(grid, getCardCount("home"));
    const data = await fetchApi(apiUrl("/trending/all/day"));
    if (!data?.results) {
      showError(grid);
      return;
    }
    sectionData["trending"] = {
      results: data.results.filter((item) => item.media_type !== "person"),
      type: "mixed",
    };
  }

  renderTrending();
}

function renderTrending() {
  const grid = document.querySelector("#trending .cards-grid");
  if (!grid || !sectionData["trending"]) return;

  const { results } = sectionData["trending"];
  const count = getCardCount("home");

  grid.innerHTML = "";
  results.slice(0, count).forEach((item) => {
    grid.appendChild(
      createCard(item, item.media_type === "tv" ? "tv" : "movie")
    );
  });
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  initSlideshow();
  loadTrending();
  loadSection("/movie/top_rated", "recommendations", "movie");
  loadSection("/movie/popular", "movies", "movie");
  loadSection("/tv/popular", "series", "tv");
  loadSection("/movie/upcoming", "upcoming", "movie");
});

window.addEventListener("resize", handleResize);
window.addEventListener("orientationchange", handleResize);

window.addEventListener("beforeunload", () => {
  if (slideTimer) clearInterval(slideTimer);
});
