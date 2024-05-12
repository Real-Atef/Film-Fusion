var apiKey = "37af78034f737ae890e4ffcb2e0dd466";

var data;
function getData() {
  var myHttp = new XMLHttpRequest();
  myHttp.open(
    "GET",
    `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}`
  );
  myHttp.send();
  myHttp.addEventListener("load", function () {
    if (myHttp.readyState == 4 && myHttp.status == 200) {
      data = JSON.parse(myHttp.response);
      var section = document.querySelector(`.row`);
      for (var i = 0; i < data.results.length; i++) {
        const movie = data.results[i];
        const card = document.createElement("div");
        card.classList.add("col-1", "card");
        const anchor = document.createElement("a");
        anchor.href = `/Pages/description.html?id=${movie.id}&type=movie`;
        anchor.innerHTML = `
          <img src="https://image.tmdb.org/t/p/w500/${movie.poster_path}">
          <div class="overlay">
            <div class="text">${movie.title}</div>
          </div>
        `;
        card.appendChild(anchor);
        section.appendChild(card);
      }
    }
  });
}
getData();
