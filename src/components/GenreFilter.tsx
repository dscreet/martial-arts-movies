'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Genre } from '@prisma/client';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ChevronDownIcon } from 'lucide-react';

interface FilterProps {
  genres: Genre[];
}

export default function GenreFilter({ genres }: FilterProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const selectedGenres = searchParams.get('genre')?.split(',') ?? [];

  function toggleGenre(value: string) {
    const params = new URLSearchParams(searchParams);

    const newGenres = selectedGenres.includes(value)
      ? selectedGenres.filter((g) => g !== value)
      : [...selectedGenres, value];

    if (newGenres.length) {
      params.set('genre', newGenres.join(','));
    } else {
      params.delete('genre');
    }
    router.push(`?${params.toString()}`, { scroll: false });
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn('w-[200px] justify-between', selectedGenres.length ? 'text-primary' : 'text-muted-foreground')}
        >
          {selectedGenres.length
            ? `${selectedGenres.length} genre${selectedGenres.length > 1 ? 's' : ''} selected`
            : 'Select genres'}
          <ChevronDownIcon className="size-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[200px] p-2">
        {genres.map((genre) => {
          return (
            <div key={genre.id} className="flex items-center space-x-2 py-1">
              <Checkbox
                id={genre.slug}
                checked={selectedGenres.includes(genre.slug)}
                onCheckedChange={() => toggleGenre(genre.slug)}
              />
              <Label htmlFor={genre.slug}>{genre.name}</Label>
            </div>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
