/*
  Warnings:

  - A unique constraint covering the columns `[sku]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sku` to the `Product` table. Existing products will be backfilled from their id.

*/

-- 1. Add sku as nullable first
ALTER TABLE "Product" ADD COLUMN "sku" TEXT;

-- 2. Backfill existing products
UPDATE "Product"
SET "sku" = 'SKU-' || SUBSTRING("id", 1, 8)
WHERE "sku" IS NULL;

-- 3. Make sku required
ALTER TABLE "Product" ALTER COLUMN "sku" SET NOT NULL;

-- 4. Create unique index
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");