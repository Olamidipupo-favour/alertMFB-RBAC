/*
  Warnings:

  - You are about to drop the column `user_id` on the `Role` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Role" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "permissions" TEXT NOT NULL
);
INSERT INTO "new_Role" ("id", "name", "permissions") SELECT "id", "name", "permissions" FROM "Role";
DROP TABLE "Role";
ALTER TABLE "new_Role" RENAME TO "Role";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
