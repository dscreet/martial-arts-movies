import { describe, test, expect, vi } from 'vitest';
import prismaMock from '@/__mocks__/prisma';
import { fetchMartialArt } from '@/lib/data';

vi.mock('@/lib/prisma');

describe('fetchMartialArt', () => {
  test('returns martial art data when found', async () => {
    const mockResult = { name: 'Kung Fu' };
    prismaMock.martialArt.findUnique.mockResolvedValue(mockResult as any);

    const result = await fetchMartialArt('kung-fu');

    expect(result).toEqual(mockResult);
  });
});
