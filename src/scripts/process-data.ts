// ----------------------------------------------------
// Martial Arts Classification Pipeline
// ----------------------------------------------------
// This script processes raw TMDB movie data by running it
// through OpenAI batch classification to identify martial arts.
//
// Pipeline:
// 1. Build batch file with classification requests
// 2. Submit batch job to OpenAI
// 3. Poll until batch completes
// 4. Retrieve and parse classification results
// 5. Save classification results to JSON
// 6. Process movies (merge raw movie data + classifications)
// 7. Save final processed movies dataset
//
// Output:
// - movie-classifications.json
// - processed-movies.json

import fs from 'fs/promises';
import { createReadStream } from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();
const client = new OpenAI();

// --- File paths ---
const RAW_MOVIES_FILE = path.resolve(__dirname, '../data/movies.json');
const PROCESSED_MOVIES_FILE = path.resolve(__dirname, '../data/processed-movies.json');
const BATCH_FILE = path.resolve(__dirname, '../data/movies-batch.jsonl');
const CLASSIFICATIONS_FILE = path.resolve(__dirname, '../data/movie-classifications.json');

// --- OpenAI ---
const OPENAI_MODEL = 'gpt-5-2025-08-07';
const OPENAI_REASONING = 'medium';
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

// --- Types ---
interface RawMovie {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string;
  backdrop_path: string;
  genres: { id: number; name: string }[];
  origin_country: string[];
}

