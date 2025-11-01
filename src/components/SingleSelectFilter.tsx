'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface MultiSelectFilterProps {
  label: string;
  paramKey: string;
  options: { id: number; name: string; value: string }[];
}

export default function SelectFilter({ label, paramKey, options }: MultiSelectFilterProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  function handleFilterChange(value: string) {
    const params = new URLSearchParams(searchParams);

    if (value === 'all') {
      params.delete(paramKey);
    } else {
      params.set(paramKey, value);
    }

    router.push(`?${decodeURIComponent(params.toString())}`, { scroll: false });
  }

  const selectedValue = searchParams.get(paramKey) || 'all';

  return (
    <div>
      <Select onValueChange={handleFilterChange} value={selectedValue}>
        <SelectTrigger className={cn('w-[200px]', selectedValue === 'all' && 'text-muted-foreground')}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All {label}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.value}>
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
