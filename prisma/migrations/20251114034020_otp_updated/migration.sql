-- CreateEnum
CREATE TYPE "OtpTypeEnum" AS ENUM ('Email', 'Phone');

-- CreateEnum
CREATE TYPE "OtpPurposeTypeEnum" AS ENUM ('Login', 'Verification', 'PasswordReset', 'Other');

-- AlterTable
ALTER TABLE "OTP" ADD COLUMN     "purpose" "OtpPurposeTypeEnum" NOT NULL DEFAULT 'Login',
ADD COLUMN     "type" "OtpTypeEnum" NOT NULL DEFAULT 'Email';
