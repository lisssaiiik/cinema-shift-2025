const params = new URLSearchParams(window.location.search);
const filmId = params.get('id');
if (filmId) {
    fetchFilmData(filmId);
    fetchFilmSchedule(filmId);
} else {
    console.log("Не указан ID фильма.");
}

const RatingMap = {
    'G': '0+',
    'PG': '6+',
    'PG-13': '12+',
    'R': '16+',
    'NC17': '17+',
    'R18': '18+'
};

function fetchFilmData(filmId) {
    fetch(`${FILM_URL}${filmId}`, {
        method: 'GET',
        headers: { 'accept': 'application/json' }
    })
        .then(response => response.json())
        .then(response => renderFilmDetails(response.film));
}

function renderFilmDetails(film) {
    let filmHtml = '';

    const rawRating = film.ageRating;
    const ageRating = RatingMap[rawRating];
    const kinopoiskRating = film.userRatings.kinopoisk;
    const imageUrl = `${BASE_URL}${film.img}`;
    const starRatingSrc = getStarRating(kinopoiskRating);
    const genre = film.genres[0];
    const countryName = film.country.name;
    const filmYear = film.releaseDate.split(" ").pop();
    const actors = film.actors.map(actor => actor.fullName).join(', ');

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
    const ratingOutOfFive = Math.round(kinopoiskRating / 2);
    return `assets/filmPage/Rating_${ratingOutOfFive}.svg`;
}

function fetchFilmSchedule(filmId) {
    fetch(FILM_SCHEDULE_URL.replace('{filmId}', filmId), {
        method: 'GET',
        headers: { 'accept': 'application/json' }
    })
        .then(response => response.json())
        .then(renderSchedules);
}

function renderSchedules(data) {
    if (data.success) {
        const schedules = data.schedules;
        let filmHtml = '<h2>Расписание</h2><div class="schedule-info-container">';
        if (schedules.length > 0) {
            schedules.forEach(function (schedule) {
                const formattedDate = formatDate(schedule.date);
                if (formattedDate) {
                    filmHtml += `<button class="schedule-button" data-date="${schedule.date}">${formattedDate}</button>`;
                } else {
                    console.error("Некорректная дата:", schedule.date);
                }
            });
        }

        filmHtml += '</div>';
        document.querySelector('.schedule-container').innerHTML = filmHtml;
        const dateButtons = document.querySelectorAll('.schedule-button');
        dateButtons.forEach(button => {
            button.addEventListener('click', function () {
                const selectedDate = this.getAttribute('data-date');
                const selectedSchedule = schedules.find(schedule => schedule.date === selectedDate);
                renderSeances(selectedSchedule);
            });
        });
    } else {
        console.error("Ошибка: ", data.reason);
    }
}

function formatDate(dateString) {
    const [day, month, year] = dateString.split('.');
    return new Date(`${`20${year}`}-${month}-${day}`).toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' });
}

function translateHallName(hallName) {
    switch (hallName) {
        case 'Red':
            return 'Красный';
        case 'Green':
            return 'Зелёный';
        case 'Blue':
            return 'Голубой';
    }
}

function renderSeances(schedule) {
    let seancesHtml = '';

    const halls = schedule.seances.reduce((acc, seance) => {
        const hallName = seance.hall.name;
        if (!acc[hallName]) {
            acc[hallName] = [];
        }
        acc[hallName].push(seance.time);
        return acc;
    }, {});

    for (const hallName in halls) {
        const translatedHallName = `${translateHallName(hallName)} зал`;
        const times = halls[hallName];

        seancesHtml += `<div class="hall-info">
                            <h4>${translatedHallName}</h4>
                            <div class="time-list">`;

        times.forEach((time) => {
            seancesHtml += `<div class="time-cell" data-selected="false" data-time="${time}">${time}</div>`;
        });

        seancesHtml += `</div></div>`;
    }

    seancesHtml += '<button class="button-to-continue-operations">Продолжить</button>';

    document.querySelector('.seances-container').innerHTML = seancesHtml;

    const timeCells = document.querySelectorAll('.time-cell');
    timeCells.forEach(cell => {
        cell.addEventListener('click', function (event) {
            const selectedTimeCell = event.target;
            timeCells.forEach(cell => {
                cell.dataset.selected = false;
            });
            selectedTimeCell.dataset.selected = true;
        });
    });
}