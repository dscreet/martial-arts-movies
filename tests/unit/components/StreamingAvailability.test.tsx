import { render, screen } from '@testing-library/react';
import { useTheme } from 'next-themes';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import StreamingAvailability from '@/components/StreamingAvailability';
import type { StreamingAvailabilityResponse } from '@/types/common';

vi.mock('next-themes', () => ({
  useTheme: vi.fn(),
}));

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => <a href={href}>{children}</a>,
}));

vi.mock('@/components/ImageWithFallback', () => ({
  default: ({
    src,
    alt,
    ...props
  }: {
    src: string;
    alt: string;
  } & React.ImgHTMLAttributes<HTMLImageElement>) => <img src={src} alt={alt} {...props} />,
}));

const mockAvailabilityData: StreamingAvailabilityResponse = {
  streamingOptions: {
    us: [
      {
        service: {
          id: 'prime',
          name: 'Prime Video',
          imageSet: {
            lightThemeImage: 'https://example.com/prime-light.svg',
            darkThemeImage: 'https://example.com/prime-dark.svg',
          },
        },
        type: 'subscription',
        link: 'https://example.com/prime',
        quality: 'hd',
      },
      {
        service: {
          id: 'prime',
          name: 'Prime Video',
          imageSet: {
            lightThemeImage: 'https://example.com/prime-light.svg',
            darkThemeImage: 'https://example.com/prime-dark.svg',
          },
        },
        addon: {
          id: 'midnight-pulp',
          name: 'MIDNIGHT PULP',
          imageSet: {
            lightThemeImage: 'https://example.com/midnight-pulp-light.svg',
            darkThemeImage: 'https://example.com/midnight-pulp-dark.svg',
          },
        },
        type: 'addon',
        link: 'https://example.com/midnight-pulp',
        quality: 'hd',
      },
      {
        service: {
          id: 'hbo-max',
          name: 'HBO Max',
          imageSet: {
            lightThemeImage: 'https://example.com/hbo-max-light.svg',
            darkThemeImage: 'https://example.com/hbo-max-dark.svg',
          },
        },
        type: 'rent',
        link: 'https://example.com/hbo-max-rent',
        quality: 'hd',
      },
      {
        service: {
          id: 'apple',
          name: 'Apple TV',
          imageSet: {
            lightThemeImage: 'https://example.com/apple-light.svg',
            darkThemeImage: 'https://example.com/apple-dark.svg',
          },
        },
        type: 'buy',
        link: 'https://example.com/apple-buy',
        quality: 'hd',
      },
      {
        service: {
          id: 'tubi',
          name: 'Tubi',
          imageSet: {
            lightThemeImage: 'https://example.com/tubi-light.svg',
            darkThemeImage: 'https://example.com/tubi-dark.svg',
          },
        },
        type: 'free',
        link: 'https://example.com/tubi-free',
        quality: 'hd',
      },
    ],
  },
};

describe('StreamingAvailability', () => {
  beforeEach(() => {
    vi.mocked(useTheme).mockReset();
    vi.mocked(useTheme).mockReturnValue({ resolvedTheme: 'light' } as ReturnType<typeof useTheme>);
  });

  test('renders error message when no availability data', () => {
    render(<StreamingAvailability availabilityData={null} />);

    expect(screen.getByText('Error loading availability.')).toBeInTheDocument();
  });

  test('renders empty state when no options available in the selected country', () => {
    render(<StreamingAvailability availabilityData={{ streamingOptions: { us: [] } }} />);

    expect(screen.getByText('No watch options are currently available in your country.')).toBeInTheDocument();
  });

  test('groups options into watch sections and renders provider links', () => {
    render(<StreamingAvailability availabilityData={mockAvailabilityData} />);

    expect(screen.getByText('Free')).toBeInTheDocument();
    expect(screen.getByText('Stream')).toBeInTheDocument();
    expect(screen.getByText('Rent')).toBeInTheDocument();
    expect(screen.getByText('Buy')).toBeInTheDocument();

    expect(screen.getByRole('img', { name: 'Prime Video' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'MIDNIGHT PULP' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'HBO Max' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Apple TV' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Tubi' })).toBeInTheDocument();

    expect(screen.getByRole('link', { name: 'Prime Video' })).toHaveAttribute('href', 'https://example.com/prime');
    expect(screen.getByRole('link', { name: 'MIDNIGHT PULP' })).toHaveAttribute(
      'href',
      'https://example.com/midnight-pulp'
    );
  });

  test('uses light theme logos when resolved theme is light', () => {
    vi.mocked(useTheme).mockReturnValue({ resolvedTheme: 'light' } as ReturnType<typeof useTheme>);

    render(<StreamingAvailability availabilityData={mockAvailabilityData} />);

    const primeLogo = screen.getByRole('img', { name: 'Prime Video' });
    const pulpLogo = screen.getByRole('img', { name: 'MIDNIGHT PULP' });

    expect(primeLogo).toHaveAttribute('src', 'https://example.com/prime-light.svg');
    expect(pulpLogo).toHaveAttribute('src', 'https://example.com/midnight-pulp-light.svg');
  });

  test('uses dark theme logos when resolved theme is dark', () => {
    vi.mocked(useTheme).mockReturnValue({ resolvedTheme: 'dark' } as ReturnType<typeof useTheme>);

    render(<StreamingAvailability availabilityData={mockAvailabilityData} />);

    const primeLogo = screen.getByRole('img', { name: 'Prime Video' });
    const pulpLogo = screen.getByRole('img', { name: 'MIDNIGHT PULP' });

    expect(primeLogo).toHaveAttribute('src', 'https://example.com/prime-dark.svg');
    expect(pulpLogo).toHaveAttribute('src', 'https://example.com/midnight-pulp-dark.svg');
  });

  test('deduplicates options that share same link within a section', () => {
    const duplicateLinkAvailabilityData: StreamingAvailabilityResponse = {
      streamingOptions: {
        us: [
          {
            service: {
              id: 'prime',
              name: 'Prime Video',
              imageSet: {
                lightThemeImage: 'https://example.com/prime-light.svg',
                darkThemeImage: 'https://example.com/prime-dark.svg',
              },
            },
            type: 'rent',
            link: 'https://example.com/prime-rent',
            quality: 'sd',
          },
          {
            service: {
              id: 'prime',
              name: 'Prime Video',
              imageSet: {
                lightThemeImage: 'https://example.com/prime-light.svg',
                darkThemeImage: 'https://example.com/prime-dark.svg',
              },
            },
            type: 'rent',
            link: 'https://example.com/prime-rent',
            quality: 'hd',
          },
        ],
      },
    };

    render(<StreamingAvailability availabilityData={duplicateLinkAvailabilityData} />);

    const rentLinks = screen.getAllByRole('link', { name: 'Prime Video' });

    expect(rentLinks).toHaveLength(1);
    expect(rentLinks[0]).toHaveAttribute('href', 'https://example.com/prime-rent');
  });
});
