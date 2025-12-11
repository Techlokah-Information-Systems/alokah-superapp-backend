-- CreateEnum
CREATE TYPE "ContactForEnum" AS ENUM ('Hotel', 'Personal', 'Alokah', 'Vendor');

-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "contactFor" "ContactForEnum" NOT NULL DEFAULT 'Hotel';
