// Fetch movie details including top cast, YouTube trailer, and genres based on movie ID and media type
async function fetchMovieDetails(movieId, mediaType) {
  const apiKey = "587c710c3df4f4747c43471c4788cf12";
  const movieUrl = `https://api.themoviedb.org/3/${mediaType}/${movieId}?api_key=${apiKey}`;
  const creditsUrl = `https://api.themoviedb.org/3/${mediaType}/${movieId}/credits?api_key=${apiKey}`;
  const videosUrl = `https://api.themoviedb.org/3/${mediaType}/${movieId}/videos?api_key=${apiKey}&type=trailer`;

  try {
    const [movieResponse, creditsResponse, videosResponse] = await Promise.all([
      fetch(movieUrl),
      fetch(creditsUrl),
      fetch(videosUrl),
    ]);

    if (!movieResponse.ok || !creditsResponse.ok || !videosResponse.ok) {
      throw new Error("One or more network responses were not ok");
    }

    const [movieData, creditsData, videosData] = await Promise.all([
      movieResponse.json(),
      creditsResponse.json(),
      videosResponse.json(),
    ]);

    // Populate movie details on the description page
    document.getElementById("movie-title").textContent = movieData.title;
    document.getElementById(
      "movie-poster"
    ).src = `https://image.tmdb.org/t/p/w500/${movieData.poster_path}`;
    document.getElementById("movie-synopsis").textContent = movieData.overview;
    const imdbRating = movieData.vote_average;
    document.getElementById("movie-rating").textContent = `${imdbRating}/10`;
    document.getElementById("movie-release-date").textContent =
      mediaType === "movie" ? movieData.release_date : movieData.first_air_date; // Change depending on mediaType

    // Populate genres
    const genres = movieData.genres.map((genre) => genre.name);
    populateGenreButtons(genres);

    // Populate director's name on the description page
    const keyRole =
      mediaType === "movie" ? "Director" : "Executive Producer" || "Producer";
    const director = creditsData.crew.find((member) => member.job === keyRole);
    if (director) {
      document.getElementById("movie-director").textContent = director.name;
    } else {
      console.error(`${keyRole} information not found.`);
    }
    // Populate top cast on the description page
    const topCast = creditsData.cast.slice(0, 3); // Limit to top 3 cast members
    topCast.forEach((actor, index) => {
      const actorImage = document.getElementById(`actor${index + 1}-image`);
      const actorName = document.getElementById(`actor${index + 1}-name`);
      actorImage.src = `https://image.tmdb.org/t/p/w500/${actor.profile_path}`;
      actorName.textContent = actor.name;
    });

    // Find the trailer key
    const trailer = videosData.results.find(
      (video) => video.type === "Trailer"
    );
    if (trailer) {
      // Set the YouTube trailer URL
      const trailerKey = trailer.key;
      const trailerUrl = `https://www.youtube-nocookie.com/embed/${trailerKey}?rel=0`;
      document.getElementById("movie-trailer").src = trailerUrl;
    } else {
      console.error("No trailer found for this movie.");
    }
  } catch (error) {
    console.error("Error fetching movie details:", error);
  }
}

// Function to populate genre buttons dynamically
function populateGenreButtons(genres) {
  const genreButtonsContainer = document.getElementById("genre-buttons");
  genres.forEach((genre) => {
    const button = document.createElement("button");
    button.classList.add("button");
    button.textContent = genre;
    genreButtonsContainer.appendChild(button);
  });
}

// Call the fetchMovieDetails function with a specific movie ID and media type
window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const movieId = params.get("id");
  const mediaType = params.get("type"); // Get the media type from URL parameters
  if (movieId && mediaType) {
    fetchMovieDetails(movieId, mediaType); // Pass mediaType to fetchMovieDetails
  } else {
    console.error("No movie ID or media type provided in the URL.");
  }
});
