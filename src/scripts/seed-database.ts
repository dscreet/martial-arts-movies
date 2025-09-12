// seed db
import { prisma } from '@/lib/prisma';

// createMany() doesn't fully support sqlite where you can avoid duplicates - need to use upsert()

async function seedMartialArts() {}

async function seedGenres() {}

async function seedCountries() {}

async function seedMovies() {}

async function main() {
  try {
    console.log('starting database seeding...');

    await seedMartialArts();
    await seedGenres();
    await seedCountries();
    await seedMovies();

    console.log('successfully completed seeding the database');
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
