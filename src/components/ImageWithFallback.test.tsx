import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MockedImage from '@/__mocks__/next/image';
import ImageWithFallback from '@/components/ImageWithFallback';

vi.mock('next/image', () => ({ default: MockedImage }));

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
