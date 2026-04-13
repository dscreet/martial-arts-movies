'use client';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import ImageWithFallback from '@/components/ImageWithFallback';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { StreamingAvailabilityOption, StreamingAvailabilityResponse } from '@/types/common';

function getStreamingOptionLogo(option: StreamingAvailabilityOption, theme: string) {
  const imageSet = option.addon?.imageSet ?? option.service.imageSet;
  return theme === 'dark' ? imageSet.darkThemeImage : imageSet.lightThemeImage;
}

function getStreamingOptionName(option: StreamingAvailabilityOption) {
  return option.addon?.name ?? option.service.name;
}

function deduplicateOptions(options: StreamingAvailabilityOption[]) {
  const seen = new Set<string>();
  return options.filter((option) => {
    if (seen.has(option.link)) return false;
    seen.add(option.link);
    return true;
  });
}

export default function StreamingAvailability({
  availabilityData,
  countryOptions,
}: {
  availabilityData: StreamingAvailabilityResponse | null;
  countryOptions: { id: number; name: string; value: string }[];
}) {
  // needed for logos to match light/dark mode
  const [mounted, setMounted] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState('us');
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted || !resolvedTheme) {
    return null;
  }

  if (!availabilityData) {
    return <p className="text-muted-foreground">Error loading availability.</p>;
  }

  const selectedCountryName =
    countryOptions.find((option) => option.value === selectedCountryCode)?.name ?? 'your selected country';
  const userCountryOptions = availabilityData.streamingOptions[selectedCountryCode] ?? [];

  const watchSections: Array<{ title: string; options: StreamingAvailabilityOption[] }> = [
    { title: 'Free', options: userCountryOptions.filter((option) => option.type === 'free') },
    {
      title: 'Stream',
      options: userCountryOptions.filter((option) => option.type === 'subscription' || option.type === 'addon'),
    },
    { title: 'Rent', options: userCountryOptions.filter((option) => option.type === 'rent') },
    { title: 'Buy', options: userCountryOptions.filter((option) => option.type === 'buy') },
  ]
    .map((section) => ({ ...section, options: deduplicateOptions(section.options) }))
    .filter((section) => section.options.length);

  //   <SelectContent className="max-h-96">
  //selectrigger classname

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <p className="text-sm font-medium text-muted-foreground">Check availability in</p>
        <Select onValueChange={setSelectedCountryCode} value={selectedCountryCode}>
          <SelectTrigger className="w-full sm:w-[220px]" aria-label="Select streaming country">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-96">
            {countryOptions.map((option) => (
              <SelectItem key={option.id} value={option.value}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!watchSections.length ? (
        <p className="text-muted-foreground">No watch options are currently available in {selectedCountryName}.</p>
      ) : (
        watchSections.map((section) => (
          <div key={section.title} className="flex flex-col gap-2 sm:flex-row">
            <h4 className="min-w-16 text-sm font-semibold text-muted-foreground sm:pt-3">{section.title}</h4>
            <div className="flex flex-wrap gap-3">
              {section.options.map((option) => (
                <Link key={`${option.type}-${option.service.id}-${option.quality}-${option.link}`} href={option.link}>
                  <div className="overflow-hidden rounded-lg border shadow-sm">
                    <ImageWithFallback
                      src={getStreamingOptionLogo(option, resolvedTheme)}
                      fallbackSrc={'/images/fallback-image.png'}
                      alt={getStreamingOptionName(option)}
                      height={48}
                      width={96}
                      className="h-12 w-24 object-contain p-2"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
