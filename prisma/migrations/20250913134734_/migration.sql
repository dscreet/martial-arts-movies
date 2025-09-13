-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Movie" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tmdbId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "overview" TEXT NOT NULL,
    "releaseDate" DATETIME,
    "posterPath" TEXT NOT NULL,
    "backdropPath" TEXT NOT NULL,
    "primaryMartialArtId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Movie_primaryMartialArtId_fkey" FOREIGN KEY ("primaryMartialArtId") REFERENCES "MartialArt" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Movie" ("backdropPath", "createdAt", "id", "overview", "posterPath", "primaryMartialArtId", "releaseDate", "title", "tmdbId", "updatedAt") SELECT "backdropPath", "createdAt", "id", "overview", "posterPath", "primaryMartialArtId", "releaseDate", "title", "tmdbId", "updatedAt" FROM "Movie";
DROP TABLE "Movie";
ALTER TABLE "new_Movie" RENAME TO "Movie";
CREATE UNIQUE INDEX "Movie_tmdbId_key" ON "Movie"("tmdbId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
