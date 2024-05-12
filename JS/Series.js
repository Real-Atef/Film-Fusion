// API Key for the movie database
var apiKey = "8913688ba8c6297c6666f612a9c5409f";

var data;
function getData() {
  var myHttp = new XMLHttpRequest();
  myHttp.open(
    "GET",
    `https://api.themoviedb.org/3/trending/tv/week?api_key=${apiKey}`
  );
  myHttp.send();
  myHttp.addEventListener("load", function () {
    if (myHttp.readyState == 4 && myHttp.status == 200) {
      data = JSON.parse(myHttp.response);
      var section = document.querySelector(`.row`);
      for (var i = 0; i < data.results.length; i++) {
        const tvShow = data.results[i];
        const card = document.createElement("div");
        card.classList.add("col-1", "card");
        const anchor = document.createElement("a");
        anchor.href = `/Pages/description.html?id=${tvShow.id}&type=tv`; // Pass TV show ID in the query parameter
        anchor.innerHTML = `
          <img src="https://image.tmdb.org/t/p/w500/${tvShow.poster_path}">
          <div class="overlay">
            <div class="text">${tvShow.name}</div>
          </div>
        `;
        card.appendChild(anchor);
        section.appendChild(card);
      }
    }
  });
}
getData();
