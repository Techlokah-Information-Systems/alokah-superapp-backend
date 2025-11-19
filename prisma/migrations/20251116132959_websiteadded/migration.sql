-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OtpTypeEnum" ADD VALUE 'Username';
ALTER TYPE "OtpTypeEnum" ADD VALUE 'Password';

-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "website" TEXT,
ALTER COLUMN "email" DROP NOT NULL;
