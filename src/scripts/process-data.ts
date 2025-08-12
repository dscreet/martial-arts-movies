// read from movies file
// remove unused fields
// add classification data to movie object
// save to new json file
// additionally, create a new json for classification data

import fs from 'fs/promises';
import path from 'path';

async function processMovies() {
  try {
    console.log('reading input file...');
    const inputFilePath = path.resolve(__dirname, '../data/movies.json');
    const rawData = await fs.readFile(inputFilePath, 'utf-8');
    const data = JSON.parse(rawData);
    const movies = data.movies;

    console.log(`\nprocessing ${movies.length} movies...`);

    const processedMovies = [];
    for (let i = 0; i < 5; i++) {
      const movie = movies[i];
      console.log(`[${i + 1}/${movies.length}] processing movie ${movie.id}`);

      const processedMovie = {
        tmdbId: movie.id,
        title: movie.title,
        overview: movie.overview,
        releaseDate: movie.release_date,
        posterPath: movie.poster_path,
        backdropPath: movie.backdrop_path,
        // primaryMartialArtId:
        // primaryMartialArt:
        // martialArts:
        countries: movie.origin_country,
        genres: movie.genres,
      };

      processedMovies.push(processedMovie);
    }

    console.log(`processed ${processedMovies.length} movies`);

    const output = {
      metadata: {
        fetched_at: data.metadata.fetched_at,
        processed_at: new Date().toISOString(),
        keyword_id: data.metadata.keyword_id,
        total_movies: processedMovies.length,
        source: data.metadata.source,
      },
      movies: processedMovies,
    };

    console.log('\nwriting output file...');
    const outputPath = path.resolve(__dirname, `../data/processed_movies.json`);
    await fs.writeFile(outputPath, JSON.stringify(output, null, 2));

    console.log(`saved ${processedMovies.length} processed movies to ${outputPath}`);
  } catch (error) {
    console.error('error processsing movies:', error);
  }
}

async function classifyMartialArts(movie) {
  //use openai to classify movies
}

processMovies();
