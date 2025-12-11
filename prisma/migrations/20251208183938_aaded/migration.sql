-- CreateEnum
CREATE TYPE "UserScopeEnum" AS ENUM ('Hotel', 'Personal', 'Alokah', 'Vendor');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "scope" "UserScopeEnum" NOT NULL DEFAULT 'Personal';
