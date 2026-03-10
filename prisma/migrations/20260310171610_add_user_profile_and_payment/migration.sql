-- AlterTable
ALTER TABLE "users" ADD COLUMN     "city" TEXT,
ADD COLUMN     "cnpj" TEXT,
ADD COLUMN     "hasPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paidUntil" TIMESTAMP(3),
ADD COLUMN     "serviceType" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "whatsapp" TEXT,
ADD COLUMN     "workflow" TEXT;
