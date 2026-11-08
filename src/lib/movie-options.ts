export const SORT_OPTIONS = {
  'release-asc': { releaseDate: 'asc' },
  'release-desc': { releaseDate: 'desc' },
  'title-asc': { title: 'asc' },
  'title-desc': { title: 'desc' },
} as const;

export type SortOption = keyof typeof SORT_OPTIONS;

export const DEFAULT_SORT: SortOption = 'release-desc';

export const DECADES = [
  { id: 1, name: 'Pre 1950', value: 'pre-1950' },
  { id: 2, name: '1950s', value: '1950' },
  { id: 3, name: '1960s', value: '1960' },
  { id: 4, name: '1970s', value: '1970' },
  { id: 5, name: '1980s', value: '1980' },
  { id: 6, name: '1990s', value: '1990' },
  { id: 7, name: '2000s', value: '2000' },
  { id: 8, name: '2010s', value: '2010' },
  { id: 9, name: '2020+', value: '2020' },
];
