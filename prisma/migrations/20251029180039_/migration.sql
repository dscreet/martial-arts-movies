/*
  Warnings:

  - Made the column `slug` on table `Genre` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Genre" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL
);
INSERT INTO "new_Genre" ("id", "name", "slug") SELECT "id", "name", "slug" FROM "Genre";
DROP TABLE "Genre";
ALTER TABLE "new_Genre" RENAME TO "Genre";
CREATE UNIQUE INDEX "Genre_name_key" ON "Genre"("name");
CREATE UNIQUE INDEX "Genre_slug_key" ON "Genre"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
