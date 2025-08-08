/*
  Warnings:

  - You are about to drop the column `url` on the `File` table. All the data in the column will be lost.
  - Added the required column `name` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `path` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."File" DROP COLUMN "url",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "path" TEXT NOT NULL;
