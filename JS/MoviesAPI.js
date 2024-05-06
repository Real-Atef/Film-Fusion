//API Key for the movie database
var apikey = "37af78034f737ae890e4ffcb2e0dd466";


var data;
function getdata() {
  var myhttp = new XMLHttpRequest();
  myhttp.open("GET",`https://api.themoviedb.org/3/discover/movie?api_key=${apikey}`);
  myhttp.send();
  myhttp.addEventListener("load", function () {
    if (myhttp.readyState == 4 && myhttp.status == 200) {
      data = JSON.parse(myhttp.response);
      var section = document.querySelector(`.row`);
      for (var i = 0; i < data.results.length; i++) {
        const card = document.createElement("div");
        card.classList.add("col-1", "card");
        card.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w500/${data.results[i].poster_path}">
        <div class="overlay">
          <div class="text">${data.results[i].title}</div>
        </div>
      `;
      console.log(data.results[i].poster_path);
      section.appendChild(card);
      }
    }
  });
}
getdata();
