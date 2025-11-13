/*
  Warnings:

  - You are about to drop the column `quantity` on the `InventoryItem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sku]` on the table `InventoryItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sku` to the `InventoryItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InventoryItem" DROP COLUMN "quantity",
ADD COLUMN     "sku" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "AlokahInventoryItem" (
    "id" TEXT NOT NULL,
    "inventoryId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "sku" TEXT NOT NULL,
    "stock" DOUBLE PRECISION NOT NULL,
    "minOrderQuantity" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "minStockThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "metrics" "MetricsEnum" NOT NULL DEFAULT 'Kg',
    "shelfLifeDays" INTEGER NOT NULL,
    "isHotItem" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "itemType" "ItemTypeEnum" NOT NULL DEFAULT 'Other',

    CONSTRAINT "AlokahInventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AlokahInventoryItem_sku_key" ON "AlokahInventoryItem"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItem_sku_key" ON "InventoryItem"("sku");

-- AddForeignKey
ALTER TABLE "AlokahInventoryItem" ADD CONSTRAINT "AlokahInventoryItem_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "AlokahInventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
