export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="aspect-square bg-gray-100 dark:bg-gray-800 animate-shimmer" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg animate-shimmer w-3/4" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-lg animate-shimmer w-1/2" />
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-lg animate-shimmer w-1/3" />
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-shimmer w-full" />
      </div>
    </div>
  )
}

export function SkeletonBanner() {
  return (
    <div className="rounded-2xl overflow-hidden h-[200px] md:h-[280px] bg-gray-200 dark:bg-gray-800 animate-shimmer" />
  )
}

export function SkeletonCategory() {
  return (
    <div className="aspect-square rounded-2xl bg-gray-200 dark:bg-gray-800 animate-shimmer" />
  )
}

export function SkeletonProductGrid({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  )
}
