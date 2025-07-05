-- CreateTable
CREATE TABLE "UserContext" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserContext_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicWork" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AcademicWork_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserContext_userId_idx" ON "UserContext"("userId");

-- CreateIndex
CREATE INDEX "AcademicWork_userId_idx" ON "AcademicWork"("userId");
