//TODO: script explanation

import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { Genre, Country, ProcessedMovie } from '@/types/common';

dotenv.config();

// --- File paths ---
const MARTIAL_ARTS_FILE = path.resolve(__dirname, '../data/martial-arts.json');
const GENRES_FILE = path.resolve(__dirname, '../data/genres.json');
const COUNTRIES_FILE = path.resolve(__dirname, '../data/countries.json');
const MOVIES_FILE = path.resolve(__dirname, '../data/processed-movies.json');

// --- Helpers ---
async function readJson<T>(filePath: string): Promise<{ data: T[] }> {
  const file = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(file);
}

// --- Seed functions ---
// createMany() doesn't fully support sqlite where you can avoid duplicates - need to use upsert()
async function seedMartialArts() {
  console.log(`\nseeding martial arts data...`);

  const { data: martialArts } = await readJson<string>(MARTIAL_ARTS_FILE);

  const results = await prisma.$transaction(
    martialArts.map((name) =>
      prisma.martialArt.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );

  console.log(`successfully inserted ${results.length} martial arts`);
}

async function seedGenres() {
  console.log(`\nseeding genres data...`);

  const { data: genres } = await readJson<Genre>(GENRES_FILE);

  const results = await prisma.$transaction(
    genres.map((genre) =>
      prisma.genre.upsert({
        where: { id: genre.id },
        update: {},
        create: { id: genre.id, name: genre.name },
      })
    )
  );

  console.log(`successfully inserted ${results.length} genres`);
}

async function seedCountries() {
  console.log(`\nseeding countries data...`);

  const { data: countries } = await readJson<Country>(COUNTRIES_FILE);

  const results = await prisma.$transaction(
    countries.map((country) =>
      prisma.country.upsert({
        where: { code: country.iso_3166_1 },
        update: {},
        create: { name: country.english_name, code: country.iso_3166_1 },
      })
    )
  );

  console.log(`successfully inserted ${results.length} countries`);
}

async function seedMovies() {
  console.log(`\nseeding movies data...`);

  const { data: movies } = await readJson<ProcessedMovie>(MOVIES_FILE);

  const results = await prisma.$transaction(
    movies.map((movie) =>
      prisma.movie.upsert({
        where: { tmdbId: movie.tmdbId },
        update: {},
        create: {
          tmdbId: movie.tmdbId,
          title: movie.title,
          overview: movie.overview,
          releaseDate: movie.releaseDate ? new Date(movie.releaseDate) : null,
          posterPath: movie.posterPath,
          backdropPath: movie.backdropPath,

          primaryMartialArt: {
            connect: { name: movie.primaryMartialArt },
          },

          martialArts: {
            connect: movie.martialArts.map((name) => ({ name })),
          },

          genres: {
            connect: movie.genres.map((genre) => ({ id: genre.id })),
          },

          countries: {
            connect: movie.countries.map((code) => ({ code })),
          },
        },
      })
    )
  );

  console.log(`successfully inserted ${results.length} movies`);
}

// --- Seed runner ---
async function main() {
  try {
    console.log('starting database seeding...');

    await seedMartialArts();
    await seedGenres();
    await seedCountries();
    await seedMovies();

    console.log('successfully completed database seeding');
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
