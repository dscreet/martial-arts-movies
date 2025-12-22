'use client';

export const imageLoader = ({ src, width }) => {
  if (width <= 300) return `https://image.tmdb.org/t/p/w300${src}`;
  if (width <= 780) return `https://image.tmdb.org/t/p/w780${src}`;
  if (width <= 1280) return `https://image.tmdb.org/t/p/w1280${src}`;
  return `https://image.tmdb.org/t/p/original${src}`;
};
