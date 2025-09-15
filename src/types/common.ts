export interface RawMovie {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  genres: Genre[];
  origin_country: string[];
}

export interface ProcessedMovie {
  tmdbId: number;
  slug: string;
  title: string;
  overview: string | null;
  releaseDate: string | null;
  posterPath: string | null;
  backdropPath: string | null;
  primaryMartialArt: string;
  martialArts: string[];
  genres: Genre[];
  countries: string[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface Country {
  iso_3166_1: string;
  english_name: string;
  native_name: string;
}

export interface MartialArt {
  name: string;
  slug: string;
}
