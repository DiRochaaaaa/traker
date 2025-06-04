'use client'

export function SkeletonMobileCard() {
  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg animate-pulse">
      {/* Header Compacto */}
      <div className="p-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex-1 pr-2">
            <div className="h-3 bg-gray-700 rounded w-3/4"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-5 bg-gray-700 rounded w-12"></div>
            <div className="h-3 w-3 bg-gray-700 rounded"></div>
          </div>
        </div>

        {/* Métricas Grid Compactas */}
        <div className="grid grid-cols-4 gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="text-center bg-gray-800/30 rounded p-1">
              <div className="h-2.5 w-2.5 bg-gray-700 rounded-full mx-auto mb-0.5"></div>
              <div className="h-2.5 bg-gray-700 rounded w-8 mx-auto mb-0.5"></div>
              <div className="h-2.5 bg-gray-700 rounded w-10 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function SkeletonMobileList() {
  return (
    <div className="p-3 space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonMobileCard key={i} />
      ))}
    </div>
  )
} 