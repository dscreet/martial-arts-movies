'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ChevronDownIcon } from 'lucide-react';
import { Input } from './ui/input';

interface MultiSelectFilterProps {
  label: string;
  paramKey: string;
  options: { id: number; name: string; value: string }[];
}

export default function MultiSelectFilter({ label, paramKey, options }: MultiSelectFilterProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const selectedOptions = searchParams.get(paramKey)?.split(',') ?? [];

  const [search, setSearch] = useState('');

  const filteredOptions = useMemo(() => {
    return options.filter((opt) => opt.name.toLowerCase().includes(search.toLowerCase()));
  }, [options, search]);

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

  function clearFilter() {
    const params = new URLSearchParams(searchParams);
    params.delete(paramKey);
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
    <Popover
      onOpenChange={(open) => {
        if (open) setSearch('');
      }}
    >
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

      <PopoverContent className="w-[240px] p-2 space-y-2">
        {/* only show search for country */}
        {options.length > 30 && (
          <Input
            placeholder={`Search ${label.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8"
          />
        )}

        <div className="max-h-[200px] overflow-y-auto space-y-1">
          {filteredOptions.length === 0 ? (
            <p className="text-sm text-muted-foreground px-2 py-2">No matches found</p>
          ) : (
            filteredOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-2 py-1">
                <Checkbox
                  id={option.value}
                  checked={selectedOptions.includes(option.value)}
                  onCheckedChange={() => toggleOption(option.value)}
                />
                <Label htmlFor={option.value} className="text-sm cursor-pointer">
                  {option.name}
                </Label>
              </div>
            ))
          )}
        </div>

        <Button variant="ghost" size="sm" className="w-full text-muted-foreground mt-2" onClick={() => clearFilter()}>
          Clear {label.toLowerCase()}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
