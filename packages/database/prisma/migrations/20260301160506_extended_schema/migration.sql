-- CreateEnum
CREATE TYPE "AdCategory" AS ENUM ('NEKRETNINE', 'BIJELA_TEHNIKA', 'AUTOMOBILI');

-- CreateEnum
CREATE TYPE "AdType" AS ENUM ('PRODAJA', 'IZNAJMLJIVANJE');

-- CreateEnum
CREATE TYPE "AdStatus" AS ENUM ('AKTIVNO', 'NEAKTIVNO', 'PRODATO', 'IZNAJMLJENO');

-- CreateEnum
CREATE TYPE "RealEstateType" AS ENUM ('STAN', 'KUCA', 'POSLOVNI_PROSTOR');

-- CreateEnum
CREATE TYPE "HeatingType" AS ENUM ('CENTRALNO', 'ETAZNO', 'PLIN', 'STRUJA', 'PELET', 'KRUTO_GORIVO', 'TOPLOTNA_PUMPA', 'KLIMA');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('AUTOMOBIL', 'TERETNO', 'MOTOCIKL');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('BENZIN', 'DIZEL', 'HIBRID', 'ELEKTRICNI', 'PLIN');

-- CreateEnum
CREATE TYPE "Transmission" AS ENUM ('MANUELNI', 'AUTOMATIK');

-- CreateEnum
CREATE TYPE "ItemCondition" AS ENUM ('NOVO', 'KAO_NOVO', 'DOBRO', 'ZADOVOLJAVAJUCE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phone" TEXT;

-- CreateTable
CREATE TABLE "Ad" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "category" "AdCategory" NOT NULL,
    "type" "AdType" NOT NULL,
    "status" "AdStatus" NOT NULL DEFAULT 'AKTIVNO',
    "userId" TEXT NOT NULL,
    "locationId" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RealEstate" (
    "id" TEXT NOT NULL,
    "adId" TEXT NOT NULL,
    "realEstateType" "RealEstateType" NOT NULL,
    "surface" DECIMAL(8,2) NOT NULL,
    "rooms" INTEGER,
    "bathrooms" INTEGER,
    "floor" INTEGER,
    "totalFloors" INTEGER,
    "yearBuilt" INTEGER,
    "heating" "HeatingType",
    "parking" BOOLEAN NOT NULL DEFAULT false,
    "elevator" BOOLEAN NOT NULL DEFAULT false,
    "balcony" BOOLEAN NOT NULL DEFAULT false,
    "terrace" BOOLEAN NOT NULL DEFAULT false,
    "garden" BOOLEAN NOT NULL DEFAULT false,
    "furnished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RealEstate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhiteGoods" (
    "id" TEXT NOT NULL,
    "adId" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "condition" "ItemCondition" NOT NULL,
    "yearOfManufacture" INTEGER,
    "warranty" BOOLEAN NOT NULL DEFAULT false,
    "warrantyMonths" INTEGER,
    "energyClass" TEXT,
    "capacity" TEXT,
    "features" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhiteGoods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "adId" TEXT NOT NULL,
    "vehicleType" "VehicleType" NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "yearOfManufacture" INTEGER NOT NULL,
    "mileage" INTEGER NOT NULL,
    "fuelType" "FuelType" NOT NULL,
    "transmission" "Transmission" NOT NULL,
    "enginePower" INTEGER,
    "engineVolume" INTEGER,
    "condition" "ItemCondition" NOT NULL,
    "registeredUntil" TIMESTAMP(3),
    "color" TEXT,
    "doors" INTEGER,
    "seats" INTEGER,
    "airbags" BOOLEAN NOT NULL DEFAULT false,
    "abs" BOOLEAN NOT NULL DEFAULT false,
    "airConditioning" BOOLEAN NOT NULL DEFAULT false,
    "parkingSensors" BOOLEAN NOT NULL DEFAULT false,
    "cruiseControl" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Bosna i Hercegovina',
    "city" TEXT NOT NULL,
    "municipality" TEXT,
    "address" TEXT,
    "postalCode" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "adId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "adId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "adId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT NOT NULL,
    "replied" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Ad_userId_idx" ON "Ad"("userId");

-- CreateIndex
CREATE INDEX "Ad_category_idx" ON "Ad"("category");

-- CreateIndex
CREATE INDEX "Ad_type_idx" ON "Ad"("type");

-- CreateIndex
CREATE INDEX "Ad_status_idx" ON "Ad"("status");

-- CreateIndex
CREATE INDEX "Ad_createdAt_idx" ON "Ad"("createdAt");

-- CreateIndex
CREATE INDEX "Ad_featured_idx" ON "Ad"("featured");

-- CreateIndex
CREATE UNIQUE INDEX "RealEstate_adId_key" ON "RealEstate"("adId");

-- CreateIndex
CREATE INDEX "RealEstate_realEstateType_idx" ON "RealEstate"("realEstateType");

-- CreateIndex
CREATE UNIQUE INDEX "WhiteGoods_adId_key" ON "WhiteGoods"("adId");

-- CreateIndex
CREATE INDEX "WhiteGoods_brand_idx" ON "WhiteGoods"("brand");

-- CreateIndex
CREATE INDEX "WhiteGoods_condition_idx" ON "WhiteGoods"("condition");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_adId_key" ON "Vehicle"("adId");

-- CreateIndex
CREATE INDEX "Vehicle_vehicleType_idx" ON "Vehicle"("vehicleType");

-- CreateIndex
CREATE INDEX "Vehicle_brand_idx" ON "Vehicle"("brand");

-- CreateIndex
CREATE INDEX "Vehicle_yearOfManufacture_idx" ON "Vehicle"("yearOfManufacture");

-- CreateIndex
CREATE INDEX "Vehicle_fuelType_idx" ON "Vehicle"("fuelType");

-- CreateIndex
CREATE INDEX "Location_city_idx" ON "Location"("city");

-- CreateIndex
CREATE INDEX "Location_municipality_idx" ON "Location"("municipality");

-- CreateIndex
CREATE INDEX "Image_adId_idx" ON "Image"("adId");

-- CreateIndex
CREATE INDEX "Image_order_idx" ON "Image"("order");

-- CreateIndex
CREATE INDEX "Favorite_userId_idx" ON "Favorite"("userId");

-- CreateIndex
CREATE INDEX "Favorite_adId_idx" ON "Favorite"("adId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_adId_key" ON "Favorite"("userId", "adId");

-- CreateIndex
CREATE INDEX "Contact_adId_idx" ON "Contact"("adId");

-- CreateIndex
CREATE INDEX "Contact_userId_idx" ON "Contact"("userId");

-- CreateIndex
CREATE INDEX "Contact_replied_idx" ON "Contact"("replied");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Ad" ADD CONSTRAINT "Ad_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ad" ADD CONSTRAINT "Ad_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RealEstate" ADD CONSTRAINT "RealEstate_adId_fkey" FOREIGN KEY ("adId") REFERENCES "Ad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhiteGoods" ADD CONSTRAINT "WhiteGoods_adId_fkey" FOREIGN KEY ("adId") REFERENCES "Ad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_adId_fkey" FOREIGN KEY ("adId") REFERENCES "Ad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_adId_fkey" FOREIGN KEY ("adId") REFERENCES "Ad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_adId_fkey" FOREIGN KEY ("adId") REFERENCES "Ad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_adId_fkey" FOREIGN KEY ("adId") REFERENCES "Ad"("id") ON DELETE CASCADE ON UPDATE CASCADE;
