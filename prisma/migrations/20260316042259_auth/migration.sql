
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "createdAt",
DROP COLUMN "description",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Destination" DROP COLUMN "city",
DROP COLUMN "country",
DROP COLUMN "createdAt",
DROP COLUMN "imageUrl",
DROP COLUMN "name",
DROP COLUMN "updatedAt",
ADD COLUMN     "image" TEXT,
ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "rating" DOUBLE PRECISION,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "SavedTrip" DROP COLUMN "createdAt",
DROP COLUMN "endDate",
DROP COLUMN "notes",
DROP COLUMN "startDate",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';

-- CreateIndex
CREATE INDEX "Destination_location_idx" ON "Destination"("location");

-- CreateIndex
CREATE INDEX "Destination_price_idx" ON "Destination"("price");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");
