import React from 'react';

interface PaginationByNumberProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isDarkMode: boolean;
}

export default function PaginationByNumber({
  currentPage,
  totalPages,
  onPageChange,
  isDarkMode
}: PaginationByNumberProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: ({ type: 'page'; value: number } | { type: 'ellipsis'; direction: 'prev' | 'next'; targetPage: number })[] = [];
    
    if (totalPages <= 10) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push({ type: 'page', value: i });
      }
    } else {
      if (currentPage <= 5) {
        // Near the start: show 1 to 8, then ellipsis, then last page
        for (let i = 1; i <= 8; i++) {
          pages.push({ type: 'page', value: i });
        }
        pages.push({ type: 'ellipsis', direction: 'next', targetPage: 9 });
        pages.push({ type: 'page', value: totalPages });
      } else if (currentPage >= totalPages - 4) {
        // Near the end: 1, then ellipsis, then last 8 pages
        pages.push({ type: 'page', value: 1 });
        pages.push({ type: 'ellipsis', direction: 'prev', targetPage: totalPages - 8 });
        for (let i = totalPages - 7; i <= totalPages; i++) {
          pages.push({ type: 'page', value: i });
        }
      } else {
        // Somewhere in the middle: 1, ellipsis, 7 centered pages, ellipsis, last page
        pages.push({ type: 'page', value: 1 });
        pages.push({ type: 'ellipsis', direction: 'prev', targetPage: currentPage - 4 });
        
        for (let i = currentPage - 3; i <= currentPage + 3; i++) {
          pages.push({ type: 'page', value: i });
        }
        
        pages.push({ type: 'ellipsis', direction: 'next', targetPage: currentPage + 4 });
        pages.push({ type: 'page', value: totalPages });
      }
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex items-center justify-center space-x-1.5 flex-wrap gap-y-2 select-none font-sans">
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
          currentPage === 1
            ? 'bg-stone-50 text-stone-300 border-stone-200 dark:bg-slate-900/40 dark:text-slate-700 dark:border-slate-800/40 cursor-not-allowed'
            : 'bg-white text-stone-700 hover:bg-stone-50 border-stone-200 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-850 dark:border-slate-800 cursor-pointer'
        }`}
      >
        Previous
      </button>

      {pages.map((p, idx) => {
        if (p.type === 'ellipsis') {
          const isPrev = p.direction === 'prev';
          const targetPage = p.targetPage;

          return (
            <button
              key={`ellipsis-${p.direction}-${idx}`}
              type="button"
              onClick={() => onPageChange(targetPage)}
              title={isPrev ? `Go to page ${targetPage}` : `Go to page ${targetPage}`}
              className={`group w-8 h-8 rounded-xl text-xs font-bold transition-all flex items-center justify-center border border-transparent hover:border-stone-200 dark:hover:border-slate-800 hover:bg-stone-50 dark:hover:bg-slate-855 text-stone-400 hover:text-amber-500 dark:text-stone-500 dark:hover:text-amber-400 cursor-pointer`}
            >
              <span className="group-hover:hidden">...</span>
              <span className="hidden group-hover:inline">{isPrev ? '«' : '»'}</span>
            </button>
          );
        }

        const pageNum = p.value;
        const isCurrent = pageNum === currentPage;
        return (
          <button
            key={`page-${pageNum}`}
            type="button"
            onClick={() => onPageChange(pageNum)}
            className={`w-8 h-8 rounded-xl text-xs font-bold transition-all flex items-center justify-center border ${
              isCurrent
                ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                : 'bg-white text-stone-700 hover:bg-stone-50 border-stone-200 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-855 dark:border-slate-800 cursor-pointer'
            }`}
          >
            {pageNum}
          </button>
        );
      })}

      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
          currentPage === totalPages
            ? 'bg-stone-50 text-stone-300 border-stone-200 dark:bg-slate-900/40 dark:text-slate-700 dark:border-slate-800/40 cursor-not-allowed'
            : 'bg-white text-stone-700 hover:bg-stone-50 border-stone-200 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-850 dark:border-slate-800 cursor-pointer'
        }`}
      >
        Next
      </button>
    </div>
  );
}
