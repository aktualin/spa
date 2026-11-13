-- CreateTable
CREATE TABLE "ContentImage" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "altText" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContentImage_entityType_entityId_sortOrder_idx" ON "ContentImage"("entityType", "entityId", "sortOrder");
