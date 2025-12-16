import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { usePathname, useSearchParams } from 'next/navigation';
import PaginationBar from '@/components/Pagination';
import generatePagination from '@/lib/pagination';

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
}));

vi.mock('@/lib/pagination', () => ({
  default: vi.fn(() => [1, 2, 3]),
}));

describe('PaginationBar', () => {
  const renderWithParams = (searchParams = '', totalPages = 3) => {
    vi.mocked(usePathname).mockReturnValue('/movies');
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams(searchParams) as any);
    return render(<PaginationBar totalPages={totalPages} />);
  };

  test('removes the page param when navigating to page 1', () => {
    renderWithParams('page=3');

    const page1Btn = screen.getByRole('link', { name: '1' });
    expect(page1Btn).toHaveAttribute('href', '/movies?');
  });

  test('sets the correct page param when navigating to a page > 1', () => {
    renderWithParams('page=2');

    const page3Btn = screen.getByRole('link', { name: '3' });
    expect(page3Btn).toHaveAttribute('href', '/movies?page=3');
  });

  test('preserves other search params when changing pages', () => {
    renderWithParams('genre=action&sort=asc');

    const page2Btn = screen.getByRole('link', { name: '2' });
    expect(page2Btn).toHaveAttribute('href', '/movies?genre=action&sort=asc&page=2');
  });

  test('defaults to page 1 when no page param exists', () => {
    renderWithParams();

    const page1Btn = screen.getByRole('link', { name: '1' });
    expect(page1Btn).toHaveAttribute('data-active', 'true');
  });

  test('disables previous button when on page 1', () => {
    renderWithParams();

    const prevBtn = screen.getByRole('link', { name: 'Go to previous page' });
    expect(prevBtn).toHaveAttribute('aria-disabled', 'true');
    expect(prevBtn).toHaveClass('pointer-events-none');
  });

  test('enables previous button when on page > 1', () => {
    renderWithParams('page=3');

    const prevBtn = screen.getByRole('link', { name: 'Go to previous page' });
    expect(prevBtn).toHaveAttribute('aria-disabled', 'false');
    expect(prevBtn).not.toHaveClass('pointer-events-none');
    expect(prevBtn).toHaveAttribute('href', '/movies?page=2');
  });

  test('disables next button when on the last page', () => {
    renderWithParams('page=3');

    const nextBtn = screen.getByRole('link', { name: 'Go to next page' });
    expect(nextBtn).toHaveAttribute('aria-disabled', 'true');
    expect(nextBtn).toHaveClass('pointer-events-none');
  });

  test('enables next button when before the last page', () => {
    renderWithParams('page=2');

    const nextBtn = screen.getByRole('link', { name: 'Go to next page' });
    expect(nextBtn).toHaveAttribute('aria-disabled', 'false');
    expect(nextBtn).not.toHaveClass('pointer-events-none');
    expect(nextBtn).toHaveAttribute('href', '/movies?page=3');
  });

  test('highlights the current page as active', () => {
    renderWithParams('page=2');

    const currentPage = screen.getByRole('link', { name: '2' });
    expect(currentPage).toHaveAttribute('data-active', 'true');
  });

  test('renders ellipsis correctly', () => {
    vi.mocked(generatePagination).mockReturnValueOnce([1, 2, 3, '...', 9, 10]);

    renderWithParams('', 10);

    const ellipsis = screen.getByText('More pages');
    expect(ellipsis).toBeInTheDocument();
  });
});
