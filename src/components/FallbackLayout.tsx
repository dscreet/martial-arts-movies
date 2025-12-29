import Link from 'next/link';

import { Button } from '@/components/ui/button';

interface Props {
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
}

export default function FallbackLayout({ title, description, primaryAction, secondaryAction }: Props) {
  return (
    <div className="mx-auto py-28 text-center">
      <h1 className="mb-6 text-3xl font-bold sm:text-4xl">{title}</h1>

      <p className="mb-8 text-base text-muted-foreground sm:text-lg">{description}</p>

      <div className="flex flex-col justify-center gap-4 sm:flex-row">
        {primaryAction &&
          (primaryAction.href ? (
            <Button size="lg" asChild>
              <Link href={primaryAction.href}>{primaryAction.label}</Link>
            </Button>
          ) : (
            <Button size="lg" onClick={primaryAction.onClick}>
              {primaryAction.label}
            </Button>
          ))}

        {secondaryAction && (
          <Button variant="outline" size="lg" asChild>
            <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
