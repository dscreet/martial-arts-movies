import type { Metadata } from 'next';

type MetadataInput = {
  title: string;
  description: string;
  socialTitle?: string;
  socialDescription?: string;
  url: string;
  type?: 'website' | 'video.movie';
};

export function baseMetadata({
  title,
  description,
  socialTitle,
  socialDescription,
  url,
  type = 'website',
}: MetadataInput): Metadata {
  const ogTitle = socialTitle ?? title;
  const ogDescription = socialDescription ?? description;

  return {
    title,
    description,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url,
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
    },
    alternates: {
      canonical: url,
    },
  };
}
