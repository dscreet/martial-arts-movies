'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ChevronDownIcon } from 'lucide-react';

interface MultiSelectFilterProps {
  label: string;
  paramKey: string;
  options: { id: number; name: string; value: string }[];
}

export default function MultiSelectFilter({ label, paramKey, options }: MultiSelectFilterProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const selectedOptions = searchParams.get(paramKey)?.split(',') ?? [];

  function toggleOption(value: string) {
    const params = new URLSearchParams(searchParams);

    const updatedOptions = selectedOptions.includes(value)
      ? selectedOptions.filter((o) => o !== value)
      : [...selectedOptions, value];

    if (updatedOptions.length) {
      params.set(paramKey, updatedOptions.join(','));
    } else {
      params.delete(paramKey);
    }
    router.push(`?${decodeURIComponent(params.toString())}`, { scroll: false });
  }

  const displayNames = selectedOptions
    .map((value) => {
      const option = options.find((option) => option.value === value);
      if (!option) return null;
      return paramKey === 'country' ? option.value : option.name;
    })
    .filter(Boolean) as string[];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[240px] justify-between">
          <span>{label}</span>
          <div className="flex items-center gap-1 text-muted-foreground">
            <span className="truncate max-w-[100px] block">
              {displayNames.length === 0
                ? 'All'
                : displayNames.length <= 2
                ? displayNames.join(', ')
                : `${displayNames.length} selected`}
            </span>
            <ChevronDownIcon className="size-4 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[200px] p-2">
        {options.map((option) => {
          return (
            <div key={option.id} className="flex items-center space-x-2 py-1">
              <Checkbox
                id={option.value}
                checked={selectedOptions.includes(option.value)}
                onCheckedChange={() => toggleOption(option.value)}
              />
              <Label htmlFor={option.value}>{option.name}</Label>
            </div>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
