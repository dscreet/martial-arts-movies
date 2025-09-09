import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const ACCESS_TOKEN = process.env.TMDB_API_ACCESS_TOKEN;
const BASE_URL = 'https://api.themoviedb.org/3/';
const KEYWORD_ID = 779; // "martial arts" - can turn into array and use keywords such as "boxing" to get specific martial arts

interface TMDBDiscoverResponse {
  page: number;
  results: { id: number }[]; // only need the movie ids from this response to use in fetchMovies()
  total_pages: number;
  total_results: number;
}

interface TMDBGenreResponse {
  genres: Genre[];
}

interface Movie {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string;
  backdrop_path: string;
  genres: Genre[];
  origin_country: string[];
}

interface Genre {
  id: number;
  name: string;
}

interface Country {
  iso_3166_1: string;
  english_name: string;
  native_name: string;
}

interface Metadata {
  fetchedAt: string;
  source: string;
  keywordId?: number;
  totalItems: number;
  dataset: DataName;
}

type OutputData<T> = {
  metadata: Metadata;
  [key: string]: T[] | Metadata;
};

type DataName = 'movies' | 'genres' | 'countries';

async function saveDataToFile<T>(data: T[], dataName: DataName): Promise<void> {
  try {
    const output: OutputData<T> = {
      metadata: {
        fetchedAt: new Date().toISOString(),
        source: 'TMDB API',
        ...(dataName === 'movies' ? { keywordId: KEYWORD_ID } : {}),
        totalItems: data.length,
        dataset: dataName,
      },
      data: data,
    };

    const outputPath = path.resolve(__dirname, `../data/${dataName}.json`);
    await fs.writeFile(outputPath, JSON.stringify(output, null, 2));

    console.log(`saved ${data.length} ${dataName} to ${outputPath}\n`);
  } catch (error) {
    console.error(`failed to write ${dataName} to file:`, error);
  }
}

async function fetchFromTMDB<T>(url: string): Promise<T> {
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
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`TMDB API fetch error: ${url}`, { cause: error });
  }
}

// need to get the total amount of pages of results to iterate through
async function getTotalPages(): Promise<number> {
  const url = `${BASE_URL}discover/movie?page=1&with_keywords=${KEYWORD_ID}`;
  const data = await fetchFromTMDB<TMDBDiscoverResponse>(url);
  console.log(`\nfound ${data.total_results} results across ${data.total_pages} pages\n`);
  return data.total_pages;
}

// use /discover/movie with martial arts keyword to get list of movie ids
async function fetchMovieIds(): Promise<number[]> {
  const movieIds: number[] = [];
  const totalPages = await getTotalPages();

  console.log(`fetching movie ids...`);
  for (let page = 1; page <= totalPages; page++) {
    const url = `${BASE_URL}discover/movie?page=${page}&with_keywords=${KEYWORD_ID}`;
    const data = await fetchFromTMDB<TMDBDiscoverResponse>(url);
    const ids = data.results.map((movie) => movie.id);
    movieIds.push(...ids);
  }

  console.log(`fetched ${movieIds.length} movie ids`);
  return movieIds;
}

// fetch movies by id and save responses
async function fetchMovies(): Promise<Movie[]> {
  const movies: Movie[] = [];
  const movieIds = await fetchMovieIds();

  console.log(`\nfetching ${movieIds.length} movies...`);
  for (let i = 0; i < movieIds.length; i++) {
    const id = movieIds[i];
    const url = `${BASE_URL}movie/${id}`;
    const movie = await fetchFromTMDB<Movie>(url);
    if (movie) {
      movies.push(movie);
      console.log(`[${i + 1}/${movieIds.length}] fetched movie ${movie.id}`);
    }
  }

  console.log(`fetched ${movies.length} movies`);
  return movies;
}

async function fetchGenres(): Promise<Genre[]> {
  console.log('fetching genres...');
  const url = `${BASE_URL}genre/movie/list`;
  const { genres } = await fetchFromTMDB<TMDBGenreResponse>(url);
  console.log(`fetched ${genres.length} genres`);
  return genres;
}

async function fetchCountries(): Promise<Country[]> {
  console.log('fetching countries...');
  const url = `${BASE_URL}configuration/countries`;
  const countries = await fetchFromTMDB<Country[]>(url);
  console.log(`fetched ${countries.length} countries`);
  return countries;
}

async function main() {
  try {
    console.log('starting TMDB data fetch...');

    const movies = await fetchMovies();
    await saveDataToFile(movies, 'movies');

    const genres = await fetchGenres();
    await saveDataToFile(genres, 'genres');

    const countries = await fetchCountries();
    await saveDataToFile(countries, 'countries');

    console.log('TMDB data successfully fetched and saved');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
