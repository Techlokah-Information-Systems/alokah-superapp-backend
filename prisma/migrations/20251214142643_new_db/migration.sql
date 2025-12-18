/*
  Warnings:

  - You are about to drop the column `username` on the `AlokahUser` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[associateId]` on the table `AlokahUser` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "AlokahUser_username_key";

-- AlterTable
ALTER TABLE "AlokahUser" DROP COLUMN "username",
ADD COLUMN     "associateId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "AlokahUser_associateId_key" ON "AlokahUser"("associateId");
