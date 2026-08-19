/*
  Warnings:

  - Made the column `categoryId` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/

-- Create default category if it does not exist
INSERT INTO "Category" ("id", "name", "updatedAt")
VALUES ('category_other', 'Other', CURRENT_TIMESTAMP)
    ON CONFLICT ("name") DO NOTHING;

-- Backfill existing products without category
UPDATE "Product"
SET "categoryId" = (
    SELECT "id" FROM "Category" WHERE "name" = 'Other'
)
WHERE "categoryId" IS NULL;

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_categoryId_fkey";

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "categoryId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;