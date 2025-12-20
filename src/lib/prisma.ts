import { PrismaClient } from '@prisma/client';
import path from 'path';

// typed reference to global object
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const filePath = path.join(process.cwd(), 'prisma/dev.db');
const config = {
  datasources: {
    db: {
      url: 'file:' + filePath,
    },
  },
};

// ensures reusing client if exists
const prisma = globalForPrisma.prisma ?? new PrismaClient(config);

// prevents creating multiple connections during hot reload in dev
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
