-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "addedByUserId" INTEGER;

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "lastLoginAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_addedByUserId_fkey" FOREIGN KEY ("addedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
