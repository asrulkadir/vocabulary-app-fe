import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  showPageJump?: boolean
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  showPageJump = true,
}: PaginationProps) {
  const [jumpValue, setJumpValue] = useState('')

  const handleJump = () => {
    const pageNum = parseInt(jumpValue, 10)
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum)
      setJumpValue('')
    }
  }

  const handleJumpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleJump()
    }
  }

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: Array<number | 'ellipsis'> = []
    const showPages = 5 // Number of pages to show

    if (totalPages <= showPages + 2) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      // Calculate start and end
      let start = Math.max(2, page - 1)
      let end = Math.min(totalPages - 1, page + 1)

      // Adjust if at the start
      if (page <= 3) {
        end = Math.min(showPages - 1, totalPages - 1)
      }

      // Adjust if at the end
      if (page >= totalPages - 2) {
        start = Math.max(2, totalPages - showPages + 2)
      }

      // Add ellipsis if needed
      if (start > 2) {
        pages.push('ellipsis')
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      // Add ellipsis if needed
      if (end < totalPages - 1) {
        pages.push('ellipsis')
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-1 sm:gap-2">
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-gray-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          title="First Page"
        >
          <ChevronFirst className="w-4 h-4" />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-gray-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Numbers */}
        <div className="hidden sm:flex items-center gap-1">
          {pageNumbers.map((pageNum, idx) =>
            pageNum === 'ellipsis' ? (
              <span key={`ellipsis-${idx}`} className="px-2 text-gray-500">
                ...
              </span>
            ) : (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`min-w-9 h-9 px-2 rounded-lg text-sm font-medium transition-colors ${
                  pageNum === page
                    ? 'bg-cyan-500 text-white'
                    : 'bg-slate-800 border border-slate-700 text-gray-300 hover:bg-slate-700'
                }`}
              >
                {pageNum}
              </button>
            ),
          )}
        </div>

        {/* Mobile: Current Page Display */}
        <span className="sm:hidden px-3 py-2 text-gray-400 text-sm">
          {page} / {totalPages}
        </span>

        {/* Next Page */}
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-gray-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-gray-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Last Page"
        >
          <ChevronLast className="w-4 h-4" />
        </button>
      </div>

      {/* Page Jump */}
      {showPageJump && totalPages > 5 && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>Go to:</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={jumpValue}
            onChange={(e) => setJumpValue(e.target.value)}
            onKeyDown={handleJumpKeyDown}
            onBlur={handleJump}
            placeholder={String(page)}
            className="w-16 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white text-center focus:outline-none focus:border-cyan-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      )}
    </div>
  )
}
