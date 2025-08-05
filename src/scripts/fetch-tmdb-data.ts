import dotenv from 'dotenv';
dotenv.config();

const ACCESS_TOKEN = process.env.TMDB_API_ACCESS_TOKEN;
const BASE_URL = 'https://api.themoviedb.org/3/';
const KEYWORD_ID = 779; // "martial arts" - can turn into array and use keywords such as "boxing" to get specific martial arts

async function fetchFromTMDB(url) {
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
  };

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.statusText}, ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`TMDB API fetch error: ${url}`, error);
  }
}

async function getTotalPages() {
  const url = `${BASE_URL}discover/movie?page=1&with_keywords=${KEYWORD_ID}`;
  const data = await fetchFromTMDB(url);
  console.log(`found ${data.total_results} results across ${data.total_pages} pages`);
  return data.total_pages - 98;
}

// use /discover/movie with martial arts keyword to get list of movie ids
async function fetchMovieIds() {
  const movieIds = [];
  const totalPages = await getTotalPages();

  for (let page = 1; page <= totalPages; page++) {
    const url = `${BASE_URL}discover/movie?page=${page}&with_keywords=${KEYWORD_ID}`;
    const data = await fetchFromTMDB(url);
    const ids = data.results.map((movie) => movie.id);
    movieIds.push(...ids);
  }

  console.log(`fetched ${movieIds.length} movie ids`);
  return movieIds;
}

// fetch movies by id and save responses
async function fetchMovies() {
  const movies = [];
  const movieIds = await fetchMovieIds();
  for (const id of movieIds) {
    const url = `${BASE_URL}movie/${id}`;
    const movie = await fetchFromTMDB(url);
    if (movie) movies.push(movie);
  }
  console.log(movies);
}

fetchMovies();

// need to get list of genres, countries, martial arts
