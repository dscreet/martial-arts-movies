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

function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < 2; i += chunkSize) {
    // dont forget
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

async function buildBatchFile(): Promise<number> {
  console.log('\nbuilding batch file for movie martial arts classification...');

  try {
    const rawData = await fs.readFile(RAW_MOVIES_FILE, 'utf-8');
    const { movies: rawMovies }: { movies: RawMovie[] } = JSON.parse(rawData);

    const chunkSize = 10;
    const chunks = chunkArray(rawMovies, chunkSize);

    console.log('generating batch entries...');
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
    console.log(`created ${batchEntries.length} batch entries`);

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
  console.log('\nsubmitting batch job...');

  try {
    console.log('uploading batch file...');
    const file = await client.files.create({
      file: createReadStream(BATCH_FILE),
      purpose: 'batch',
    });
    console.log(`uploaded batch file: ${file.id}`);

    console.log('creating batch...');
    const batch = await client.batches.create({
      input_file_id: file.id,
      endpoint: '/v1/responses',
      completion_window: '24h',
    });
    console.log(`created batch job: ${batch.id}`);

    console.log('successfully submitted batch job for movie martial arts classification');
    return batch.id;
  } catch (error) {
    console.error('failed to submit batch', error);
    throw error;
  }
}

async function pollBatch(batchId: string): Promise<OpenAI.Batch> {
  console.log(`\npolling batch: ${batchId}...`);

  while (true) {
    try {
      const batch = await client.batches.retrieve(batchId);

      if (batch.status === 'completed') {
        console.log(`[${new Date().toISOString()}] batch completed`);
        return batch;
      } else if (batch.status === 'in_progress') {
        const { completed = 0, failed = 0, total = 0 } = batch.request_counts || {};
        console.log(`[${new Date().toISOString()}] completed ${completed}/${total} requests, ${failed} failed`);
      } else if (batch.status === 'failed' || batch.status === 'expired') {
        throw new Error(`batch unsuccessful: ${batch.status}`);
      } else {
        console.log(`[${new Date().toISOString()}] batch status: ${batch.status}`);
      }

      await new Promise((resolve) => setTimeout(resolve, 60_000));
    } catch (error) {
      console.error('error polling batch', error);
      throw error;
    }
  }
}
//remove redundant try cathces

async function retrieveBatchResults(batch: OpenAI.Batch): Promise<string> {
  console.log('\nretrieving batch results...');

  if (!batch.output_file_id) {
    throw new Error('batch completed but output file not found');
  }

  console.log(`downloading results from batch output file: ${batch.output_file_id}...`);
  const fileResponse = await client.files.content(batch.output_file_id);
  const fileContents = await fileResponse.text();
  console.log(fileContents); //del

  console.log('successfully downloaded batch results');
  return fileContents;
}

function parseBatchResults(fileContents: string): ClassificationResult[] {
  console.log('\nparsing batch results...');

  try {
    const lines = fileContents
      .trim()
      .split('\n')
      .map((l) => JSON.parse(l));
    console.log(lines); //del

    const results: ClassificationResult[] = [];
    for (const line of lines) {
      try {
        const responseText = line.response.body.output[1].content[0].text;
        console.log(JSON.parse(responseText)); //del
        results.push(JSON.parse(responseText));
      } catch {
        console.error(`failed to parse: ${line}`);
      }
    }

    console.log(`successfully parsed ${results.length}/${lines.length} batch entries`);
    return results;
  } catch (error) {
    console.error('failed to parse batch results', error);
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
    console.log('starting data processing and martial arts classification pipeline...');

    // await buildBatchFile();
    // const batchId = await submitBatch();
    const batch = await pollBatch('batch_68bcbe465e2c8190896baf5fb099bff1');
    const batchResults = await retrieveBatchResults(batch);
    const classifications = parseBatchResults(batchResults);

    // dont forget \n before this
    console.log('successfully completed the data processing pipeline');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