interface ProcessedMovie {
  tmdbId: number;
  title: string;
  overview: string;
  releaseDate: string;
  posterPath: string;
  backdropPath: string;
  primaryMartialArt: string;
  martialArts: string[];
  genres: { id: number; name: string }[];
  countries: string[];
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

interface ClassificationResult {
  id: number;
  primary: string;
  secondary: string[];
}

interface ClassificationMetadata {
  createdAt: string;
  completedAt: string;
  model: string;
  reasoning: string;
  sourceFile: string;
  classificationCount: number;
  requests: {
    total: number;
    successful: number;
    failed: number;
  };
  tokens: {
    input: number;
    output: number;
    total: number;
  };
}

type ClassificationFile = {
  metadata: ClassificationMetadata;
  data: ClassificationResult[];
};

interface ProcessedMoviesMetadata {
  createdAt: string;
  sourceFile: string;
  classificationFile: string;
  counts: {
    input: number;
    output: number;
    filtered: number;
  };
}

type ProcessedMoviesFile = {
  metadata: ProcessedMoviesMetadata;
  data: ProcessedMovie[];
};

// --- Helpers ---
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

// --- Classification steps ---
async function buildBatchFile(rawMovies: RawMovie[]): Promise<void> {
  console.log('\nbuilding batch file for movie martial arts classification...');

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
        model: OPENAI_MODEL,
        reasoning: {
          effort: OPENAI_REASONING,
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
}

async function submitBatch(): Promise<string> {
  console.log('\nsubmitting batch job...');

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
}

async function pollBatch(batchId: string): Promise<OpenAI.Batch> {
  console.log(`\npolling batch: ${batchId}...`);

  const pollIntervalMs = 60_000;

  while (true) {
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

    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }
}

async function retrieveBatchResults(batch: OpenAI.Batch): Promise<string> {
  console.log('\nretrieving batch results...');

  if (!batch.output_file_id) {
    throw new Error('batch completed but output file not found');
  }

  const fileResponse = await client.files.content(batch.output_file_id);
  const fileContents = await fileResponse.text();

  console.log(`successfully downloaded batch results from batch output file: ${batch.output_file_id}`);
  return fileContents;
}

function parseBatchResults(fileContents: string): ClassificationResult[] {
  console.log('\nparsing batch results...');

  const results: ClassificationResult[] = [];
  const lines = fileContents
    .trim()
    .split('\n')
    .map((l) => JSON.parse(l));

  for (const line of lines) {
    try {
      const responseText = line.response.body.output[1].content[0].text;
      results.push(JSON.parse(responseText));
    } catch {
      console.error(`failed to parse: ${line}`);
    }
  }

  console.log(`successfully parsed ${results.length}/${lines.length} batch entries`);
  return results.flat(); //removes chunks
}

async function saveClassifications(classifications: ClassificationResult[], batch: OpenAI.Batch): Promise<void> {
  console.log(`\nsaving classifications...`);

  const output: ClassificationFile = {
    metadata: {
      createdAt: new Date(batch.created_at * 1000).toISOString(),
      completedAt: new Date(batch.completed_at! * 1000).toISOString(),
      model: OPENAI_MODEL,
      reasoning: OPENAI_REASONING,
      sourceFile: path.basename(RAW_MOVIES_FILE),
      classificationCount: classifications.length,
      requests: {
        total: batch.request_counts?.total ?? 0,
        successful: batch.request_counts?.completed ?? 0,
        failed: batch.request_counts?.failed ?? 0,
      },
      tokens: {
        input: (batch as any).usage.input_tokens ?? 0,
        output: (batch as any).usage.output_tokens ?? 0,
        total: (batch as any).usage.total_tokens ?? 0,
      },
    },
    data: classifications,
  };

  await fs.writeFile(CLASSIFICATIONS_FILE, JSON.stringify(output, null, 2));
  console.log(`successfully saved ${classifications.length} classifications to: ${CLASSIFICATIONS_FILE}`);
}

// --- Movie processing steps ---
async function processMovies(
  rawMovies: RawMovie[],
  classifications: ClassificationResult[]
): Promise<ProcessedMovie[]> {
  console.log(`\nprocessing ${rawMovies.length} movies...`);

  const classificationMap = new Map(classifications.map((c) => [c.id, c]));
  const processedMovies: ProcessedMovie[] = [];

  for (const movie of rawMovies) {
    const classification = classificationMap.get(movie.id);
    // skip movies with no martial arts
    if (!classification?.primary || classification?.primary === 'None') {
      continue;
    }
    processedMovies.push({
      tmdbId: movie.id,
      title: movie.title,
      overview: movie.overview,
      releaseDate: movie.release_date,
      posterPath: movie.poster_path,
      backdropPath: movie.backdrop_path,
      primaryMartialArt: classification.primary,
      martialArts: [classification.primary, ...(classification.secondary ?? [])],
      genres: movie.genres,
      countries: movie.origin_country,
    });
  }

  console.log(`successfully processed ${rawMovies.length} movies`);
  console.log(`${processedMovies.length} outputted movies`);
  return processedMovies;
}

async function saveProcessedMovies(movies: ProcessedMovie[], rawMoviesCount: number): Promise<void> {
  console.log(`\nsaving processed movies...`);

  const output: ProcessedMoviesFile = {
    metadata: {
      createdAt: new Date().toISOString(),
      sourceFile: path.basename(RAW_MOVIES_FILE),
      classificationFile: path.basename(CLASSIFICATIONS_FILE),
      counts: {
        input: rawMoviesCount,
        output: movies.length,
        filtered: rawMoviesCount - movies.length,
      },
    },
    data: movies,
  };

  await fs.writeFile(PROCESSED_MOVIES_FILE, JSON.stringify(output, null, 2));
  console.log(`successfully saved ${movies.length} processed movies to: ${PROCESSED_MOVIES_FILE}\n`);
}

// --- Pipeline ---
async function main() {
  try {
    console.log('starting data processing and martial arts classification pipeline...');

    const rawData = await fs.readFile(RAW_MOVIES_FILE, 'utf-8');
    const { data: rawMovies }: { data: RawMovie[] } = JSON.parse(rawData);

    await buildBatchFile(rawMovies);
    const batchId = await submitBatch();
    const batch = await pollBatch(batchId);
    const batchResults = await retrieveBatchResults(batch);
    const classifications = parseBatchResults(batchResults);
    await saveClassifications(classifications, batch);

    const processedMovies = await processMovies(rawMovies, classifications);
    await saveProcessedMovies(processedMovies, rawMovies.length);

    console.log('successfully completed the data processing pipeline');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
