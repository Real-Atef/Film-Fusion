/**
 * Film Fusion - Description Page
 * Full details with trailers, images, box office, providers
 */

async function loadDetails(id, type) {
  const titleEl = document.getElementById("title");
  if (titleEl) titleEl.textContent = "Loading...";

  try {
    const [details, credits, videos, similar, images, providers] =
      await Promise.all([
        fetchApi(apiUrl(`/${type}/${id}`)),
        fetchApi(apiUrl(`/${type}/${id}/credits`)),
        fetchApi(apiUrl(`/${type}/${id}/videos`)),
        fetchApi(apiUrl(`/${type}/${id}/similar`)),
        fetchApi(apiUrl(`/${type}/${id}/images`)),
        fetchApi(apiUrl(`/${type}/${id}/watch/providers`)),
      ]);

    if (!details) {
      if (titleEl) titleEl.textContent = "Not Found";
      return;
    }

    const title = details.title || details.name;
    document.title = `${title} - Film Fusion`;

    // Add to history
    addToHistory({
      id: parseInt(id),
      type,
      title,
      poster: details.poster_path,
    });

    // Title
    if (titleEl) titleEl.textContent = title;

    // Poster
    const posterEl = document.getElementById("poster");
    if (posterEl) {
      posterEl.src = imgUrl(details.poster_path);
      posterEl.alt = title;
      posterEl.onerror = () => (posterEl.src = FALLBACK.POSTER);
    }

    // Trailer
    const trailerEl = document.getElementById("trailer");
    if (trailerEl && videos?.results) {
      const trailer =
        videos.results.find(
          (v) => v.type === "Trailer" && v.site === "YouTube"
        ) || videos.results.find((v) => v.site === "YouTube");
      if (trailer) {
        trailerEl.src = `https://www.youtube.com/embed/${trailer.key}?rel=0&modestbranding=1`;
      } else {
        trailerEl.style.display = "none";
      }
    }

    // Actions (genres + watchlist + watched)
    const actionsEl = document.getElementById("actions");
    if (actionsEl) {
      actionsEl.innerHTML = "";
      details.genres?.forEach((g) => {
        actionsEl.innerHTML += `<a href="./genre.html?id=${g.id}&type=${type}" class="genre-tag">${g.name}</a>`;
      });

      // Watchlist button
      const inList = inWatchlist(parseInt(id), type);
      const wlBtn = document.createElement("button");
      wlBtn.className = "add-watchlist-btn";
      wlBtn.textContent = inList ? "♥ In Watchlist" : "♡ Add to Watchlist";
      wlBtn.addEventListener("click", () => {
        if (inWatchlist(parseInt(id), type)) {
          removeFromWatchlist(parseInt(id), type);
          wlBtn.textContent = "♡ Add to Watchlist";
        } else {
          addToWatchlist({
            id: parseInt(id),
            type,
            title,
            poster: details.poster_path,
          });
          wlBtn.textContent = "♥ In Watchlist";
        }
      });
      actionsEl.appendChild(wlBtn);

      // Watched button
      const watched = isWatched(parseInt(id), type);
      const watchedBtn = document.createElement("button");
      watchedBtn.className = `watched-btn ${watched ? "active" : ""}`;
      watchedBtn.textContent = watched ? "✓ Watched" : "○ Mark as Watched";
      watchedBtn.addEventListener("click", () => {
        toggleWatched(parseInt(id), type, title, details.poster_path);
        const nowWatched = isWatched(parseInt(id), type);
        watchedBtn.className = `watched-btn ${nowWatched ? "active" : ""}`;
        watchedBtn.textContent = nowWatched ? "✓ Watched" : "○ Mark as Watched";
      });
      actionsEl.appendChild(watchedBtn);
    }

    // Share Buttons
    const shareEl = document.getElementById("shareButtons");
    if (shareEl) {
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(`Check out ${title} on Film Fusion!`);
      shareEl.innerHTML = `
        <span class="share-label">Share:</span>
        <a href="https://twitter.com/intent/tweet?url=${url}&text=${text}" target="_blank" class="share-btn twitter" title="Share on Twitter">𝕏</a>
        <a href="https://www.facebook.com/sharer/sharer.php?u=${url}" target="_blank" class="share-btn facebook" title="Share on Facebook">f</a>
        <a href="https://wa.me/?text=${text}%20${url}" target="_blank" class="share-btn whatsapp" title="Share on WhatsApp">W</a>
        <button class="share-btn copy" onclick="navigator.clipboard.writeText('${window.location.href}'); showToast('Link copied!');" title="Copy Link">📋</button>
      `;
    }

    // Synopsis
    const synopsisEl = document.getElementById("synopsis");
    if (synopsisEl)
      synopsisEl.textContent = details.overview || "No synopsis available.";

    // Info
    const infoEl = document.getElementById("info");
    if (infoEl) {
      const date =
        type === "movie" ? details.release_date : details.first_air_date;
      const rating = details.vote_average
        ? details.vote_average.toFixed(1)
        : "N/A";

      let director = "Unknown";
      if (credits?.crew) {
        const dir = credits.crew.find((p) => p.job === "Director");
        if (dir) director = dir.name;
        else if (details.created_by?.length)
          director = details.created_by[0].name;
      }

      let infoHTML = `
        <div class="info-item"><label>${
          type === "tv" ? "Creator" : "Director"
        }</label><span>${director}</span></div>
        <div class="info-item"><label>Release</label><span>${
          date || "TBA"
        }</span></div>
        <div class="info-item"><label>Rating</label><span>⭐ ${rating}/10</span></div>
      `;

      if (details.runtime) {
        const hrs = Math.floor(details.runtime / 60);
        const mins = details.runtime % 60;
        infoHTML += `<div class="info-item"><label>Runtime</label><span>${hrs}h ${mins}m</span></div>`;
      }

      if (details.number_of_seasons) {
        infoHTML += `<div class="info-item"><label>Seasons</label><span>${details.number_of_seasons}</span></div>`;
      }

      if (details.status) {
        infoHTML += `<div class="info-item"><label>Status</label><span>${details.status}</span></div>`;
      }

      infoEl.innerHTML = infoHTML;
    }

    // Box Office (movies only)
    if (type === "movie" && (details.budget || details.revenue)) {
      const boxEl = document.getElementById("boxOffice");
      const gridEl = document.getElementById("boxOfficeGrid");
      if (boxEl && gridEl) {
        boxEl.style.display = "block";
        gridEl.innerHTML = "";
        if (details.budget) {
          gridEl.innerHTML += `<div class="box-item"><label>Budget</label><span>$${(
            details.budget / 1000000
          ).toFixed(1)}M</span></div>`;
        }
        if (details.revenue) {
          gridEl.innerHTML += `<div class="box-item"><label>Revenue</label><span>$${(
            details.revenue / 1000000
          ).toFixed(1)}M</span></div>`;
        }
        if (details.budget && details.revenue) {
          const profit = details.revenue - details.budget;
          gridEl.innerHTML += `<div class="box-item"><label>Profit</label><span class="${
            profit > 0 ? "positive" : "negative"
          }">$${(profit / 1000000).toFixed(1)}M</span></div>`;
        }
      }
    }

    // Watch Providers
    if (providers?.results?.US) {
      const provSection = document.getElementById("watchProviders");
      const provGrid = document.getElementById("providersGrid");
      if (provSection && provGrid) {
        const us = providers.results.US;
        const allProviders = [
          ...(us.flatrate || []),
          ...(us.rent || []),
          ...(us.buy || []),
        ];
        const unique = [
          ...new Map(allProviders.map((p) => [p.provider_id, p])).values(),
        ];

        if (unique.length > 0) {
          provSection.style.display = "block";
          provGrid.innerHTML = "";
          unique.slice(0, 8).forEach((p) => {
            provGrid.innerHTML += `
              <div class="provider-item" title="${p.provider_name}">
                <img src="${imgUrl(p.logo_path, "w92")}" alt="${
              p.provider_name
            }">
              </div>
            `;
          });
        }
      }
    }

    // Cast
    const castEl = document.getElementById("cast");
    if (castEl && credits?.cast) {
      castEl.innerHTML = "";
      credits.cast.slice(0, 6).forEach((actor) => {
        castEl.innerHTML += `
          <a href="./person.html?id=${actor.id}" class="cast-member">
            <img class="cast-photo" src="${imgUrl(
              actor.profile_path,
              "w185"
            )}" alt="${actor.name}" onerror="this.src='${FALLBACK.POSTER}'">
            <span class="cast-name">${actor.name}</span>
            <span class="cast-character">${actor.character || ""}</span>
          </a>
        `;
      });
    }

    // Videos Gallery
    if (videos?.results?.length > 1) {
      const vidSection = document.getElementById("videosSection");
      const vidRow = document.getElementById("videosRow");
      if (vidSection && vidRow) {
        vidSection.style.display = "block";
        vidRow.innerHTML = "";
        videos.results.slice(0, 6).forEach((vid) => {
          if (vid.site !== "YouTube") return;
          vidRow.innerHTML += `
            <div class="video-item">
              <a href="https://www.youtube.com/watch?v=${vid.key}" target="_blank">
                <img src="https://img.youtube.com/vi/${vid.key}/mqdefault.jpg" alt="${vid.name}">
                <span class="play-icon">▶</span>
              </a>
              <p>${vid.name}</p>
            </div>
          `;
        });
      }
    }

    // Images Gallery
    if (images?.backdrops?.length || images?.posters?.length) {
      const imgSection = document.getElementById("imagesSection");
      const imgRow = document.getElementById("imagesRow");
      if (imgSection && imgRow) {
        const allImages = [
          ...(images.backdrops || []),
          ...(images.posters || []),
        ];
        if (allImages.length > 0) {
          imgSection.style.display = "block";
          imgRow.innerHTML = "";
          allImages.slice(0, 10).forEach((img) => {
            imgRow.innerHTML += `
              <a href="${imgUrl(
                img.file_path,
                "original"
              )}" target="_blank" class="gallery-image">
                <img src="${imgUrl(
                  img.file_path,
                  "w300"
                )}" alt="Gallery image" loading="lazy">
              </a>
            `;
          });
        }
      }
    }

    // Similar
    const similarSection = document.getElementById("similarSection");
    const similarRow = document.getElementById("similarRow");
    if (similarSection && similarRow && similar?.results?.length) {
      similarSection.classList.add("visible");
      similarRow.innerHTML = "";
      similar.results.slice(0, 8).forEach((item) => {
        if (!item.poster_path) return;
        similarRow.innerHTML += `
          <a href="./Description.html?id=${
            item.id
          }&type=${type}" class="similar-card">
            <img src="${imgUrl(item.poster_path, "w200")}" alt="${
          item.title || item.name
        }" onerror="this.src='${FALLBACK.POSTER}'">
            <p>${item.title || item.name}</p>
          </a>
        `;
      });
    }
  } catch (err) {
    console.error(err);
    if (titleEl) titleEl.textContent = "Error loading content";
  }
}

// Keyboard Navigation
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    window.history.back();
  }
});

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const type = params.get("type");

  if (id && type) {
    loadDetails(id, type);
  } else {
    document.getElementById("title").textContent = "No content selected";
    document.getElementById("synopsis").textContent =
      "Please select a movie or series from the home page.";
  }
});
