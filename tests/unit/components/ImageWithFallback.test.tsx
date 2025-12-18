import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import ImageWithFallback from '@/components/ImageWithFallback';

vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}));

describe('ImageWithFallback', () => {
  const defaultProps = {
    src: '/original.jpg',
    fallbackSrc: '/fallback.jpg',
    alt: 'test image',
  };

  test('renders with the initial src', () => {
    render(<ImageWithFallback {...defaultProps} />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/original.jpg');
  });

  test('switches to fallback src on error event', () => {
    render(<ImageWithFallback {...defaultProps} />);

    const img = screen.getByRole('img');
    fireEvent.error(img);
    expect(img).toHaveAttribute('src', '/fallback.jpg');
  });
});
