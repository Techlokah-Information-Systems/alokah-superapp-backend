-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "alternateCountryCode" TEXT,
ADD COLUMN     "countryCode" TEXT NOT NULL DEFAULT '+91';
