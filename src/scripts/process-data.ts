// read from movies file
// remove unused fields
// add classification data to movie object
// save to new json file
// additionally, create a new json for classification data
// Pipeline: build batch → submit → poll → retrieve results → save files

import fs from 'fs/promises';
import { createReadStream } from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import OpenAI from 'openai';

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

function logStep(message: string) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < 2; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

async function buildBatchFile(): Promise<number> {
  logStep('\nbuilding batch file...');

  try {
    const rawData = await fs.readFile(RAW_MOVIES_FILE, 'utf-8');
    const { movies: rawMovies }: { movies: RawMovie[] } = JSON.parse(rawData);

    const chunkSize = 10;
    const chunks = chunkArray(rawMovies, chunkSize);

    logStep('generating batch entires...');
    const batchEntries: BatchEntry[] = chunks.map((chunk, idx) => {
      const inputText = chunk
        .map((movie, i) => `Movie ${i + 1}:\nId: ${movie.id}\nTitle: ${movie.title}\nOverview: ${movie.overview}`)
        .join('\n\n');

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
    console.log(`created ${batchEntries.length} batch entires`);

    const jsonl = batchEntries.map((entry) => JSON.stringify(entry)).join('\n');
    await fs.writeFile(BATCH_FILE, jsonl);

    console.log('successfully built and saved batch file');
    return batchEntries.length;
  } catch (error) {
    console.error('failed to build batch file', error);
    throw error;
  }
}

async function submitBatch(): Promise<string> {
  logStep('\nsubmitting batch job...');

  try {
    logStep('uploading batch file...');
    const file = await client.files.create({
      file: createReadStream(BATCH_FILE),
      purpose: 'batch',
    });
    logStep(`uploaded batch file: ${file.id}`);

    logStep('creating batch...');
    const batch = await client.batches.create({
      input_file_id: file.id,
      endpoint: '/v1/responses',
      completion_window: '24h',
    });
    logStep(`created batch job: ${batch.id}`);

    logStep('successfully submitted batch job');
    return batch.id;
  } catch (error) {
    console.error('failed to submit batch', error);
    throw error;
  }
}

/*
1. build the batch file full of requests for classification
2. upload the batch file and create a batch request
3. poll the batch file and when finished, retrieve the batch output
4. save the classification results as json
5. create a new json file with movie objects containing the new martial arts fields and removing the redundant ones
*/
async function main() {
  try {
    logStep('starting data processing...');

    await buildBatchFile();
    const batchId = await submitBatch();

    logStep('successfully processed data');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
