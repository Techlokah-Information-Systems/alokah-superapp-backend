-- CreateTable
CREATE TABLE "HotelAccommodation" (
    "id" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "isAccommodationAvailable" BOOLEAN NOT NULL DEFAULT false,
    "totalFloors" INTEGER NOT NULL DEFAULT 1,
    "totalRooms" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HotelAccommodation_pkey" PRIMARY KEY ("id")
);
