'use client'

export function SkeletonCard() {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 md:p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 bg-gray-700 rounded w-24"></div>
        <div className="h-6 w-6 bg-gray-700 rounded"></div>
      </div>
      <div className="h-8 bg-gray-700 rounded w-32 mb-2"></div>
      <div className="h-3 bg-gray-700 rounded w-20"></div>
    </div>
  )
}

export function SkeletonTable() {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
      <div className="px-4 md:px-6 py-4 border-b border-gray-700">
        <div className="h-6 bg-gray-700 rounded w-48 animate-pulse"></div>
      </div>
      
      {/* Desktop skeleton */}
      <div className="hidden md:block">
        <div className="px-6 py-3 bg-gray-900/50 border-b border-gray-700">
          <div className="grid grid-cols-12 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-700 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="px-6 py-4 border-b border-gray-700/50">
            <div className="grid grid-cols-12 gap-4 items-center">
              {Array.from({ length: 12 }).map((_, j) => (
                <div key={j} className="h-4 bg-gray-700 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile skeleton */}
      <div className="block md:hidden p-4 space-y-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-gray-900/50 rounded-xl p-5 animate-pulse">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="h-5 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
              </div>
              <div className="h-6 bg-gray-700 rounded w-16"></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 8 }).map((_, j) => (
                <div key={j} className="space-y-1">
                  <div className="h-3 bg-gray-700 rounded w-16"></div>
                  <div className="h-4 bg-gray-700 rounded w-20"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 