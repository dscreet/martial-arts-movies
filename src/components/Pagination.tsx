'use client';

import { usePathname, useSearchParams } from 'next/navigation';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import generatePagination from '@/lib/pagination';

export default function PaginationBar({ totalPages }: { totalPages: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;

  function setPage(page: number) {
    const params = new URLSearchParams(searchParams);

    if (page <= 1) {
      params.delete('page');
    } else {
      params.set('page', page.toString());
    }

    return `${pathname}?${params.toString()}`;
  }

  const allPages = generatePagination(currentPage, totalPages);

  //class names and such dry?
  return (
    <Pagination className="mt-6 sm:mt-8">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={setPage(currentPage - 1)}
            className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
            aria-disabled={currentPage <= 1}
            tabIndex={currentPage <= 1 ? -1 : undefined}
          />
        </PaginationItem>

        {allPages.map((page, index) => {
          return (
            <PaginationItem key={`${page}-${index}`}>
              {page === '...' ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink href={setPage(page)} isActive={page === currentPage}>
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          );
        })}

        <PaginationItem>
          <PaginationNext
            href={setPage(currentPage + 1)}
            className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
            aria-disabled={currentPage >= totalPages}
            tabIndex={currentPage >= totalPages ? -1 : undefined}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
