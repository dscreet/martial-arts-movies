import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, useSearchParams } from 'next/navigation';
import { describe, expect, test, vi } from 'vitest';

import SelectFilter from '@/components/SingleSelectFilter';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

describe('SelectFilter', () => {
  const renderWithParams = (search = '') => {
    const mockPush = vi.fn();
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any);
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams(search) as any);

    return {
      user: userEvent.setup(),
      mockPush,
      ...render(
        <SelectFilter
          label="genres"
          paramKey="genre"
          options={[
            { id: 1, name: 'Action', value: 'action' },
            { id: 2, name: 'Adventure', value: 'adventure' },
          ]}
        />
      ),
    };
  };

  test('defaults to all when the filter param is missing', () => {
    renderWithParams();

    const dropdownButton = screen.getByRole('combobox');
    expect(dropdownButton).toHaveTextContent('All genres');
  });

  test('displays selected option when param is set', () => {
    renderWithParams('genre=action');

    const dropdownButton = screen.getByRole('combobox');
    expect(dropdownButton).toHaveTextContent('Action');
  });

  test('removes param when selecting "All"', async () => {
    const { user, mockPush } = renderWithParams('genre=action');

    const dropdownButton = screen.getByRole('combobox');
    await user.click(dropdownButton);

    const allOption = screen.getByRole('option', { name: 'All genres' });
    await user.click(allOption);

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('?');
  });

  test('sets param when selecting a specific option', async () => {
    const { user, mockPush } = renderWithParams();

    const dropdownButton = screen.getByRole('combobox');
    await user.click(dropdownButton);

    const advOption = screen.getByRole('option', { name: 'Adventure' });
    await user.click(advOption);

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('?genre=adventure');
  });

  test('removes page param when filter changes', async () => {
    const { user, mockPush } = renderWithParams('genre=action&page=3');

    const dropdownButton = screen.getByRole('combobox');
    await user.click(dropdownButton);

    const advOption = screen.getByRole('option', { name: 'Adventure' });
    await user.click(advOption);

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('?genre=adventure');
  });

  test('preserves other search params when filter changes', async () => {
    const { user, mockPush } = renderWithParams('genre=action&martial-art=kung-fu&sort=release-desc');

    const dropdownButton = screen.getByRole('combobox');
    await user.click(dropdownButton);

    const advOption = screen.getByRole('option', { name: 'Adventure' });
    await user.click(advOption);

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('?genre=adventure&martial-art=kung-fu&sort=release-desc');
  });

  test('displays all options', async () => {
    const { user } = renderWithParams();

    const dropdownButton = screen.getByRole('combobox');
    await user.click(dropdownButton);

    expect(screen.getByRole('option', { name: 'All genres' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Action' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Adventure' })).toBeInTheDocument();
  });
});
