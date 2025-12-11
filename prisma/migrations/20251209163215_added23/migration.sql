-- CreateEnum
CREATE TYPE "BusinessType" AS ENUM ('Hotel', 'Restaurant', 'Cafe');

-- AlterTable
ALTER TABLE "Hotel" ADD COLUMN     "type" "BusinessType" NOT NULL DEFAULT 'Hotel';
