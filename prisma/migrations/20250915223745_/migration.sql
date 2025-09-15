/*
  Warnings:

  - Added the required column `slug` to the `MartialArt` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MartialArt" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL
);
INSERT INTO "new_MartialArt" ("id", "name") SELECT "id", "name" FROM "MartialArt";
DROP TABLE "MartialArt";
ALTER TABLE "new_MartialArt" RENAME TO "MartialArt";
CREATE UNIQUE INDEX "MartialArt_name_key" ON "MartialArt"("name");
CREATE UNIQUE INDEX "MartialArt_slug_key" ON "MartialArt"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
