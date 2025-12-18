-- CreateEnum
CREATE TYPE "SecretsTypeEnum" AS ENUM ('API', 'AUTH', 'JWT');

-- CreateTable
CREATE TABLE "Secrets" (
    "id" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "SecretsTypeEnum" NOT NULL DEFAULT 'API',

    CONSTRAINT "Secrets_pkey" PRIMARY KEY ("id")
);
