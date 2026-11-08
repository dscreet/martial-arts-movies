'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DEFAULT_SORT, SORT_OPTIONS, type SortOption } from '@/lib/movie-options';

export default function Sort() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sort = searchParams.get('sort');
  const sortValue: SortOption = sort && sort in SORT_OPTIONS ? (sort as SortOption) : DEFAULT_SORT;

  function handleSortChange(value: string) {
    const params = new URLSearchParams(searchParams);
    params.set('sort', value);
    params.delete('page');
    router.push(`?${params.toString()}`);
  }

  return (
    <div>
      <Select onValueChange={handleSortChange} value={sortValue}>
        <SelectTrigger className="w-[180px]" aria-label="Sort movies by">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="release-desc">Newest</SelectItem>
          <SelectItem value="release-asc">Oldest</SelectItem>
          <SelectItem value="title-asc">Title (A-Z)</SelectItem>
          <SelectItem value="title-desc">Title (Z-A)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
