'use client'

import Link from 'next/link'

interface PaginationProps {
  currentPage: number
  totalPages: number
  basePath: string
  category?: string
}

export default function Pagination({ currentPage, totalPages, basePath, category }: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const createPageUrl = (page: number) => {
    // Simple URL creation without search params
    return `${basePath}?page=${page}`
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 7
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)
      
      if (currentPage > 3) {
        pages.push('...')
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...')
      }
      
      // Always show last page
      pages.push(totalPages)
    }
    
    return pages
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8 md:mt-12">
      {/* Previous Button */}
      {currentPage > 1 ? (
        <Link
          href={createPageUrl(currentPage - 1)}
          className="px-4 py-2 bg-gray-900 text-white border border-gray-700 rounded-md hover:bg-gray-800 transition-colors"
        >
          Previous
        </Link>
      ) : (
        <span className="px-4 py-2 bg-gray-900 text-gray-600 border border-gray-700 rounded-md cursor-not-allowed">
          Previous
        </span>
      )}

      {/* Page Numbers */}
      <div className="flex items-center gap-2">
        {getPageNumbers().map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                ...
              </span>
            )
          }
          
          const pageNum = page as number
          const isActive = pageNum === currentPage
          
          return (
            <Link
              key={pageNum}
              href={createPageUrl(pageNum)}
              className={`px-4 py-2 rounded-md transition-colors ${
                isActive
                  ? 'bg-white text-black font-semibold'
                  : 'bg-gray-900 text-white border border-gray-700 hover:bg-gray-800'
              }`}
            >
              {pageNum}
            </Link>
          )
        })}
      </div>

      {/* Next Button */}
      {currentPage < totalPages ? (
        <Link
          href={createPageUrl(currentPage + 1)}
          className="px-4 py-2 bg-gray-900 text-white border border-gray-700 rounded-md hover:bg-gray-800 transition-colors"
        >
          Next
        </Link>
      ) : (
        <span className="px-4 py-2 bg-gray-900 text-gray-600 border border-gray-700 rounded-md cursor-not-allowed">
          Next
        </span>
      )}
    </div>
  )
}

