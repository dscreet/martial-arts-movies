import { expect, type Page, test } from '@playwright/test';

test.describe('Discovery and navigation', () => {
  test('home page loads and displays martial arts', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Martial Arts Movies/);

    await expect(page.getByRole('heading', { name: 'Explore Martial Arts' })).toBeVisible();

    await expect(page.getByRole('link', { name: 'Kung Fu' })).toBeVisible();
  });

  test('navigation links work', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'All movies' }).click();
    await expect(page).toHaveURL('/movies');
    await expect(page.getByRole('heading', { name: 'All movies' })).toBeVisible();

    await page.getByRole('link', { name: 'Home', exact: true }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Explore Martial Arts' })).toBeVisible();
  });

  test('unknown route shows global not found page', async ({ page }) => {
    await page.goto('/invalid-path');

    await expect(page).toHaveTitle(/Page Not Found/);

    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();

    await expect(page.getByRole('link', { name: 'Go home' })).toHaveAttribute('href', '/');
  });
});

test.describe('Martial arts page', () => {
  test('martial arts page renders correctly', async ({ page }) => {
    await page.goto('/martial-arts/kung-fu');

    await expect(page).toHaveTitle(/Kung Fu Movies/);

    await expect(page.getByRole('heading', { name: 'Kung Fu movies' })).toBeVisible();

    await expect(page.getByTestId('movie-list')).toBeVisible();
    await expect(page.getByRole('combobox')).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'pagination' })).toBeVisible();
  });

  test('sorting resets pagination on martial arts page', async ({ page }) => {
    await page.goto('/martial-arts/kung-fu?page=3&sort=release-asc');

    await selectSort(page, 'Oldest', 'Title (A-Z)');
    await expect(page).toHaveURL(/sort=title-asc/);
    await expect(page).not.toHaveURL(/page=/);

    await expect(page.getByTestId('movie-list')).toBeVisible();
  });

  test('pagination preserves sort on martial arts page', async ({ page }) => {
    await page.goto('/martial-arts/kung-fu');

    await selectSort(page, 'Newest', 'Oldest');
    await expect(page).toHaveURL(/sort=release-asc/);

    await page.getByRole('link', { name: /next page/i }).click();

    await expect(page).toHaveURL(/sort=release-asc/);
    await expect(page).toHaveURL(/page=2/);

    await expect(page.getByTestId('movie-list')).toBeVisible();
  });

  test('invalid martial art slug shows martial art not found page', async ({ page }) => {
    await page.goto('/martial-arts/invalid-path');

    await expect(page).toHaveTitle(/Martial Art Not Found/);

    await expect(page.getByRole('heading', { name: 'Martial art not found' })).toBeVisible();

    await expect(page.getByRole('link', { name: 'Explore martial arts' })).toHaveAttribute('href', '/');
  });
});

test.describe('All movies page', () => {
  test('all movies page renders correctly', async ({ page }) => {
    await page.goto('/movies');

    await expect(page).toHaveTitle(/All Martial Arts Movies/);

    await expect(page.getByRole('heading', { name: 'All movies' })).toBeVisible();

    await expect(page.getByTestId('movie-list')).toBeVisible();
    await expect(page.getByRole('combobox')).toHaveCount(5);
    await expect(page.getByRole('navigation', { name: 'pagination' })).toBeVisible();
  });

  test('sorting resets pagination on all movies page', async ({ page }) => {
    await page.goto('/movies?page=3');

    await selectSort(page, 'Newest', 'Oldest');
    await expect(page).toHaveURL(/sort=release-asc/);
    await expect(page).not.toHaveURL(/page=/);

    await expect(page.getByTestId('movie-list')).toBeVisible();
  });

  test('filtering resets pagination on all movies page', async ({ page }) => {
    await page.goto('/movies?page=5');

    await selectSort(page, 'All genres', 'Adventure');
    await expect(page).toHaveURL(/genre=adventure/);
    await expect(page).not.toHaveURL(/page=/);

    await expect(page.getByTestId('movie-list')).toBeVisible();
  });

  test('pagination preserves sort and filters on all movies page', async ({ page }) => {
    await page.goto('/movies');

    await selectSort(page, 'Newest', 'Oldest');
    await expect(page).toHaveURL(/sort=release-asc/);

    await selectSort(page, 'All years', '1980s');
    await expect(page).toHaveURL(/year=1980/);

    await page.getByRole('link', { name: '2', exact: true }).click();

    await expect(page).toHaveURL(/sort=release-asc/);
    await expect(page).toHaveURL(/year=1980/);
    await expect(page).toHaveURL(/page=2/);

    await expect(page.getByTestId('movie-list')).toBeVisible();
  });

  test('deep link with filters restores state on all movies page', async ({ page }) => {
    await page.goto('/movies?martial-art=kung-fu&genre=action&country=US&year=1970&page=2&sort=title-asc');

    await expect(page).toHaveURL(/martial-art=kung-fu/);
    await expect(page).toHaveURL(/title-asc/);

    await expect(page.getByRole('combobox').filter({ hasText: 'Kung Fu' })).toBeVisible();
    await expect(page.getByRole('combobox').filter({ hasText: 'Title (A-Z)' })).toBeVisible();

    await expect(page.getByTestId('movie-list')).toBeVisible();
  });
});

test.describe('Movie page', () => {
  test('movie page renders correctly', async ({ page }) => {
    await page.goto('/movies/karate-kid-legends-2025');

    await expect(page).toHaveTitle(/Karate Kid: Legends \(2025\)/);

    await expect(page.getByRole('heading', { name: 'Karate Kid: Legends' })).toBeVisible();
    await expect(page.getByText('2025')).toBeVisible();

    await expect(page.getByText('Overview')).toBeVisible();
    await expect(page.getByText('Primary martial art')).toBeVisible();
  });

  test('invalid movie slug shows movie not found page', async ({ page }) => {
    await page.goto('/movies/invalid-path');

    await expect(page).toHaveTitle(/Movie Not Found/);

    await expect(page.getByRole('heading', { name: 'Movie not found' })).toBeVisible();

    await expect(page.getByRole('link', { name: 'Browse all movies' })).toHaveAttribute('href', '/movies');
  });
});

test.describe('User journeys', () => {
  test('user journey: home → martial art → movie details', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'Kung Fu' }).click();
    await expect(page).toHaveURL('/martial-arts/kung-fu');

    await page.getByTestId('movie-list').getByRole('link').first().click();
    await expect(page).toHaveURL(/movies/);

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText('Overview')).toBeVisible();
    await expect(page.getByText('Primary martial art')).toBeVisible();
    await expect(page.getByText('Kung Fu')).toBeVisible();
  });
});

const selectSort = async (page: Page, prevValue: string, newValue: string) => {
  await page.getByRole('combobox').getByText(prevValue).click();
  await page.getByRole('option', { name: newValue }).click();
};
