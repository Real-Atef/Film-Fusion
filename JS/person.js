/**
 * Film Fusion - Person Page (Actor/Director)
 */

let allWorks = [];
let currentPage = 1;
const itemsPerPage = 12;
let totalPages = 1;

async function loadPerson(id) {
  const nameEl = document.getElementById("personName");
  if (nameEl) nameEl.textContent = "Loading...";

  try {
    const [person, credits] = await Promise.all([
      fetchApi(apiUrl(`/person/${id}`)),
      fetchApi(apiUrl(`/person/${id}/combined_credits`)),
    ]);

    if (!person) {
      if (nameEl) nameEl.textContent = "Person not found";
      return;
    }

    document.title = `${person.name} - Film Fusion`;

    // Photo
    const photoEl = document.getElementById("personPhoto");
    if (photoEl) {
      photoEl.src = imgUrl(person.profile_path, "w500");
      photoEl.alt = person.name;
      photoEl.onerror = () => (photoEl.src = FALLBACK.POSTER);
    }

    if (nameEl) nameEl.textContent = person.name;

    const roleEl = document.getElementById("personRole");
    if (roleEl) roleEl.textContent = person.known_for_department || "Actor";

    const bornEl = document.getElementById("personBorn");
    if (bornEl) {
      let bornText = "";
      if (person.birthday) bornText += `Born: ${person.birthday}`;
      if (person.place_of_birth) bornText += ` in ${person.place_of_birth}`;
      if (person.deathday) bornText += ` | Died: ${person.deathday}`;
      bornEl.textContent = bornText;
    }

    const bioEl = document.getElementById("personBio");
    if (bioEl)
      bioEl.textContent = person.biography || "No biography available.";

    // Process filmography
    if (credits) {
      const allCredits = [
        ...(credits.cast || []).map((c) => ({
          ...c,
          role: c.character || "Actor",
        })),
        ...(credits.crew || [])
          .filter((c) => c.job === "Director")
          .map((c) => ({ ...c, role: "Director" })),
      ];

      const seen = new Set();
      allWorks = allCredits.filter((c) => {
        if (seen.has(c.id)) return false;
        if (!c.poster_path) return false;
        seen.add(c.id);
        return true;
      });

      allWorks.sort((a, b) => {
        const dateA = a.release_date || a.first_air_date || "";
        const dateB = b.release_date || b.first_air_date || "";
        return dateB.localeCompare(dateA);
      });

      totalPages = Math.ceil(allWorks.length / itemsPerPage);
      setupPagination();
      renderFilmography();
    }
  } catch (err) {
    console.error(err);
    if (nameEl) nameEl.textContent = "Error loading person";
  }
}

function renderFilmography() {
  const grid = document.getElementById("filmographyGrid");
  if (!grid) return;

  const start = (currentPage - 1) * itemsPerPage;
  const pageItems = allWorks.slice(start, start + itemsPerPage);

  if (pageItems.length === 0) {
    grid.innerHTML = '<p class="no-results">No filmography available</p>';
    return;
  }

  grid.innerHTML = "";
  pageItems.forEach((item) => {
    const type = item.media_type === "tv" ? "tv" : "movie";
    grid.appendChild(createCard(item, type));
  });

  updatePagination();
}

function setupPagination() {
  const container = document.getElementById("filmographyPagination");
  if (!container) return;

  container.innerHTML = `
    <button class="page-btn" id="prevBtn" aria-label="Previous page">← Previous</button>
    <span class="page-info" id="pageInfo">Page 1 of ${totalPages}</span>
    <button class="page-btn" id="nextBtn" aria-label="Next page">Next →</button>
  `;

  document.getElementById("prevBtn").addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderFilmography();
      document
        .getElementById("filmographyGrid")
        .scrollIntoView({ behavior: "smooth" });
    }
  });

  document.getElementById("nextBtn").addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderFilmography();
      document
        .getElementById("filmographyGrid")
        .scrollIntoView({ behavior: "smooth" });
    }
  });
}

function updatePagination() {
  const prev = document.getElementById("prevBtn");
  const next = document.getElementById("nextBtn");
  const info = document.getElementById("pageInfo");

  if (prev) prev.disabled = currentPage === 1;
  if (next) next.disabled = currentPage >= totalPages;
  if (info)
    info.textContent = `Page ${currentPage} of ${totalPages} (${allWorks.length} works)`;
}

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(location.search);
  const id = params.get("id");

  if (id) {
    loadPerson(id);
  } else {
    document.getElementById("personName").textContent = "No person selected";
  }
});
