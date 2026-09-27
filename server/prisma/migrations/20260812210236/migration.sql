-- CreateTable
CREATE TABLE "customer_queries" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "replied" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_queries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "customer_queries_email_idx" ON "customer_queries"("email");
