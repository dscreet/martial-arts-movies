import type { PrismaClient } from '@prisma/client';
import { beforeEach } from 'vitest';
import { type DeepMockProxy, mockDeep, mockReset } from 'vitest-mock-extended';

beforeEach(() => {
  mockReset(prismaMock);
});

export const prismaMock = mockDeep<PrismaClient>();
export type PrismaMock = DeepMockProxy<PrismaClient>;
