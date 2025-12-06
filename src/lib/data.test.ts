import { describe, test, expect, vi } from 'vitest';
import { prismaMock } from '@/__mocks__/prisma';
import { fetchMartialArt } from '@/lib/data';

vi.mock('@/lib/prisma', () => ({ default: prismaMock }));

describe('fetchMartialArt', () => {
  test('returns martial art data when found', async () => {
    const mockResult = { name: 'Kung Fu' };
    prismaMock.martialArt.findUnique.mockResolvedValue(mockResult as any);
    const result = await fetchMartialArt('kung-fu');

    expect(prismaMock.martialArt.findUnique).toHaveBeenCalledWith({
      where: { slug: 'kung-fu' },
      select: { name: true },
    });
    expect(result).toEqual(mockResult);
  });

  test('returns null when martial art is not found', async () => {
    prismaMock.martialArt.findUnique.mockResolvedValue(null);
    const result = await fetchMartialArt('x');

    expect(result).toBeNull();
  });

  test('throws an error when Prisma throws internally', async () => {
    const dbError = new Error('DB connection failed');
    prismaMock.martialArt.findUnique.mockRejectedValue(dbError);

    await expect(fetchMartialArt('kung-fu')).rejects.toThrow('Failed to fetch martial art data');
  });
});
