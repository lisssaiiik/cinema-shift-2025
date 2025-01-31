fetch(TODAY_API_URL, {
    method: 'GET',
    headers: {
        'Accept': 'application/json'
    }
})
.then(response => {
    if (!response.ok) throw new Error('Ошибка получения данных');

    return response.json();
})
.then(data => {
    if (data.success) {
        const films = data.films;
        const filmsHtml = createFilmsList(films);
        document.querySelector('.movies-container').innerHTML = filmsHtml;
    } else {
        document.querySelector('.movies-container').innerHTML = '<p>Ошибка получения данных.</p>';
    }
})
.catch(error => {
    document.querySelector('.movies-container').innerHTML = `<p>Произошла ошибка: ${error.message}</p>`;
});

const RatingMap = {
    'G': '0+',
    'PG': '6+',
    'PG-13': '12+',
    'R': '16+',
    'NC17': '17+',
    'R18': '18+'
};

function getStarRating(kinopoiskRating) {
    const ratingOutOfFive = Math.round(kinopoiskRating / 2);
    return `assets/filmPage/Rating_${ratingOutOfFive}.svg`;
}

function createFilmsList(films) {
    let filmsHtml = '';

    films.slice(0, 10).forEach((film) => {
        const rawRating = film.ageRating;
        const ageRating = RatingMap[rawRating];
        const kinopoiskRating = film.userRatings?.kinopoisk;
        const imageUrl = `${BASE_URL}${film.img}`;
        const starRatingSrc = getStarRating(kinopoiskRating);
        const genre = film.genres[0];
        const countryName = film.country?.name;
        const filmYear = film.releaseDate.split(" ").pop();

        filmsHtml += `
            <div class="movie-card">
                <div class="poster-wrapper">
                    <img src="${imageUrl}" alt="${film.name}" class="movie-poster" />
                    <img src="assets/filmPage/Label.svg" alt="Label" class="label" />
                    <p class="genre">${genre}</p>
                    <p class="countryAndFilm">${countryName}, ${filmYear}</p>
                </div>
                <div class="movie-info">
                    <h3 class="movie-title">${film.name} (${ageRating})</h3>
                    <p class="movie-subtitle">Фильм</p>
                </div>
                <div class="rating-container">
                    <img src="${starRatingSrc}" class="rating pics">
                    <p class="movie-subtitle">Kinopoisk - ${kinopoiskRating}</p>
                </div>
                <button class="movie-button" onclick="location.href='film.html?id=${film.id}'">Подробнее</button>
            </div>
        `;
    });

    return filmsHtml;
}