import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const ACCESS_TOKEN = process.env.TMDB_API_ACCESS_TOKEN;
const BASE_URL = 'https://api.themoviedb.org/3/';
const KEYWORD_ID = 779; // "martial arts" - can turn into array and use keywords such as "boxing" to get specific martial arts

async function saveDataToFile(data, dataName) {
  try {
    const output = {
      metadata: {
        fetched_at: new Date().toISOString(),
        ...(dataName === 'movies' ? { keyword_id: KEYWORD_ID } : {}),
        [`total_${dataName}`]: data.length,
        source: 'TMDB API',
      },
      [dataName]: data,
    };

    const outputPath = path.resolve(__dirname, `../data/${dataName}.json`);
    await fs.writeFile(outputPath, JSON.stringify(output, null, 2));

    console.log(`\nsaved ${data.length} ${dataName} to ${outputPath}\n`);
  } catch (error) {
    console.error(`failed to write ${dataName} to file:`, error.message);
  }
}

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
  console.log(`\nfound ${data.total_results} results across ${data.total_pages} pages`);
  return data.total_pages;
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

  console.log(`\nfetched ${movieIds.length} movie ids\n`);
  return movieIds;
}

// fetch movies by id and save responses
async function fetchMovies() {
  const movies = [];
  const movieIds = await fetchMovieIds();
  for (let i = 0; i < movieIds.length; i++) {
    const id = movieIds[i];
    const url = `${BASE_URL}movie/${id}`;
    const movie = await fetchFromTMDB(url);
    if (movie) {
      movies.push(movie);
      console.log(`[${i + 1}/${movieIds.length}] fetched movie id ${movie.id}`);
    }
  }
  return movies;
}

async function fetchGenres() {
  const url = `${BASE_URL}genre/movie/list`;
  const data = await fetchFromTMDB(url);
  return data.genres;
}

async function fetchCountries() {
  const url = `${BASE_URL}configuration/countries`;
  const data = await fetchFromTMDB(url);
  return data;
}

async function main() {
  try {
    const movies = await fetchMovies();
    await saveDataToFile(movies, 'movies');

    const genres = await fetchGenres();
    await saveDataToFile(genres, 'genres');

    const countires = await fetchCountries();
    await saveDataToFile(countires, 'countries');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
