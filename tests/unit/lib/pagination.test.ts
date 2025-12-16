import { describe, test, expect } from 'vitest';
import generatePagination from '@/lib/pagination';

describe('generatePagination', () => {
  test('returns all pages when totalPages is 7 or less', () => {
    expect(generatePagination(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(generatePagination(7, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  test('returns first 3 pages, ellipsis, and last 2 pages when currentPage is within the first 3', () => {
    expect(generatePagination(1, 8)).toEqual([1, 2, 3, '...', 7, 8]);
    expect(generatePagination(3, 10)).toEqual([1, 2, 3, '...', 9, 10]);
  });

  test('returns first 2 pages, ellipsis, and last 3 pages when currentPage is within the last 3', () => {
    expect(generatePagination(8, 10)).toEqual([1, 2, '...', 8, 9, 10]);
    expect(generatePagination(20, 20)).toEqual([1, 2, '...', 18, 19, 20]);
  });

  test('returns first page, ellipsis, surrounding pages, ellipsis, and last page when in the middle', () => {
    expect(generatePagination(4, 10)).toEqual([1, '...', 3, 4, 5, '...', 10]);
    expect(generatePagination(7, 10)).toEqual([1, '...', 6, 7, 8, '...', 10]);
  });
});
