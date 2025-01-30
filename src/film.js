document.addEventListener('DOMContentLoaded', function () {
    const params = new URLSearchParams(window.location.search);
    const filmId = params.get('id');
    if (filmId) {
        fetchFilmData(filmId);
    } else {
        alert("Не указан ID фильма.");
    }
});

const RatingMap = {
    'G': '0+',
    'PG': '6+',
    'PG-13': '12+',
    'R': '16+',
    'NC17': '17+',
    'R18': '18+'
};

function fetchFilmData(filmId) {
    fetch(`https://shift-intensive.ru/api/cinema/film/${filmId}`, {
        method: 'GET',
        headers: { 'accept': 'application/json' }
    })
    .then(response => response.json())
    .then(response => {
        if (response.success) {
            const film = response.film;
            renderFilmDetails(film);
        } else {
            alert("Ошибка: " + response.reason);
        }
    })
    .catch(() => {
        alert("Произошла ошибка при загрузке данных о фильме.");
    });
}

function renderFilmDetails(film) {
    let filmHtml = '';

    const rawRating = film.ageRating || 'N/A';
    const ageRating = RatingMap[rawRating] || 'N/A';
    const kinopoiskRating = film.userRatings.kinopoisk || 'N/A';
    const baseUrl = 'https://shift-intensive.ru/api';
    const imageUrl = (film.img) ? `${baseUrl}${film.img}` : 'assets/filmPage/default.jpg';
    const starRatingSrc = getStarRating(kinopoiskRating);
    const genre = film.genres[0];
    const countryName = film.country.name;
    const filmYear = film.releaseDate.split(" ").pop();
    const actors = film.actors.map(actor => actor.fullName).join(', ') || "Не указано";

    filmHtml += `
        <div class="movie-card">
            <div class="poster-wrapper">
                <img src="${imageUrl}" alt="${film.name}" class="movie-poster" />
                <img src="assets/filmPage/Label.svg" alt="Label" class="label" />
                <p class="genre-page-for-certain-film">${genre}</p>
                <p class="countryAndFilm-page-for-certain-film">${countryName}, ${filmYear}</p>
            </div>
        </div>
        <div class="movie-info-container">  
            <h1 class="">${film.name} (${ageRating})</h1>  
            <p class="movie-subtitle-for-certain-film">Фильм</p>  
            <div class="rating-container">  
                <img src="${starRatingSrc}" class="rating pics">  
                <p class="movie-subtitle">Kinopoisk - ${kinopoiskRating}</p>  
            </div>  
            <p class="">${film.description}</p>
            <p class="movie-actors-for-certain-film">Актеры: ${actors}</p>
        </div>  
    `;

    document.querySelector('.certain-film-container').innerHTML = filmHtml;
}

function getStarRating(kinopoiskRating) {
    if (kinopoiskRating !== 'N/A') {
        let ratingOutOfFive = Math.round(kinopoiskRating / 2);
        return `assets/filmPage/Rating_${ratingOutOfFive}.svg`;
    }
    return 'Нет рейтинга';
}