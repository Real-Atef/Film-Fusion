const apiKey = "587c710c3df4f4747c43471c4788cf12";
let slideIndex = 0;

function showSlides(slides) {
  for (let i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  slideIndex++;
  if (slideIndex > slides.length) {
    slideIndex = 1;
  }
  slides[slideIndex - 1].style.display = "block";
  setTimeout(showSlides, 3000, slides); // Change image every 3 seconds
}

// Fetch popular movies from API for slideshow
fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}`)
  .then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  })
  .then((data) => {
    const popularMovies = data.results;
    const slideshowContainer = document.getElementById("Slideshow");

    popularMovies.forEach((movie) => {
      // Create slide element
      const slide = document.createElement("div");
      slide.classList.add("mySlides", "fade");

      // Create image element for the slide
      const image = document.createElement("img");
      image.src = `https://image.tmdb.org/t/p/w1280/${movie.backdrop_path}`; // Fetch higher resolution image
      image.style.width = "100%";
      image.style.height = "auto";
      slide.appendChild(image);

      // Append slide to slideshow container
      slideshowContainer.appendChild(slide);
    });

    // Show the slides once they are loaded
    const slides = document.querySelectorAll(".mySlides");
    showSlides(slides);
  })
  .catch((error) => {
    console.error("Error fetching data:", error);
  });

// Function to fetch data
function fetchData(url, sectionId, cardClass, sliceStart, sliceEnd, mediaType) {
  fetch(url + apiKey)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      const items = data.results.slice(sliceStart, sliceEnd); // Limit to a certain number of items
      const section = document.querySelector(`#${sectionId} .row`);

      items.forEach((item) => {
        // Create anchor tag to link to description page
        const anchor = document.createElement("a");
        anchor.href = `/Pages/description.html?id=${item.id}&type=${mediaType}`; // Pass media type in the query parameter

        // Create card container
        const card = document.createElement("div");
        card.classList.add("col-1", "card", cardClass); // Add classes to style with CSS

        // Create card content
        card.innerHTML = `
          <img src="https://image.tmdb.org/t/p/w500/${item.poster_path}" alt="${
          item.title || item.name
        }" />
          <div class="overlay">
            <div class="text">${item.title || item.name}</div>
          </div>
        `;

        // Append card content to anchor tag
        anchor.appendChild(card);

        // Append anchor tag to section
        section.appendChild(anchor);
      });
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}

// Event listener for loading data
window.addEventListener("load", () => {
  fetchData(
    "https://api.themoviedb.org/3/movie/top_rated?api_key=",
    "recommendations",
    "popular-movie-card",
    8,
    15,
    "movie" // Pass media type "movie"
  );
  fetchData(
    "https://api.themoviedb.org/3/discover/movie?api_key=",
    "movies",
    "movie-card",
    0,
    7,
    "movie" // Pass media type "movie"
  );
  fetchData(
    "https://api.themoviedb.org/3/discover/tv?api_key=",
    "series",
    "series-card",
    0,
    7,
    "tv" // Pass media type "series"
  );
  fetchData(
    "https://api.themoviedb.org/3/movie/upcoming?api_key=",
    "upcoming",
    "upcoming-movie-card",
    0,
    7,
    "movie" // Pass media type "movie"
  );
});
