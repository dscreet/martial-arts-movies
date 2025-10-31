'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ChevronDownIcon } from 'lucide-react';

interface MultiSelectFilterProps {
  label: string;
  paramKey: string;
  options: { id: number; name: string; slug: string }[];
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
    router.push(`?${params.toString()}`, { scroll: false });
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn('w-[200px] justify-between', selectedOptions.length ? 'text-primary' : 'text-muted-foreground')}
        >
          {selectedOptions.length
            ? `${selectedOptions.length} ${label}${selectedOptions.length > 1 ? 's' : ''} selected`
            : `Select ${label}`}
          <ChevronDownIcon className="size-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[200px] p-2">
        {options.map((option) => {
          return (
            <div key={option.id} className="flex items-center space-x-2 py-1">
              <Checkbox
                id={option.slug}
                checked={selectedOptions.includes(option.slug)}
                onCheckedChange={() => toggleOption(option.slug)}
              />
              <Label htmlFor={option.slug}>{option.name}</Label>
            </div>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
