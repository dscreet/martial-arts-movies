//TODO: script explanation

import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// --- File paths ---
const GENRES_FILE = path.resolve(__dirname, '../data/genres.json');
const COUNTRIES_FILE = path.resolve(__dirname, '../data/countries.json');
const MOVIES_FILE = path.resolve(__dirname, '../data/processed-movies.json');

// --- Types ---
interface Genre {
  id: number;
  name: string;
}

interface Country {
  iso_3166_1: string;
  english_name: string;
  native_name: string;
}

// --- Helpers ---
async function readJson<T>(filePath: string): Promise<{ data: T[] }> {
  const file = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(file);
}

// --- Seed functions ---
// createMany() doesn't fully support sqlite where you can avoid duplicates - need to use upsert()
async function seedMartialArts() {
  console.log(`\nseeding martial arts data...`);

  const martialArts = [
    'Aikido',
    'Boxing',
    'Capoeira',
    'Jeet Kune Do',
    'Jiu-Jitsu',
    'Judo',
    'Karate',
    'Kendo',
    'Kenjutsu',
    'Keysi',
    'Kickboxing',
    'Krav Maga',
    'Kung Fu',
    'MMA',
    'Muay Thai',
    'Ninjutsu',
    'Sambo',
    'Savate',
    'Silat',
    'Taekwondo',
    'Wrestling',
    'Other',
  ];

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

async function seedMovies() {}

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
