import { PrismaClient } from '@prisma/client';

// typed reference to global object
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// ensures reusing client if exists
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// prevents creating multiple connections during hot reload in dev
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
