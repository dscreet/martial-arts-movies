// read from movies file
// remove unused fields
// add classification data to movie object
// save to new json file
// additionally, create a new json for classification data

import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { createReadStream } from 'fs';

dotenv.config();

const client = new OpenAI();

const BATCH_FILE = path.resolve(__dirname, '../data/movies-batch.jsonl');
const RAW_MOVIES_FILE = path.resolve(__dirname, '../data/movies.json');
const PROCESSED_MOVIES_FILE = path.resolve(__dirname, '../data/processed-movies.json');
const CLASSIFICATIONS_FILE = path.resolve(__dirname, '../data/movie-classifications.json');

const CLASSIFIER_PROMPT = `
You are a movie martial arts classifier.
Rules:
1. Always return valid JSON.
2. The JSON must have three fields:
   - "id": the movie Id from the input.
   - "primary": the single most prominent martial art in the movie.
   - "secondary": a list of other martial arts that appear (may be empty).
3. If no martial arts are present, set primary to 'None' and secondary to [].
4. Only classify martial arts from the following predefined list:
   - Karate
   - Kung Fu
   - Taekwondo
   - Judo
   - Jiu-Jitsu
   - Aikido
   - Boxing
   - Kickboxing
   - Muay Thai
   - Wrestling
   - MMA
   - Kendo
   - Kenjutsu
   - Ninjutsu
   - Capoeira
   - Krav Maga
   - Sambo
   - Savate
   - Jeet Kune Do
   - Silat
   - Keysi
   - Other
5. Always pick the closest match from this list.
   - If the movie shows general fighting (e.g. brawling, street fighting), classify as "Other". 
   - If the movie shows no martial arts or fighting at all, classify as "None".
`;

interface Genre {
  id: number;
  name: string;
}

interface RawMovie {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string;
  backdrop_path: string;
  genres: Genre[];
  origin_country: string[];
}

interface Movie {
  tmdbId: number;
  title: string;
  overview: string;
  releaseDate: string;
  posterPath: string;
  backdropPath: string;
  genres: Genre[];
  countries: string[];
  primaryMartialArt: string;
  martialArts: string[];
}

interface ClassificationResult {
  tmdbId: number;
  primary: string;
  secondary: string[];
}

interface BatchEntry {
  custom_id: string;
  method: 'POST';
  url: string;
  body: {
    model: string;
    reasoning: {
      effort: string;
    };
    input: {
      role: 'system' | 'user';
      content: string;
    }[];
  };
}

// async function processMovies() {
//   try {
//     console.log('reading input file...');
//     const inputFilePath = path.resolve(__dirname, '../data/movies.json');
//     const rawData = await fs.readFile(inputFilePath, 'utf-8');
//     const { movies } = JSON.parse(rawData);

//     console.log(`\nprocessing ${movies.length} movies...`);
//     const processedMovies = [];
//     for (let i = 0; i < movies.length; i++) {
//       const movie = movies[i];
//       console.log(`[${i + 1}/${movies.length}] processing movie ${movie.id}`);

//       const processedMovie = {
//         tmdbId: movie.id,
//         title: movie.title,
//         overview: movie.overview,
//         releaseDate: movie.release_date,
//         posterPath: movie.poster_path,
//         backdropPath: movie.backdrop_path,
//         // primaryMartialArtId:
//         // primaryMartialArt:
//         // martialArts:
//         genres: movie.genres,
//         countries: movie.origin_country,
//       };

//       processedMovies.push(processedMovie);
//     }

//     console.log(`processed ${processedMovies.length} movies`);

//   } catch (error) {
//     console.error('error processsing movies:', error);
//   }
// }

function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < 2; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

async function buildBatchFile(): Promise<number> {
  const rawData = await fs.readFile(RAW_MOVIES_FILE, 'utf-8');
  const { movies: rawMovies }: { movies: RawMovie[] } = JSON.parse(rawData);

  const chunkSize = 10;
  const chunks = chunkArray(rawMovies, chunkSize);

  const batchEntries: BatchEntry[] = chunks.map((chunk, idx) => {
    const inputText = chunk
      .map((movie, i) => `Movie ${i + 1}:\nId: ${movie.id}\nTitle: ${movie.title}\nOverview: ${movie.overview}`)
      .join('\n\n');
    console.log('input text:', inputText);

    return {
      custom_id: `batch-${idx + 1}`,
      method: 'POST',
      url: '/v1/responses',
      body: {
        model: 'gpt-5',
        reasoning: {
          effort: 'medium',
        },
        input: [
          { role: 'system', content: CLASSIFIER_PROMPT },
          { role: 'user', content: inputText },
        ],
      },
    };
  });

  console.log('batch entries:', batchEntries);

  const jsonl = batchEntries.map((entry) => JSON.stringify(entry)).join('\n');
  await fs.writeFile(BATCH_FILE, jsonl);
  return batchEntries.length;
}

async function submitBatch(): Promise<string> {
  const file = await client.files.create({
    file: createReadStream(BATCH_FILE),
    purpose: 'batch',
  });
  console.log(`Uploaded batch file: ${file.id}`);

  const batch = await client.batches.create({
    input_file_id: file.id,
    endpoint: '/v1/responses',
    completion_window: '24h',
  });

  // console.log('Batch job submitted. ID:', batch.id);
  console.log(batch.id);
  return batch.id;
}

async function main() {
  try {
    await buildBatchFile();
    // await submitBatch();
    //1. build the batch file
    //2 submit the batch file for classification
    //3. retrieve the results and save the json
    //4. add the new properties to the movie object and save json

    // console.log('starting TMDB data fetch...');
    // console.log('TMDB data successfully fetched and saved');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
