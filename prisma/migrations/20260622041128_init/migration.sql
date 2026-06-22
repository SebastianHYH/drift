-- CreateTable
CREATE TABLE "Letter" (
    "id" TEXT NOT NULL,
    "authorToken" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "claimedBy" TEXT,
    "claimedAt" TIMESTAMP(3),

    CONSTRAINT "Letter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reply" (
    "id" TEXT NOT NULL,
    "letterId" TEXT NOT NULL,
    "responderToken" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reply_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Letter_claimedBy_idx" ON "Letter"("claimedBy");

-- CreateIndex
CREATE INDEX "Letter_authorToken_idx" ON "Letter"("authorToken");

-- CreateIndex
CREATE INDEX "Letter_expiresAt_idx" ON "Letter"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Reply_letterId_key" ON "Reply"("letterId");

-- AddForeignKey
ALTER TABLE "Reply" ADD CONSTRAINT "Reply_letterId_fkey" FOREIGN KEY ("letterId") REFERENCES "Letter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
