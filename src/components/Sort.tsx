'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Sort() {
  const searchParams = useSearchParams();
  const router = useRouter();

  function handleSortChange(value: string) {
    const params = new URLSearchParams(searchParams);
    params.set('sort', value);
    router.push(`?${params.toString()}`, { scroll: false });
  }

  return (
    <div>
      <Select onValueChange={handleSortChange} value={searchParams.get('sort') || 'release-desc'}>
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
