import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sort from '@/components/Sort';
import userEvent from '@testing-library/user-event';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

describe('Sort', () => {
  const renderWithParams = (search = '') => {
    const mockPush = vi.fn();
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any);
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams(search) as any);

    return {
      user: userEvent.setup(),
      mockPush,
      ...render(<Sort />),
    };
  };

  test('defaults to Newest when param is missing', () => {
    renderWithParams();

    const dropdownButton = screen.getByRole('combobox');
    expect(dropdownButton).toHaveTextContent('Newest');
  });

  test('displays selected option when param is set', () => {
    renderWithParams('sort=title-asc');

    const dropdownButton = screen.getByRole('combobox');
    expect(dropdownButton).toHaveTextContent('Title (A-Z)');
  });

  test('updates param when sort option is changed', async () => {
    const { user, mockPush } = renderWithParams();

    const dropdownButton = screen.getByRole('combobox');
    await user.click(dropdownButton);

    const oldestOption = screen.getByRole('option', { name: 'Oldest' });
    await user.click(oldestOption);

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('?sort=release-asc', { scroll: false });
  });

  test('preserves other search params when sort changes', async () => {
    const { user, mockPush } = renderWithParams('genre=action&martial-art=kung-fu&sort=release-asc');

    const dropdownButton = screen.getByRole('combobox');
    await user.click(dropdownButton);

    const newestOption = screen.getByRole('option', { name: 'Newest' });
    await user.click(newestOption);

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('?genre=action&martial-art=kung-fu&sort=release-desc', { scroll: false });
  });
});
