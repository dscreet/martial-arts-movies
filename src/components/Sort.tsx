'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter, useSearchParams } from 'next/navigation';
import { SortOption, sortOptions } from '@/lib/data';

export default function Sort() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sort = searchParams.get('sort');
  const sortValue: SortOption = sort && sort in sortOptions ? (sort as SortOption) : 'release-desc';

  function handleSortChange(value: string) {
    const params = new URLSearchParams(searchParams);
    params.set('sort', value);
    params.delete('page');
    router.push(`?${params.toString()}`);
  }

  return (
    <div>
      <Select onValueChange={handleSortChange} value={sortValue}>
        <SelectTrigger className="w-[180px]">
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
