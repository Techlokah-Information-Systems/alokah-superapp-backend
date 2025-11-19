/*
  Warnings:

  - You are about to drop the column `hotelTypeId` on the `Hotel` table. All the data in the column will be lost.
  - You are about to drop the `HotelType` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Hotel" DROP CONSTRAINT "Hotel_hotelTypeId_fkey";

-- AlterTable
ALTER TABLE "Hotel" DROP COLUMN "hotelTypeId",
ADD COLUMN     "hotelType" "HotelTypeEnum" NOT NULL DEFAULT 'Veg';

-- DropTable
DROP TABLE "HotelType";
